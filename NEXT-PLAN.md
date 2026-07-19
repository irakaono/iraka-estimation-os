# 次チャットの計画（e0.3.1 検証クローズ → e0.3.2 案件・図面管理）

## 現状
- **e0.3-beta が GitHub Pages で稼働**。PDF表示(CDN方式)・Polygon描画・面積計算・保存・再読込まで動作確認済み。
- **e0.3.1 実装済み・検証待ち**：UI表示ラベルの日本語化（翻訳表どおり／内部値は英語のまま）＋ 読み込み時 fit ズーム。typecheck・build 両グリーン。
- コンソールの黄色警告「HTML dialog can only be shown with a user activation」は `window.prompt`（縮尺較正）由来で**無害**。優先度低。

---

## バージョンの刻み（合意済み）

小さく割って、不具合時に切り戻しやすくする。特に **Measurement モデル変更（e0.3.3）を独立リリース**にするのが肝。

| 版 | 内容 | 状態 |
|----|------|------|
| **e0.3.1** | UI改善（日本語化 + fit zoom）※ロジック不変 | 実装済み・**検証待ち** |
| **e0.3.2** | 案件・図面管理（Project / Drawing）。複数PDF・複数ページ・図面リスト・←→ | 次 |
| **e0.3.3** | Measurement ↔ Drawing 連携（`drawingId` / `page` 追加 → 図面ジャンプ） | その後 |
| **e0.4.0** | Recognizer・Evidence Viewer・数量エンジン強化 | 将来 |

> 原則: e0.3.2 は Project/Drawing を **足すだけ**（Measurement 型には触れない）。型を触るのは e0.3.3 だけ。こうすれば「案件管理」で不具合が出ても Measurement には波及せず、e0.3.3 だけロールバックできる。

---

## e0.3.1 完了ゲート（4項目・実PDF＋公開版で確認して初めてクローズ）

「実装できた」≠「完了」。GitHub Pages の公開版に実PDFを1枚読み込んで、下記4つが通ったら **e0.3.1 を正式リリースとして閉じる**。

- [ ] ① PDFを1枚読み込む（公開版で読み込めるか）
- [ ] ② 日本語表示を確認（図形/拾い種類/面積/名称/工種/積算項目、保存・書き出しボタン、一覧見出し）
- [ ] ③ 初期表示で図面全体が収まるか（立面図など大きい図面が切れないか）
- [ ] ④「全体表示」ボタンで再fitするか（パン・ズーム後に押して全体に戻るか）

> 数値メモ: fit の余白は現状 4%（`fitToView` の `pad = 0.96`）。きつい/緩ければこの1箇所だけ調整。

---

## e0.3.2 — 案件・図面管理（Project / Drawing）

現状は「1ファイル = 1背景」。実務は「1案件 = 図面一式」。目標のツリー:

```
Project（案件：今野様邸）
 ├─ Drawing1.pdf
 │   ├─ page1
 │   └─ page2
 ├─ Drawing2.pdf
 └─ measurements   ← 拾いは案件に属する（図面への紐付けは e0.3.3）
```

- 「図面を読み込む」→ **複数選択**で取り込み、左に図面リスト:
  ```
  今野様邸
  □ A-01 表紙
  □ A-03 平面図
  □ A-06 屋根伏図
  ...
  現在表示中 ── A-06 屋根伏図
  ← 前の図面 / → 次の図面
  ```
- 毎回「図面を読み込む」を押さずに ←→ で切替。
- PDF複数ページにも対応（`getPage(n)` で 1PDF = 複数 Drawing になり得る）。
- 将来: ドラッグ&ドロップで「今野様邸.zip」（A-01.pdf … 一式）→ 案件として登録。

### e0.3.2 の作るもの（実装メモ・Measurement型には触れない）
1. `Drawing` 型を新設: `{ drawingId, name, pageIndex, image(dataURL/HTMLImageElement) }`。`Project`（軽い概念）に Drawing 配列。
2. 複数選択の取り込み（`<input multiple>`）＋ PDF 複数ページを page ごとに Drawing 化。
3. 図面リスト UI（サイドバー上部）: 一覧・現在表示ハイライト・←→ナビ。
4. 背景切替（選択 Drawing の image を Canvas 背景に）。切替時に fit（e0.3.1 の `fitToView` を再利用）。

---

## e0.3.3 — Measurement ↔ Drawing 連携（ここだけ型を触る）

- **Measurement に `drawingId?: string` / `page?: number` を追加**（任意フィールド＝既存互換。旧データは補完）。
  - 例: M-001 図面A-06 屋根面積① / M-003 図面A-04 軒高さ / M-004 図面A-05 ケラバ高さ。
  - → Measurement をクリックすると**その図面へ自動ジャンプ**。Recognizer にも効く。
- 背景切替時は drawingId で**今の図面の拾いだけ濃く**表示（他図面の拾いは薄く/非表示）。
- 変わらない原則: **vertices が真実**。drawingId/page は所属メタにすぎない。Quantity は派生ビューのまま。
- DATAMODEL.md も e0.3.3 で更新（Drawing 概念と drawingId/page を正として記載）。

> この設計は将来の AI Recognizer / Evidence Viewer / 人手積算との比較 / 複数図面横断検索 まで、そのまま拡張できる土台になる。

---

## e0.3.1 翻訳表（実施済み・記録用）

| 現在(旧) | 変更(日本語) |
|------|------|
| Geometry | 図形 |
| Operation | 拾い種類 |
| Polygon | 多角形 |
| Area | 面積 |
| Measurement | 拾いデータ |
| Measurements | 保存済みデータ |
| Label | 名称 |
| Trade | 工種 |
| Item | 積算項目 |
| Measurement を保存 | 拾いデータを保存 |
| measurements.json を書き出す | 拾いデータを書き出す |

> 内部の識別子（geometry='Polygon', operation='Area', status='editing' 等の**値**）は英語のまま。**表示ラベルだけ**日本語化（データ互換を壊さない）。
