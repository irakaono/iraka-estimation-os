# 甍AI Estimation OS — 引き継ぎ（次チャット用 / e0.3-beta）

## 現状
- `e0.1-constitution` ✅ 完了（理念・設計・規律を確定）
- `e0.2-datamodel` ✅ 完了（Data Model Complete。5モデル＋Geometry/Document Engine）
- `e0.3` CAD Core / Geometry Editor **実装完了・凍結**。次に `e0.3-beta` タグを打つ段階。
  - まだ本物の屋根伏図を1棟も拾っていない → だから `e0.3-geometry-editor` ではなく `e0.3-beta`。

## このOSの中心思想（絶対に崩さない）
- **真実は Measurement.vertices だけ**。amount / Quantity は保存しない（派生値）。
- **画面 → Measurement**：React state は Measurement そのもの（`editing: Measurement | null`）。
- **Geometry Engine は Measurement を読むだけ**（`measure(m)`）。拡張せず、計算能力は Geometry Knowledge（辞典）を増やす。
- **Quantity は派生ビュー**（保存しない。必要時のみ Cache＝実装であって真実ではない）。
- **Recognizer は PDF→Geometry だけ**書く（Decision/Measurement完成/Estimate/Documentは書かない）。
- **AI は横断レイヤー**。OSの中心ではない。器（CAD Core）が使えるのが先。
- 帳票 = データ＋Document＋Template（Excel/PDF/JSON はテンプレの一つ）。

## リポジトリ構成
```
iraka-estimation-os/
├ README.md           理念（数量を出すAIではない。判断を記録・理解・再利用するOS）
├ ARCHITECTURE.md     全体設計（Semantic Mapping は Future Work として記録のみ）
├ CONSTITUTION.md     原則1〜17（17: Knowledge はコードではない・資産）
├ DATAMODEL.md        設計の正（5モデル / Geometry Engine / Document Engine / 不変条件 / ロードマップ）
├ EDITOR.md           Geometry Editor 起動・操作・完成条件
├ BACKLOG-e0.4.md     e0.3-beta 検証記録表 と e0.4 候補
├ .gitignore          node_modules / __pycache__ など
├ proof/              e0.2 の証明（Python）
│  ├ sample_data.json    Decision/Measurement サンプル（quantities は持たない＝派生ビュー）
│  ├ template_engine.py  Geometry Engine + Quantity View + Document Engine（積算表.xlsx生成）
│  └ 積算表.xlsx         生成物（積算表/拾い明細/判断台帳の3シート）
└ （e0.3 CAD Core：Vite + React + TypeScript + Konva + pdfjs）
   ├ package.json / vite.config.ts / tsconfig*.json / index.html
   └ src/
      ├ main.tsx / index.css / vite-env.d.ts
      ├ App.tsx                     中心state=editing:Measurement。undo/history含む
      ├ components/
      │  ├ GeometryCanvas.tsx       Konva描画・頂点編集・snap・zoom/pan・自動閉じ・較正
      │  ├ Toolbar.tsx              図面読込/Polygon/確定/クリア/Undo/較正/スナップ/縮尺/全体表示
      │  ├ Properties.tsx           編集中Measurementの編集（label/trade/item・面積・status/rev）
      │  └ MeasurementList.tsx      一覧クリックで再編集・JSON書き出し
      └ geometry/
         ├ types.ts                Measurement型（vertices/status/revision …）
         ├ geometryEngine.ts       measure(m) → GEOMETRY_KNOWLEDGE(Area/Length/Count)へ委譲
         ├ measurementStore.ts     localStorage保存・採番・JSON書き出し・旧データ補完
         └ snap.ts                 既存頂点吸着・水平垂直スナップ
```

## e0.3 で実装済みの機能
Measurement中心 / World座標 / ズーム(ホイール)・パン(Space+ドラッグ) / スナップ(頂点・直交、Shift直交) /
Polygon自動閉じ(始点近接) / Undo(Ctrl+Z、1ドラッグ=1Undo) / 縮尺較正(2点+実長mm→px/m) /
面積リアルタイム(重心付近表示) / localStorage永続 / measurements.json 書き出し / status・revision。

## 起動
```bash
npm install
npm run dev   # http://localhost:5173
```
> Vite dev は esbuild で型を無視するので型エラーでも起動する。厳密な型チェックは `npm run build`（tsc）。

## 次チャットの最初のタスク
1. `e0.3-beta` タグを打つ（下記コマンド）。push前に `git status` を確認（node_modules/__pycache__ が入っていないこと）。
2. 本物の住宅屋根伏図(PDF)で **1棟拾い切る**検証：PDF読込 → 縮尺較正 → 屋根A/屋根B/下屋 を Polygon → 保存 → measurements.json。
3. `BACKLOG-e0.4.md` の記録表（所要時間/Polygon数/Undo/ズーム/パン/スナップ失敗/困ったこと）を3棟ぶん埋める。
4. 検証で詰まった点があればそれが e0.4 最優先。詰まらず通れば `e0.3-geometry-editor` へ昇格。

### タグ手順
```bash
cd <iraka-estimation-os のパス>
git add .
git status
git commit -m "feat(editor): CAD Core e0.3 — Measurement中心/snap/zoom-pan/縮尺較正/自動閉じ/Undo"
git push origin main
git tag -a e0.3-beta -m "CAD Core beta: 実図面で1棟拾いを検証する段階"
git push origin e0.3-beta
```

## ロードマップ（タグ）
```
e0.1-constitution ✅ → e0.2-datamodel ✅ → e0.3-beta（次）→ e0.3-geometry-editor（1棟拾えたら）
→ e0.4-geometry-engine（Edge Snap / Rectangle・Polyline・Point / Undo履歴可視化 / 複数選択）
→ e0.5-document-engine → e0.6-recognizer → e0.7-roof → e0.8-wall → e1.0-estimation-os
```
- e0.4 に入れる候補：Edge Snap、Undo履歴の可視化、Measurement複数選択、Rectangle/Polyline/Point ツール。
- e0.4 でまだ入れない：AI / Recognizer（CAD Core が十分に使えるのが先）。

## 既知の注意点
- PDF背景は pdfjs を遅延import（`pdfjs-dist/build/pdf.worker.min.mjs?url`）。読み込み失敗時は画像(PNG/JPG)でも可。
- 座標は world（Konva の getRelativePointerPosition / stage.scale・position）で統一。ズーム/パンしても vertices はぶれない。
- localStorage キー `iraka.measurements.v1`。旧データは status/revision を自動補完。
- 今のゴールは「OSを作る」ではなく **「実際の積算で毎日使いたくなる CAD を作る」**。
