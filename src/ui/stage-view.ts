import { Application, Container } from 'pixi.js';
import { BaseElement, toast } from './base';
import type { AssetPart, Bone, Project, Rig, Timeline } from '../core/types';
import { Camera, DESIGN_H, DESIGN_W, RigView, cameraGround, createPixiApp } from '../core/renderer';
import { applyMat } from '../core/rig';
import { clamp } from '../core/util';

const css = /* css */ `
  :host { display: block; position: relative; min-height: 0; height: 100%; }
  .wrap { position: absolute; inset: 0; overflow: hidden; background:
    radial-gradient(700px 420px at 50% 30%, rgba(120,170,120,.08), transparent 70%), #0a0f0c; }
  canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .canvas-host { position: absolute; inset: 0; }
  .hud { position: absolute; left: 12px; top: 12px; display: flex; gap: 6px; align-items: center; z-index: 5; pointer-events: none; }
  .hud > * { pointer-events: auto; }
  .hud-pill {
    display: flex; align-items: center; gap: 7px; height: 28px; padding: 0 10px; border-radius: 8px;
    background: rgba(14,20,16,.78); border: 1px solid rgba(58,78,63,.7); backdrop-filter: blur(8px);
    font-size: 11px; color: var(--text-dim);
  }
  .hud-pill b { color: #e3ecdf; font-weight: 600; }
  .hud-pill .dot { color: var(--green); }
  .tools { position: absolute; left: 12px; top: 48px; display: flex; flex-direction: column; gap: 4px; z-index: 5;
    background: rgba(14,20,16,.82); border: 1px solid rgba(58,78,63,.7); border-radius: 10px; padding: 4px; backdrop-filter: blur(8px); }
  .tools button { width: 32px; height: 30px; border: none; background: transparent; color: #a5b8a6; border-radius: 7px; font-size: 14px; display: flex; align-items: center; justify-content: center; }
  .tools button:hover { background: #26352b; color: #e2ecdf; }
  .tools button.on { background: #34462f; color: #f0d79a; }
  .zoom { position: absolute; right: 12px; bottom: 12px; display: flex; align-items: center; gap: 4px; z-index: 5;
    background: rgba(14,20,16,.82); border: 1px solid rgba(58,78,63,.7); border-radius: 8px; padding: 3px 4px; backdrop-filter: blur(8px); }
  .zoom button { width: 24px; height: 22px; border: none; background: transparent; color: #a5b8a6; border-radius: 5px; }
  .zoom button:hover { background: #26352b; }
  .zoom .val { font-family: var(--mono); font-size: 10px; color: #8fa393; padding: 0 4px; min-width: 38px; text-align: center; }
  .mode-hint { position: absolute; left: 50%; transform: translateX(-50%); top: 12px; z-index: 5; font-size: 11px; color: #b7c9b8;
    background: rgba(18,27,21,.9); border: 1px solid #3a5242; padding: 5px 12px; border-radius: 999px; display: none; }
  .mode-hint.show { display: block; animation: fadeUp .16s ease-out; }
  .empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; color: var(--text-faint); }
  .ann-layer { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
  .ann-pin {
    position: absolute; width: 22px; height: 22px; margin: -30px 0 0 8px; border-radius: 50%;
    background: rgba(233,183,80,.92); color: #251c08; border: 2px solid #fff2cf; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; pointer-events: none; cursor: pointer;
    box-shadow: 0 3px 10px rgba(0,0,0,.4); font-family: var(--mono); letter-spacing: 0;
  }
  .ann-layer.live .ann-pin { pointer-events: auto; }
  .ann-anchor {
    position: absolute; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; border-radius: 50%;
    background: rgba(233,183,80,.95); box-shadow: 0 0 0 2px rgba(255,242,207,.6), 0 0 10px rgba(233,183,80,.6);
    pointer-events: none;
  }
  .ann-anchor.done { background: #6fbf7c; box-shadow: 0 0 0 2px rgba(216,243,216,.55), 0 0 10px rgba(111,191,124,.5); }
  .ann-anchor.explained { background: #6fa8d6; box-shadow: 0 0 0 2px rgba(219,234,248,.55), 0 0 10px rgba(111,168,214,.5); }
  .ann-leader { position: absolute; width: 1px; height: 16px; background: rgba(233,183,80,.5); pointer-events: none; transform-origin: bottom center; }
  .ann-pin.done { background: rgba(96,170,110,.92); color: #10220f; border-color: #d8f3d8; }
  .ann-pin.explained { background: rgba(110,150,200,.92); color: #0d1a26; border-color: #dbeaf8; }
  .ann-pin.sel { transform: scale(1.15); box-shadow: 0 0 0 4px rgba(233,183,80,.28), 0 3px 10px rgba(0,0,0,.4); }
  .ann-pin.pulse { animation: pulse .7s ease-out; }
  @keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(233,183,80,.7); } 100% { transform: scale(1); box-shadow: 0 0 0 16px rgba(233,183,80,0); } }
  .draft-pop {
    position: absolute; z-index: 12; width: 240px; background: #1a251d; border: 1px solid #45604c; border-radius: 10px;
    box-shadow: 0 16px 40px rgba(0,0,0,.55); padding: 9px; display: flex; flex-direction: column; gap: 7px;
  }
  .draft-pop .head { font-size: 11px; color: #b9cbb9; display: flex; gap: 6px; align-items: center; }
  .draft-pop textarea { width: 100%; height: 60px; resize: none; background: #0e1511; border: 1px solid #35483b; border-radius: 7px; color: #e6efe4; padding: 7px; font-size: 11.5px; line-height: 1.5; outline: none; }
  .draft-pop textarea:focus { border-color: #6a9a72; }
  .draft-pop .acts { display: flex; justify-content: flex-end; gap: 6px; }
  .badge-lock { position: absolute; right: 12px; top: 12px; z-index: 5; display: none; }
  .badge-lock.show { display: flex; }
`;

