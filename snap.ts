* { box-sizing: border-box; }
body { margin: 0; font-family: 'Yu Gothic', 'Hiragino Kaku Gothic ProN', 'Segoe UI', sans-serif; color: #222; }
.app { display: flex; flex-direction: column; height: 100vh; }
.main { flex: 1; display: flex; min-height: 0; }
.canvas-wrap { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #eef1f4; min-width: 0; }
.canvas-box { background: #fff; border: 1px solid #d7dee6; border-radius: 8px; overflow: hidden; align-self: flex-start; }
.hint { font-size: 12px; color: #66707a; }
.sidebar { width: 320px; border-left: 1px solid #dde3ea; padding: 12px; overflow: auto; background: #fafbfc; }

/* 左: 案件エクスプローラー（e0.3.2） */
.explorer { width: 240px; border-right: 1px solid #dde3ea; padding: 12px; overflow: auto; background: #fafbfc; display: flex; flex-direction: column; }
.explorer h3 { margin: 0 0 10px; font-size: 13px; color: #1f4e79; letter-spacing: .03em; }
.explorer .proj { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.explorer .proj-ico { font-size: 14px; }
.explorer .proj-name { flex: 1; min-width: 0; padding: 5px 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; font-weight: bold; color: #1f4e79; }
.dwg-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
.dwg-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 13px; }
.dwg-item:hover { border-color: #2e74b5; }
.dwg-item.sel { border-color: #e8590c; background: #fff4ec; }
.dwg-ico { font-size: 13px; flex: none; }
.dwg-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dwg-nav { display: flex; gap: 6px; margin-bottom: 10px; }
.dwg-nav button { flex: 1; font-size: 12px; padding: 6px 4px; background: #fff; border: 1px solid #cbd5e1; color: #33414f; border-radius: 6px; cursor: pointer; }
.dwg-nav button:hover:not(:disabled) { border-color: #2e74b5; color: #1f4e79; }
.dwg-nav button:disabled { color: #b7c0cb; cursor: not-allowed; }
.explorer .add { margin-top: auto; width: 100%; background: #fff; border: 1px solid #1f4e79; color: #1f4e79; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.explorer .add:hover { background: #1f4e79; color: #fff; }

.toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #1f4e79; color: #fff; flex-wrap: wrap; }
.toolbar .sp { flex: 1; }
.toolbar label { font-size: 12px; display: flex; align-items: center; gap: 4px; }
.toolbar input[type=number] { width: 64px; padding: 4px; border-radius: 4px; border: none; }
.toolbar button { background: #2e74b5; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; }
.toolbar button:hover { background: #3a86d0; }
.toolbar button.ghost { background: transparent; border: 1px solid #ffffff66; }
.toolbar .file { background: #ffffff22; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 13px; }

.panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
.panel h3 { margin: 0 0 10px; font-size: 13px; color: #1f4e79; letter-spacing: .03em; }
.kv { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.kv b { color: #1f4e79; }
.area { font-size: 30px; font-weight: bold; color: #1f4e79; margin: 6px 0 12px; }
.area small { font-size: 14px; font-weight: normal; color: #66707a; }
.field { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; font-size: 12px; color: #55606a; }
.field input { padding: 7px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; }
.save { width: 100%; background: #1f4e79; color: #fff; border: none; padding: 9px; border-radius: 6px; font-size: 14px; cursor: pointer; }
.save:disabled { background: #a7b3c0; cursor: not-allowed; }

.list-item { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; cursor: pointer; font-size: 13px; display: flex; justify-content: space-between; }
.list-item:hover { border-color: #2e74b5; }
.list-item.sel { border-color: #e8590c; background: #fff4ec; }
.list-item .id { color: #66707a; font-size: 11px; }
.list-empty { font-size: 12px; color: #99a; padding: 8px 0; }
.exp { width: 100%; margin-top: 6px; background: #fff; border: 1px solid #1f4e79; color: #1f4e79; padding: 7px; border-radius: 6px; cursor: pointer; font-size: 13px; }
