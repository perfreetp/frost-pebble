import { Application, Container } from 'pixi.js';
import { BaseElement, toast } from './base';
import { store, navigate } from './context';
import type { CharacterVersion, Project } from '../core/types';
import { diffFrames } from '../core/rig';
import { Camera, DESIGN_H, DESIGN_W, RigView, cameraGround, createPixiApp } from '../core/renderer';
import { escapeHtml, fmtDate } from '../core/util';
import { buildDeliveryZip, downloadZip } from '../core/exporter';

const css = /* css */ `
  :host { display: flex; flex-direction: column; height: 100%; min-height: 0; overflow: hidden; }
  .topbar {
    height: 44px; flex: 0 0 44px; display: flex; align-items: center; gap: 10px; padding: 0 12px;
    border-bottom: 1px solid var(--line-soft); background: #101712;
  }
  .proj { display: flex; flex-direction: column; line-height: 1.2; }
  .proj .t { font-size: 12.5px; font-weight: 600; color: #e8efe4; }
  .proj .s { font-size: 10px; color: var(--text-faint); }
  .spacer { flex: 1; }
  .vpick { display: flex; align-items: center; gap: 6px; }
  .vpick label { font-size: 10px; color: var(--text-faint); letter-spacing: .4px; }
  .vpick select { height: 26px; width: 108px; font-size: 11px; font-family: var(--mono); }
  .vs { font-size: 11px; color: #8fa393; }

  .body { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  .views { flex: 1; min-height: 0; display: flex; gap: 1px; background: var(--line-soft); }
  .pane { flex: 1; min-width: 0; position: relative; background: #0a0f0c; display: flex; flex-direction: column; }
  .pane-head {
    height: 34px; flex: 0 0 34px; display: flex; align-items: center; gap: 8px; padding: 0 10px;
    background: #0f1612; border-bottom: 1px solid var(--line-soft); z-index: 3;
  }
  .pane-head .vn { font-family: var(--mono); font-size: 11px; padding: 2px 7px; border-radius: 5px; }
  .pane-head .vn.a { color: #a8d8ea; background: #172630; border: 1px solid #2f4759; }
  .pane-head .vn.b { color: #f0cd84; background: #2b2415; border: 1px solid #4a3c20; }
  .pane-head .note { font-size: 10.5px; color: var(--text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pane-head .when { margin-left: auto; font-size: 9.5px; color: var(--text-faint); font-family: var(--mono); }
  .pane-canvas { flex: 1; min-height: 0; position: relative; }
  .pane-canvas canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .pane-foot { flex: 0 0 26px; display: flex; align-items: center; gap: 8px; padding: 0 10px; background: #0f1612; border-top: 1px solid var(--line-soft); font-size: 10px; color: var(--text-faint); }
  .pane-foot .badge { font-family: var(--mono); font-size: 9.5px; color: #8fa393; }

  .diff-strip { flex: 0 0 84px; border-top: 1px solid var(--line); background: #0d1310; padding: 8px 12px; display: flex; flex-direction: column; gap: 6px; }
  .strip-head { display: flex; align-items: center; gap: 10px; font-size: 10.5px; color: var(--text-dim); }
  .strip-head .he { font-weight: 600; color: #d5e1d2; letter-spacing: .4px; }
  .strip-head .chipd { font-family: var(--mono); font-size: 10px; padding: 1px 7px; border-radius: 999px; }
  .strip { position: relative; height: 30px; }
  .strip .seg { position: absolute; top: 8px; width: 5px; height: 14px; border-radius: 2px; }
  .strip .seg.same { background: #223028; }
  .strip .seg.diff { background: linear-gradient(180deg, #e9b750, #cf8b2f); box-shadow: 0 0 6px rgba(233,183,80,.5); }
  .strip .seg.cur { outline: 2px solid #fff2cf; outline-offset: 1px; }
  .strip .ph { position: absolute; top: 0; bottom: 0; width: 1px; background: #e9b750; box-shadow: 0 0 6px rgba(233,183,80,.6); }
  .strip-legend { display: flex; gap: 12px; font-size: 9.5px; color: var(--text-faint); }
  .strip-legend i { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
  .controls { flex: 0 0 42px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border-top: 1px solid var(--line-soft); background: #101712; }
  .controls .frame-mono { font-family: var(--mono); font-size: 11px; color: #b9c9b6; min-width: 150px; }
  .controls .spacer { flex: 1; }
  .controls input[type=range] { flex: 1; max-width: 380px; accent-color: #e9b750; }
  .controls .jump { height: 25px; width: 60px; text-align: center; }
  .diff-info { font-size: 10.5px; color: #c9b184; }
  .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px; color: var(--text-faint); }
  .pane .offline { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-faint); font-size: 11px; }
  .mode-tabs { display: flex; gap: 3px; background: #0c120e; border: 1px solid var(--line-soft); border-radius: 8px; padding: 2px; }
  .mode-tabs button { height: 22px; padding: 0 9px; border: none; border-radius: 6px; background: transparent; color: var(--text-faint); font-size: 10.5px; }
  .mode-tabs button.on { background: #2b3a2f; color: #e4efdf; }
`;

