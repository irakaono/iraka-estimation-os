// 甍AI Estimation OS — CAD Core / Geometry Editor (e0.3)
// 中心思想: 画面が Measurement を直接編集する（画面 → Measurement）。
//   React state = Measurement そのもの。Geometry Engine は Measurement を読むだけ。
// e0.3 UX: スナップ / ズーム・パン / 縮尺較正 / Polygon自動閉じ / Undo(Ctrl+Z)。
// ※ AI / Recognizer / Excel / 見積 / 単価 / Roof Engine / Edge Snap は作らない（Edge Snapはe0.4）。

import { useCallback, useEffect, useMemo, useState } from 'react';
import Toolbar from './components/Toolbar';
import GeometryCanvas from './components/GeometryCanvas';
import Properties from './components/Properties';
import MeasurementList from './components/MeasurementList';
import { measure, toSquareMeters } from './geometry/geometryEngine';
import { loadMeasurements, persist, nextId, exportJSON } from './geometry/measurementStore';
import type { Measurement, Vertex } from './geometry/types';

const CANVAS_W = 900;
const CANVAS_H = 620;

function blankMeasurement(seed: { trade: string; item: string }): Measurement {
  return {
    measurementId: '', geometry: 'Polygon', operation: 'Area', vertices: [],
    label: '', trade: seed.trade, item: seed.item, unit: '㎡',
    status: 'editing', revision: 1,
  };
}