type Mode = 'select' | 'build' | 'annotate';

interface DragState {
  kind: 'move' | 'rotate' | 'joint' | 'pan' | 'rubber';
  boneId: string;
  startWorld: { x: number; y: number };
  startLocal: { x: number; y: number };
  startRotation: number;
  startAngle: number;
  jointStart: { x: number; y: number };
  moved: boolean;
  worldStart: { x: number; y: number };
}

export class StageView extends BaseElement {
  private app: Application | null = null;
  private world = new Container();
  private gridLayer = new Container();
  private artLayer = new Container();
  private rig: RigView | null = null;
  private camera = new Camera();
  private project: Project | null = null;
  private lastTimeline: Timeline | null = null;
  private frame = 0;
  private selectedBoneId: string | null = null;
  private mode: Mode = 'select';
  private showBones = true;
  private showParts = true;
  private showBonesInit = true;
  private ghostFrame: number | null = null;
  private drag: DragState | null = null;
  private layerBuilt = false;
  private annLayer: HTMLElement | null = null;
  private annSelection: string | null = null;
  private draft: { frame: number; x: number; y: number } | null = null;
  private needDraw = true;
  private fittedOnce = false;
  private pinsLive = false;
  private markupVisible = true;
  private readonly onResize = () => this.resize();

  protected init() {
    this.render(`<div class="wrap">
      <div class="canvas-host"></div>
      <div class="hud">
        <div class="hud-pill" id="pill-crop">—</div>
        <div class="hud-pill" id="pill-frame">第 0 帧</div>
      </div>
      <div class="tools">
        <button data-mode="select" class="on" title="选择/变换 (V)">✥</button>
        <button data-mode="build" title="搭骨/加关节 (B)">⌗</button>
        <button data-mode="annotate" title="批注 (A)">✎</button>
        <button data-toggle="bones" class="on" title="显示骨骼">◈</button>
        <button data-toggle="parts" class="on" title="显示零件">◒</button>
      </div>
      <div class="badge-lock hud-pill" id="lock-badge">🔒 <b>已锁定</b> — 该零件不可拖动</div>
      <div class="mode-hint" id="mode-hint"></div>
      <div class="zoom">
        <button data-zoom="out">−</button>
        <span class="val" id="zoom-val">100%</span>
        <button data-zoom="in">+</button>
        <button data-zoom="fit" title="适应画布">⤢</button>
      </div>
      <div class="ann-layer"></div>
    </div>`, css);
    this.annLayer = this.shadow.querySelector('.ann-layer');
    this.bindToolbar();
    window.addEventListener('resize', this.onResize);
    this.setupPixi();
  }