interface PaneHandle {
  app: Application;
  root: Container;
  view: RigView;
  camera: Camera;
  host: HTMLElement;
  version: CharacterVersion | null;
}

export class CompareView extends BaseElement {
  private aVersion = 0;
  private bVersion = 0;
  private frame = 0;
  private diffList: number[] = [];
  private mode: 'side' | 'overlay' = 'side';
  private panes: PaneHandle[] = [];
  private unsubscribe: (() => void) | null = null;
  private drawing = false;
  private initialized = false;

  protected init() {
    this.unsubscribe = store.subscribe(() => {
      if (this.drawing) return;
      this.paintChrome();
      this.recomputeDiff();
      this.drawFrame();
    });
    this.render(`
      <div class="topbar" id="topbar"></div>
      <div class="body" id="body"></div>
      <div class="controls" id="controls"></div>`, css);
    void this.paintAsync();
  }

  protected onDisconnect() {
    this.unsubscribe?.();
    this.destroyPanes();
  }

  refresh() {
    void this.paintAsync();
  }

  private get project() {
    return store.project;
  }

  private async paintAsync() {
    const p = this.project;
    if (!p) {
      this.shadow.getElementById('body')!.innerHTML = '<div class="empty-state">未选择项目</div>';
      return;
    }
    const versions = p.versions;
    if (versions.length < 2) {
      this.paintChrome();
      this.shadow.getElementById('body')!.innerHTML = `
        <div class="empty-state">
          <div style="font-size:26px;opacity:.4">⇄</div>
          <div>至少需要两个已提交版本才能比对</div>
          <div class="small">当前有 ${versions.length} 个版本 · 去工作台提交新版本后再来</div>
          <button class="btn sm primary" id="go-wb">去工作台</button>
        </div>`;
      this.shadow.getElementById('go-wb')?.addEventListener('click', () => navigate('animate', p.id));
      return;
    }
    if (!this.aVersion) this.aVersion = versions[Math.max(0, versions.length - 2)].number;
    if (!this.bVersion) this.bVersion = versions[versions.length - 1].number;
    if (!versions.some((v) => v.number === this.aVersion)) this.aVersion = versions[versions.length - 2].number;
    if (!versions.some((v) => v.number === this.bVersion)) this.bVersion = versions[versions.length - 1].number;
    this.recomputeDiff();
    // open on a frame that actually differs so the comparison reads immediately
    if (this.diffList.length && this.frame === 0) this.frame = this.diffList[Math.floor(this.diffList.length / 3)];
    this.paintChrome();
    await this.buildPanes();
    this.drawFrame();
  }

