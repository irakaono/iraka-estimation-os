// Measurement 一覧: クリックで選択 → Canvas上でPolygonが光る。JSON書き出し。
import type { Measurement } from '../geometry/types';

interface Props {
  measurements: Measurement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExport: () => void;
}

export default function MeasurementList(props: Props) {
  return (
    <div className="panel list">
      <h3>保存済みデータ（{props.measurements.length}）</h3>

      {props.measurements.length === 0 && (
        <div className="list-empty">まだ拾いがありません。多角形を描いて保存してください。</div>
      )}

      {props.measurements.map((m) => (
        <div
          key={m.measurementId}
          className={'list-item' + (m.measurementId === props.selectedId ? ' sel' : '')}
          onClick={() => props.onSelect(m.measurementId)}
        >
          <span>{m.label || '（無題）'}<br /><span className="id">{m.item}</span></span>
          <span className="id">{m.measurementId}</span>
        </div>
      ))}

      {props.measurements.length > 0 && (
        <button className="exp" onClick={props.onExport}>拾いデータを書き出す</button>
      )}
    </div>
  );
}
