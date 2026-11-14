import { BaseElement, confirmDialog, toast } from './base';
import { store, navigate } from './context';
import type { AssetPart, Bone, ChannelKind, EasingType, PartKind, Project, Keyframe } from '../core/types';
import { CHANNEL_LABEL, EASING_LABEL, PART_LABEL } from '../core/types';
import { renderPart } from '../core/art';
import { canParent, ensureTrack, sortKeys } from '../core/rig';
import { clamp, escapeHtml, fmtDate, uid } from '../core/util';
import { buildDeliveryZip, downloadZip, parseConfig, rigConfig } from '../core/exporter';
import { DESIGN_H, DESIGN_W } from '../core/renderer';
import type { StageView } from './stage-view';
import type { TimelineView } from './timeline-view';

const css = /* css */ `
  :host { display: flex; flex-direction: column; height: 100%; min-height: 0; overflow: hidden; }
  .topbar {
    height: 44px; flex: 0 0 44px; display: flex; align-items: center; gap: 10px; padding: 0 12px;
    border-bottom: 1px solid var(--line-soft); background: #101712;
  }
  .proj { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
  .proj .t { font-size: 12.5px; font-weight: 600; color: #e8efe4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
  .proj .s { font-size: 10px; color: var(--text-faint); display: flex; gap: 6px; align-items: center; }
  .status-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; height: 19px; padding: 0 8px; border-radius: 999px; border: 1px solid; }
  .top-sep { width: 1px; height: 22px; background: var(--line); }
  .spacer { flex: 1; }
  .vchip { font-family: var(--mono); font-size: 10.5px; color: #e6cd92; background: #2b2415; border: 1px solid #4a3c20; border-radius: 5px; padding: 2px 7px; }
  .pending-chip { font-size: 10.5px; color: #f2b7a9; display: flex; align-items: center; gap: 5px; cursor: pointer; }
  .pending-chip:hover { color: #ffd0c4; }

  .main { flex: 1; min-height: 0; display: flex; }
  .side { width: 206px; flex: 0 0 206px; display: flex; flex-direction: column; border-right: 1px solid var(--line-soft); background: var(--panel); min-height: 0; }
  .side.right { border-right: none; border-left: 1px solid var(--line-soft); width: 286px; flex-basis: 286px; }
  .side-head {
    height: 34px; flex: 0 0 34px; display: flex; align-items: center; gap: 6px; padding: 0 10px;
    border-bottom: 1px solid var(--line-soft); font-size: 11px; font-weight: 600; letter-spacing: .6px; color: #cddcce;
  }
  .side-head .mini-btn { margin-left: auto; }
  .side-scroll { flex: 1 1 52%; overflow: auto; min-height: 0; padding: 8px; }
  .stage-wrap { flex: 1; min-width: 0; position: relative; display: flex; flex-direction: column; }
  .stage-box { flex: 1; min-height: 0; position: relative; }
  .playbar {
    flex: 0 0 38px; display: flex; align-items: center; gap: 6px; padding: 0 10px;
    border-top: 1px solid var(--line-soft); background: #101712;
  }
  .playbar .frame-in { width: 58px; height: 25px; text-align: center; }
  .playbar .spacer { flex: 1; }
  .playbar .time { font-family: var(--mono); font-size: 10.5px; color: #8fa393; }
  .tl-wrap { flex: 0 0 286px; min-height: 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; }
  .resizer { height: 5px; cursor: ns-resize; background: transparent; }
  .tl-wrap farm-timeline { flex: 1; min-height: 0; }

  .asset {
    display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 8px; border: 1px solid transparent;
    cursor: grab; transition: background .12s, border-color .12s; position: relative;
  }
  .asset:hover { background: #1c2620; border-color: #2e4034; }
  .asset.used { opacity: .55; }
  .asset .thumb {
    width: 40px; height: 40px; flex: 0 0 auto; border-radius: 7px; border: 1px solid #2e4034;
    background: repeating-conic-gradient(#172017 0% 25%, #121a14 0% 50%) 50% / 12px 12px;
    display: grid; place-items: center; overflow: hidden;
  }
  .asset .thumb img { max-width: 38px; max-height: 38px; object-fit: contain; }
  .asset .info { min-width: 0; flex: 1; }
  .asset .nm { font-size: 11.5px; color: #d9e5d6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .asset .kind { font-size: 9.5px; color: var(--text-faint); margin-top: 2px; }
  .asset .use { font-size: 9px; color: #7e947f; }
  .tree-panel { flex: 1 1 48%; min-height: 150px; display: flex; flex-direction: column; border-top: 1px solid var(--line); overflow: hidden; }
  .tree-count { margin-left: auto; font-family: var(--mono); font-size: 9.5px; color: var(--text-faint); font-weight: 400; }
  .tree-scroll { flex: 1; overflow: auto; padding: 6px; min-height: 0; }
  .tree-actions { display: flex; gap: 5px; padding: 6px; border-top: 1px solid var(--line-soft); }
  .tree-actions .btn { flex: 1; padding: 0 6px; font-size: 10.5px; }
  .drop-hint {
    border: 1px dashed #3a4f3f; border-radius: 9px; padding: 12px; text-align: center; color: var(--text-faint);
    font-size: 10.5px; line-height: 1.7; margin-top: 8px;
  }
  .drop-hint.over { border-color: #7cb469; background: #1a261c; color: #b9d7b4; }

  .tree { display: flex; flex-direction: column; gap: 1px; }
  .tree-row {
    display: flex; align-items: center; gap: 6px; height: 25px; padding: 0 6px; border-radius: 6px;
    font-size: 11.5px; color: #c7d5c5; cursor: pointer; position: relative;
  }
  .tree-row:hover { background: #1d2821; }
  .tree-row.sel { background: #2a3626; color: #f1e6c9; box-shadow: inset 0 0 0 1px #4a5f46; }
  .tree-row .tw { width: 10px; color: #5f7461; font-size: 9px; text-align: center; }
  .tree-row .sw { width: 7px; height: 7px; border-radius: 2px; flex: 0 0 auto; }
  .tree-row .nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tree-row .lk { font-size: 9px; color: #8f9d90; }
  .tree-row .pt { width: 6px; height: 6px; border-radius: 50%; background: #4d6a55; }
  .tree-row.haspart .pt { background: #7cb469; box-shadow: 0 0 5px rgba(124,180,105,.7); }
  .tree-empty { padding: 14px 8px; font-size: 10.5px; color: var(--text-faint); line-height: 1.8; text-align: center; }

  .insp-empty { padding: 26px 12px; text-align: center; font-size: 11px; color: var(--text-faint); line-height: 1.9; }
  .sec { padding: 8px 10px; border-bottom: 1px solid var(--line-soft); }
  .sec:last-child { border-bottom: none; }
  .sec-title { font-size: 10px; letter-spacing: 1px; color: var(--text-faint); margin-bottom: 7px; display: flex; align-items: center; gap: 6px; }
  .sec-title .line { flex: 1; height: 1px; background: var(--line-soft); }
  .name-row { display: flex; gap: 6px; align-items: center; }
  .name-input { height: 27px; font-size: 12px; }
  .prop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .prop { display: flex; flex-direction: column; gap: 3px; }
  .prop label { font-size: 9.5px; color: var(--text-faint); letter-spacing: .4px; display: flex; align-items: center; gap: 4px; }
  .prop input { height: 26px; font-size: 11.5px; font-family: var(--mono); background: #0d1410; }
  .prop input:disabled { opacity: .5; }
  .prop input:focus { border-color: #5d8a67; }
  .lock-row { display: flex; align-items: center; gap: 8px; }
  .switch { position: relative; width: 32px; height: 18px; border-radius: 999px; background: #2a372e; border: 1px solid #3c5043; transition: background .15s; flex: 0 0 auto; cursor: pointer; }
  .switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: #8fa393; transition: transform .15s, background .15s; }
  .switch.on { background: #5a3a22; border-color: #8a5a2f; }
  .switch.on::after { transform: translateX(14px); background: #f0c27a; }
  .switch-label { font-size: 11px; color: #c4d3c2; }
  .switch-sub { font-size: 9.5px; color: var(--text-faint); }
  .btn-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .btn-row .btn { flex: 1; min-width: 0; padding: 0 8px; font-size: 11px; }
  .bind-note { font-size: 9.5px; color: var(--text-faint); line-height: 1.6; }
  .key-count { font-family: var(--mono); font-size: 10px; color: #93a595; }
  .ch-list { display: flex; flex-direction: column; gap: 4px; }
  .ch-row { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #c2d0c0; }
  .ch-row .k { margin-left: auto; font-family: var(--mono); font-size: 9.5px; color: #829583; }
  .ch-row .kd { width: 6px; height: 6px; border-radius: 50%; }
  .version-list { display: flex; flex-direction: column; gap: 6px; }
  .ver-item { border: 1px solid var(--line-soft); background: #141c17; border-radius: 8px; padding: 7px 8px; }
  .ver-item .vh { display: flex; align-items: center; gap: 6px; }
  .ver-item .vh b { font-family: var(--mono); font-size: 11px; color: #e6cd92; }
  .ver-item .vh .when { margin-left: auto; font-size: 9.5px; color: var(--text-faint); }
  .ver-item .vnote { font-size: 10.5px; color: var(--text-dim); margin-top: 4px; line-height: 1.5; }
  .ann-mini { display: flex; gap: 6px; align-items: flex-start; padding: 5px 6px; border-radius: 6px; background: #161f19; margin-bottom: 4px; }
  .ann-mini .num { font-family: var(--mono); font-size: 9px; width: 16px; height: 16px; display: grid; place-items: center; border-radius: 50%; background: #3a2a1b; color: #f0cd84; flex: 0 0 auto; }
  .ann-mini .tx { font-size: 10.5px; color: #c8d5c6; line-height: 1.5; }
  .ann-mini .fr { font-size: 9px; color: var(--text-faint); font-family: var(--mono); }

  .export-modal .modal { width: 520px; }
  .export-progress { height: 6px; border-radius: 4px; background: #1b2620; overflow: hidden; }
  .export-progress i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #7cb469, #e9b750); transition: width .12s; }
  .export-log { font-family: var(--mono); font-size: 10px; color: #8fa393; height: 72px; overflow: auto; background: #0c120e; border: 1px solid var(--line-soft); border-radius: 7px; padding: 6px 8px; line-height: 1.6; }
  .opt-row { display: flex; align-items: center; gap: 10px; font-size: 11.5px; color: #c8d5c6; }
  .checkbox { appearance: none; width: 15px; height: 15px; border: 1px solid #4a6150; border-radius: 4px; background: #0d1410; position: relative; cursor: pointer; }
  .checkbox:checked { background: #527a58; border-color: #6f9c74; }
  .checkbox:checked::after { content: '✓'; position: absolute; inset: 0; color: #10200f; font-size: 11px; display: grid; place-items: center; font-weight: 700; }
  .hint-note { font-size: 9.5px; color: var(--text-faint); line-height: 1.6; padding: 6px 2px 0; text-align: center; }
  .warn-box { font-size: 10.5px; color: #f2c9a0; background: #2a2013; border: 1px solid #56401e; border-radius: 8px; padding: 8px 10px; line-height: 1.6; }
  .shortcut-row { display: flex; gap: 10px; font-size: 9.5px; color: var(--text-faint); flex-wrap: wrap; }
`;

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  '制作中': { color: '#f0cd84', bg: '#2a2416', border: '#5d4a24', dot: '#e9b750' },
  '待审核': { color: '#a8cdea', bg: '#182430', border: '#2f4759', dot: '#6fa8d6' },
  '退回': { color: '#f2a99c', bg: '#2b1c19', border: '#5a3733', dot: '#e07464' },
  '已采用': { color: '#9fda9f', bg: '#1a2a20', border: '#35543c', dot: '#73c17a' },
};