  protected onDisconnect() {
    window.removeEventListener('resize', this.onResize);
    this.app?.destroy(true, { children: true });
    this.app = null;
    this.rig = null;
    this.layerBuilt = false;
  }

  private async setupPixi() {
    const host = this.shadow.querySelector('.canvas-host') as HTMLElement;
    const app = await createPixiApp(host);
    this.app = app;
    this.gridLayer.addChild(cameraGround(DESIGN_W, DESIGN_H));
    this.world.addChild(this.gridLayer);
    this.world.addChild(this.artLayer);
    app.stage.addChild(this.world);

    this.rig = new RigView();
    // the review desk hides bone chrome; the workbench shows it
    this.rig.setStyle({ showBones: this.showBones, showParts: this.showParts, ghostAlpha: 0.28 });
    this.world.addChild(this.rig.root);

    app.ticker.add(() => {
      if (this.needDraw) {
        this.needDraw = false;
        this.draw();
      }
    });

    this.installPointer();
    this.resize();
    this.syncData(true);
    void this.rig.preload().then(() => {
      this.fitContent();
      this.needDraw = true;
    });
  }

  private resize() {
    if (!this.app) return;
    const rect = this.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
    const h = Math.max(180, Math.floor(rect.height || 400));
    this.app.renderer.resize(w, h);
    if (!this.fittedOnce) this.fitContent();
    else this.applyCamera();
    this.renderAnnotations();
  }

  /** Frames the character instead of the whole design canvas, so the rig fills the view. */
  fitContent() {
    if (!this.app) return;
    const rect = this.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
    const h = Math.max(180, Math.floor(rect.height || 400));
    const bounds = this.rig?.partBounds(this.frame);
    if (bounds) {
      this.camera.fitBounds(bounds, w, h, Math.min(w, h) * 0.16);
      this.fittedOnce = true;
    } else {
      this.camera.fit(w, h);
    }
    this.applyCamera();
  }

  private applyCamera() {
    if (!this.app) return;
    this.world.position.set(this.camera.panX, this.camera.panY);
    this.world.scale.set(this.camera.zoom);
    this.rig?.setViewScale(this.camera.zoom);
    const zv = this.shadow.getElementById('zoom-val');
    if (zv) zv.textContent = `${Math.round(this.camera.zoom * 100)}%`;
    this.needDraw = true;
  }

  setProject(project: Project | null, timeline: Timeline | null, frame: number) {
    const changed = this.project?.id !== project?.id;
    this.project = project;
    this.lastTimeline = timeline;
    this.frame = frame;
    if (changed) {
      this.selectedBoneId = null;
      this.annSelection = null;
      this.fittedOnce = false;
    }
    this.syncData(changed);
    if (changed) setTimeout(() => this.fitContent(), 80);
    this.renderAnnotations();
    this.updateHud();
  }

  setFrame(frame: number) {
    this.frame = frame;
    this.needDraw = true;
    this.renderAnnotations();
    this.updateHud();
  }

  setTimeline(timeline: Timeline | null) {
    this.lastTimeline = timeline;
    this.syncData(false);
  }

  setSelectedBone(id: string | null) {
    this.selectedBoneId = id;
    this.rig?.setSelection(id);
    const locked = this.project?.rig.bones.find((b) => b.id === id)?.locked;
    this.shadow.getElementById('lock-badge')?.classList.toggle('show', !!locked);
    if (id) this.annSelection = null;
    this.renderAnnotations();
    this.needDraw = true;
  }