export default function App() {
  const [measurements, setMeasurements] = useState<Measurement[]>(() => loadMeasurements());
  const [editing, setEditing] = useState<Measurement | null>(null);
  const [history, setHistory] = useState<Measurement[]>([]); // Undo 用（編集セッション単位）
  const [drawing, setDrawing] = useState(false);
  const [selectedVertex, setSelectedVertex] = useState<number | null>(null);
  const [scale, setScale] = useState(50); // px per meter
  const [bg, setBg] = useState<HTMLImageElement | null>(null);
  const [seed, setSeed] = useState({ trade: '屋根工事', item: '横暖S 本体' });

  // UX: ズーム/パン・スナップ・パンキー・縮尺較正
  const [zoom, setZoom] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [snapOn, setSnapOn] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [calibPts, setCalibPts] = useState<Vertex[]>([]);

  useEffect(() => { persist(measurements); }, [measurements]);

  const areaM2 = useMemo(
    () => (editing ? toSquareMeters(measure(editing), scale) : 0),
    [editing, scale],
  );

  // 変更前の editing を history に積んでから editing を更新する
  const commit = useCallback((fn: (m: Measurement) => Measurement) => {
    setEditing((e) => {
      if (!e) return e;
      setHistory((h) => [...h, e]);
      return fn(e);
    });
  }, []);

  const addVertex = useCallback((p: Vertex) => commit((m) => ({ ...m, vertices: [...m.vertices, p] })), [commit]);
  const deleteVertex = useCallback((i: number) => {
    commit((m) => ({ ...m, vertices: m.vertices.filter((_, j) => j !== i) }));
    setSelectedVertex(null);
  }, [commit]);
  // ドラッグ移動は連続発火するので history はドラッグ開始時に一度だけ積む
  const beginVertexDrag = useCallback(() => {
    setEditing((e) => { if (e) setHistory((h) => [...h, e]); return e; });
  }, []);
  const moveVertex = useCallback(
    (i: number, p: Vertex) => setEditing((e) => (e ? { ...e, vertices: e.vertices.map((v, j) => (j === i ? p : v)) } : e)),
    [],
  );
  const setField = (f: 'label' | 'trade' | 'item', v: string) =>
    setEditing((e) => (e ? { ...e, [f]: v } : e));

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setEditing(h[h.length - 1]);
      setSelectedVertex(null);
      return h.slice(0, -1);
    });
  }, []);

  const newPolygon = () => { setEditing(blankMeasurement(seed)); setHistory([]); setDrawing(true); setSelectedVertex(null); };
  const finish = () => { if (editing && editing.vertices.length >= 3) setDrawing(false); };
  const cancel = () => { setEditing(null); setHistory([]); setDrawing(false); setSelectedVertex(null); };

  const selectMeasurement = (id: string) => {
    const m = measurements.find((x) => x.measurementId === id);
    if (!m) return;
    setEditing({ ...m, vertices: m.vertices.map((v) => [...v] as Vertex) });
    setHistory([]); setDrawing(false); setSelectedVertex(null);
  };

  const save = () => {
    if (!editing || editing.vertices.length < 3) return;
    const rounded: Measurement = {
      ...editing,
      vertices: editing.vertices.map(([x, y]) => [Math.round(x), Math.round(y)] as Vertex),
      label: editing.label || '（無題）',
    };
    if (editing.measurementId) {
      const updated: Measurement = { ...rounded, revision: (editing.revision ?? 1) + 1 };
      setMeasurements((ms) => ms.map((m) => (m.measurementId === editing.measurementId ? updated : m)));
    } else {
      const withId: Measurement = { ...rounded, measurementId: nextId(measurements), revision: 1 };
      setMeasurements((ms) => [...ms, withId]);
    }
    setSeed({ trade: editing.trade, item: editing.item });
    setEditing(null); setHistory([]); setDrawing(false); setSelectedVertex(null);
  };

  // 縮尺較正: 2点クリック → 実長(mm)入力 → px/m 算出
  const startCalibrate = () => { setCalibrating(true); setCalibPts([]); setDrawing(false); };
  const onCalibClick = (p: Vertex) => {
    if (calibPts.length === 0) { setCalibPts([p]); return; }
    const a = calibPts[0];
    const dPx = Math.hypot(p[0] - a[0], p[1] - a[1]);
    const input = window.prompt('この2点の実長さ(mm)を入力', '4550');
    const mm = input ? parseFloat(input) : NaN;
    if (!Number.isNaN(mm) && mm > 0) setScale(Math.max(1, Math.round((dPx / (mm / 1000)) * 100) / 100));
    setCalibrating(false); setCalibPts([]);
  };

  // 図面全体がキャンバスに収まる初期ズーム(fit)を計算して適用する。
  // 大きな立面図などが読み込み時に切れる問題を解消する（e0.3.1）。
  const fitToView = useCallback((img: HTMLImageElement | null) => {
    if (!img) { setZoom(1); setStagePos({ x: 0, y: 0 }); return; }
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) { setZoom(1); setStagePos({ x: 0, y: 0 }); return; }
    const pad = 0.96; // 端に少し余白を残す
    const z = Math.min(20, Math.max(0.1, Math.min(CANVAS_W / w, CANVAS_H / h) * pad));
    setZoom(z);
    setStagePos({ x: (CANVAS_W - w * z) / 2, y: (CANVAS_H - h * z) / 2 }); // 中央寄せ
  }, []);
  // 「全体表示」: 現在の図面に合わせて fit（図面が無ければ等倍リセット）
  const resetView = useCallback(() => fitToView(bg), [fitToView, bg]);

  // キー: Delete=頂点削除, Space=パン, Ctrl/Cmd+Z=Undo
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); setSpaceHeld(true); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedVertex !== null) {
        e.preventDefault(); deleteVertex(selectedVertex);
      }
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceHeld(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [selectedVertex, deleteVertex, undo]);

  const loadBackground = async (file: File) => {
    try {
      const img = file.type === 'application/pdf' ? await renderPdf(file) : await renderImage(file);
      setBg(img); fitToView(img); // 読み込み時に図面全体が収まる初期ズーム
    } catch (err) {
      console.error(err);
      alert('図面の読み込みに失敗しました。画像(PNG/JPG)またはPDFを選んでください。');
    }
  };

  const editingId = editing?.measurementId || null;
  const others = measurements.filter((m) => m.measurementId !== editingId);

  return (
    <div className="app">
      <Toolbar
        drawing={drawing}
        scale={scale}
        zoom={zoom}
        snapOn={snapOn}
        calibrating={calibrating}
        canFinish={!!editing && editing.vertices.length >= 3}
        canUndo={history.length > 0}
        onScale={setScale}
        onToggleSnap={() => setSnapOn((s) => !s)}
        onCalibrate={startCalibrate}
        onResetView={resetView}
        onUndo={undo}
        onNewPolygon={newPolygon}
        onFinish={finish}
        onClear={cancel}
        onLoadBackground={loadBackground}
      />
      <div className="main">
        <div className="canvas-wrap">
          <GeometryCanvas
            width={CANVAS_W}
            height={CANVAS_H}
            background={bg}
            gridStep={scale}
            zoom={zoom}
            stagePos={stagePos}
            spaceHeld={spaceHeld}
            snapOn={snapOn}
            draft={editing?.vertices ?? []}
            drawing={drawing}
            areaM2={areaM2}
            selectedVertex={selectedVertex}
            measurements={others}
            selectedId={editingId}
            calibrating={calibrating}
            calibPts={calibPts}
            onAddVertex={addVertex}
            onMoveVertex={moveVertex}
            onVertexDragStart={beginVertexDrag}
            onSelectVertex={setSelectedVertex}
            onFinish={finish}
            onZoomPan={(z, pos) => { setZoom(z); setStagePos(pos); }}
            onCalibClick={onCalibClick}
          />
          <div className="hint">
            左クリック=頂点／ドラッグ=移動／Delete=削除／右クリック or 始点クリック=確定／Shift=直交／ホイール=ズーム／Space+ドラッグ=パン／Ctrl+Z=元に戻す
            {calibrating && <b style={{ color: '#e8590c' }}>　← 縮尺較正: 基準線の2点をクリック</b>}
          </div>
        </div>
        <aside className="sidebar">
          <Properties
            active={!!editing}
            vertexCount={editing?.vertices.length ?? 0}
            areaM2={areaM2}
            label={editing?.label ?? ''}
            trade={editing?.trade ?? seed.trade}
            item={editing?.item ?? seed.item}
            editingId={editingId}
            revision={editing?.revision ?? 0}
            status={editing?.status ?? 'editing'}
            canSave={!!editing && editing.vertices.length >= 3}
            onChange={setField}
            onSave={save}
          />
          <MeasurementList
            measurements={measurements}
            selectedId={editingId}
            onSelect={selectMeasurement}
            onExport={() => exportJSON(measurements)}
          />
        </aside>
      </div>
    </div>
  );
}

// ---- 背景（PDF/画像）ローダ ------------------------------------------------
async function renderImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error('image load error'));
    img.src = url;
  });
  return img;
}

async function renderPdf(file: File): Promise<HTMLImageElement> {
  // pdfjs は CDN から動的読み込み（GitHub Pages でのバンドル/ワーカーパス問題を回避）。
  // Vite にバンドルさせないため /* @vite-ignore */ を付ける。
  const V = '4.7.76';
  const pdfjs: any = await import(/* @vite-ignore */ `https://cdn.jsdelivr.net/npm/pdfjs-dist@${V}/build/pdf.min.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${V}/build/pdf.worker.min.mjs`;
  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context 取得失敗');
  await page.render({ canvasContext: ctx, viewport }).promise;
  const img = new Image();
  await new Promise<void>((res) => { img.onload = () => res(); img.src = canvas.toDataURL(); });
  return img;
}