export class WorkbenchView extends BaseElement {
  private frame = 0;
  private playing = false;
  private loop = true;
  private rafId = 0;
  private playAcc = 0;
  private lastTs = 0;
  private selectedBoneId: string | null = null;
  private selectedKey: { boneId: string; kind: ChannelKind; keyId: string } | null = null;
  private unsubscribe: (() => void) | null = null;
  private collapsedTimeline = false;
  private tlHeight = 286;
  private needsFullRefresh = true;

  protected init() {
    this.unsubscribe = store.subscribe((_s, reason) => this.onStore(reason));
    this.renderShell();
    this.bindShell();
    this.bindStoreEvents();
    this.bindKeyboard();
    this.refreshAll();
  }

  protected onDisconnect() {
    this.unsubscribe?.();
    cancelAnimationFrame(this.rafId);
  }

  private get project() {
    return store.project;
  }

  private renderShell() {
    this.render(`
      <div class="topbar" id="topbar"></div>
      <div class="main">
        <div class="side left">
          <div class="side-head">零件库 <button class="btn sm ghost mini-btn" id="import-btn" title="导入 PNG 零件">＋ 导入</button></div>
          <div class="side-scroll" id="asset-list"></div>
          <div class="tree-panel" id="bone-tree-panel">
            <div class="side-head">骨架层级 <span class="tree-count" id="tree-count"></span>
              <button class="btn sm ghost mini-btn" id="tree-add-bone" title="在画布中心加一根骨骼">＋</button>
            </div>
            <div class="tree-scroll" id="bone-tree"></div>
            <div class="tree-actions">
              <button class="btn sm ghost" id="tree-del-bone">删除选中</button>
              <button class="btn sm ghost" id="tree-lock" title="锁定/解锁 (L)">🔒 锁定</button>
            </div>
          </div>
        </div>
        <div class="stage-wrap">
          <div class="stage-box" id="stage-box"><farm-stage id="stage"></farm-stage></div>
          <div class="playbar">
            <button class="btn icon" id="go-start" title="回到第 0 帧">⏮</button>
            <button class="btn icon" id="go-prev" title="上一帧">◀</button>
            <button class="btn icon primary" id="play-btn" title="播放 / 暂停 (空格)">▶</button>
            <button class="btn icon" id="go-next" title="下一帧">▶|</button>
            <button class="btn icon" id="go-end" title="末帧">⏭</button>
            <input class="input mono frame-in" id="frame-in" value="0" title="跳转到帧">
            <button class="btn sm ${this.loop ? 'toggled' : ''}" id="loop-btn" title="循环播放">↻ 循环</button>
            <span class="spacer"></span>
            <span class="shortcut-row"><span><span class="kbd">K</span> 打帧</span><span><span class="kbd">空格</span> 播放</span><span><span class="kbd">←→</span> 逐帧</span></span>
            <span class="time" id="time-disp">0.00s / 2.00s</span>
          </div>
        </div>
        <div class="side right" id="inspector"><div class="side-head">骨骼检查器</div><div class="side-scroll" id="insp-body"></div></div>
      </div>
      <div class="resizer" id="resizer"></div>
      <div class="tl-wrap" id="tl-wrap"><farm-timeline id="timeline"></farm-timeline></div>
      <input type="file" id="file-input" accept="image/png,image/*" multiple style="display:none">
      <input type="file" id="import-config" accept="application/json" style="display:none">
    `, css);
  }

