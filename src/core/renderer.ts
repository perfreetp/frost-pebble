import {
  Application, Container, Graphics, Sprite, Text, Texture, Rectangle, Matrix, ColorMatrixFilter,
} from 'pixi.js';
import type { AssetPart, Bone, Rig, Timeline } from './types';
import { resolvePose, type ResolvedPose } from './rig';
import { clamp } from './util';

export const DESIGN_W = 960;
export const DESIGN_H = 640;

interface BoneVisual {
  sprite?: Sprite;
  partId?: string;
}

export interface RigViewData {
  rig: Rig;
  timeline: Timeline | null;
  assets: AssetPart[];
}

export interface RigViewStyle {
  showBones: boolean;
  showParts: boolean;
  ghostAlpha: number;
  tint?: number;
}

/**
 * Renders one rig into a Pixi container. Several instances can coexist in one
 * application (used by the version comparison view).
 */
export class RigView {
  readonly root = new Container();
  private parts = new Container();
  private ghosts = new Container();
  private overlay = new Graphics();
  private labels = new Container();
  private visuals = new Map<string, BoneVisual>();
  private textures = new Map<string, Texture>();
  private loaded = new Set<string>();
  private loading = new Map<string, Promise<void>>();
  private labelPool = new Map<string, Text>();
  private data: RigViewData | null = null;
  private pose: Map<string, ResolvedPose> = new Map();
  private selection: string | null = null;
  private hover: string | null = null;
  private viewScale = 1;
  private style: RigViewStyle = { showBones: true, showParts: true, ghostAlpha: 0.28 };
  private ghostFrame: number | null = null;
  private dirty = true;
  private frame = 0;

  constructor(private assets: AssetPart[] = []) {
    this.root.addChild(this.ghosts, this.parts, this.overlay, this.labels);
    this.root.sortableChildren = true;
    this.overlay.zIndex = 9000;
    this.labels.zIndex = 9001;
  }

  get currentFrame() {
    return this.frame;
  }

  setStyle(style: Partial<RigViewStyle>) {
    Object.assign(this.style, style);
    this.dirty = true;
  }

  setGhostFrame(frame: number | null) {
    this.ghostFrame = frame;
    this.dirty = true;
  }

  setViewScale(scale: number) {
    this.viewScale = scale;
    this.dirty = true;
  }

  setSelection(boneId: string | null) {
    this.selection = boneId;
    this.dirty = true;
  }

  setHover(boneId: string | null) {
    if (this.hover === boneId) return;
    this.hover = boneId;
    this.dirty = true;
  }

  setData(data: RigViewData) {
    const structuralChanged =
      !this.data ||
      this.data.assets !== data.assets ||
      this.data.rig.bones.length !== data.rig.bones.length ||
      this.data.rig.bones.some((b, i) => b.id !== data.rig.bones[i]?.id || b.partId !== data.rig.bones[i]?.partId);
    this.data = data;
    if (structuralChanged) this.rebuild();
    this.markDirty();
  }

  private rebuild() {
    this.parts.removeChildren().forEach((c) => c.destroy({ children: true }));
    this.visuals.clear();
    if (!this.data) return;
    for (const bone of this.data.rig.bones) {
      const asset = this.data.assets.find((a) => a.id === bone.partId);
      if (!asset) continue;
      const tex = this.textures.get(asset.id);
      if (!tex || !this.loaded.has(asset.id)) continue;
      const sprite = new Sprite(tex);
      sprite.anchor.set(asset.anchorX / asset.width, asset.anchorY / asset.height);
      sprite.zIndex = bone.z;
      this.parts.addChild(sprite);
      this.visuals.set(bone.id, { sprite, partId: asset.id });
    }
  }

