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
  // e0.3.3 で drawingId?: string / page?: number を追加予定（今はまだ足さない）。
}

// ── e0.3.2: 案件 = 図面一式 ────────────────────────────────────────────
// 「1案件 = 複数図面」を表す軽い概念。Measurement 型には触れない（ひも付けは e0.3.3）。

// 1枚の図面（PDFの1ページ or 画像1枚）。背景画像は実行時のみ保持（e0.3.2 では永続化しない）。
export interface Drawing {
  drawingId: string;   // 例: D-001
  name: string;        // 表示名 例: "A-06 屋根伏図 (p1)"
  sourceName: string;  // 元ファイル名 例: A-06.pdf
  page: number;        // 1始まりのページ番号（画像は常に 1）
  pageCount: number;   // 元ファイルの総ページ数
  image: HTMLImageElement; // 背景画像（session only。将来 dataURL 等で永続化）
}

// 案件。将来「エクスプローラー」に AI認識/手積算比較/Evidence を生やす器。
export interface Project {
  schemaVersion: number; // ★最初から持たせる。将来の移行処理の土台（現状 = 1）
  name: string;          // 案件名 例: 今野様邸
  createdAt?: string;    // ISO日時（任意）
  drawings: Drawing[];   // 図面一式
}

export const PROJECT_SCHEMA_VERSION = 1;
