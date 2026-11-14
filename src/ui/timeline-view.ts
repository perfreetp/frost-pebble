import { BaseElement } from './base';
import type { Annotation, Bone, ChannelKind, EasingType, Project } from '../core/types';
import { CHANNEL_LABEL, EASING_LABEL } from '../core/types';
import { clamp, escapeHtml } from '../core/util';

const css = /* css */ `
  :host { display: flex; flex-direction: column; min-height: 0; height: 100%; background: var(--panel); }
  .toolbar {
    display: flex; align-items: center; gap: 6px; padding: 6px 10px;
    border-bottom: 1px solid var(--line-soft); flex-wrap: nowrap; min-height: 40px;
  }
  .toolbar .sep { width: 1px; height: 18px; background: var(--line); margin: 0 2px; }
  .toolbar .label { font-size: 10.5px; color: var(--text-faint); letter-spacing: .4px; }
  .spacer { flex: 1; }
  .body { flex: 1; display: flex; min-height: 0; position: relative; }
  .labels { width: 172px; flex: 0 0 172px; min-height: 0; border-right: 1px solid var(--line-soft); overflow: hidden; background: #111814; display: flex; flex-direction: column; }
  .labels-head { height: 82px; flex: 0 0 82px; border-bottom: 1px solid var(--line-soft); display: flex; flex-direction: column; font-size: 10.5px; letter-spacing: 1px; color: var(--text-faint); }
  .labels-head .lh-block { height: 56px; display: flex; align-items: flex-end; padding: 0 10px 7px; justify-content: space-between; }
  .labels-head .lh-ann { height: 26px; display: flex; align-items: center; padding: 0 10px; border-top: 1px solid var(--line-soft); letter-spacing: .6px; }
  .labels-scroll { overflow: hidden; flex: 1; min-height: 0; }
  .grid { flex: 1; position: relative; overflow: hidden; }
  .grid-scroll { position: absolute; inset: 0; overflow: auto hidden; }
  .canvas-area { position: relative; }
  .ruler { position: sticky; top: 0; height: 56px; z-index: 5; background: #111814; border-bottom: 1px solid var(--line-soft); }
  .grid-scroll::-webkit-scrollbar:horizontal { height: 9px; }
  .ruler svg { display: block; }
  .rows { position: relative; }
  .row { display: flex; align-items: stretch; border-bottom: 1px solid rgba(43,59,48,.5); position: relative; }
  .row.bone { background: rgba(255,255,255,.022); cursor: pointer; }
  .row.bone.sel { background: rgba(233,183,80,.09); }
  .row.channel { background: transparent; }
  .row.channel.sel { background: rgba(233,183,80,.05); }
  .row .row-label { width: 172px; flex: 0 0 172px; display: flex; align-items: center; gap: 6px; padding: 0 8px; overflow: hidden; border-right: 1px solid var(--line-soft); }
  .row .track { position: relative; flex: 1; cursor: crosshair; }
  .row .track .gridline { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(43,59,48,.35); }
  .row .track .gridline.major { background: rgba(52,74,58,.6); }
  .bone-label { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #cfdccd; width: 100%; min-width: 0; }
  .bone-label .swatch { width: 7px; height: 7px; border-radius: 2px; flex: 0 0 auto; }
  .bone-label .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bone-label .lk { margin-left: auto; font-size: 9px; color: #8a9b8c; }
  .ch-label { padding-left: 22px; font-size: 10.5px; color: var(--text-faint); letter-spacing: .3px; display: flex; align-items: center; width: 100%; gap: 4px; }
  .ch-label .dot2 { width: 4px; height: 4px; border-radius: 50%; background: #5d7564; }
  .key {
    position: absolute; top: 50%; width: 11px; height: 11px; margin-left: -5.5px; margin-top: -5.5px;
    transform: rotate(45deg); background: #cdd9cd; border: 1.5px solid #0f1611; border-radius: 2px;
    cursor: grab; z-index: 3; transition: background .1s, box-shadow .1s;
  }
  .key:hover { background: #fff5d6; }
  .key.sel { background: var(--wheat); box-shadow: 0 0 0 3px rgba(233,183,80,.24); }
  .key.ease-step { border-radius: 1px; background: #8fb4cc; }
  .key.ease-bezier { background: #c4a9e6; }
  .key.ease-bezier.sel, .key.ease-step.sel { background: var(--wheat); }
  .seg {
    position: absolute; top: 50%; height: 12px; transform: translateY(-50%);
    cursor: pointer; border-radius: 3px; z-index: 2;
  }
  .seg:hover { background: rgba(233,183,80,.12); }
  .seg.sel { background: rgba(233,183,80,.2); box-shadow: inset 0 0 0 1px rgba(233,183,80,.5); }
  .seg .curve { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
  .seg .curve polyline { fill: none; stroke: rgba(143,214,154,.5); stroke-width: 1.2; }
  .playhead { position: absolute; top: 0; bottom: 0; width: 1px; background: var(--wheat); z-index: 6; pointer-events: none; box-shadow: 0 0 8px rgba(233,183,80,.5); }
  .playhead::before { content: ''; position: absolute; top: 0; left: -5px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 8px solid var(--wheat); }
  .ann-row { height: 26px; background: #141d17; border-bottom: 1px solid var(--line-soft); }
  .ann-marker {
    position: absolute; top: 4px; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%;
    background: #3a2a1b; border: 1px solid #a9792f; color: #f0cd84; font-size: 10px;
    display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 4; font-family: var(--mono);
  }
  .ann-marker:hover { background: #4d3721; }
  .ann-marker.active { background: var(--wheat); color: #221a08; font-weight: 700; }
  .ann-marker.done { border-color: #4c6d55; background: #22332a; color: #9fda9f; }
  .ann-marker.explained { border-color: #4c5d7d; background: #1e2a36; color: #a8cdea; }
  .ann-marker.sel { outline: 2px solid #f7dfa8; outline-offset: 1px; }
  .easing-pop {
    position: absolute; z-index: 40; background: #1a251d; border: 1px solid #3b5243; border-radius: 9px;
    box-shadow: 0 12px 30px rgba(0,0,0,.5); padding: 4px; display: flex; flex-direction: column; min-width: 132px;
  }
  .easing-pop button {
    display: flex; align-items: center; gap: 7px; background: transparent; border: none; color: #dce8db;
    padding: 6px 8px; border-radius: 6px; text-align: left; font-size: 11.5px;
  }
  .easing-pop button:hover { background: #26372b; }
  .easing-pop button.on { background: #33422b; color: #f0d79a; }
  .easing-pop .hint { padding: 3px 8px 5px; font-size: 10px; color: var(--text-faint); border-top: 1px solid #2a3b30; margin-top: 3px; }
  .bez-edit { display: flex; gap: 4px; padding: 4px 6px; }
  .bez-edit input { width: 44px; height: 22px; background: #0f1611; border: 1px solid #33443a; color: #d6e2d5; border-radius: 5px; padding: 0 4px; font-family: var(--mono); font-size: 10px; }
  .no-project { padding: 30px; color: var(--text-faint); text-align: center; }
  .ruler-tick-text { font-family: var(--mono); font-size: 9px; fill: #7d9182; }
`;

