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
        MEASUREMENT
        {props.active && (
          <span style={{ float: 'right', fontSize: 11, color: props.editingId ? '#e8590c' : '#2e74b5' }}>
            {props.editingId ? `編集中 ${props.editingId}` : '新規'}
          </span>
        )}
      </h3>

      {!props.active && (
        <div className="list-empty">「＋ 新規 Polygon」か、一覧の項目をクリックして編集を開始。</div>
      )}

      <div className="kv"><span>Geometry</span><b>Polygon</b></div>
      <div className="kv"><span>Operation</span><b>Area</b></div>
      <div className="kv"><span>頂点数</span><b>{props.vertexCount}</b></div>
      {props.active && (
        <div className="kv"><span>状態 / 版</span><b>{props.status} · rev{props.revision}</b></div>
      )}

      <div className="area">
        {props.areaM2.toFixed(2)}<small> ㎡</small>
      </div>

      <div className="field">
        Label（拾い名）
        <input value={props.label} placeholder="屋根面A" disabled={!props.active}
          onChange={(e) => props.onChange('label', e.target.value)} />
      </div>
      <div className="field">
        Trade（工種）
        <input value={props.trade} placeholder="屋根工事" disabled={!props.active}
          onChange={(e) => props.onChange('trade', e.target.value)} />
      </div>
      <div className="field">
        Item（集約先）
        <input value={props.item} placeholder="横暖S 本体" disabled={!props.active}
          onChange={(e) => props.onChange('item', e.target.value)} />
      </div>

      <button className="save" disabled={!props.canSave} onClick={props.onSave}>
        {props.editingId ? 'Measurement を更新' : 'Measurement を保存'}
      </button>
    </div>
  );
}