  /** Loads artwork bitmaps; sprites only appear once their bitmap is decoded. */
  async preload(): Promise<void> {
    if (!this.data) return;
    const pending: Promise<void>[] = [];
    for (const asset of this.data.assets) {
      if (this.loaded.has(asset.id) || !asset.dataUrl) continue;
      const existing = this.loading.get(asset.id);
      if (existing) { pending.push(existing); continue; }
      const promise = new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          this.textures.set(asset.id, Texture.from(img));
          this.loaded.add(asset.id);
          this.loading.delete(asset.id);
          resolve();
        };
        const done = () => {
          this.loading.delete(asset.id);
          resolve();
        };
        img.onerror = done;
        img.src = asset.dataUrl!;
      });
      this.loading.set(asset.id, promise);
      pending.push(promise);
    }
    if (pending.length) {
      await Promise.all(pending);
      if (this.data) this.rebuild();
      this.markDirty();
    }
  }

  markDirty() {
    this.dirty = true;
  }

  /** Resolves the pose at `frame` and applies it to the scene graph. */
  draw(frame: number) {
    this.frame = frame;
    if (!this.data) return;
    this.pose = resolvePose(this.data.rig, this.data.timeline, frame);
    const byId = new Map(this.data.rig.bones.map((b) => [b.id, b]));
    for (const bone of this.data.rig.bones) {
      const visual = this.visuals.get(bone.id);
      const pose = this.pose.get(bone.id);
      if (!visual?.sprite || !pose) continue;
      const m = pose.world;
      visual.sprite.setFromMatrix(new Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty));
      visual.sprite.visible = this.style.showParts && !(this.style as { hidden?: string }).hidden;
      if (this.style.tint !== undefined) {
        visual.sprite.tint = this.style.tint;
      } else {
        visual.sprite.tint = 0xffffff;
      }
    }
    this.parts.sortChildren();
    this.drawGhosts(frame, byId);
    this.drawOverlay(byId);
    this.dirty = false;
  }

  private drawGhosts(frame: number, _byId: Map<string, Bone>) {
    this.ghosts.removeChildren().forEach((c) => c.destroy({ children: true }));
    if (this.ghostFrame === null || !this.data) return;
    const ghostPose = resolvePose(this.data.rig, this.data.timeline, this.ghostFrame);
    for (const bone of this.data.rig.bones) {
      const asset = this.data.assets.find((a) => a.id === bone.partId);
      const pose = ghostPose.get(bone.id);
      if (!asset || !pose) continue;
      const tex = this.textures.get(asset.id);
      if (!tex || !this.loaded.has(asset.id)) continue;
      const sprite = new Sprite(tex);
      sprite.anchor.set(asset.anchorX / asset.width, asset.anchorY / asset.height);
      const m = pose.world;
      sprite.setFromMatrix(new Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty));
      sprite.alpha = this.style.ghostAlpha;
      sprite.tint = 0x9fe0b0;
      this.ghosts.addChild(sprite);
    }
  }

  private drawOverlay(byId: Map<string, Bone>) {
    const g = this.overlay;
    g.clear();
    if (!this.style.showBones || !this.data) {
      this.labels.visible = false;
      return;
    }
    this.labels.visible = true;
    const px = 1 / this.viewScale;
    // bone connections
    for (const bone of this.data.rig.bones) {
      const pose = this.pose.get(bone.id);
      if (!pose) continue;
      const parent = bone.parentId ? byId.get(bone.parentId) : null;
      const parentPose = parent ? this.pose.get(parent.id) : null;
      const selected = this.selection === bone.id;
      const hovered = this.hover === bone.id;
      if (parentPose) {
        g.moveTo(parentPose.joint.x, parentPose.joint.y);
        g.lineTo(pose.joint.x, pose.joint.y);
        g.stroke({
          width: (selected ? 3 : hovered ? 2.4 : 1.6) * px,
          color: bone.locked ? 0x5c6b5f : selected ? 0xffe6a6 : hovered ? 0xd6e8d2 : 0x6f8a74,
          alpha: selected ? 1 : 0.9,
        });
      }
    }
    for (const bone of this.data.rig.bones) {
      const pose = this.pose.get(bone.id);
      if (!pose) continue;
      const selected = this.selection === bone.id;
      const hovered = this.hover === bone.id;
      const color = bone.locked ? 0x7d8a7f : parseInt(bone.color.slice(1), 16);
      // selection ring around the part
      if (selected) {
        const visual = this.visuals.get(bone.id);
        const asset = this.data.assets.find((a) => a.id === bone.partId);
        if (visual?.sprite && asset) {
          const m = pose.world;
          const corners = [
            [-asset.anchorX, -asset.anchorY],
            [asset.width - asset.anchorX, -asset.anchorY],
            [asset.width - asset.anchorX, asset.height - asset.anchorY],
            [-asset.anchorX, asset.height - asset.anchorY],
          ].map(([x, y]) => ({ x: m.a * x + m.c * y + m.tx, y: m.b * x + m.d * y + m.ty }));
          g.poly(corners.flatMap((p) => [p.x, p.y]));
          g.fill({ color: 0xe9b750, alpha: 0.05 });
          g.stroke({ width: 1.6 * px, color: 0xe9b750, alpha: 0.9 });
        }
      }
      // joint
      const r = (selected ? 7 : hovered ? 6.4 : 5) * px;
      g.circle(pose.joint.x, pose.joint.y, r);
      g.fill({ color: selected ? 0xffdf9a : bone.locked ? 0x8b978c : 0x1b241d, alpha: 1 });
      g.stroke({ width: 1.8 * px, color: selected ? 0xffe9b0 : color, alpha: selected ? 1 : 0.85 });
      if (bone.locked) {
        g.rect(pose.joint.x - 2.5 * px, pose.joint.y - 1 * px, 5 * px, 4 * px);
        g.fill({ color: 0xc9d3cb, alpha: 0.9 });
      }
      if (selected && !bone.locked) {
        // rotate handle
        const up = this.boneUp(pose);
        const hx = pose.joint.x + up.x * 48 * px;
        const hy = pose.joint.y + up.y * 48 * px;
        g.moveTo(pose.joint.x, pose.joint.y);
        g.lineTo(hx, hy);
        g.stroke({ width: 1.4 * px, color: 0x8fd69a, alpha: 0.8 });
        g.circle(hx, hy, 5.5 * px);
        g.fill({ color: 0x8fd69a, alpha: 0.9 });
        // parent-link ring
        g.circle(pose.joint.x, pose.joint.y, 11 * px);
        g.stroke({ width: 1.2 * px, color: 0xb198d8, alpha: 0.8 });
      }
      // label
      let label = this.labelPool.get(bone.id);
      if (!label) {
        label = new Text({
          text: bone.name,
          style: { fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', fontSize: 11, fill: 0xe9f0e8, stroke: { color: 0x0b0f0c, width: 3 }, letterSpacing: 0.2 },
        });
        label.anchor.set(0.5, 1);
        this.labelPool.set(bone.id, label);
        this.labels.addChild(label);
      }
      label.visible = selected || hovered;
      label.position.set(pose.joint.x, pose.joint.y - 9 * px);
      label.scale.set(px);
      label.alpha = bone.locked ? 0.6 : 1;
    }
  }

  private boneUp(pose: ResolvedPose): { x: number; y: number } {
    const m = pose.world;
    const vx = -m.c;
    const vy = -m.d;
    const len = Math.hypot(vx, vy) || 1;
    return { x: vx / len, y: vy / len };
  }

  poseAt(frame: number) {
    return this.data ? resolvePose(this.data.rig, this.data.timeline, frame) : new Map();
  }

  getPose(): Map<string, ResolvedPose> {
    return this.pose;
  }

  /** Bone under a point in armature space (topmost first). */
  hitTest(world: { x: number; y: number }, opts: { includeLocked?: boolean; partsOnly?: boolean; jointRadius?: number } = {}): string | null {
    if (!this.data) return null;
    const radius = opts.jointRadius ?? 10 / this.viewScale;
    const bones = [...this.data.rig.bones].sort((a, b) => b.z - a.z);
    for (const bone of bones) {
      if (bone.locked && !opts.includeLocked) continue;
      const pose = this.pose.get(bone.id);
      if (!pose) continue;
      if (!opts.partsOnly) {
        if (Math.hypot(pose.joint.x - world.x, pose.joint.y - world.y) <= radius) return bone.id;
      }
    }
    for (const bone of bones) {
      if (bone.locked && !opts.includeLocked) continue;
      const pose = this.pose.get(bone.id);
      const asset = this.data.assets.find((a) => a.id === bone.partId);
      if (!pose || !asset) continue;
      const local = this.worldToLocal(pose.world, world);
      if (local.x >= -asset.anchorX && local.x <= asset.width - asset.anchorX && local.y >= -asset.anchorY && local.y <= asset.height - asset.anchorY) {
        return bone.id;
      }
    }
    return null;
  }

  private worldToLocal(m: { a: number; b: number; c: number; d: number; tx: number; ty: number }, p: { x: number; y: number }) {
    const det = m.a * m.d - m.b * m.c || 1e-9;
    const dx = p.x - m.tx;
    const dy = p.y - m.ty;
    return { x: (m.d * dx - m.c * dy) / det, y: (-m.b * dx + m.a * dy) / det };
  }

  /** Screen-space joint position, for DOM overlays. */
  jointScreen(boneId: string, camera: { zoom: number; panX: number; panY: number }) {
    const pose = this.pose.get(boneId);
    if (!pose) return null;
    return { x: pose.joint.x * camera.zoom + camera.panX, y: pose.joint.y * camera.zoom + camera.panY };
  }

  /** Armature-space center of a bone's part. */
  partCenter(boneId: string): { x: number; y: number } | null {
    const pose = this.pose.get(boneId);
    const bone = this.data?.rig.bones.find((b) => b.id === boneId);
    if (!pose || !bone || !this.data) return null;
    const asset = this.data.assets.find((a) => a.id === bone.partId);
    if (!asset) return { x: pose.joint.x, y: pose.joint.y };
    const m = pose.world;
    const lx = asset.width / 2 - asset.anchorX;
    const ly = asset.height / 2 - asset.anchorY;
    return { x: m.a * lx + m.c * ly + m.tx, y: m.b * lx + m.d * ly + m.ty };
  }

  /** Union of every mounted part's transformed rectangle, in armature space. */
  partBounds(frame: number): { minX: number; minY: number; maxX: number; maxY: number } | null {
    if (!this.data) return null;
    const pose = resolvePose(this.data.rig, this.data.timeline, frame);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const bone of this.data.rig.bones) {
      const asset = this.data.assets.find((a) => a.id === bone.partId);
      const p = pose.get(bone.id);
      if (!asset || !p) continue;
      const m = p.world;
      const corners = [
        [-asset.anchorX, -asset.anchorY],
        [asset.width - asset.anchorX, -asset.anchorY],
        [asset.width - asset.anchorX, asset.height - asset.anchorY],
        [-asset.anchorX, asset.height - asset.anchorY],
      ];
      for (const [x, y] of corners) {
        const wx = m.a * x + m.c * y + m.tx;
        const wy = m.b * x + m.d * y + m.ty;
        minX = Math.min(minX, wx); maxX = Math.max(maxX, wx);
        minY = Math.min(minY, wy); maxY = Math.max(maxY, wy);
      }
    }
    if (!Number.isFinite(minX)) return null;
    return { minX, minY, maxX, maxY };
  }

  destroy() {
    for (const tex of this.textures.values()) tex.destroy(true);
    this.textures.clear();
    this.loaded.clear();
    this.loading.clear();
    this.root.destroy({ children: true });
  }
}