interface RowRender {
  bone: Bone;
  top: number;
  height: number;
}

export class TimelineView extends BaseElement {
  private project: Project | null = null;
  private frame = 0;
  private selectedBoneId: string | null = null;
  private selectedKey: { boneId: string; kind: ChannelKind; keyId: string } | null = null;
  private selectedSegment: { boneId: string; kind: ChannelKind; aId: string } | null = null;
  private selectedAnnotation: string | null = null;
  private pxPerFrame = 12;
  private rows: RowRender[] = [];
  private drag: { type: 'playhead' | 'key'; keyId?: string; boneId?: string; kind?: ChannelKind; startX: number; startFrame: number } | null = null;
  private pop: HTMLElement | null = null;

  private get labelWidth() { return 172; }

  setProject(project: Project | null, selectedBoneId: string | null) {
    const isNewProject = this.project?.id !== project?.id;
    this.project = project;
    this.selectedBoneId = selectedBoneId;
    if (isNewProject) {
      this.selectedKey = null;
      this.selectedSegment = null;
      this.selectedAnnotation = null;
    }
    if (project && this.frame > project.timeline.duration) this.frame = 0;
    this.renderAll();
  }

  setFrame(frame: number) {
    this.frame = frame;
    const ph = this.shadow.querySelector('.playhead') as HTMLElement | null;
    if (ph) ph.style.left = `${frame * this.pxPerFrame}px`;
    const scroll = this.shadow.querySelector('.grid-scroll') as HTMLElement | null;
    if (scroll) {
      const x = frame * this.pxPerFrame;
      if (x < scroll.scrollLeft + 40) scroll.scrollLeft = Math.max(0, x - 60);
      else if (x > scroll.scrollLeft + scroll.clientWidth - 80) scroll.scrollLeft = x - scroll.clientWidth + 120;
    }
    this.updateFrameLabel();
  }