  /** Pins are clickable when live; joints stay the primary target otherwise. */
  setAnnotationsInteractive(live: boolean) {
    this.pinsLive = live;
    this.annLayer?.classList.toggle('live', live);
  }

  setAnnotationSelection(id: string | null) {
    this.annSelection = id;
    this.renderAnnotations();
  }

  pulseAnnotation(id: string) {
    this.annSelection = id;
    this.renderAnnotations();
    const el = this.annLayer?.querySelector(`[data-ann="${id}"]`);
    el?.classList.add('pulse');
    setTimeout(() => el?.classList.remove('pulse'), 800);
  }

  setGhostFrame(frame: number | null) {
    this.ghostFrame = frame;
    this.rig?.setGhostFrame(frame);
    this.needDraw = true;
  }

  setViewOptions(opts: { bones?: boolean; parts?: boolean }) {
    if (opts.bones !== undefined) {
      this.showBones = opts.bones;
      this.rig?.setStyle({ showBones: opts.bones });
      this.shadow.querySelectorAll<HTMLElement>('[data-toggle="bones"]').forEach((el) => el.classList.toggle('on', opts.bones!));
    }
    if (opts.parts !== undefined) {
      this.showParts = opts.parts;
      this.rig?.setStyle({ showParts: opts.parts });
      this.shadow.querySelectorAll<HTMLElement>('[data-toggle="parts"]').forEach((el) => el.classList.toggle('on', opts.parts!));
    }
    this.needDraw = true;
  }

  setToolsVisible(visible: boolean) {
    const tools = this.shadow.querySelector('.tools') as HTMLElement | null;
    if (tools) tools.style.display = visible ? '' : 'none';
    const badge = this.shadow.getElementById('lock-badge') as HTMLElement | null;
    if (badge) badge.style.display = visible ? '' : 'none';
  }

  setMode(mode: Mode, silent = false) {
    this.mode = mode;
    this.closeDraft();
    // annotate mode always enables pins; other modes keep whatever the host asked for
    this.annLayer?.classList.toggle('live', mode === 'annotate' || this.pinsLive);
    if (mode === 'annotate') this.rig?.setSelection(null);
    this.shadow.querySelectorAll('.tools [data-mode]').forEach((el) => {
      el.classList.toggle('on', (el as HTMLElement).dataset.mode === mode);
    });
    const hints: Record<Mode, string> = {
      select: '选择模式：拖动关节移动骨骼，拖上方圆点旋转，滚轮缩放，空格/中键平移',
      build: '搭骨模式：在画布上点两下建立父子关节（先父后子），已选零件自动挂到新关节',
      annotate: '批注模式：在画面上点击任意位置写下审核意见，批注会挂到当前帧',
    };
    const hint = this.shadow.getElementById('mode-hint');
    if (hint && !silent) {
      hint.textContent = hints[mode];
      hint.classList.add('show');
      setTimeout(() => hint.classList.remove('show'), 3200);
    }
    (this.shadow.host as HTMLElement).style.cursor = mode === 'annotate' ? 'crosshair' : '';
  }

  getMode() {
    return this.mode;
  }

  private syncData(rebuild: boolean) {
    if (!this.rig) return;
    if (!this.project) return;
    this.rig.setData({
      rig: this.project.rig,
      timeline: this.lastTimeline,
      assets: this.project.assets,
    });
    this.rig.setSelection(this.selectedBoneId);
    this.rig.setGhostFrame(this.ghostFrame);
    if (rebuild) {
      void this.rig.preload().then(() => {
        this.needDraw = true;
      });
    }
    this.needDraw = true;
    this.updateHud();
  }

  private updateHud() {
    const pillCrop = this.shadow.getElementById('pill-crop');
    if (pillCrop && this.project) {
      pillCrop.innerHTML = `<span class="dot"></span><b>${this.project.crop}</b> 第 ${this.project.episode} 集`;
    }
    const pillFrame = this.shadow.getElementById('pill-frame');
    if (pillFrame) pillFrame.innerHTML = `第 <b>${this.frame}</b> 帧${this.ghostFrame !== null ? ` · 对比第 ${this.ghostFrame} 帧` : ''}`;
  }