/** Camera helpers shared by the workbench and comparison views. */
export class Camera {
  zoom = 1;
  panX = 0;
  panY = 0;
  fit(w: number, h: number, pad = 40) {
    const z = Math.min((w - pad * 2) / DESIGN_W, (h - pad * 2) / DESIGN_H);
    this.zoom = clamp(z, 0.15, 4);
    this.panX = (w - DESIGN_W * this.zoom) / 2;
    this.panY = (h - DESIGN_H * this.zoom) / 2;
  }

  /** Frames a content box (typically the character bounds) with breathing room. */
  fitBounds(bounds: { minX: number; minY: number; maxX: number; maxY: number }, w: number, h: number, pad = 64) {
    const bw = Math.max(60, bounds.maxX - bounds.minX);
    const bh = Math.max(60, bounds.maxY - bounds.minY);
    const z = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    this.zoom = clamp(z, 0.2, 4);
    const cx = (bounds.minX + bounds.maxX) / 2;
    const cy = (bounds.minY + bounds.maxY) / 2;
    this.panX = w / 2 - cx * this.zoom;
    this.panY = h / 2 - cy * this.zoom;
  }
  screenToWorld(x: number, y: number) {
    return { x: (x - this.panX) / this.zoom, y: (y - this.panY) / this.zoom };
  }
  worldToScreen(x: number, y: number) {
    return { x: x * this.zoom + this.panX, y: y * this.zoom + this.panY };
  }
  zoomAt(x: number, y: number, factor: number) {
    const before = this.screenToWorld(x, y);
    this.zoom = clamp(this.zoom * factor, 0.15, 4);
    const after = this.screenToWorld(x, y);
    this.panX += (after.x - before.x) * this.zoom;
    this.panY += (after.y - before.y) * this.zoom;
  }
}