  private paintChrome() {
    const p = this.project;
    if (!p) return;
    const versions = p.versions;
    const top = this.shadow.getElementById('topbar')!;
    top.innerHTML = `
      <div class="proj"><div class="t">${escapeHtml(p.title)}</div><div class="s">${p.crop} · 第 ${p.episode} 集 · 版本比对</div></div>
      <div class="spacer"></div>
      <div class="vpick"><label>基线</label>
        <select class="select" id="v-a">${versions.map((v) => `<option value="${v.number}" ${v.number === this.aVersion ? 'selected' : ''}>v${v.number}</option>`).join('')}</select>
      </div>
      <span class="vs">⇄</span>
      <div class="vpick"><label>对比</label>
        <select class="select" id="v-b">${versions.map((v) => `<option value="${v.number}" ${v.number === this.bVersion ? 'selected' : ''}>v${v.number}</option>`).join('')}</select>
      </div>
      <div class="mode-tabs">
        <button data-mode="side" class="${this.mode === 'side' ? 'on' : ''}">并排</button>
        <button data-mode="overlay" class="${this.mode === 'overlay' ? 'on' : ''}">叠加</button>
      </div>
      <button class="btn sm ghost" id="btn-export-a">⇩ 导出基线帧</button>
      <button class="btn sm ghost" id="btn-back">◧ 工作台</button>`;
    const selA = top.querySelector('#v-a') as HTMLSelectElement;
    const selB = top.querySelector('#v-b') as HTMLSelectElement;
    selA.addEventListener('change', () => { this.aVersion = Number(selA.value); this.recomputeDiff(); this.paintChrome(); void this.buildPanes().then(() => { this.recomputeDiff(); this.paintChrome(); this.drawFrame(); }); });
    selB.addEventListener('change', () => { this.bVersion = Number(selB.value); this.recomputeDiff(); this.paintChrome(); void this.buildPanes().then(() => { this.recomputeDiff(); this.paintChrome(); this.drawFrame(); }); });
    top.querySelectorAll<HTMLElement>('[data-mode]').forEach((el) => {
      el.addEventListener('click', () => {
        this.mode = el.dataset.mode as 'side' | 'overlay';
        this.paintChrome();
        void this.buildPanes().then(() => { this.recomputeDiff(); this.paintChrome(); this.drawFrame(); });
      });
    });
    top.querySelector('#btn-back')?.addEventListener('click', () => navigate('animate', p.id));
    top.querySelector('#btn-export-a')?.addEventListener('click', () => void this.exportVersion());

    const controls = this.shadow.getElementById('controls')!;
    const p2 = this.project!;
    const dur = p2.timeline.duration;
    const isDiff = this.diffList.includes(this.frame);
    controls.innerHTML = `
      <button class="btn icon" id="c-prev">◀</button>
      <button class="btn icon" id="c-next">▶</button>
      <span class="frame-mono">第 ${this.frame} / ${dur} 帧</span>
      <input type="range" id="c-range" min="0" max="${dur}" step="1" value="${this.frame}">
      <input class="input mono jump" id="c-jump" value="${this.frame}">
      <button class="btn sm ${isDiff ? 'primary' : 'ghost'}" id="c-jump-diff" ${this.diffList.length ? '' : 'disabled'}>跳到下一个差异帧</button>
      <span class="diff-info">${this.diffList.length} 个差异帧</span>
      <div class="spacer"></div>
      <span class="faint small">差异判定：任一骨骼世界位移 / 旋转 / 缩放变化 > 0.4%</span>`;
    controls.querySelector('#c-prev')?.addEventListener('click', () => this.setFrame(this.frame - 1));
    controls.querySelector('#c-next')?.addEventListener('click', () => this.setFrame(this.frame + 1));
    const range = controls.querySelector('#c-range') as HTMLInputElement;
    range.addEventListener('input', () => this.setFrame(Number(range.value)));
    const jump = controls.querySelector('#c-jump') as HTMLInputElement;
    jump.addEventListener('change', () => this.setFrame(Number(jump.value) || 0));
    controls.querySelector('#c-jump-diff')?.addEventListener('click', () => {
      if (!this.diffList.length) return;
      const next = this.diffList.find((f) => f > this.frame) ?? this.diffList[0];
      this.setFrame(next);
    });
  }