  setSelectedBone(id: string | null) {
    if (this.selectedBoneId === id) return;
    this.selectedBoneId = id;
    this.renderAll();
  }

  setSelectedAnnotation(id: string | null) {
    this.selectedAnnotation = id;
    this.renderAll();
  }

  private measureScale() {
    if (!this.project) return;
    const grid = this.shadow.querySelector('.grid') as HTMLElement | null;
    const avail = Math.max(320, (grid?.clientWidth ?? 700) - 24);
    const duration = Math.max(1, this.project.timeline.duration);
    this.pxPerFrame = clamp(avail / (duration + 1), 5, 40);
  }

  private renderAll() {
    if (!this.project) {
      this.render(`<div class="no-project">未打开项目</div>`, css);
      return;
    }
    this.measureScale();
    const p = this.project;
    const dur = p.timeline.duration;
    const fps = p.timeline.fps;
    const totalW = (dur + 1) * this.pxPerFrame;
    const bones = [...p.rig.bones].sort((a, b) => a.z - b.z);

    const ruler = this.rulerSvg(dur, fps, totalW);
    const anns = p.annotations;
    const annMarkers = anns
      .map((a, i) => {
        const cls = a.status === 'resolved' ? 'done' : a.status === 'explained' ? 'explained' : '';
        return `<div class="ann-marker ${cls} ${this.selectedAnnotation === a.id ? 'sel' : ''}" data-ann="${a.id}" style="left:${a.frame * this.pxPerFrame}px" title="${escapeHtml(a.text)}">${i + 1}</div>`;
      })
      .join('');

    const leftRows: string[] = [];
    const rightRows: string[] = [];
    this.rows = [];
    let top = 0;
    for (const bone of bones) {
      const boneTop = top;
      const hasTrack = p.timeline.tracks.find((t) => t.boneId === bone.id);
      leftRows.push(`
        <div class="row bone ${this.selectedBoneId === bone.id ? 'sel' : ''}" data-bone-row="${bone.id}" style="height:24px">
          <div class="row-label">
            <div class="bone-label"><span class="swatch" style="background:${bone.locked ? '#6f7d71' : bone.color}"></span>
            <span class="nm">${escapeHtml(bone.name)}</span>${bone.locked ? '<span class="lk">🔒 锁定</span>' : ''}</div>
          </div>
        </div>`);
      rightRows.push(`
        <div class="row bone ${this.selectedBoneId === bone.id ? 'sel' : ''}" data-bone-row="${bone.id}" style="height:24px">
          <div class="row-label">
            <div class="bone-label"><span class="swatch" style="background:${bone.locked ? '#6f7d71' : bone.color}"></span>
            <span class="nm">${escapeHtml(bone.name)}</span>${hasTrack ? '' : '<span class="faint small" style="margin-left:auto;font-size:9px">无曲线</span>'}</div>
          </div>
          <div class="track" data-track-bone="${bone.id}">${this.gridLines(dur)}</div>
        </div>`);
      top += 24;
      this.rows.push({ bone, top: boneTop, height: 24 });
      for (const kind of ['position', 'rotation', 'scale'] as ChannelKind[]) {
        const chTop = top;
        const keys = p.timeline.tracks.find((t) => t.boneId === bone.id)?.channels[kind].keys ?? [];
        leftRows.push(`
          <div class="row channel ${this.selectedBoneId === bone.id ? 'sel' : ''}" style="height:19px">
            <div class="row-label"><div class="ch-label"><span class="dot2"></span>${CHANNEL_LABEL[kind]}</div></div>
          </div>`);
        rightRows.push(`
          <div class="row channel ${this.selectedBoneId === bone.id ? 'sel' : ''}" style="height:19px" data-ch-row="${bone.id}:${kind}">
            <div class="row-label"><div class="ch-label"><span class="dot2"></span>${CHANNEL_LABEL[kind]}</div></div>
            <div class="track" data-track="${bone.id}:${kind}">${this.gridLines(dur)}${this.channelContent(bone, kind, keys)}</div>
          </div>`);
        top += 19;
        this.rows.push({ bone, top: chTop, height: 19 });
      }
    }

    const contentH = top;
    const html = `
      <div class="toolbar">
        <button class="btn sm ghost" data-act="addkey" title="在播放头处为选中骨骼打关键帧 (K)">◆ 打关键帧</button>
        <button class="btn sm ghost" data-act="delkey" title="删除选中的关键帧 (Delete)">删除关键帧</button>
        <span class="sep"></span>
        <span class="label">曲线</span>
        ${(['easeInOut', 'step', 'bezier'] as EasingType[]).map((e) => `
          <button class="btn sm ${this.currentEasing() === e ? 'toggled' : ''}" data-easing="${e}" title="${e === 'bezier' ? '贝塞尔（可拖控制点）' : e === 'step' ? '阶梯（保持前值）' : '缓入缓出'}">${EASING_LABEL[e]}</button>
        `).join('')}
        <span class="sep"></span>
        <span class="label">帧率</span>
        <span class="mono small">${fps}fps</span>
        <span class="sep"></span>
        <span class="label">总长</span>
        <span class="mono small">${dur} 帧</span>
        <span class="spacer"></span>
        <span class="label" id="frame-label">第 ${this.frame} 帧 · ${(this.frame / fps).toFixed(2)}s</span>
      </div>
      <div class="body">
        <div class="labels">
          <div class="labels-head">
            <div class="lh-block"><span>骨骼 / 曲线通道</span></div>
            <div class="lh-ann">批注</div>
          </div>
          <div class="labels-scroll">${leftRows.join('')}</div>
        </div>
        <div class="grid">
          <div class="grid-scroll">
            <div class="canvas-area" style="width:${totalW}px">
              <div class="ruler" style="width:${totalW}px">${ruler}</div>
              <div class="row ann-row" style="height:26px">
                <div class="track" style="width:${totalW}px">${annMarkers}</div>
              </div>
              <div class="rows" style="height:${contentH}px">${rightRows.join('')}</div>
              <div class="playhead" style="left:${this.frame * this.pxPerFrame}px;top:0;bottom:0"></div>
            </div>
          </div>
        </div>
      </div>`;
    this.render(html, css);
    this.bind();
    this.syncLabelsScroll();
    // Remove the duplicate first label column inside right rows (kept for grid alignment)
    this.shadow.querySelectorAll('.rows .row-label').forEach((el) => ((el as HTMLElement).style.display = 'none'));
  }

