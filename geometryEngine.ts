// プロパティ: 編集中の Measurement を直接編集する（画面 → Measurement）。
interface Props {
  active: boolean;
  vertexCount: number;
  areaM2: number;
  label: string;
  trade: string;
  item: string;
  editingId: string | null; // 既存編集中なら M-00x、新規なら null
  revision: number;
  status: 'editing' | 'confirmed' | 'locked';
  canSave: boolean;
  onChange: (field: 'label' | 'trade' | 'item', value: string) => void;
  onSave: () => void;
}

export default function Properties(props: Props) {
  return (
    <div className="panel">
      <h3>
        拾いデータ
        {props.active && (
          <span style={{ float: 'right', fontSize: 11, color: props.editingId ? '#e8590c' : '#2e74b5' }}>
            {props.editingId ? `編集中 ${props.editingId}` : '新規'}
          </span>
        )}
      </h3>

      {!props.active && (
        <div className="list-empty">「＋ 多角形を描く」か、一覧の項目をクリックして編集を開始。</div>
      )}

      <div className="kv"><span>図形</span><b>多角形</b></div>
      <div className="kv"><span>拾い種類</span><b>面積</b></div>
      <div className="kv"><span>頂点数</span><b>{props.vertexCount}</b></div>
      {props.active && (
        <div className="kv"><span>状態 / 版</span><b>{statusLabel(props.status)} · rev{props.revision}</b></div>
      )}

      <div className="area">
        {props.areaM2.toFixed(2)}<small> ㎡</small>
      </div>

      <div className="field">
        名称（拾い名）
        <input value={props.label} placeholder="屋根面A" disabled={!props.active}
          onChange={(e) => props.onChange('label', e.target.value)} />
      </div>
      <div className="field">
        工種
        <input value={props.trade} placeholder="屋根工事" disabled={!props.active}
          onChange={(e) => props.onChange('trade', e.target.value)} />
      </div>
      <div className="field">
        積算項目（集約先）
        <input value={props.item} placeholder="横暖S 本体" disabled={!props.active}
          onChange={(e) => props.onChange('item', e.target.value)} />
      </div>

      <button className="save" disabled={!props.canSave} onClick={props.onSave}>
        {props.editingId ? '拾いデータを更新' : '拾いデータを保存'}
      </button>
    </div>
  );
}

// 状態の値は内部では英語のまま（データ互換）。表示だけ日本語化する。
function statusLabel(status: 'editing' | 'confirmed' | 'locked'): string {
  return status === 'confirmed' ? '確定' : status === 'locked' ? 'ロック' : '編集中';
}