  private bindShell() {
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;

    this.shadow.getElementById('import-btn')?.addEventListener('click', () => {
      (this.shadow.getElementById('file-input') as HTMLInputElement).click();
    });
    this.shadow.getElementById('file-input')?.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) void this.importFiles(Array.from(files));
      (e.target as HTMLInputElement).value = '';
    });

    const assetList = this.shadow.getElementById('asset-list')!;
    assetList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const hint = assetList.querySelector('.drop-hint');
      hint?.classList.add('over');
    });
    assetList.addEventListener('dragleave', () => assetList.querySelector('.drop-hint')?.classList.remove('over'));
    assetList.addEventListener('drop', (e) => {
      e.preventDefault();
      assetList.querySelector('.drop-hint')?.classList.remove('over');
      const files = e.dataTransfer?.files;
      if (files?.length) void this.importFiles(Array.from(files));
    });

    this.shadow.getElementById('tree-add-bone')?.addEventListener('click', () => {
      this.buildBone(this.selectedBoneId, DESIGN_W / 2, DESIGN_H / 2, true);
    });
    this.shadow.getElementById('tree-del-bone')?.addEventListener('click', () => void this.deleteSelectedBone());
    this.shadow.getElementById('tree-lock')?.addEventListener('click', () => this.toggleLock());

    // stage -> workbench
    stage.addEventListener('bone-select', (e) => {
      this.selectedBoneId = (e as CustomEvent<string | null>).detail;
      this.syncSelection();
    });
    stage.addEventListener('bone-transform', (e) => {
      const d = (e as CustomEvent<{ boneId: string; patch: Partial<Bone>; live: boolean }>).detail;
      this.applyBonePatch(d.boneId, d.patch, d.live);
    });
    stage.addEventListener('build-bone', (e) => {
      const d = (e as CustomEvent<{ parentId: string | null; x: number; y: number }>).detail;
      this.buildBone(d.parentId, d.x, d.y);
    });
    stage.addEventListener('annotation-draft', (e) => {
      const d = (e as CustomEvent<{ frame: number; x: number; y: number; text: string }>).detail;
      if (roleIsAnimator()) {
        toast('画布批注由农技审核员提出；动画师可在审核页逐条回复', 'warn', 3200);
        stage.setMode('select');
        return;
      }
      const ann = store.addAnnotation(d.frame, d.x, d.y, d.text);
      if (ann) {
        toast('批注已添加，已同步到审核台', 'ok');
        stage.setMode('select');
        stage.setAnnotationsInteractive(false);
        this.refreshInspector();
      }
    });
    stage.setAnnotationsInteractive(false);
    stage.addEventListener('annotation-click', (e) => {
      const id = (e as CustomEvent<string>).detail;
      stage.setAnnotationSelection(id);
      timeline.setSelectedAnnotation(id);
      const ann = this.project?.annotations.find((a) => a.id === id);
      if (ann) this.seek(ann.frame);
    });

    // timeline -> workbench
    timeline.addEventListener('frame-change', (e) => this.setFrame((e as CustomEvent<number>).detail, false));
    timeline.addEventListener('bone-select', (e) => {
      this.selectedBoneId = (e as CustomEvent<string>).detail;
      this.syncSelection();
    });
    timeline.addEventListener('key-select', (e) => {
      this.selectedKey = (e as CustomEvent).detail;
    });
    timeline.addEventListener('segment-select', (e) => {
      this.selectedKey = null;
      void e;
    });
    timeline.addEventListener('easing-change', (e) => {
      const d = (e as CustomEvent<{ boneId: string; kind: ChannelKind; keyId: string; easing: EasingType }>).detail;
      this.changeEasing(d.boneId, d.kind, d.keyId, d.easing);
    });
    timeline.addEventListener('bezier-change', (e) => {
      const d = (e as CustomEvent<{ boneId: string; kind: ChannelKind; keyId: string; bezier: [number, number, number, number] }>).detail;
      this.changeBezier(d.boneId, d.kind, d.keyId, d.bezier);
    });
    timeline.addEventListener('key-drag', (e) => {
      const d = (e as CustomEvent<{ boneId: string; kind: ChannelKind; keyId: string; frame: number; live: boolean }>).detail;
      this.moveKey(d.boneId, d.kind, d.keyId, d.frame, d.live);
    });
    timeline.addEventListener('track-add-key', (e) => {
      const d = (e as CustomEvent<{ boneId: string; kind: ChannelKind; frame: number }>).detail;
      this.addKeyAt(d.boneId, d.kind, d.frame);
    });
    timeline.addEventListener('annotation-click', (e) => {
      const id = (e as CustomEvent<string>).detail;
      stage.focusAnnotation(id);
      const ann = this.project?.annotations.find((a) => a.id === id);
      if (ann) this.setFrame(ann.frame, false);
      this.refreshInspector();
    });
    timeline.addEventListener('toolbar-add-key', () => this.addKeyCurrentFrame());
    timeline.addEventListener('toolbar-delete-key', () => this.deleteSelectedKey());
    timeline.addEventListener('easing-noop', () => toast('先在时间轴上选中一个关键帧或曲线段', 'warn'));

    // playback
    this.shadow.getElementById('play-btn')?.addEventListener('click', () => this.togglePlay());
    this.shadow.getElementById('go-start')?.addEventListener('click', () => this.setFrame(0, false));
    this.shadow.getElementById('go-end')?.addEventListener('click', () => this.setFrame(this.project?.timeline.duration ?? 0, false));
    this.shadow.getElementById('go-prev')?.addEventListener('click', () => this.setFrame(this.frame - 1, false));
    this.shadow.getElementById('go-next')?.addEventListener('click', () => this.setFrame(this.frame + 1, false));
    this.shadow.getElementById('loop-btn')?.addEventListener('click', (e) => {
      this.loop = !this.loop;
      (e.currentTarget as HTMLElement).classList.toggle('toggled', this.loop);
    });
    const frameIn = this.shadow.getElementById('frame-in') as HTMLInputElement;
    frameIn?.addEventListener('change', () => this.setFrame(Number(frameIn.value) || 0, false));
    frameIn?.addEventListener('keydown', (e) => e.stopPropagation());

    // resizer
    const resizer = this.shadow.getElementById('resizer')!;
    resizer.addEventListener('pointerdown', (e) => {
      const startY = e.clientY;
      const startH = this.tlHeight;
      const move = (ev: PointerEvent) => {
        this.tlHeight = clamp(startH - (ev.clientY - startY), 120, 460);
        const wrap = this.shadow.getElementById('tl-wrap')!;
        wrap.style.flexBasis = `${this.tlHeight}px`;
      };
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
  }

  private bindStoreEvents() {
    window.addEventListener('focus-annotation', (e) => {
      const id = (e as CustomEvent<string>).detail;
      this.focusAnnotation(id);
    });
  }

  private bindKeyboard() {
    this.shadow.addEventListener('keydown', (e) => this.handleKey(e as KeyboardEvent));
  }

  private handleKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.setFrame(this.frame - (e.shiftKey ? 10 : 1), false);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.setFrame(this.frame + (e.shiftKey ? 10 : 1), false);
        break;
      case 'k':
      case 'K':
        e.preventDefault();
        this.addKeyCurrentFrame();
        break;
      case 'v':
      case 'V':
        stage.setMode('select');
        break;
      case 'b':
      case 'B':
        stage.setMode('build');
        break;
      case 'a':
      case 'A':
        stage.setMode('annotate');
        break;
      case 'l':
      case 'L':
        this.toggleLock();
        break;
      case 'Delete':
      case 'Backspace':
        if (this.selectedKey) {
          e.preventDefault();
          this.deleteSelectedKey();
        }
        break;
      case 'Home':
        this.setFrame(0, false);
        break;
      case 'End':
        this.setFrame(this.project?.timeline.duration ?? 0, false);
        break;
      default:
        break;
    }
  }

  refreshAll() {
    this.refreshTopbar();
    this.refreshAssets();
    this.refreshTree();
    this.refreshInspector();
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    stage?.setProject(this.project, this.project?.timeline ?? null, this.frame);
    timeline?.setProject(this.project, this.selectedBoneId);
    timeline?.setFrame(this.frame);
    this.updateTimeDisp();
    if (this.project && this.project.rig.bones.length && !this.selectedBoneId) {
      this.selectedBoneId = this.project.rig.bones[0].id;
      this.syncSelection();
    }
  }

  refresh() {
    this.refreshAll();
  }

  private onStore(reason: string) {
    if (reason === 'project') {
      this.frame = 0;
      this.selectedBoneId = null;
      this.refreshAll();
      return;
    }
    this.refreshTopbar();
    if (reason === 'edit' || reason === 'rig' || reason === 'annotations' || reason === 'status' || reason === 'version') {
      this.refreshTree();
      this.refreshAssets();
      this.refreshInspector();
      const stage = this.shadow.getElementById('stage') as unknown as StageView;
      const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
      stage?.setTimeline(this.project?.timeline ?? null);
      stage?.setProject(this.project, this.project?.timeline ?? null, this.frame);
      timeline?.setProject(this.project, this.selectedBoneId);
      timeline?.setFrame(this.frame);
    }
  }

  private refreshTopbar() {
    const bar = this.shadow.getElementById('topbar');
    if (!bar) return;
    const p = this.project;
    if (!p) {
      bar.innerHTML = `<div class="proj"><div class="t">未选择项目</div></div><div class="spacer"></div>`;
      return;
    }
    const st = STATUS_STYLE[p.status];
    const pending = p.annotations.filter((a) => a.status === 'pending').length;
    bar.innerHTML = `
      <div class="proj">
        <div class="t">${escapeHtml(p.title)}</div>
        <div class="s"><span>${p.crop} · 第 ${p.episode} 集</span><span>·</span><span>交付 ${p.deliveryDate}</span></div>
      </div>
      <span class="vchip">v${p.versions.length}</span>
      <span class="status-pill" style="color:${st.color};background:${st.bg};border-color:${st.border}"><span class="dot" style="color:${st.dot}"></span>${p.status}</span>
      ${pending ? `<span class="pending-chip" id="pending-chip">✎ ${pending} 条批注待处理</span>` : ''}
      <div class="top-sep"></div>
      <button class="btn sm" id="btn-save-bind" title="把当前姿态存为绑定姿态">存绑定姿态</button>
      <button class="btn sm ghost" id="btn-reset-pose" title="把选中骨骼恢复到绑定姿态">恢复绑定</button>
      <button class="btn sm ghost" id="btn-import-cfg" title="导入 character.json">导入配置</button>
      <div class="spacer"></div>
      <button class="btn sm ghost" id="btn-export" ${p.versions.length === 0 ? 'disabled title="请先提交版本"' : 'title="导出序列帧 + 角色配置"'}>⤓ 导出</button>
      <button class="btn sm primary" id="btn-submit" ${p.status === '已采用' ? 'disabled' : ''}>提交新版本 →</button>
    `;
    bar.querySelector('#pending-chip')?.addEventListener('click', () => navigate('review', p.id));
    bar.querySelector('#btn-save-bind')?.addEventListener('click', () => this.saveBindPose());
    bar.querySelector('#btn-reset-pose')?.addEventListener('click', () => this.resetToBind());
    bar.querySelector('#btn-export')?.addEventListener('click', () => this.openExport());
    bar.querySelector('#btn-submit')?.addEventListener('click', () => this.openSubmit());
    bar.querySelector('#btn-import-cfg')?.addEventListener('click', () => {
      (this.shadow.getElementById('import-config') as HTMLInputElement).click();
    });
    const cfgInput = this.shadow.getElementById('import-config') as HTMLInputElement;
    cfgInput.onchange = () => {
      const f = cfgInput.files?.[0];
      if (f) void f.text().then((txt) => this.importConfig(txt));
      cfgInput.value = '';
    };
  }

  private refreshAssets() {
    const list = this.shadow.getElementById('asset-list');
    if (!list || !this.project) return;
    const p = this.project;
    const used = new Set(p.rig.bones.map((b) => b.partId).filter(Boolean) as string[]);
    list.innerHTML = p.assets.map((a) => `
      <div class="asset ${used.has(a.id) ? 'used' : ''}" draggable="true" data-asset="${a.id}" title="拖到画布可挂到选中骨骼">
        <div class="thumb">${a.dataUrl ? `<img src="${a.dataUrl}" alt="">` : '?'}</div>
        <div class="info">
          <div class="nm">${escapeHtml(a.name)}</div>
          <div class="kind">${PART_LABEL[a.kind]} · ${a.width}×${a.height}${used.has(a.id) ? ' · <span class="use">已挂载</span>' : ''}</div>
        </div>
      </div>`).join('') + `
      <div class="drop-hint" id="drop-hint">拖 PNG 到这里导入<br>或点标题旁「＋ 导入」</div>
      <div class="hint-note">双击零件挂到选中骨骼 · 拖拽到画布可直接装配</div>`;


  }

  private refreshTree() {
    const tree = this.shadow.getElementById('bone-tree');
    const count = this.shadow.getElementById('tree-count');
    if (!tree || !this.project) return;
    const p = this.project;
    if (count) count.textContent = `${p.rig.bones.length} 骨`;
    const roots = p.rig.bones.filter((b) => !b.parentId || !p.rig.bones.some((x) => x.id === b.parentId));
    const rows: string[] = [];
    const walk = (bone: Bone, depth: number) => {
      const asset = p.assets.find((a) => a.id === bone.partId);
      rows.push(`
        <div class="tree-row ${this.selectedBoneId === bone.id ? 'sel' : ''} ${bone.partId ? 'haspart' : ''}" data-bone="${bone.id}" style="padding-left:${6 + depth * 12}px">
          <span class="tw">${p.rig.bones.some((b) => b.parentId === bone.id) ? '▾' : '·'}</span>
          <span class="sw" style="background:${bone.locked ? '#6f7d71' : bone.color}"></span>
          <span class="nm">${escapeHtml(bone.name)}</span>
          ${asset ? `<span class="pt" title="${escapeHtml(asset.name)}"></span>` : ''}
          ${bone.locked ? '<span class="lk">🔒</span>' : ''}
        </div>`);
      for (const child of p.rig.bones.filter((b) => b.parentId === bone.id)) walk(child, depth + 1);
    };
    roots.forEach((r) => walk(r, 0));
    tree.innerHTML = rows.join('') || '<div class="tree-empty">还没有骨骼<br>切到「搭骨」模式<br>在画布上点两下建骨</div>';
    tree.querySelectorAll<HTMLElement>('[data-bone]').forEach((el) => {
      el.addEventListener('click', () => {
        this.selectedBoneId = el.dataset.bone!;
        this.syncSelection();
      });
    });
  }

  private refreshInspector() {
    const body = this.shadow.getElementById('insp-body');
    if (!body) return;
    const p = this.project;
    if (!p) {
      body.innerHTML = '<div class="insp-empty">未选择项目</div>';
      return;
    }
    const bone = p.rig.bones.find((b) => b.id === this.selectedBoneId);
    const track = p.timeline.tracks.find((t) => t.boneId === bone?.id);
    const anns = p.annotations;
    const pendingAnns = anns.filter((a) => a.status === 'pending');

    const boneSection = bone ? `
      <div class="sec">
        <div class="sec-title">骨骼属性 <span class="line"></span></div>
        <div class="name-row">
          <input class="input name-input grow" id="bone-name" value="${escapeHtml(bone.name)}">
          <button class="btn sm icon" id="bone-color" title="切换标识色" style="background:${bone.color};width:24px;height:24px;border-radius:6px"></button>
        </div>
        <div class="row" style="margin-top:8px;gap:7px">
          <div class="lock-row grow">
            <span class="switch ${bone.locked ? 'on' : ''}" id="lock-switch"></span>
            <div><div class="switch-label">${bone.locked ? '已锁定' : '未锁定'}</div><div class="switch-sub">${bone.locked ? '画布上不可误拖' : '锁定后画布不可拖动'}</div></div>
          </div>
        </div>
        <div class="row" style="margin-top:8px;justify-content:flex-end">
          <button class="btn sm ghost" id="bone-delete">删除骨骼</button>
        </div>
      </div>
      <div class="sec">
        <div class="sec-title">父子关系 <span class="line"></span></div>
        <div class="field"><label>父骨骼</label>
          <select class="select" id="bone-parent" style="height:27px;font-size:11.5px">
            <option value="">（根关节）</option>
            ${p.rig.bones.filter((b) => b.id !== bone.id && canParent(p.rig, bone.id, b.id)).map((b) => `<option value="${b.id}" ${bone.parentId === b.id ? 'selected' : ''}>${escapeHtml(b.name)}</option>`).join('')}
          </select>
        </div>
        <div class="field" style="margin-top:7px"><label>挂载零件</label>
          <select class="select" id="bone-part" style="height:27px;font-size:11.5px">
            <option value="">（无零件，仅关节）</option>
            ${p.assets.map((a) => `<option value="${a.id}" ${bone.partId === a.id ? 'selected' : ''}>${escapeHtml(a.name)} · ${PART_LABEL[a.kind]}</option>`).join('')}
          </select>
        </div>
        <div class="row" style="margin-top:7px;gap:7px">
          <div class="prop grow"><label>层叠序</label><input id="bone-z" type="number" value="${bone.z}"></div>
          <div class="prop grow"><label>标识</label><input value="${bone.color}" readonly style="text-align:center"></div>
        </div>
      </div>
      <div class="sec">
        <div class="sec-title">变换 ${bone.locked ? '<span class="chip red" style="height:16px;font-size:9px">锁定</span>' : ''} <span class="line"></span></div>
        <div class="prop-grid">
          <div class="prop"><label>X</label><input id="v-x" class="input mono" type="number" step="1" value="${bone.x}" ${bone.locked ? 'disabled' : ''}></div>
          <div class="prop"><label>Y</label><input id="v-y" class="input mono" type="number" step="1" value="${bone.y}" ${bone.locked ? 'disabled' : ''}></div>
          <div class="prop"><label>旋转 °</label><input id="v-rot" class="input mono" type="number" step="1" value="${bone.rotation}" ${bone.locked ? 'disabled' : ''}></div>
          <div class="prop"><label>缩放</label><input id="v-sc" class="input mono" type="number" step="0.01" value="${bone.scaleX}" ${bone.locked ? 'disabled' : ''}></div>
        </div>
        <div class="btn-row" style="margin-top:8px">
          <button class="btn sm ghost" id="v-key" ${bone.locked ? 'disabled' : ''}>◆ 当前帧打帧</button>
          <button class="btn sm ghost" id="v-reset" ${bone.locked ? 'disabled' : ''}>↺ 恢复绑定</button>
        </div>
      </div>
      <div class="sec">
        <div class="sec-title">绑定姿态 <span class="line"></span></div>
        <div class="bind-note">绑定：X ${bone.bindX} / Y ${bone.bindY} / 旋转 ${bone.bindRotation}° / 缩放 ${(bone.bindScaleX).toFixed(2, )}<br>在时间轴第 0 帧保存骨骼静置姿态，之后所有关键帧都相对它播放。</div>
        <div class="btn-row" style="margin-top:7px">
          <button class="btn sm" id="bind-save">保存当前为绑定</button>
        </div>
      </div>
      <div class="sec">
        <div class="sec-title">曲线通道 <span class="line"></span><span class="key-count">${track ? Object.values(track.channels).reduce((n, c) => n + c.keys.length, 0) : 0} 帧</span></div>
        <div class="ch-list">
          ${(['position', 'rotation', 'scale'] as ChannelKind[]).map((kind) => {
            const keys = track?.channels[kind].keys ?? [];
            return `<div class="ch-row"><span class="kd" style="background:${kind === 'position' ? '#73c17a' : kind === 'rotation' ? '#e9b750' : '#6fa8d6'}"></span>${CHANNEL_LABEL[kind]}
              <span class="k">${keys.length ? `${keys.length} 键 · ${keys.map((k) => EASING_LABEL[k.easing]).filter((v, i, a) => a.indexOf(v) === i).join('/')}` : '空'}</span></div>`;
          }).join('')}
        </div>
      </div>` : `<div class="insp-empty">在画布或骨架层级里选中一根骨骼<br><span class="small">拖动关节可位移，拖上方小圆点可旋转</span></div>`;

    body.innerHTML = boneSection + `
      <div class="sec">
        <div class="sec-title">批注 <span class="line"></span><span class="key-count">${pendingAnns.length} 待处理 / ${anns.length} 总</span></div>
        ${anns.length ? anns.slice(0, 6).map((a, i) => `
          <div class="ann-mini" data-ann-go="${a.id}" style="cursor:pointer">
            <span class="num" style="background:${a.status === 'pending' ? '#3a2a1b' : a.status === 'resolved' ? '#22332a' : '#1e2a36'};color:${a.status === 'pending' ? '#f0cd84' : a.status === 'resolved' ? '#9fda9f' : '#a8cdea'}">${i + 1}</span>
            <div class="grow"><div class="tx">${escapeHtml(a.text.slice(0, 46))}${a.text.length > 46 ? '…' : ''}</div>
              <div class="fr">第 ${a.frame} 帧 · ${a.status === 'pending' ? '待处理' : a.status === 'resolved' ? '已改' : '已说明'}</div></div>
          </div>`).join('') : '<div class="faint small" style="padding:4px 0">暂无批注，可在画布「批注」模式下添加</div>'}
        ${anns.length > 6 ? `<div class="faint small">还有 ${anns.length - 6} 条，去审核页查看</div>` : ''}
        <div class="btn-row" style="margin-top:7px">
          <button class="btn sm ghost" id="go-review">去审核页处理 →</button>
        </div>
      </div>
      <div class="sec">
        <div class="sec-title">版本记录 <span class="line"></span></div>
        <div class="version-list">
          ${p.versions.length ? p.versions.slice().reverse().slice(0, 5).map((v) => `
            <div class="ver-item">
              <div class="vh"><b>v${v.number}</b><span class="faint small">${v.submittedBy}</span><span class="when">${fmtDate(v.submittedAt)}</span></div>
              <div class="vnote">${escapeHtml(v.note)}</div>
            </div>`).join('') : '<div class="faint small" style="padding:2px 0">还没有提交过版本</div>'}
        </div>
        <div class="divider"></div>
        <div class="btn-row">
          <button class="btn sm ghost" id="go-compare">两版比对 ⇄</button>
        </div>
      </div>`;

    this.bindInspector(bone);
  }

  private bindInspector(bone: Bone | undefined) {
    const body = this.shadow.getElementById('insp-body')!;
    if (!bone) {
      body.querySelector('#go-review')?.addEventListener('click', () => navigate('review'));
      body.querySelector('#go-compare')?.addEventListener('click', () => navigate('compare'));
      body.querySelectorAll<HTMLElement>('[data-ann-go]').forEach((el) => {
        el.addEventListener('click', () => {
          const id = el.dataset.annGo!;
          const ann = this.project?.annotations.find((a) => a.id === id);
          if (ann) this.seek(ann.frame);
          navigate('review', this.project?.id);
          setTimeout(() => window.dispatchEvent(new CustomEvent('focus-annotation', { detail: id })), 80);
        });
      });
      return;
    }
    const nameInput = body.querySelector('#bone-name') as HTMLInputElement;
    nameInput?.addEventListener('change', () => {
      const v = nameInput.value.trim() || bone.name;
      bone.name = v;
      store.updateProject(() => {}, 'rig');
    });
    body.querySelector('#bone-color')?.addEventListener('click', () => {
      const palette = ['#e9b750', '#73c17a', '#6fa8d6', '#b198d8', '#e0885f', '#62c4b8', '#d9c06a'];
      const idx = (palette.indexOf(bone.color) + 1) % palette.length;
      bone.color = palette[idx];
      store.updateProject(() => {}, 'rig');
    });
    body.querySelector('#lock-switch')?.addEventListener('click', () => this.toggleLock());
    body.querySelector('#bone-delete')?.addEventListener('click', () => void this.deleteSelectedBone());
    (body.querySelector('#bone-parent') as HTMLSelectElement)?.addEventListener('change', (e) => {
      const parentId = (e.target as HTMLSelectElement).value || null;
      if (!canParent(this.project!.rig, bone.id, parentId)) {
        toast('不能把骨骼挂到自己的子级下', 'err');
        this.refreshInspector();
        return;
      }
      const oldParent = bone.parentId;
      bone.parentId = parentId;
      store.updateProject(() => {}, 'rig');
      this.logAction(`调整父骨骼 ${oldParent ? '→ ' + (this.project!.rig.bones.find((b) => b.id === parentId)?.name ?? '根') : '→ 根'}`, 'rig');
      this.refreshTree();
    });
    (body.querySelector('#bone-part') as HTMLSelectElement)?.addEventListener('change', (e) => {
      const partId = (e.target as HTMLSelectElement).value || null;
      bone.partId = partId;
      store.updateProject(() => {}, 'rig');
      this.logAction(partId ? `挂载零件 ${this.project!.assets.find((a) => a.id === partId)?.name}` : '卸下零件', 'rig');
    });
    const zInput = body.querySelector('#bone-z') as HTMLInputElement;
    zInput?.addEventListener('change', () => {
      bone.z = Number(zInput.value) || 0;
      store.updateProject(() => {}, 'rig');
    });
    const bind = (id: string) => body.querySelector(id) as HTMLInputElement;
    const applyNumeric = (input: HTMLInputElement, apply: () => void) => {
      input?.addEventListener('change', () => {
        apply();
        this.dispatchBoneUpdate(bone.id);
      });
    };
    applyNumeric(bind('#v-x'), () => { bone.x = Number(bind('#v-x').value) || 0; });
    applyNumeric(bind('#v-y'), () => { bone.y = Number(bind('#v-y').value) || 0; });
    applyNumeric(bind('#v-rot'), () => { bone.rotation = Number(bind('#v-rot').value) || 0; });
    applyNumeric(bind('#v-sc'), () => {
      const v = Number(bind('#v-sc').value) || 1;
      bone.scaleX = v;
      bone.scaleY = v;
    });
    body.querySelector('#v-key')?.addEventListener('click', () => this.addKeyCurrentFrame());
    body.querySelector('#v-reset')?.addEventListener('click', () => this.resetToBind(bone.id));
    body.querySelector('#bind-save')?.addEventListener('click', () => this.saveBindPose(bone.id));
    body.querySelector('#go-review')?.addEventListener('click', () => navigate('review'));
    body.querySelector('#go-compare')?.addEventListener('click', () => navigate('compare'));
    body.querySelectorAll<HTMLElement>('[data-ann-go]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.annGo!;
        const ann = this.project?.annotations.find((a) => a.id === id);
        if (ann) this.seek(ann.frame);
        navigate('review', this.project?.id);
        setTimeout(() => window.dispatchEvent(new CustomEvent('focus-annotation', { detail: id })), 80);
      });
    });
  }

  private dispatchBoneUpdate(boneId: string) {
    store.updateProject(() => {}, 'rig');
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    stage?.setTimeline(this.project?.timeline ?? null);
    timeline?.setProject(this.project, this.selectedBoneId);
    timeline?.setFrame(this.frame);
    stage?.redraw();
    this.logAction('调整变换', 'rig');
    const bone = this.project?.rig.bones.find((b) => b.id === boneId);
    if (bone?.locked) toast('该骨骼已锁定，画布上不可拖动', 'warn');
  }

  private syncSelection() {
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    const bone = this.project?.rig.bones.find((b) => b.id === this.selectedBoneId);
    stage?.setSelectedBone(bone?.locked ? bone.id : this.selectedBoneId);
    timeline?.setSelectedBone(this.selectedBoneId);
    this.refreshInspector();
    this.refreshTree();
  }

  private seek(frame: number) {
    this.setFrame(frame, false);
  }

  private setFrame(frame: number, fromPlay: boolean) {
    const dur = this.project?.timeline.duration ?? 0;
    const f = clamp(Math.round(frame), 0, dur);
    this.frame = f;
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    timeline?.setFrame(f);
    stage?.setFrame(f);
    const fi = this.shadow.getElementById('frame-in') as HTMLInputElement;
    if (fi && document.activeElement !== fi) fi.value = String(f);
    this.updateTimeDisp();
    if (fromPlay) this.refreshTopbar();
  }

  private updateTimeDisp() {
    const el = this.shadow.getElementById('time-disp');
    if (el && this.project) el.textContent = `${(this.frame / this.project.timeline.fps).toFixed(2)}s / ${(this.project.timeline.duration / this.project.timeline.fps).toFixed(2)}s`;
  }

  private togglePlay() {
    this.playing = !this.playing;
    const btn = this.shadow.getElementById('play-btn');
    if (btn) btn.textContent = this.playing ? '❚❚' : '▶';
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    if (this.playing) {
      stage.setGhostFrame(null);
      this.lastTs = performance.now();
      this.playAcc = 0;
      const tick = (ts: number) => {
        if (!this.playing) return;
        const dt = Math.min(100, ts - this.lastTs);
        this.lastTs = ts;
        this.playAcc += dt;
        const spf = 1000 / (this.project?.timeline.fps ?? 24);
        if (this.playAcc >= spf) {
          const steps = Math.floor(this.playAcc / spf);
          this.playAcc -= steps * spf;
          let nf = this.frame + steps;
          const dur = this.project?.timeline.duration ?? 0;
          if (nf > dur) {
            if (this.loop) nf = nf % (dur + 1);
            else {
              nf = dur;
              this.playing = false;
              if (btn) btn.textContent = '▶';
            }
          }
          this.setFrame(nf, false);
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(this.rafId);
    }
  }

  private logAction(_action: string, _reason = 'edit') {
    // Keep the activity trail meaningful without spamming: only version/status-level events are logged.
  }

  private applyBonePatch(boneId: string, patch: Partial<Bone>, live: boolean) {
    const p = this.project;
    const bone = p?.rig.bones.find((b) => b.id === boneId);
    if (!bone || !p) return;
    if (bone.locked) {
      toast(`${bone.name} 已锁定，不能拖动`, 'warn');
      return;
    }
    // Joint drags write to the frame currently previewed: if this bone already has
    // position keys, live-edit that key instead of silently leaving the track in charge.
    const track = p.timeline.tracks.find((t) => t.boneId === boneId);
    const posKeys = track?.channels.position.keys.length ?? 0;
    const rotKeys = track?.channels.rotation.keys.length ?? 0;

    if (typeof patch.x === 'number' || typeof patch.y === 'number') {
      if (posKeys) {
        if (patch.x !== undefined) bone.x = patch.x;
        if (patch.y !== undefined) bone.y = patch.y;
        this.patchKeyAtFrame(track!, 'position', this.frame, { x: bone.x, y: bone.y }, live);
      } else {
        if (patch.x !== undefined) bone.x = patch.x;
        if (patch.y !== undefined) bone.y = patch.y;
      }
    }
    if (typeof patch.rotation === 'number') {
      if (rotKeys) {
        bone.rotation = patch.rotation;
        this.patchKeyAtFrame(track!, 'rotation', this.frame, patch.rotation, live);
      } else {
        bone.rotation = patch.rotation;
      }
    }
    if (typeof patch.scaleX === 'number') {
      bone.scaleX = patch.scaleX;
      bone.scaleY = patch.scaleY ?? bone.scaleX;
    }
    p.updatedAt = Date.now();
    store.scheduleSave();
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    stage?.setTimeline(p.timeline);
    stage?.redraw();
    if (live) {
      this.liveInspectorSync(bone);
    } else {
      sortKeys(p.timeline);
      this.refreshInspector();
      this.refreshTree();
      timeline?.setProject(p, this.selectedBoneId);
      timeline?.setFrame(this.frame);
      store.emit('rig');
    }
  }

  /** Writes a sampled value into the nearest key at `frame` while dragging. */
  private patchKeyAtFrame(
    track: import('../core/types').BoneTrack,
    kind: ChannelKind,
    frame: number,
    value: { x: number; y: number } | number,
    live: boolean,
  ) {
    const channel = track.channels[kind];
    if (!channel.keys.length) return;
    // Auto-key semantics: dragging at the playhead writes the key for this frame,
    // so the pose always matches the viewport instead of drifting through interpolation.
    const existing = channel.keys.find((k) => k.frame === frame);
    if (existing) existing.value = value;
    else channel.keys.push({ id: uid('k'), frame, value, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] });
    if (!live) sortKeys(this.project!.timeline);
  }

  private liveInspectorSync(bone: Bone) {
    const body = this.shadow.getElementById('insp-body');
    if (!body) return;
    const set = (sel: string, v: number) => {
      const el = body.querySelector(sel) as HTMLInputElement | null;
      if (el && document.activeElement !== el) el.value = String(Math.round(v * 100) / 100);
    };
    set('#v-x', bone.x);
    set('#v-y', bone.y);
    set('#v-rot', bone.rotation);
    set('#v-sc', bone.scaleX);
  }

  private buildBone(parentId: string | null, x: number, y: number, center = false) {
    const p = this.project;
    if (!p) return;
    const usedKinds = new Set(p.rig.bones.map((b) => p.assets.find((a) => a.id === b.partId)?.kind).filter(Boolean));
    const freeAssets = p.assets.filter((a) => !p.rig.bones.some((b) => b.partId === a.id));
    const nextAsset = freeAssets[0];
    const bone: Bone = {
      id: uid('bone'),
      name: nextAsset ? nextAsset.name : (usedKinds.size ? `关节 ${p.rig.bones.length + 1}` : '根骨'),
      parentId,
      partId: nextAsset?.id ?? null,
      x, y, rotation: 0, scaleX: 1, scaleY: 1,
      bindX: x, bindY: y, bindRotation: 0, bindScaleX: 1, bindScaleY: 1,
      locked: false,
      z: p.rig.bones.length + 1,
      color: ['#e9b750', '#73c17a', '#6fa8d6', '#b198d8', '#e0885f', '#62c4b8', '#d9c06a'][p.rig.bones.length % 7],
    };
    p.rig.bones.push(bone);
    ensureTrack(p.timeline, bone.id);
    this.selectedBoneId = bone.id;
    store.updateProject((proj) => {
      store.log(proj, `新增骨骼「${bone.name}」`, { by: store.currentName, role: store.state.role });
    }, 'rig');
    toast(`已添加骨骼「${bone.name}」${nextAsset ? `，挂载${nextAsset.name}` : ''}`, 'ok');
    if (center) this.seek(0);
    this.refreshAll();
  }

  private attachPartToSelected(asset: AssetPart) {
    const bone = this.project?.rig.bones.find((b) => b.id === this.selectedBoneId);
    if (!bone) {
      toast('先在画布或层级里选中一根骨骼', 'warn');
      return;
    }
    if (bone.locked) {
      toast('该骨骼已锁定，先解锁再挂零件', 'warn');
      return;
    }
    bone.partId = asset.id;
    store.updateProject(() => {}, 'rig');
    toast(`已把「${asset.name}」挂到 ${bone.name}`, 'ok');
    this.refreshInspector();
    this.refreshTree();
    this.refreshAssets();
  }

  private toggleLock() {
    const bone = this.project?.rig.bones.find((b) => b.id === this.selectedBoneId);
    if (!bone) {
      toast('先选中一根骨骼', 'warn');
      return;
    }
    bone.locked = !bone.locked;
    store.updateProject(() => {}, 'rig');
    toast(bone.locked ? `已锁定「${bone.name}」，画布上不可拖动` : `已解锁「${bone.name}」`, bone.locked ? 'warn' : 'ok');
    this.syncSelection();
  }

  private saveBindPose(boneId?: string) {
    const p = this.project;
    if (!p) return;
    const bones = boneId ? p.rig.bones.filter((b) => b.id === boneId) : p.rig.bones;
    if (!bones.length) { toast('没有骨骼', 'warn'); return; }
    for (const b of bones) {
      b.bindX = b.x;
      b.bindY = b.y;
      b.bindRotation = b.rotation;
      b.bindScaleX = b.scaleX;
      b.bindScaleY = b.scaleY;
    }
    store.updateProject((proj) => store.log(proj, `保存绑定姿态（${bones.length} 根骨骼）`), 'rig');
    toast(`绑定姿态已保存：${bones.map((b) => b.name).join('、')}`, 'ok');
    this.refreshInspector();
    this.refreshTree();
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    timeline?.setProject(this.project, this.selectedBoneId);
  }

  private resetToBind(boneId?: string) {
    const bone = boneId ? this.project?.rig.bones.find((b) => b.id === boneId) : this.project?.rig.bones.find((b) => b.id === this.selectedBoneId);
    if (!bone) { toast('先选中一根骨骼', 'warn'); return; }
    if (bone.locked) { toast('已锁定，不能修改', 'warn'); return; }
    bone.x = bone.bindX;
    bone.y = bone.bindY;
    bone.rotation = bone.bindRotation;
    bone.scaleX = bone.bindScaleX;
    bone.scaleY = bone.bindScaleY;
    store.updateProject(() => {}, 'rig');
    this.dispatchBoneUpdate(bone.id);
    toast(`「${bone.name}」已恢复绑定姿态`, 'ok');
  }

  private channelCurrentValue(bone: Bone, kind: ChannelKind): { x: number; y: number } | number {
    if (kind === 'position') return { x: bone.x, y: bone.y };
    if (kind === 'rotation') return bone.rotation;
    return { x: bone.scaleX, y: bone.scaleY };
  }

  private addKeyCurrentFrame() {
    const p = this.project;
    const bone = p?.rig.bones.find((b) => b.id === this.selectedBoneId);
    if (!p || !bone) { toast('先选中一根骨骼', 'warn'); return; }
    if (bone.locked) { toast('骨骼已锁定，不能打关键帧', 'warn'); return; }
    for (const kind of ['position', 'rotation', 'scale'] as ChannelKind[]) {
      this.upsertKey(bone, kind, this.frame, this.channelCurrentValue(bone, kind));
    }
    sortKeys(p.timeline);
    store.updateProject((proj) => store.log(proj, `第 ${this.frame} 帧打关键帧`, { note: `骨骼 ${bone.name}` }), 'edit');
    toast(`「${bone.name}」第 ${this.frame} 帧已打帧（位移/旋转/缩放）`, 'ok');
    this.afterTimelineEdit();
  }

  private addKeyAt(boneId: string, kind: ChannelKind, frame: number) {
    const p = this.project;
    const bone = p?.rig.bones.find((b) => b.id === boneId);
    if (!p || !bone) return;
    if (bone.locked) { toast('骨骼已锁定', 'warn'); return; }
    this.upsertKey(bone, kind, frame, this.channelCurrentValue(bone, kind));
    sortKeys(p.timeline);
    store.updateProject(() => {}, 'edit');
    toast(`第 ${frame} 帧 · ${CHANNEL_LABEL[kind]} 已加键`, 'ok');
    this.afterTimelineEdit();
  }

  private upsertKey(bone: Bone, kind: ChannelKind, frame: number, value: { x: number; y: number } | number) {
    const p = this.project!;
    const track = ensureTrack(p.timeline, bone.id);
    const channel = track.channels[kind];
    const exist = channel.keys.find((k) => k.frame === frame);
    if (exist) {
      exist.value = value;
      return exist;
    }
    const template: Keyframe = {
      id: uid('k'), frame, value, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1],
    };
    channel.keys.push(template);
    return template;
  }

  private afterTimelineEdit() {
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    timeline?.setProject(this.project, this.selectedBoneId);
    timeline?.setFrame(this.frame);
    stage?.setTimeline(this.project?.timeline ?? null);
    stage?.redraw();
    this.refreshInspector();
  }

  private deleteSelectedKey() {
    const sel = this.selectedKey;
    if (!sel) { toast('在时间轴上点选一个关键帧再删', 'warn'); return; }
    const p = this.project;
    const bone = p?.rig.bones.find((b) => b.id === sel.boneId);
    if (!p || !bone) return;
    if (bone.locked) { toast('骨骼已锁定', 'warn'); return; }
    const track = p.timeline.tracks.find((t) => t.boneId === sel.boneId);
    const channel = track?.channels[sel.kind];
    if (!channel) return;
    channel.keys = channel.keys.filter((k) => k.id !== sel.keyId);
    this.selectedKey = null;
    store.updateProject(() => {}, 'edit');
    toast(`已删除 ${CHANNEL_LABEL[sel.kind]} 关键帧`, 'ok');
    this.afterTimelineEdit();
  }

  private changeEasing(boneId: string, kind: ChannelKind, keyId: string, easing: EasingType) {
    const p = this.project;
    const bone = p?.rig.bones.find((b) => b.id === boneId);
    const track = p?.timeline.tracks.find((t) => t.boneId === boneId);
    const key = track?.channels[kind].keys.find((k) => k.id === keyId);
    if (!p || !bone || !key) return;
    key.easing = easing;
    store.updateProject((proj) => store.log(proj, `曲线切换为 ${EASING_LABEL[easing]}`, { note: `${bone.name} · ${CHANNEL_LABEL[kind]} 第 ${key.frame} 帧` }), 'edit');
    toast(`已切换为${EASING_LABEL[easing]}`, 'ok');
    this.afterTimelineEdit();
  }

  private changeBezier(boneId: string, kind: ChannelKind, keyId: string, bezier: [number, number, number, number]) {
    const track = this.project?.timeline.tracks.find((t) => t.boneId === boneId);
    const key = track?.channels[kind].keys.find((k) => k.id === keyId);
    if (!key) return;
    key.bezier = bezier;
    key.easing = 'bezier';
    store.updateProject(() => {}, 'edit');
    this.afterTimelineEdit();
  }

  private moveKey(boneId: string, kind: ChannelKind, keyId: string, frame: number, live: boolean) {
    const p = this.project;
    const track = p?.timeline.tracks.find((t) => t.boneId === boneId);
    const key = track?.channels[kind].keys.find((k) => k.id === keyId);
    if (!p || !key) return;
    const clamped = clamp(frame, 0, p.timeline.duration);
    const conflict = track!.channels[kind].keys.find((k) => k.id !== keyId && k.frame === clamped);
    if (conflict && !live) {
      toast('该帧已有其他关键帧，未移动', 'warn');
      this.afterTimelineEdit();
      return;
    }
    key.frame = clamped;
    sortKeys(p.timeline);
    if (live) {
      store.scheduleSave();
      this.shadow.getElementById('stage') && (this.shadow.getElementById('stage') as unknown as StageView).redraw();
      const tl = this.shadow.getElementById('timeline') as unknown as TimelineView;
      tl?.setFrame(this.frame);
    } else {
      store.updateProject(() => {}, 'edit');
      this.afterTimelineEdit();
    }
  }

  private async deleteSelectedBone() {
    const p = this.project;
    const bone = p?.rig.bones.find((b) => b.id === this.selectedBoneId);
    if (!p || !bone) return;
    if (bone.locked) { toast('骨骼已锁定，不能删除', 'warn'); return; }
    const children = p.rig.bones.filter((b) => b.parentId === bone.id);
    const ok = await confirmDialog('删除骨骼', `删除「${escapeHtml(bone.name)}」？${children.length ? `<br>它的 ${children.length} 个子骨骼会转挂到父级。` : ''}`, '删除');
    if (!ok) return;
    const parentId = bone.parentId;
    for (const c of children) c.parentId = parentId;
    p.rig.bones = p.rig.bones.filter((b) => b.id !== bone.id);
    p.timeline.tracks = p.timeline.tracks.filter((t) => t.boneId !== bone.id);
    this.selectedBoneId = parentId;
    store.updateProject(() => {}, 'rig');
    toast(`已删除「${bone.name}」`, 'ok');
    this.refreshAll();
  }

  private focusAnnotation(id: string) {
    const ann = this.project?.annotations.find((a) => a.id === id);
    if (!ann) return;
    this.setFrame(ann.frame, false);
    const stage = this.shadow.getElementById('stage') as unknown as StageView;
    stage.focusAnnotation(id);
    const timeline = this.shadow.getElementById('timeline') as unknown as TimelineView;
    timeline.setSelectedAnnotation(id);
    this.refreshInspector();
  }

  private async importFiles(files: File[]) {
    const p = this.project;
    if (!p) { toast('先选择一个项目', 'warn'); return; }
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        if (file.name.endsWith('.json')) {
          await this.importConfig(await file.text());
        } else toast(`${file.name} 不是图片`, 'warn');
        continue;
      }
      const dataUrl = await readAsDataUrl(file);
      const { width, height } = await imageSize(dataUrl);
      const guessKind = guessPartKind(file.name);
      const art = renderPart(guessKind === 'other' ? 'leaf' : guessKind, p.crop);
      const asset: AssetPart = {
        id: uid('asset'),
        name: file.name.replace(/\.[^.]+$/, ''),
        kind: guessKind,
        dataUrl,
        width, height,
        anchorX: Math.round(width / 2),
        anchorY: Math.round(height * 0.82),
      };
      void art;
      p.assets.push(asset);
      store.updateProject((proj) => store.log(proj, `导入零件「${asset.name}」`, { note: `${width}×${height} ${PART_LABEL[asset.kind]}` }), 'rig');
      toast(`已导入零件「${asset.name}」`, 'ok');
    }
    refreshAllAfter(this);
  }

  private async importConfig(raw: string) {
    const p = this.project;
    if (!p) { toast('先选择一个项目', 'warn'); return; }
    try {
      const parsed = parseConfig(JSON.parse(raw));
      if (!parsed) { toast('不是有效的禾影角色配置（schema: heying.character/1）', 'err'); return; }
      const known = new Set(p.assets.map((a) => a.id));
      for (const meta of parsed.meta.assets) {
        if (known.has(meta.id)) continue;
        const kind = meta.kind as PartKind;
        const art = renderPart(kind === 'other' ? 'leaf' : kind, p.crop);
        p.assets.push({
          id: meta.id, name: meta.name, kind,
          width: meta.width, height: meta.height, anchorX: meta.anchorX, anchorY: meta.anchorY,
          dataUrl: meta.builtin ? art.dataUrl : undefined,
        });
      }
      p.rig = parsed.rig;
      p.timeline = parsed.timeline;
      for (const b of p.rig.bones) {
        const a = p.assets.find((x) => x.id === b.partId);
        if (a?.builtinKey) b.partId = a.id;
      }
      this.selectedBoneId = p.rig.bones[0]?.id ?? null;
      store.updateProject((proj) => store.log(proj, `导入角色配置 v${parsed.meta.version}`, { note: `${parsed.rig.bones.length} 骨 / ${p.assets.length} 零件` }), 'rig');
      toast(`已导入配置：${parsed.rig.bones.length} 根骨骼`, 'ok');
      refreshAllAfter(this);
    } catch (err) {
      toast(`配置解析失败：${(err as Error).message}`, 'err');
    }
  }

  private openSubmit() {
    const p = this.project;
    if (!p) return;
    const pending = p.annotations.filter((a) => a.status === 'pending');
    const back = document.createElement('div');
    back.className = 'modal-backdrop';
    const nextV = p.versions.reduce((m, v) => Math.max(m, v.number), 0) + 1;
    back.innerHTML = `
      <style>${css}</style>
      <div class="modal" style="width:430px">
        <div class="modal-head">提交新版本 · v${nextV}</div>
        <div class="modal-body">
          ${pending.length ? `<div class="warn-box">还有 <b>${pending.length}</b> 条批注未处理，定稿提交会被拦截。<br>请先到「农技审核」页逐条回复已改或说明理由。</div>` : ''}
          <div class="field"><label>本次修改说明（会写入版本记录）</label><textarea class="textarea" id="sub-note" rows="3" placeholder="例：收小穗子摆动幅度，修复左叶臂穿模"></textarea></div>
          <div class="faint small" style="line-height:1.6">提交后会快照当前骨架与全部关键帧，版本号自动递增为 v${nextV}，状态流转到「待审核」。</div>
        </div>
        <div class="modal-foot">
          <button class="btn" data-x>取消</button>
          <button class="btn primary" data-ok ${pending.length ? 'disabled' : ''}>提交 v${nextV}</button>
        </div>
      </div>`;
    document.body.appendChild(back);
    const close = () => back.remove();
    back.querySelector('[data-x]')!.addEventListener('click', close);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    back.querySelector('[data-ok]')!.addEventListener('click', () => {
      const note = (back.querySelector('#sub-note') as HTMLTextAreaElement).value;
      const res = store.submitVersion(note);
      if (!res.ok) { toast(res.message, 'err'); return; }
      close();
      toast(`已生成 v${res.version!.number}，状态 → 待审核`, 'ok', 3400);
      this.refreshAll();
    });
  }

  private openExport() {
    const p = this.project;
    if (!p) return;
    const latest = p.versions[p.versions.length - 1];
    const back = document.createElement('div');
    back.className = 'modal-backdrop export-modal';
    back.innerHTML = `
      <style>${css}</style>
      <div class="modal" style="width:520px">
        <div class="modal-head">导出交付包</div>
        <div class="modal-body">
          <div class="row" style="gap:14px">
            <div class="field grow"><label>导出范围</label>
              <select class="select" id="ex-version">
                <option value="current">当前工程（未提交改动）</option>
                ${p.versions.slice().reverse().map((v) => `<option value="${v.number}" ${latest && v.number === latest.number ? 'selected' : ''}>已提交 v${v.number} · ${v.submittedBy}</option>`).join('')}
              </select>
            </div>
            <div class="field" style="width:110px"><label>分辨率</label>
              <select class="select" id="ex-scale"><option value="1">1× 960×640</option><option value="2">2× 1920×1280</option></select>
            </div>
          </div>
          <div class="opt-row"><input class="checkbox" type="checkbox" id="ex-assets" checked><label for="ex-assets">附带原始零件 PNG</label></div>
          <div class="opt-row"><input class="checkbox" type="checkbox" id="ex-frames" checked><label for="ex-frames">附带序列帧（逐帧 PNG，带透明通道）</label></div>
          <div class="warn-box" style="display:flex;gap:8px;align-items:flex-start">
            <span>ⓘ</span><span>导出内容：<b>sequence.json</b>（帧序列）+ <b>character.json</b>（骨架 / 绑定姿态 / 关键帧 / 缓动参数）+ 可选零件与序列帧。打包为 zip。</span>
          </div>
          <div class="export-progress"><i id="ex-bar"></i></div>
          <div class="export-log" id="ex-log">待开始…</div>
        </div>
        <div class="modal-foot">
          <button class="btn" data-x>关闭</button>
          <button class="btn primary" data-ok>生成并下载</button>
        </div>
      </div>`;
    document.body.appendChild(back);
    const close = () => back.remove();
    back.querySelector('[data-x]')!.addEventListener('click', close);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    back.querySelector('[data-ok]')!.addEventListener('click', async (e) => {
      const btn = e.currentTarget as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = '导出中…';
      const log = back.querySelector('#ex-log') as HTMLElement;
      const bar = back.querySelector('#ex-bar') as HTMLElement;
      const scale = Number((back.querySelector('#ex-scale') as HTMLSelectElement).value);
      const verId = (back.querySelector('#ex-version') as HTMLSelectElement).value;
      const version = verId === 'current' ? undefined : p.versions.find((v) => v.number === Number(verId));
      const wantFrames = (back.querySelector('#ex-frames') as HTMLInputElement).checked;
      const wantAssets = (back.querySelector('#ex-assets') as HTMLInputElement).checked;
      try {
        const result = await exportProject(this, p, { version, scale, wantFrames, wantAssets, log, bar });
        toast(`导出完成：${result.fileCount} 个文件`, 'ok');
        close();
      } catch (err) {
        log.textContent += `\n✗ ${(err as Error).message}`;
        toast('导出失败：' + (err as Error).message, 'err');
        btn.disabled = false;
        btn.textContent = '生成并下载';
      }
    });
  }
}