  private draw() {
    if (!this.rig || !this.app) return;
    this.rig.draw(this.frame);
  }


  private bindToolbar() {
    this.shadow.querySelectorAll('.tools [data-mode]').forEach((el) => {
      el.addEventListener('click', () => this.setMode((el as HTMLElement).dataset.mode as Mode));
    });
    this.shadow.querySelectorAll('.tools [data-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const key = (el as HTMLElement).dataset.toggle;
        const on = el.classList.toggle('on');
        if (key === 'bones') {
          this.showBones = on;
          this.rig?.setStyle({ showBones: on });
        } else {
          this.showParts = on;
          this.rig?.setStyle({ showParts: on });
        }
        this.needDraw = true;
      });
    });
    this.shadow.querySelectorAll('[data-zoom]').forEach((el) => {
      el.addEventListener('click', () => {
        const act = (el as HTMLElement).dataset.zoom;
        const rect = this.getBoundingClientRect();
        if (act === 'fit') this.fitContent();
        else this.camera.zoomAt(rect.width / 2, rect.height / 2, act === 'in' ? 1.18 : 0.85);
        this.applyCamera();
      });
    });
  }

  private installPointer() {
    const host = this.shadow.querySelector('.canvas-host') as HTMLElement;
    host.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = host.getBoundingClientRect();
      this.camera.zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.1 : 0.91);
      this.applyCamera();
    }, { passive: false });

    host.addEventListener('pointerdown', (e) => {
      const rect = host.getBoundingClientRect();
      const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const world = this.camera.screenToWorld(screen.x, screen.y);
      if (e.button === 1 || (e.button === 0 && e.altKey) || this.spaceDown) {
        this.drag = { kind: 'pan', boneId: '', startWorld: world, startLocal: { x: 0, y: 0 }, startRotation: 0, startAngle: 0, jointStart: { x: 0, y: 0 }, moved: false, worldStart: { x: screen.x, y: screen.y } };
        host.setPointerCapture(e.pointerId);
        return;
      }
      if (this.mode === 'annotate') {
        if (e.button === 0) this.openDraft(world.x, world.y, screen.x, screen.y);
        return;
      }
      const rig = this.rig;
      if (!rig || !this.project) return;
      const hit = rig.hitTest(world);
      const sel = this.selectedBoneId ? this.project.rig.bones.find((b) => b.id === this.selectedBoneId) : null;
      const selPose = sel ? rig.getPose().get(sel.id) : null;

      // rotate handle grab
      if (sel && selPose && !sel.locked) {
        const up = boneUp(selPose.world);
        const hx = selPose.joint.x + up.x * 48 / this.camera.zoom;
        const hy = selPose.joint.y + up.y * 48 / this.camera.zoom;
        const r = 11 / this.camera.zoom;
        if (Math.hypot(hx - world.x, hy - world.y) <= r) {
          const angle = Math.atan2(world.y - selPose.joint.y, world.x - selPose.joint.x);
          this.drag = {
            kind: 'rotate', boneId: sel.id, startWorld: world, startLocal: { x: 0, y: 0 },
            startRotation: selPose.local.rotation, startAngle: angle - (selPose.local.rotation * Math.PI) / 180, 
            jointStart: selPose.joint, moved: false, worldStart: screen,
          };
          host.setPointerCapture(e.pointerId);
          return;
        }
      }

      if (this.mode === 'build') {
        this.handleBuildClick(world, screen);
        return;
      }

      if (!hit) {
        // locked parts are excluded from drag hit-testing, but clicking one should still
        // select it so the inspector can unlock it.
        const lockedHit = rig.hitTest(world, { includeLocked: true });
        if (lockedHit) {
          this.dispatchEvent(new CustomEvent('bone-select', { detail: lockedHit, bubbles: true, composed: true }));
          const lb = this.project.rig.bones.find((b) => b.id === lockedHit);
          if (lb?.locked) toast(`${lb.name} 已锁定，不能拖动`, 'warn');
        } else {
          this.dispatchEvent(new CustomEvent('bone-select', { detail: null, bubbles: true, composed: true }));
        }
        return;
      }
      const bone = this.project.rig.bones.find((b) => b.id === hit)!;
      if (bone.locked) {
        this.dispatchEvent(new CustomEvent('bone-select', { detail: bone.id, bubbles: true, composed: true }));
        toast(`${bone.name} 已锁定，不能拖动`, 'warn');
        return;
      }
      this.dispatchEvent(new CustomEvent('bone-select', { detail: bone.id, bubbles: true, composed: true }));
      const pose = rig.getPose().get(bone.id);
      if (!pose) return;
      const parentPose = bone.parentId ? rig.getPose().get(bone.parentId) : null;
      const parentInv = parentPose ? invert(parentPose.world) : { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };
      const localPoint = applyMat(parentInv, world.x, world.y);
      const jointScreenDist = Math.hypot(pose.joint.x - world.x, pose.joint.y - world.y);
      const isJoint = jointScreenDist * this.camera.zoom <= 13;
      this.drag = {
        kind: 'move', boneId: bone.id, startWorld: world, startLocal: localPoint,
        startRotation: pose.local.rotation, startAngle: 0,
        jointStart: { x: pose.local.x, y: pose.local.y },
        moved: false, worldStart: screen,
      };
      host.setPointerCapture(e.pointerId);
    });

    host.addEventListener('pointermove', (e) => {
      const rect = host.getBoundingClientRect();
      const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const world = this.camera.screenToWorld(screen.x, screen.y);
      if (!this.drag) {
        if (this.mode === 'select' && this.rig && this.project) {
          const hover = this.rig.hitTest(world);
          this.rig.setHover(hover);
          this.needDraw = true;
        }
        return;
      }
      if (this.drag.kind === 'pan') {
        this.camera.panX += screen.x - this.drag.worldStart.x;
        this.camera.panY += screen.y - this.drag.worldStart.y;
        this.drag.worldStart = screen;
        this.applyCamera();
        return;
      }
      if (this.drag.kind === 'move') {
        if (Math.hypot(world.x - this.drag.startWorld.x, world.y - this.drag.startWorld.y) > 1) this.drag.moved = true;
        const bone = this.project?.rig.bones.find((b) => b.id === this.drag!.boneId);
        if (!bone) return;
        const dx = world.x - this.drag.startWorld.x;
        const dy = world.y - this.drag.startWorld.y;
        const parentId = bone.parentId;
        const parentPose = parentId ? this.rig!.getPose().get(parentId) : null;
        let delta = { x: dx, y: dy };
        if (parentPose) {
          const rot = Math.atan2(parentPose.world.b, parentPose.world.a);
          const sx = Math.hypot(parentPose.world.a, parentPose.world.b) || 1;
          const sy = Math.hypot(parentPose.world.c, parentPose.world.d) || 1;
          const cos = Math.cos(-rot);
          const sin = Math.sin(-rot);
          delta = { x: (dx * cos - dy * sin) / sx, y: (dx * sin + dy * cos) / sy };
        }
        this.dispatchEvent(new CustomEvent('bone-transform', {
          detail: { boneId: bone.id, patch: { x: Math.round(this.drag.jointStart.x + delta.x), y: Math.round(this.drag.jointStart.y + delta.y) }, live: true },
          bubbles: true, composed: true,
        }));
        return;
      }
      if (this.drag.kind === 'rotate') {
        const bone = this.project?.rig.bones.find((b) => b.id === this.drag!.boneId);
        if (!bone) return;
        const pose = this.rig!.getPose().get(bone.id);
        if (!pose) return;
        const angle = Math.atan2(world.y - pose.joint.y, world.x - pose.joint.x);
        let degVal = ((angle - this.drag.startAngle) * 180) / Math.PI;
        if (e.shiftKey) degVal = Math.round(degVal / 15) * 15;
        this.dispatchEvent(new CustomEvent('bone-transform', {
          detail: { boneId: bone.id, patch: { rotation: Math.round(degVal) }, live: true },
          bubbles: true, composed: true,
        }));
      }
    });

    const finish = (e: PointerEvent) => {
      if (!this.drag) return;
      const drag = this.drag;
      this.drag = null;
      if (drag.kind === 'move' && drag.moved) {
        const bone = this.project?.rig.bones.find((b) => b.id === drag.boneId);
        if (bone) {
          this.dispatchEvent(new CustomEvent('bone-transform', {
            detail: { boneId: bone.id, patch: { x: bone.x, y: bone.y }, live: false },
            bubbles: true, composed: true,
          }));
        }
      }
      if (drag.kind === 'rotate') {
        const bone = this.project?.rig.bones.find((b) => b.id === drag.boneId);
        if (bone) {
          this.dispatchEvent(new CustomEvent('bone-transform', {
            detail: { boneId: bone.id, patch: { rotation: bone.rotation }, live: false },
            bubbles: true, composed: true,
          }));
        }
      }
      try { host.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    host.addEventListener('pointerup', finish);
    host.addEventListener('pointercancel', finish);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !(e.target as HTMLElement)?.closest?.('input,textarea')) {
        this.spaceDown = true;
        (this.shadow.host as HTMLElement).style.cursor = 'grab';
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spaceDown = false;
        (this.shadow.host as HTMLElement).style.cursor = '';
      }
    });
  }

  private spaceDown = false;

  private handleBuildClick(world: { x: number; y: number }, screen: { x: number; y: number }) {
    if (!this.project) return;
    const rig = this.project.rig;
    if (!this.pendingParent) {
      const hit = this.rig?.hitTest(world, { includeLocked: true }) ?? null;
      this.pendingParent = hit ?? (this.selectedBoneId || rig.bones[0]?.id || null);
      const parentName = rig.bones.find((b) => b.id === this.pendingParent)?.name ?? '（根）';
      toast(`父关节：${parentName} — 再点一下放置子关节`, 'ok');
      this.buildMarker(world);
      return;
    }
    this.clearBuildMarker();
    this.dispatchEvent(new CustomEvent('build-bone', {
      detail: { parentId: this.pendingParent, x: Math.round(world.x), y: Math.round(world.y) },
      bubbles: true, composed: true,
    }));
    this.pendingParent = null;
  }

  private pendingParent: string | null = null;
  private buildMarkerEl: HTMLElement | null = null;
  private buildMarker(position: { x: number; y: number }) {
    this.clearBuildMarker();
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border:2px dashed #b198d8;border-radius:50%;pointer-events:none;`;
    el.style.left = `${position.x * this.camera.zoom + this.camera.panX}px`;
    el.style.top = `${position.y * this.camera.zoom + this.camera.panY}px`;
    this.shadow.querySelector('.wrap')!.appendChild(el);
    this.buildMarkerEl = el;
  }
  private clearBuildMarker() {
    this.buildMarkerEl?.remove();
    this.buildMarkerEl = null;
  }

  private openDraft(worldX: number, worldY: number, screenX: number, screenY: number) {
    this.closeDraft();
    this.draft = { frame: this.frame, x: worldX, y: worldY };
    const pop = document.createElement('div');
    pop.className = 'draft-pop';
    pop.innerHTML = `
      <div class="head">✎ 第 <b style="color:#f0cd84">${this.frame}</b> 帧 · 点击画面写批注</div>
      <textarea placeholder="例如：这一帧穗子抬得太高，抽穗期不会这么弹…"></textarea>
      <div class="acts"><button class="btn sm ghost" data-x>取消</button><button class="btn sm primary" data-ok>添加批注</button></div>`;
    const hostRect = (this.shadow.querySelector('.wrap') as HTMLElement).getBoundingClientRect();
    pop.style.left = `${clamp(screenX - 120, 8, hostRect.width - 250)}px`;
    pop.style.top = `${clamp(screenY - 30, 8, hostRect.height - 150)}px`;
    this.shadow.querySelector('.wrap')!.appendChild(pop);
    this.draftEl = pop;
    const ta = pop.querySelector('textarea') as HTMLTextAreaElement;
    ta.focus();
    const submit = () => {
      const text = ta.value.trim();
      if (!text) { toast('批注内容不能为空', 'warn'); return; }
      this.dispatchEvent(new CustomEvent('annotation-draft', {
        detail: { frame: this.frame, x: worldX, y: worldY, text },
        bubbles: true, composed: true,
      }));
      this.closeDraft();
    };
    pop.querySelector('[data-ok]')!.addEventListener('click', submit);
    pop.querySelector('[data-x]')!.addEventListener('click', () => this.closeDraft());
    pop.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if ((e as KeyboardEvent).key === 'Enter' && !(e as KeyboardEvent).shiftKey) submit();
      if ((e as KeyboardEvent).key === 'Escape') this.closeDraft();
    });
  }

  private draftEl: HTMLElement | null = null;
  closeDraft() {
    this.draftEl?.remove();
    this.draftEl = null;
    this.draft = null;
  }

  /** DOM pins rendered above the canvas so text stays crisp. */
  private renderAnnotations() {
    if (!this.annLayer) return;
    if (!this.project) {
      this.annLayer.innerHTML = '';
      return;
    }
    const anns = this.project.annotations;
    const html = anns
      .map((a, i) => {
        const sx = a.x * this.camera.zoom + this.camera.panX;
        const sy = a.y * this.camera.zoom + this.camera.panY;
        const cls = a.status === 'resolved' ? 'done' : a.status === 'explained' ? 'explained' : '';
        return `<span class="ann-anchor ${cls}" style="left:${sx}px;top:${sy}px"></span>
          <span class="ann-leader" style="left:${sx + 3}px;top:${sy - 14}px"></span>
          <div class="ann-pin ${cls} ${this.annSelection === a.id ? 'sel' : ''}" data-ann="${a.id}" style="left:${sx}px;top:${sy}px" title="第 ${a.frame} 帧 · ${a.author}: ${escapeAttr(a.text)}">${i + 1}</div>`;
      })
      .join('');
    this.annLayer.innerHTML = html;
    this.annLayer.querySelectorAll('[data-ann]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = (el as HTMLElement).dataset.ann!;
        this.dispatchEvent(new CustomEvent('annotation-click', { detail: id, bubbles: true, composed: true }));
      });
    });
  }

  focusAnnotation(annId: string) {
    const ann = this.project?.annotations.find((a) => a.id === annId);
    if (!ann) return;
    this.annSelection = annId;
    const rect = this.getBoundingClientRect();
    // center pin if far outside
    const sx = ann.x * this.camera.zoom + this.camera.panX;
    const sy = ann.y * this.camera.zoom + this.camera.panY;
    if (sx < 40 || sx > rect.width - 40 || sy < 40 || sy > rect.height - 40) {
      this.camera.panX += rect.width / 2 - sx;
      this.camera.panY += rect.height / 2 - sy;
      this.applyCamera();
    }
    this.renderAnnotations();
    this.pulseAnnotation(annId);
  }

  redraw() {
    this.needDraw = true;
    this.renderAnnotations();
  }
}

function boneUp(m: { a: number; b: number; c: number; d: number }) {
  const vx = -m.c;
  const vy = -m.d;
  const len = Math.hypot(vx, vy) || 1;
  return { x: vx / len, y: vy / len };
}

function deg(r: number) {
  return (r * 180) / Math.PI;
}

function invert(m: { a: number; b: number; c: number; d: number; tx: number; ty: number }) {
  const det = m.a * m.d - m.b * m.c || 1e-9;
  const a = m.d / det;
  const b = -m.b / det;
  const c = -m.c / det;
  const d = m.a / det;
  return { a, b, c, d, tx: -(a * m.tx + c * m.ty), ty: -(b * m.tx + d * m.ty) };
}

function escapeAttr(s: string) {
  return s.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

customElements.define('farm-stage', StageView);

