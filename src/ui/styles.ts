export const baseCss = /* css */ `
  :host { display: block; color: var(--text); font-family: var(--font); font-size: 13px; }
  * { box-sizing: border-box; }
  button, input, select, textarea { font-family: inherit; font-size: 12px; color: var(--text); }
  button { cursor: pointer; }
  ::-webkit-scrollbar { width: 9px; height: 9px; }
  ::-webkit-scrollbar-thumb { background: #33443a; border-radius: 6px; border: 2px solid transparent; background-clip: content-box; }
  ::-webkit-scrollbar-track { background: transparent; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    height: 30px; padding: 0 12px; border-radius: 8px;
    background: var(--panel-3); border: 1px solid var(--line); color: var(--text);
    font-weight: 500; letter-spacing: 0.2px; transition: background .15s, border-color .15s, transform .1s;
    white-space: nowrap; user-select: none;
  }
  .btn:hover { background: var(--elev); border-color: #3c5245; }
  .btn:active { transform: translateY(1px); }
  .btn:disabled { opacity: .42; cursor: not-allowed; transform: none; }
  .btn.primary { background: linear-gradient(180deg, #eac264, #d9a63e); border-color: #f0cf86; color: #2a2210; font-weight: 600; }
  .btn.primary:hover { background: linear-gradient(180deg, #f2cf7c, #e2b04a); }
  .btn.ghost { background: transparent; }
  .btn.danger { color: #f0a396; border-color: #5a3733; }
  .btn.danger:hover { background: #3a2320; }
  .btn.sm { height: 25px; padding: 0 9px; font-size: 11px; border-radius: 7px; }
  .btn.icon { width: 28px; padding: 0; }
  .btn.toggled { background: #2f4a37; border-color: #4f7a5c; color: #d9f0da; }

  .input, .select, .textarea {
    background: var(--bg-deep); border: 1px solid var(--line); border-radius: 8px;
    height: 30px; padding: 0 9px; outline: none; width: 100%;
    transition: border-color .15s, box-shadow .15s;
  }
  .textarea { height: auto; padding: 8px 9px; resize: vertical; line-height: 1.5; }
  .input:focus, .select:focus, .textarea:focus { border-color: #5d8a67; box-shadow: 0 0 0 2px rgba(115,193,122,.14); }
  .input.mono { font-family: var(--mono); }
  .select { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #8fa393 50%), linear-gradient(135deg, #8fa393 50%, transparent 50%); background-position: calc(100% - 13px) 12px, calc(100% - 8px) 12px; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 22px; }
  .field { display: flex; flex-direction: column; gap: 5px; }
  .field > label { font-size: 11px; color: var(--text-faint); letter-spacing: .3px; }
  .row { display: flex; align-items: center; gap: 8px; }
  .grow { flex: 1; min-width: 0; }
  .muted { color: var(--text-dim); }
  .faint { color: var(--text-faint); }
  .mono { font-family: var(--mono); }
  .small { font-size: 11px; }
  .divider { height: 1px; background: var(--line-soft); margin: 10px 0; }
  .kbd { font-family: var(--mono); font-size: 10px; background: #1b2620; border: 1px solid #33443a; border-bottom-width: 2px; border-radius: 4px; padding: 1px 5px; color: #a9bcaa; }

  .panel { background: linear-gradient(180deg, rgba(255,255,255,.018), transparent 120px), var(--panel); border: 1px solid var(--line-soft); border-radius: 12px; }
  .panel-head { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; border-bottom: 1px solid var(--line-soft); }
  .panel-head .title { font-size: 12px; font-weight: 600; letter-spacing: .4px; color: #d8e5d7; }
  .panel-body { padding: 10px; }

  .chip {
    display: inline-flex; align-items: center; gap: 5px; height: 21px; padding: 0 8px;
    border-radius: 999px; font-size: 11px; border: 1px solid var(--line); background: var(--panel-2); color: var(--text-dim);
    white-space: nowrap;
  }
  .chip.gold { color: #f0cd84; border-color: #5d4a24; background: #2a2416; }
  .chip.green { color: #9fda9f; border-color: #35543c; background: #1a2a20; }
  .chip.blue { color: #a8cdea; border-color: #2f4759; background: #182430; }
  .chip.red { color: #f2a99c; border-color: #5a3733; background: #2b1c19; }
  .chip.purple { color: #cbb6e8; border-color: #453556; background: #241c2e; }

  .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px currentColor; }
  .empty { padding: 28px 16px; text-align: center; color: var(--text-faint); font-size: 12px; line-height: 1.9; }
  .scroll { overflow: auto; }
  .section-label { font-size: 10.5px; letter-spacing: 1.2px; color: var(--text-faint); text-transform: uppercase; padding: 2px 2px 6px; }
  .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; border: none; background: transparent; color: var(--text-faint); }
  .icon-btn:hover { background: #26342b; color: var(--text); }
  .icon-btn.on { color: var(--wheat); background: #2b2718; }

  .toast-host { position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 9999; pointer-events: none; }
  .toast {
    padding: 9px 16px; border-radius: 10px; background: #1c2a21; border: 1px solid #3a5543;
    box-shadow: 0 10px 30px rgba(0,0,0,.45); font-size: 12px; color: #dcf0dc;
    animation: toastIn .18s ease-out; display: flex; align-items: center; gap: 8px;
  }
  .toast.warn { background: #2e2417; border-color: #5e4a24; color: #f3dcae; }
  .toast.err { background: #2e1d1a; border-color: #5e3630; color: #f6c3b8; }
  @keyframes toastIn { from { opacity: 0; transform: translateY(8px) scale(.98); } }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(5,9,6,.66); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 9000; }
  .modal { width: 420px; background: var(--panel); border: 1px solid #33463a; border-radius: 14px; box-shadow: 0 30px 80px rgba(0,0,0,.55); animation: fadeUp .18s ease-out; }
  .modal-head { padding: 16px 18px 0; font-size: 14px; font-weight: 600; }
  .modal-body { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; }
  .modal-foot { padding: 0 18px 16px; display: flex; justify-content: flex-end; gap: 8px; }
`;

export const APP_NAME = '禾影工坊';