function roleIsAnimator(): boolean {
  return (window as unknown as { __farmRole?: string }).__farmRole === 'animator';
}

function refreshAllAfter(view: WorkbenchView) {
  (view as unknown as { refreshAll: () => void }).refreshAll();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error('读取文件失败'));
    fr.readAsDataURL(file);
  });
}

function imageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('图片解码失败'));
    img.src = dataUrl;
  });
}

function guessPartKind(filename: string): PartKind {
  const n = filename.toLowerCase();
  if (n.includes('head') || n.includes('头') || n.includes('face')) return 'head';
  if (n.includes('torso') || n.includes('body') || n.includes('躯干') || n.includes('身')) return 'torso';
  if (n.includes('leaf') || n.includes('叶')) return 'leaf';
  if (n.includes('ear') || n.includes('穗')) return 'ear';
  if (n.includes('root') || n.includes('根')) return 'roots';
  return 'other';
}

/* ---------------- export pipeline ---------------- */

interface ExportOpts {
  version?: import('../core/types').CharacterVersion;
  scale: number;
  wantFrames: boolean;
  wantAssets: boolean;
  log: HTMLElement;
  bar: HTMLElement;
}

async function exportProject(view: WorkbenchView, p: Project, opts: ExportOpts) {
  const { renderSequence, EXPORT_W, EXPORT_H } = await import('../core/canvas-export');
  const timeline = opts.version?.timeline ?? p.timeline;
  const rig = opts.version?.rig ?? p.rig;
  const log = (s: string) => { opts.log.textContent += `
${s}`; opts.log.scrollTop = opts.log.scrollHeight; };
  opts.log.textContent = `渲染器就绪（Canvas 2D · ${EXPORT_W}×${EXPORT_H} @ ${opts.scale}×）`;

  const frames = await renderSequence(rig, timeline, p.assets, {
    scale: opts.scale,
    onProgress: (done, total, _blob) => {
      opts.bar.style.width = `${Math.round((done / total) * 80)}%`;
      if (done === 1 || done % 6 === 0 || done === total) log(`  帧 ${done - 1}/${timeline.duration} 已渲染 · ${Math.round((done / total) * 100)}%`);
    },
  });
  log(`序列帧完成：${frames.length} 张透明 PNG`);

  const zip = await buildDeliveryZip(p, frames, { version: opts.version, includeAssets: opts.wantAssets });
  opts.bar.style.width = '94%';
  log(`character.json 已写入（${rig.bones.length} 根骨骼 / ${timeline.tracks.length} 条曲线）`);
  downloadZip(zip, p);
  opts.bar.style.width = '100%';
  log(`✓ 打包完成，已开始下载（${(zip.size / 1024 / 1024).toFixed(2)} MB）`);

  void view;
  void opts.wantFrames;
  return {
    fileCount: frames.length + (opts.wantAssets ? p.assets.length : 0) + 3 + 1,
    config: rigConfig(p, opts.version),
  };
}

customElements.define('farm-workbench', WorkbenchView);