  private currentEasing(): EasingType | null {
    const p = this.project;
    if (!p) return null;
    if (this.selectedKey) {
      const track = p.timeline.tracks.find((t) => t.boneId === this.selectedKey!.boneId);
      const key = track?.channels[this.selectedKey.kind].keys.find((k) => k.id === this.selectedKey!.keyId);
      return key?.easing ?? null;
    }
    if (this.selectedSegment) {
      const track = p.timeline.tracks.find((t) => t.boneId === this.selectedSegment!.boneId);
      const key = track?.channels[this.selectedSegment.kind].keys.find((k) => k.id === this.selectedSegment!.aId);
      return key?.easing ?? null;
    }
    return null;
  }

  private gridLines(dur: number): string {
    let out = '';
    const step = this.pxPerFrame * (dur > 96 ? 12 : dur > 48 ? 6 : 4);
    for (let f = 0; f <= dur; f += dur > 96 ? 12 : dur > 48 ? 6 : 4) {
      out += `<div class="gridline major" style="left:${f * this.pxPerFrame}px"></div>`;
    }
    void step;
    return out;
  }

  private rulerSvg(dur: number, fps: number, totalW: number): string {
    const h = 56;
    const step = dur > 96 ? 12 : dur > 48 ? 6 : 4;
    let svg = `<svg width="${totalW}" height="${h}" xmlns="http://www.w3.org/2000/svg">`;
    for (let f = 0; f <= dur; f++) {
      const x = f * this.pxPerFrame + 0.5;
      const major = f % step === 0;
      const tiny = f % 2 === 0;
      if (!tiny && !major) continue;
      svg += `<line x1="${x}" y1="${major ? 26 : 40}" x2="${x}" y2="${h}" stroke="${major ? '#4a6653' : '#314237'}" stroke-width="1"/>`;
      if (major) {
        svg += `<text class="ruler-tick-text" x="${x + 3}" y="20">${f}</text>`;
        svg += `<text class="ruler-tick-text" x="${x + 3}" y="32" opacity="0.72">${(f / fps).toFixed(1)}s</text>`;
      }
    }
    // playhead hit area is handled in the ruler element
    svg += `<rect x="0" y="0" width="${totalW}" height="${h}" fill="transparent" class="ruler-hit"/>`;
    svg += '</svg>';
    return svg;
  }

