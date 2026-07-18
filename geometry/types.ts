// 甍AI Estimation OS — Geometry / Measurement 型（DATAMODEL.md 準拠）
// 真実は vertices のみ。amount は保存しない（Geometry Engine が計算する）。

export type GeometryKind = 'Polygon' | 'Line' | 'Polyline' | 'Point';
export type Operation = 'Area' | 'Length' | 'Count';
export type Vertex = [number, number]; // 図面ピクセル座標

// ライフサイクル: editing → confirmed → locked
//   editing   : 編集中
//   confirmed : 積算対象として確定
//   locked    : 見積書/発注書の根拠になったため変更不可
export type MeasurementStatus = 'editing' | 'confirmed' | 'locked';

export interface Measurement {
  measurementId: string;
  geometry: GeometryKind;
  operation: Operation;
  vertices: Vertex[];   // ★唯一の保存値
  label: string;        // 例: 屋根面A
  trade: string;        // 例: 屋根工事（e0.3では仮入力でよい）
  item: string;         // 例: 横暖S 本体
  unit: string;         // ㎡ / m / 個
  status: MeasurementStatus; // 状態（AI生成/人修正/提出済みで扱いが違う）
  revision: number;     // 版。ドラッグで変わる geometry の履歴（Undo/比較の土台）
}