  private async buildPanes() {
    const p = this.project;
    if (!p) return;
    this.destroyPanes();
    const body = this.shadow.getElementById('body')!;
    const a = p.versions.find((v) => v.number === this.aVersion);
    const b = p.versions.find((v) => v.number === this.bVersion);
    if (!a || !b) return;
    const sideBySide = this.mode === 'side';
    body.innerHTML = `
      <div class="views" id="views" style="${sideBySide ? '' : 'position:relative'}">
        <div class="pane" id="pane-a" style="${sideBySide ? '' : 'position:absolute;inset:0'}">
          <div class="pane-head">
            <span class="vn a">v${a.number}</span><span class="note">${escapeHtml(a.note)}</span>
            <span class="when">${fmtDate(a.submittedAt)} · ${a.submittedBy}</span>
          </div>
          <div class="pane-canvas" id="canvas-a"></div>
          <div class="pane-foot"><span>${a.rig.bones.length} 骨</span><span class="badge">${a.timeline.tracks.reduce((n, t) => n + t.channels.position.keys.length + t.channels.rotation.keys.length + t.channels.scale.keys.length, 0)} 关键帧</span></div>
        </div>
        <div class="pane" id="pane-b" style="${sideBySide ? '' : 'position:absolute;inset:0;opacity:.55;pointer-events:none'}">
          <div class="pane-head">
            <span class="vn b">v${b.number}</span><span class="note">${escapeHtml(b.note)}</span>
            <span class="when">${fmtDate(b.submittedAt)} · ${b.submittedBy}</span>
          </div>
          <div class="pane-canvas" id="canvas-b"></div>
          <div class="pane-foot"><span>${b.rig.bones.length} 骨</span><span class="badge">${b.timeline.tracks.reduce((n, t) => n + t.channels.position.keys.length + t.channels.rotation.keys.length + t.channels.scale.keys.length, 0)} 关键帧</span></div>
        </div>
      </div>
      <div class="diff-strip" id="diff-strip"></div>`;
    this.drawStrip();

    const makePane = async (hostId: string, version: CharacterVersion | null, tint?: number): Promise<PaneHandle | null> => {
      const host = this.shadow.getElementById(hostId);
      if (!host) return null;
      const app = await createPixiApp(host);
      const camera = new Camera();
      const root = new Container();
      app.stage.addChild(root);
      root.addChild(cameraGround(DESIGN_W, DESIGN_H));
      const view = new RigView();
      view.setStyle({ showBones: false, showParts: true, tint, ghostAlpha: 0.5 });
      root.addChild(view.root);
      if (version) {
        view.setData({ rig: version.rig, timeline: version.timeline, assets: p.assets });
        await view.preload();
      }
      const rect = host.getBoundingClientRect();
      const w = Math.max(200, rect.width);
      const h = Math.max(160, rect.height);
      app.renderer.resize(w, h);
      camera.fit(w, h);
      root.position.set(camera.panX, camera.panY);
      root.scale.set(camera.zoom);
      view.setViewScale(camera.zoom);
      return { app, root, view, camera, host, version };
    };

    const paneA = await makePane('canvas-a', a);
    const paneB = await makePane('canvas-b', b, this.mode === 'overlay' ? 0x9fe0b0 : undefined);
    if (paneA) this.panes.push(paneA);
    if (paneB) this.panes.push(paneB);
    if (this.mode === 'overlay' && paneB) {
      const head = this.shadow.querySelector('#pane-b .pane-head') as HTMLElement;
      if (head) head.style.position = 'relative';
    }
    this.initialized = true;
    this.observeResize();
  }