  private channelContent(bone: Bone, kind: ChannelKind, keys: import('../core/types').Keyframe[]): string {
    const sorted = [...keys].sort((a, b) => a.frame - b.frame);
    let out = '';
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      const x1 = a.frame * this.pxPerFrame;
      const w = Math.max(2, (b.frame - a.frame) * this.pxPerFrame);
      const sel = this.selectedSegment?.kind === kind && this.selectedSegment?.boneId === bone.id && this.selectedSegment?.aId === a.id;
      const curve = a.easing === 'step' ? '' : this.curveSvg(a, w);
      out += `<div class="seg ${sel ? 'sel' : ''}" data-seg="${bone.id}:${kind}:${a.id}" style="left:${x1}px;width:${w}px" title="${EASING_LABEL[a.easing]}">
        ${curve}</div>`;
    }
    const canEdit = !bone.locked;
    for (const k of sorted) {
      const sel = this.selectedKey?.keyId === k.id;
      const easeCls = k.easing === 'step' ? 'ease-step' : k.easing === 'bezier' ? 'ease-bezier' : '';
      out += `<div class="key ${easeCls} ${sel ? 'sel' : ''}" data-key="${bone.id}:${kind}:${k.id}" style="left:${k.frame * this.pxPerFrame}px;${canEdit ? '' : 'opacity:.6;cursor:not-allowed'}" title="第 ${k.frame} 帧 · ${EASING_LABEL[k.easing]}"></div>`;
    }
    return out;
  }

  private curveSvg(a: import('../core/types').Keyframe, w: number): string {
    const kind = this.selectedSegment?.aId === a.id ? '' : '';
    void kind;
    const pts: string[] = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      let y: number;
      if (a.easing === 'bezier') y = 1 - cubic(a.bezier, t);
      else y = 1 - (t * t * (3 - 2 * t));
      pts.push(`${(t * w).toFixed(1)},${(y * 11).toFixed(1)}`);
    }
    return `<svg class="curve" width="${w}" height="12"><polyline points="${pts.join(' ')}" /></svg>`;
  }

  private bind() {
    const root = this.shadow;

    // ruler scrubbing
    const rulerEl = root.querySelector('.ruler') as HTMLElement;
    const startScrub = (e: PointerEvent) => {
      const area = root.querySelector('.canvas-area') as HTMLElement;
      const scrub = (clientX: number) => {
        const r = area.getBoundingClientRect();
        this.setFrame(clamp(Math.round((clientX - r.left) / this.pxPerFrame), 0, this.project?.timeline.duration ?? 0));
        this.emitFrame();
      };
      scrub(e.clientX);
      this.drag = { type: 'playhead', startX: e.clientX, startFrame: this.frame };
      const move = (ev: PointerEvent) => scrub(ev.clientX);
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        this.drag = null;
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    };
    rulerEl?.addEventListener('pointerdown', startScrub);

    root.querySelectorAll('[data-ann]').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        const id = (el as HTMLElement).dataset.ann!;
        this.selectedAnnotation = id;
        this.dispatchEvent(new CustomEvent('annotation-click', { detail: id, bubbles: true, composed: true }));
      });
    });

    root.querySelectorAll('[data-bone-row]').forEach((el) => {
      el.addEventListener('pointerdown', (e) => {
        const id = (el as HTMLElement).dataset.boneRow!;
        if ((e.target as HTMLElement).classList.contains('key')) return;
        this.dispatchEvent(new CustomEvent('bone-select', { detail: id, bubbles: true, composed: true }));
      });
    });

    root.querySelectorAll('[data-track]').forEach((el) => {
      el.addEventListener('dblclick', (e) => {
        const [boneId, kind] = (el as HTMLElement).dataset.track!.split(':') as [string, ChannelKind];
        if ((e.target as HTMLElement).classList.contains('key')) return;
        this.dispatchEvent(new CustomEvent('track-add-key', { detail: { boneId, kind, frame: this.frame }, bubbles: true, composed: true }));
      });
    });

    root.querySelectorAll<HTMLElement>('.key').forEach((el) => {
      el.addEventListener('pointerdown', (e: PointerEvent) => {
        e.stopPropagation();
        const [boneId, kind, keyId] = (el as HTMLElement).dataset.key!.split(':') as [string, ChannelKind, string];
        this.selectedKey = { boneId, kind, keyId };
        this.selectedSegment = null;
        this.dispatchEvent(new CustomEvent('key-select', { detail: this.selectedKey, bubbles: true, composed: true }));
        this.refreshSelectionStyles();
        const startFrame = this.keyFrame(boneId, kind, keyId);
        const x0 = e.clientX;
        let moved = false;
        const move = (ev: PointerEvent) => {
          if (!moved && Math.abs(ev.clientX - x0) < 3) return;
          moved = true;
          const delta = Math.round((ev.clientX - x0) / this.pxPerFrame);
          const next = clamp(startFrame + delta, 0, this.project?.timeline.duration ?? 0);
          this.dispatchEvent(new CustomEvent('key-drag', { detail: { boneId, kind, keyId, frame: next, live: true }, bubbles: true, composed: true }));
        };
        const up = (ev: PointerEvent) => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          if (moved) {
            const delta = Math.round((ev.clientX - x0) / this.pxPerFrame);
            const next = clamp(startFrame + delta, 0, this.project?.timeline.duration ?? 0);
            this.dispatchEvent(new CustomEvent('key-drag', { detail: { boneId, kind, keyId, frame: next, live: false }, bubbles: true, composed: true }));
          }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
      });
    });

    root.querySelectorAll<HTMLElement>('.seg').forEach((el) => {
      el.addEventListener('pointerdown', (e: PointerEvent) => {
        e.stopPropagation();
        const [boneId, kind, aId] = (el as HTMLElement).dataset.seg!.split(':') as [string, ChannelKind, string];
        this.selectedSegment = { boneId, kind, aId };
        this.selectedKey = null;
        this.dispatchEvent(new CustomEvent('segment-select', { detail: this.selectedSegment, bubbles: true, composed: true }));
        this.refreshSelectionStyles();
        if (e.button === 2) this.openEasingPop(e.clientX, e.clientY);
      });
      el.addEventListener('contextmenu', (e: MouseEvent) => {
        e.preventDefault();
        const [boneId, kind, aId] = (el as HTMLElement).dataset.seg!.split(':') as [string, ChannelKind, string];
        this.selectedSegment = { boneId, kind, aId };
        this.selectedKey = null;
        this.refreshSelectionStyles();
        this.openEasingPop(e.clientX, e.clientY);
      });
    });

    root.querySelectorAll('[data-easing]').forEach((el) => {
      el.addEventListener('click', () => {
        const easing = (el as HTMLElement).dataset.easing as EasingType;
        const target = this.selectedKey ?? this.selectedSegment;
        if (!target) {
          this.dispatchEvent(new CustomEvent('easing-noop', { bubbles: true, composed: true }));
          return;
        }
        this.dispatchEvent(new CustomEvent('easing-change', {
          detail: { boneId: target.boneId, kind: target.kind, keyId: this.keyIdOf(target), easing },
          bubbles: true, composed: true,
        }));
      });
    });

    root.querySelector('[data-act="addkey"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toolbar-add-key', { bubbles: true, composed: true }));
    });
    root.querySelector('[data-act="delkey"]')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toolbar-delete-key', { bubbles: true, composed: true }));
    });

    // keep label column scrolled with the grid vertically
    const gridScroll = root.querySelector('.grid-scroll') as HTMLElement;
    const labelScroll = root.querySelector('.labels-scroll') as HTMLElement;
    gridScroll?.addEventListener('scroll', () => {
      if (labelScroll) labelScroll.scrollTop = gridScroll.scrollTop;
    });

    // close easing popup on outside click
    root.addEventListener('pointerdown', (e) => {
      if (this.pop && !this.pop.contains(e.target as Node) && !(e.target as HTMLElement).closest?.('.seg')) {
        this.closePop();
      }
    });
  }

  private syncLabelsScroll() {
    const labelScroll = this.shadow.querySelector('.labels-scroll') as HTMLElement | null;
    const body = this.shadow.querySelector('.body') as HTMLElement | null;
    if (labelScroll && body) labelScroll.style.maxHeight = `${body.clientHeight - 82}px`;
  }

  private keyIdOf(target: { boneId: string; kind: ChannelKind; keyId?: string; aId?: string }): string {
    if ('keyId' in target && target.keyId) return target.keyId;
    return (target as { aId: string }).aId;
  }

  private keyFrame(boneId: string, kind: ChannelKind, keyId: string): number {
    const track = this.project?.timeline.tracks.find((t) => t.boneId === boneId);
    return track?.channels[kind].keys.find((k) => k.id === keyId)?.frame ?? 0;
  }

  private refreshSelectionStyles() {
    this.shadow.querySelectorAll('.key').forEach((el) => {
      const [boneId, kind, keyId] = (el as HTMLElement).dataset.key!.split(':');
      const sel = this.selectedKey?.keyId === keyId && this.selectedKey?.boneId === boneId && this.selectedKey?.kind === kind;
      el.classList.toggle('sel', !!sel);
    });
    this.shadow.querySelectorAll('.seg').forEach((el) => {
      const [boneId, kind, aId] = (el as HTMLElement).dataset.seg!.split(':');
      const sel = this.selectedSegment?.aId === aId && this.selectedSegment?.boneId === boneId && this.selectedSegment?.kind === kind;
      el.classList.toggle('sel', !!sel);
    });
    this.shadow.querySelectorAll('[data-easing]').forEach((el) => {
      const e = (el as HTMLElement).dataset.easing;
      el.classList.toggle('toggled', this.currentEasing() === e);
    });
  }

  private emitFrame() {
    this.dispatchEvent(new CustomEvent('frame-change', { detail: this.frame, bubbles: true, composed: true }));
  }

  private updateFrameLabel() {
    const el = this.shadow.getElementById('frame-label');
    if (el && this.project) el.textContent = `第 ${this.frame} 帧 · ${(this.frame / this.project.timeline.fps).toFixed(2)}s`;
  }

  /** Floating easing menu with bezier control-point editing. */
  private openEasingPop(clientX: number, clientY: number) {
    this.closePop();
    const target = this.selectedSegment ?? this.selectedKey;
    if (!target || !this.project) return;
    const track = this.project.timeline.tracks.find((t) => t.boneId === target.boneId);
    const keyId = this.keyIdOf(target);
    const key = track?.channels[target.kind].keys.find((k) => k.id === keyId);
    if (!key) return;
    const pop = document.createElement('div');
    pop.className = 'easing-pop';
    const bp = key.bezier;
    pop.innerHTML = `
      ${(['easeInOut', 'step', 'bezier'] as EasingType[]).map((e) => `
        <button data-set="${e}" class="${key.easing === e ? 'on' : ''}">${EASING_LABEL[e]}
          <span style="margin-left:auto;font-size:10px;opacity:.6">${e === 'easeInOut' ? 'smooth' : e === 'step' ? 'hold' : 'cubic'}</span>
        </button>`).join('')}
      <div class="bez-edit" style="${key.easing === 'bezier' ? '' : 'display:none'}">
        <input data-bp="0" value="${bp[0]}" title="x1">
        <input data-bp="1" value="${bp[1]}" title="y1">
        <input data-bp="2" value="${bp[2]}" title="x2">
        <input data-bp="3" value="${bp[3]}" title="y2">
      </div>
      <div class="hint">作用于该关键帧到下一帧的区间</div>`;
    const host = (this.shadow.querySelector('.grid') as HTMLElement).getBoundingClientRect();
    pop.style.left = `${clamp(clientX - host.left, 4, host.width - 150)}px`;
    pop.style.top = `${clamp(clientY - host.top, 4, host.height - 170)}px`;
    this.shadow.querySelector('.body')!.appendChild(pop);
    this.pop = pop;
    pop.querySelectorAll('[data-set]').forEach((b) => {
      b.addEventListener('click', () => {
        const easing = (b as HTMLElement).dataset.set as EasingType;
        this.dispatchEvent(new CustomEvent('easing-change', {
          detail: { boneId: target.boneId, kind: target.kind, keyId, easing },
          bubbles: true, composed: true,
        }));
        this.closePop();
      });
    });
    pop.querySelectorAll('[data-bp]').forEach((inp) => {
      inp.addEventListener('change', () => {
        const values = [...pop.querySelectorAll('[data-bp]')].map((i) => Number((i as HTMLInputElement).value) || 0) as [number, number, number, number];
        this.dispatchEvent(new CustomEvent('bezier-change', {
          detail: { boneId: target.boneId, kind: target.kind, keyId, bezier: values },
          bubbles: true, composed: true,
        }));
      });
    });
  }

  private closePop() {
    this.pop?.remove();
    this.pop = null;
  }

  getSelectedKey() {
    return this.selectedKey;
  }
  getSelectedSegment() {
    return this.selectedSegment;
  }
  getSelectedAnnotation() {
    return this.selectedAnnotation;
  }
}

function cubic(b: [number, number, number, number], t: number): number {
  // simple sampling of cubic-bezier x->y
  const [x1, y1, x2, y2] = b;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  let lo = 0, hi = 1, u = t;
  for (let i = 0; i < 20; i++) {
    u = (lo + hi) / 2;
    if (sx(u) < t) lo = u;
    else hi = u;
  }
  return sy(u);
}

customElements.define('farm-timeline', TimelineView);
export type { Annotation };