export async function createPixiApp(host: HTMLElement): Promise<Application> {
  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true,
    preference: 'webgl',
    powerPreference: 'high-performance',
  });
  app.canvas.style.display = 'block';
  app.canvas.style.width = '100%';
  app.canvas.style.height = '100%';
  host.appendChild(app.canvas);
  return app;
}

export function snapshotContainer(app: Application, container: Container, width: number, height: number, scale = 1): HTMLCanvasElement {
  const canvas = app.renderer.extract.canvas({
    target: container,
    frame: new Rectangle(0, 0, width, height),
    resolution: scale,
    clearColor: [0, 0, 0, 0],
    antialias: true,
  }) as HTMLCanvasElement;
  return canvas;
}

export function cameraGround(w: number, h: number): Graphics {
  const g = new Graphics();
  g.rect(0, 0, w, h);
  g.fill({ color: 0x0e1511, alpha: 0.35 });
  // grid
  for (let x = 0; x <= w; x += 40) {
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke({ width: 1, color: 0x2a3a2f, alpha: x % 160 === 0 ? 0.5 : 0.22 });
  }
  for (let y = 0; y <= h; y += 40) {
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke({ width: 1, color: 0x2a3a2f, alpha: y % 160 === 0 ? 0.5 : 0.22 });
  }
  // floor
  g.rect(48, h - 96, w - 96, 60);
  g.fill({ color: 0x1a241c, alpha: 0.8 });
  g.moveTo(48, h - 96);
  g.lineTo(w - 48, h - 96);
  g.stroke({ width: 2, color: 0x4d7a55, alpha: 0.55 });
  return g;
}

export { cameraGround as makeGroundGraphic };
export type { Bone, Timeline, AssetPart };