  private resizeObs: ResizeObserver | null = null;
  private observeResize() {
    this.resizeObs?.disconnect();
    this.resizeObs = new ResizeObserver(() => {
      for (const pane of this.panes) {
        const rect = pane.host.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 20) continue;
        pane.app.renderer.resize(rect.width, rect.height);
        pane.camera.fit(rect.width, rect.height);
        pane.root.position.set(pane.camera.panX, pane.camera.panY);
        pane.root.scale.set(pane.camera.zoom);
        pane.view.setViewScale(pane.camera.zoom);
      }
      this.drawFrame();
    });
    const host = this.shadow.getElementById('body');
    if (host) this.resizeObs.observe(host);
  }

  private recomputeDiff() {
    const p = this.project;
    if (!p) return;
    const a = p.versions.find((v) => v.number === this.aVersion);
    const b = p.versions.find((v) => v.number === this.bVersion);
    const dur = p.timeline.duration;
    this.diffList = a && b ? diffFrames({ rig: a.rig, timeline: a.timeline }, { rig: b.rig, timeline: b.timeline }, dur) : [];
    this.drawStrip();
  }

  private drawStrip() {
    const strip = this.shadow.getElementById('diff-strip');
    const p = this.project;
    if (!strip || !p) return;
    const dur = Math.max(1, p.timeline.duration);
    const a = p.versions.find((v) => v.number === this.aVersion);
    const b = p.versions.find((v) => v.number === this.bVersion);
    const same = dur + 1 - this.diffList.length;
    strip.innerHTML = `
      <div class="strip-head"><span class="he">差异帧分布</span>
        <span class="chipd" style="background:#2b2415;color:#f0cd84;border:1px solid #4a3c20">${this.diffList.length} 帧不同</span>
        <span class="chipd" style="background:#1a2a20;color:#9fda9f;border:1px solid #35543c">${same} 帧一致</span>
        <span class="faint small">v${a?.number ?? '-'} ⇄ v${b?.number ?? '-'} · 点击色块跳帧</span>
      </div>
      <div class="strip" id="strip-inner">
        ${Array.from({ length: dur + 1 }, (_, f) => `<span class="seg ${this.diffList.includes(f) ? 'diff' : 'same'} ${this.frame === f ? 'cur' : ''}" style="left:${(f / dur) * 100}%;width:${Math.max(1.5, 100 / (dur + 1) - 1)}%" data-f="${f}"></span>`).join('')}
        <div class="ph" style="left:${(this.frame / dur) * 100}%"></div>
      </div>
      <div class="strip-legend"><span><i style="background:#e9b750"></i>姿态存在差异</span><span><i style="background:#223028"></i>两版一致</span></div>`;
    strip.querySelectorAll<HTMLElement>('[data-f]').forEach((el) => {
      el.addEventListener('click', () => this.setFrame(Number(el.dataset.f)));
    });
  }

  private setFrame(frame: number) {
    const p = this.project;
    if (!p) return;
    const dur = p.timeline.duration;
    this.frame = Math.max(0, Math.min(dur, Math.round(frame)));
    this.drawFrame();
    this.paintControlsOnly();
    this.drawStrip();
    this.shadow.querySelector('#diff-strip');
  }

  private paintControlsOnly() {
    const c = this.shadow.getElementById('controls');
    const range = c?.querySelector('#c-range') as HTMLInputElement | null;
    if (range) range.value = String(this.frame);
    const jump = c?.querySelector('#c-jump') as HTMLInputElement | null;
    if (jump) jump.value = String(this.frame);
    const label = c?.querySelector('.frame-mono');
    if (label) label.textContent = `第 ${this.frame} / ${this.project?.timeline.duration ?? 0} 帧`;
    const btnDiff = c?.querySelector('#c-jump-diff');
    if (btnDiff) btnDiff.classList.toggle('primary', this.diffList.includes(this.frame));
  }

  private drawFrame() {
    const p = this.project;
    if (!p) return;
    this.drawing = true;
    try {
      for (const pane of this.panes) {
        if (!pane.version) continue;
        pane.view.draw(this.frame);
        pane.app.renderer.render(pane.app.stage);
      }
    } finally {
      this.drawing = false;
    }
  }

  private async exportVersion() {
    const p = this.project;
    if (!p) return;
    const a = p.versions.find((v) => v.number === this.aVersion);
    if (!a) return;
    toast('正在渲染基线版本序列帧…', 'ok');
    const { renderSequence } = await import('../core/canvas-export');
    const frames = await renderSequence(a.rig, a.timeline, p.assets, { scale: 1 });
    const zip = await buildDeliveryZip(p, frames, { version: a, includeAssets: false });
    downloadZip(zip, p);
    toast(`v${a.number} 已导出（${frames.length} 帧）`, 'ok');
  }

  private destroyPanes() {
    for (const pane of this.panes) {
      pane.view.destroy();
      pane.app.destroy(true, { children: true });
    }
    this.panes = [];
    this.resizeObs?.disconnect();
    this.resizeObs = null;
    this.initialized = false;
  }
}

customElements.define('farm-compare', CompareView);
