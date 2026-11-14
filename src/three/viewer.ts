/**
 * 三维视图：渲染、拾取、剖切（含剖切盖面）、标注绘制、标签投影。
 *
 * 性能要点：
 * - 每构件独立 BVH，拾取与曲面吸附只测一个构件，几十万面片下依然跟手
 * - 剖切用材质 clippingPlanes；盖面用逐构件模板缓冲（只对与剖切面相交的构件做，通常 1–6 个）
 * - 标签是 DOM 绝对定位（不进 WebGL），任何缩放下中文都不会糊
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import type { Bridge, ComponentInfo, CrackGeometry, Defect, Vec3, VolumeGeometry } from '@core/types';
import { buildComponentObjects, defectAnchor, severityHex, type ComponentObject } from './scene';
import { pickAtScreen, type MeshSampler, type ScenePick, makeMeshSampler } from './sampler';
import { buildBridgeMeshes } from './bridgeMeshes';

export type LabelKind = 'defect' | 'component' | 'section';

export interface LabelItem {
  id: string;
  kind: LabelKind;
  title: string;
  subtitle?: string;
  color: string;
  severity?: 'critical' | 'warning' | 'normal';
  x: number;
  y: number;
  depth: number;
}

export interface LabelSource {
  id: string;
  kind: LabelKind;
  title: string;
  subtitle?: string;
  color: string;
  point: Vec3;
  severity?: LabelItem['severity'];
  /** component 标签可附带更多信息 */
  meta?: string;
}

export interface ViewerCallbacks {
  onHover?: (pick: ScenePick | null) => void;
  onLabels?: (labels: LabelItem[]) => void;
}

export type ClipAxis = 'x' | 'y' | 'z';

export interface SectionComponentSlice {
  componentId: string;
  name: string;
  type: ComponentInfo['type'];
  elevMin: number;
  elevMax: number;
  /** 剖切面内的横向范围（偏距），水平剖时用于标注 */
  offsetMin: number;
  offsetMax: number;
  centroid: Vec3;
}

export interface SectionResultLite {
  axis: ClipAxis;
  /** 剖切位置（世界坐标） */
  pos: number;
  /** 相对里程 / 横向偏距 / 标高，取决于轴 */
  stationLabel: string;
  elevMin: number;
  elevMax: number;
  chainage: number;
  components: SectionComponentSlice[];
  /** 交线（世界坐标），用于绘制剖切轮廓 */
  segments: { componentId: string; a: Vec3; b: Vec3 }[];
}

export interface CrackPreview {
  path: Vec3[];
  normal: Vec3;
  severity: 'critical' | 'warning' | 'normal';
}

interface CachedTris {
  positions: Float32Array;
  indices: Uint32Array;
  /**
   * 空间索引：沿每个轴把三角形按“质心坐标”分桶，桶宽 = 包围盒跨度 / 512。
   * 剖切时只扫落在剖切面那一桶（±1）的三角形，40 万面片下也只需几十微秒级。
   */
  buckets: Record<
    'x' | 'y' | 'z',
    {
      min: number;
      size: number;
      offsets: Uint32Array;
      tris: Int32Array;
      /** 去重标记：区间分桶会让同一三角形落在多个桶，扫描时用时间戳去重 */
      stamp: Uint32Array;
    }
  >;
}

/**
 * 沿每个轴建立“三角形区间桶”索引：
 * 一个三角形会被放进它 [min,max] 覆盖的所有桶，因此在任何剖切位置附近取相邻桶都不会漏掉大三角形。
 * 面片均匀时平均只落 1–2 个桶，内存与扫描量都可控；剖切只扫 3 个桶。
 */
const BUCKET_COUNT = 128;

function buildAxisBuckets(
  positions: Float32Array,
  indices: Uint32Array,
): CachedTris['buckets'] {
  const triCount = indices.length / 3;
  const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];
  const out = {} as CachedTris['buckets'];
  for (let ai = 0; ai < 3; ai++) {
    const axis = axes[ai];
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < positions.length; i += 3) {
      const v = positions[i + ai];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const span = Math.max(1e-6, max - min);
    const size = span / BUCKET_COUNT;
    const bucketOf = (v: number) => {
      let b = Math.floor((v - min) / size);
      if (b < 0) b = 0;
      if (b > BUCKET_COUNT - 1) b = BUCKET_COUNT - 1;
      return b;
    };
    const counts = new Uint32Array(BUCKET_COUNT + 1);
    const triMin = new Int32Array(triCount);
    const triMax = new Int32Array(triCount);
    for (let t = 0; t < triCount; t++) {
      const a = indices[t * 3] * 3 + ai;
      const b = indices[t * 3 + 1] * 3 + ai;
      const c = indices[t * 3 + 2] * 3 + ai;
      const mn = Math.min(positions[a], positions[b], positions[c]);
      const mx = Math.max(positions[a], positions[b], positions[c]);
      const lo = bucketOf(mn);
      const hi = bucketOf(mx);
      triMin[t] = lo;
      triMax[t] = hi;
      for (let k = lo; k <= hi; k++) counts[k]++;
    }
    const offsets = new Uint32Array(BUCKET_COUNT + 2);
    let total = 0;
    for (let k = 0; k < BUCKET_COUNT; k++) {
      offsets[k] = total;
      total += counts[k];
    }
    offsets[BUCKET_COUNT] = total;
    offsets[BUCKET_COUNT + 1] = total;
    const tris = new Int32Array(total);
    const cursor = new Uint32Array(BUCKET_COUNT);
    for (let t = 0; t < triCount; t++) {
      for (let k = triMin[t]; k <= triMax[t]; k++) {
        tris[offsets[k] + cursor[k]] = t;
        cursor[k]++;
      }
    }
    out[axis] = { min, size, offsets, tris, stamp: new Uint32Array(triCount) };
  }
  return out;
}

export class BridgeViewer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: OrbitControls;
  readonly container: HTMLElement;
  bridge: Bridge;
  components: ComponentObject[] = [];
  callbacks: ViewerCallbacks = {};

  private samplers = new Map<string, MeshSampler>();
  private triCache = new Map<string, CachedTris>();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private frameId = 0;
  private disposed = false;
  private resizeObserver: ResizeObserver;
  private hoverAt = 0;

  private defectGroup = new THREE.Group();
  private overlayGroup = new THREE.Group();
  private selectionBox: THREE.Box3Helper | null = null;
  private labelSources: LabelSource[] = [];
  private showDefectLabels = true;
  private showSectionLabels = true;

  // 剖切状态
  private clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private clipEnabled = false;
  private clipAxis: ClipAxis = 'z';
  private clipPos = 0;
  private flip = false;
  private planeHelper: THREE.Mesh | null = null;
  private capPlane: THREE.Mesh | null = null;
  private capMeshes = new Map<string, THREE.Mesh>();

  // 统计
  private fps = 0;
  private fpsAcc = 0;
  private fpsFrames = 0;
  private lastT = 0;

  /** 切换页签时保留相机位置，避免每次回三维都要重新对位 */
  private static lastCamera: { pos: [number, number, number]; target: [number, number, number] } | null = null;

  constructor(opts: { container: HTMLElement; bridge: Bridge; subdivide?: number; showGrid?: boolean }) {
    this.container = opts.container;
    this.bridge = opts.bridge;
    const w = this.container.clientWidth || 900;
    const h = this.container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      stencil: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x0d1218, 1);
    this.renderer.localClippingEnabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.touchAction = 'none';
    this.container.appendChild(canvas);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0d1218, 150, 420);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.05, 2000);
    this.camera.position.set(-30, 55, 60);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.rotateSpeed = 0.75;
    this.controls.maxPolarAngle = Math.PI * 0.53;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 420;
    this.controls.screenSpacePanning = true;

    this.scene.add(new THREE.HemisphereLight(0xe6eef8, 0x161d26, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-45, 80, 55);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xa8c0dc, 0.6);
    fill.position.set(50, 25, -65);
    this.scene.add(fill);

    if (opts.showGrid !== false) this.addGrid();
    this.scene.add(this.defectGroup, this.overlayGroup);

    this.build(opts.subdivide ?? 0);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerleave', this.onPointerLeave);

    this.lastT = performance.now();
    this.loop();
    const saved = BridgeViewer.lastCamera;
    if (saved) {
      this.camera.position.set(...saved.pos);
      this.controls.target.set(...saved.target);
      this.controls.update();
    } else {
      this.fitView();
    }
  }

  private addGrid() {
    const len = Math.max(150, this.bridge.length * 1.5);
    const grid = new THREE.GridHelper(len, Math.round(len / 3), 0x2b3947, 0x1a222b);
    grid.position.set(this.bridge.length / 2, 0, 0);
    const m = grid.material as THREE.Material;
    m.transparent = true;
    m.opacity = 0.8;
    this.scene.add(grid);
    // 里程刻度线
    const mat = new THREE.LineBasicMaterial({ color: 0x35506b, transparent: true, opacity: 0.7 });
    const pts: number[] = [];
    for (const sup of this.bridge.supports) {
      pts.push(sup.x, 0, -8, sup.x, 0, 8);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    this.scene.add(new THREE.LineSegments(g, mat));
  }

  private build(subdivide: number) {
    const { bridge, meshes, colors } = buildBridgeMeshes(this.bridge, subdivide);
    this.components = buildComponentObjects(bridge, meshes, colors);
    for (const c of this.components) {
      this.scene.add(c.mesh);
      this.samplers.set(c.info.id, makeMeshSampler(c));
      const geom = c.mesh.geometry;
      const positions = geom.getAttribute('position').array as Float32Array;
      const indices = geom.getIndex()!.array as unknown as Uint32Array;
      this.triCache.set(c.info.id, {
        positions,
        indices,
        buckets: buildAxisBuckets(positions, indices),
      });
    }
  }

  get triangleCount(): number {
    let n = 0;
    for (const c of this.components) n += (c.mesh.geometry.index?.count ?? 0) / 3;
    return n;
  }

  get stats() {
    return { fps: this.fps, triangles: this.triangleCount, components: this.components.length };
  }

  getSampler(id: string) {
    return this.samplers.get(id);
  }

  get visibleComponents() {
    return this.components.filter((c) => c.mesh.visible);
  }

  // ------------------------------------------------------------ 拾取

  private onPointerMove = (e: PointerEvent) => {
    const now = performance.now();
    if (now - this.hoverAt < 55) return;
    this.hoverAt = now;
    const hit = this.pickAt(e.clientX, e.clientY);
    this.callbacks.onHover?.(hit);
    this.renderer.domElement.style.cursor = hit ? 'crosshair' : 'default';
  };

  private onPointerLeave = () => this.callbacks.onHover?.(null);

  pickAt(clientX: number, clientY: number): ScenePick | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    // 剖切打开时不能拾取被剖掉的半边：用剖切面过滤命中结果
    const pick = pickAtScreen(this.raycaster, this.pointer, this.camera, this.visibleComponents);
    if (pick && this.clipEnabled && this.isClippedPoint(pick.point)) return null;
    return pick;
  }

  private isClippedPoint(p: Vec3): boolean {
    const n = this.clipPlane.normal;
    const d = n.x * p[0] + n.y * p[1] + n.z * p[2] + this.clipPlane.constant;
    // 材质保留 normal·p + constant > 0 的一侧
    return d < 0;
  }

  // ------------------------------------------------------------ 剖切

  setClip(enabled: boolean, axis: ClipAxis, pos: number, flip = false) {
    this.clipEnabled = enabled;
    this.clipAxis = axis;
    this.clipPos = pos;
    this.flip = flip;
    const normal = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0,
    );
    if (flip) normal.negate();
    const point = new THREE.Vector3(
      axis === 'x' ? pos : 0,
      axis === 'y' ? pos : 0,
      axis === 'z' ? pos : 0,
    );
    this.clipPlane.setFromNormalAndCoplanarPoint(normal, point);

    for (const c of this.components) {
      const planes = enabled ? [this.clipPlane] : [];
      if (c.material.clippingPlanes !== planes) c.material.clippingPlanes = planes;
      // 剖切后从切口看进去要能看到梁体内壁，因此双面渲染
      c.material.side = enabled ? THREE.DoubleSide : THREE.FrontSide;
      c.material.needsUpdate = true;
    }
    this.updatePlaneHelper();
    this.rebuildCaps();
  }

  /** 剖切动画中每帧都会调用；用 rAF 合并，避免扫三角形过密 */
  private pendingSection: number | null = null;

  get clipState() {
    return { enabled: this.clipEnabled, axis: this.clipAxis, pos: this.clipPos, flip: this.flip };
  }

  private updatePlaneHelper() {
    if (this.planeHelper) {
      this.scene.remove(this.planeHelper);
      this.planeHelper.geometry.dispose();
      (this.planeHelper.material as THREE.Material).dispose();
      this.planeHelper = null;
    }
    if (!this.clipEnabled) return;
    const size = Math.max(20, this.bridge.length * 0.55);
    const geo = new THREE.PlaneGeometry(size, size * 0.6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x5b93ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 30;
    if (this.clipAxis === 'x') {
      mesh.rotation.y = Math.PI / 2;
      mesh.position.set(this.clipPos, 32, 0);
    } else if (this.clipAxis === 'y') {
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(this.bridge.length / 2, this.clipPos, 0);
    } else {
      mesh.position.set(this.bridge.length / 2, 32, this.clipPos);
    }
    this.planeHelper = mesh;
    this.scene.add(mesh);
  }

  /**
   * 盖面：把与剖切面相交的构件再用 BackSide + 深色材质画一遍。
   * 剖切后从切口看进去时，背面会填满“内壁”，视觉上是实心的；
   * 再叠加一条由真实交线得到的切口轮廓，比模板缓冲方案稳定得多。
   */
  private rebuildCaps() {
    for (const m of this.capMeshes.values()) {
      this.scene.remove(m);
      (m.material as THREE.Material).dispose();
    }
    this.capMeshes.clear();
    if (this.capPlane) {
      this.scene.remove(this.capPlane);
      this.capPlane.geometry.dispose();
      (this.capPlane.material as THREE.Material).dispose();
      this.capPlane = null;
    }
    // 切口轮廓线
    const existingOutline = this.scene.getObjectByName('section-outline');
    if (existingOutline) {
      this.scene.remove(existingOutline);
      disposeObject(existingOutline);
    }
    if (!this.clipEnabled) return;

    const axisIdx = this.clipAxis === 'x' ? 0 : this.clipAxis === 'y' ? 1 : 2;
    for (const c of this.components) {
      const box = c.mesh.geometry.boundingBox!;
      const lo = box.min.getComponent(axisIdx);
      const hi = box.max.getComponent(axisIdx);
      if (this.clipPos < lo - 1e-6 || this.clipPos > hi + 1e-6) continue;
      // 只保留剖切面带内的一薄层（两个平面取交集），把这一层的内壁当作“切口实心面”，
      // 避免整块构件的背面都糊上红色。
      const slab = new THREE.Plane();
      const slabNormal = this.clipPlane.normal.clone();
      const slabPoint = new THREE.Vector3(
        this.clipAxis === 'x' ? this.clipPos : 0,
        this.clipAxis === 'y' ? this.clipPos : 0,
        this.clipAxis === 'z' ? this.clipPos : 0,
      ).addScaledVector(slabNormal, -0.045);
      slab.setFromNormalAndCoplanarPoint(slabNormal.clone().negate(), slabPoint);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xa8434a,
        side: THREE.BackSide,
        depthWrite: true,
        depthTest: true,
        clippingPlanes: [this.clipPlane, slab],
      });
      const cap = new THREE.Mesh(c.mesh.geometry, mat);
      cap.renderOrder = 1;
      cap.frustumCulled = false;
      cap.userData.isCap = true;
      this.scene.add(cap);
      this.capMeshes.set(c.info.id, cap);
    }

    this.outlineDirty = true;
    if (this.outlineEnabled) this.updateSectionOutline();
  }

  private outlineEnabled = true;
  private outlineDirty = false;
  /** 小节扫描去重代数 */
  private sectionGen = 0;

  /** 单独抽出轮廓线更新，拖动滑杆时可降频调用 */
  updateSectionOutline() {
    const existing = this.scene.getObjectByName('section-outline');
    if (existing) {
      this.scene.remove(existing);
      disposeObject(existing);
    }
    if (!this.clipEnabled) return;
    const section = this.computeSection();
    if (section && section.segments.length) {
      const pts: number[] = [];
      for (const seg of section.segments) {
        pts.push(seg.a[0], seg.a[1], seg.a[2], seg.b[0], seg.b[1], seg.b[2]);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const outline = new THREE.LineSegments(
        geo,
        new THREE.LineBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.85 }),
      );
      outline.name = 'section-outline';
      outline.renderOrder = 3;
      outline.frustumCulled = false;
      this.scene.add(outline);
      this.outlineDirty = false;
    }
  }

  /** 计算剖切面与各构件的交线（用于实时标高/构件名读数，代价 O(三角形)，仅在剖切变化时调用） */
  computeSection(): SectionResultLite | null {
    if (!this.clipEnabled) return null;
    const axisIdx = this.clipAxis === 'x' ? 0 : this.clipAxis === 'y' ? 1 : 2;
    const pos = this.clipPos;
    const segments: SectionResultLite['segments'] = [];
    const comps: SectionComponentSlice[] = [];
    let elevMin = Infinity;
    let elevMax = -Infinity;

    for (const c of this.components) {
      if (!c.mesh.visible) continue;
      const cached = this.triCache.get(c.info.id);
      if (!cached) continue;
      const { positions, indices } = cached;
      const box = c.mesh.geometry.boundingBox!;
      if (pos < box.min.getComponent(axisIdx) || pos > box.max.getComponent(axisIdx)) continue;

      const elevs: number[] = [];
      const zs: number[] = [];
      let cx = 0;
      let cy = 0;
      let cz = 0;
      let n = 0;
      // 只扫剖切面相邻的 3 个桶（三角形可能跨越桶边界，因此取 ±1）
      const axisKey = this.clipAxis;
      const bucketData = cached.buckets[axisKey];
      const stamp = bucketData.stamp;
      const gen = ++this.sectionGen;
      const b0 = Math.max(
        0,
        Math.min(BUCKET_COUNT - 1, Math.floor((pos - bucketData.min) / bucketData.size)),
      );
      // 三角形可能跨越相邻桶，取 ±1 桶；桶内再做包围段判断
      for (let b = b0 - 1; b <= b0 + 1; b++) {
        if (b < 0 || b >= BUCKET_COUNT) continue;
        const from = bucketData.offsets[b];
        const to = bucketData.offsets[b + 1];
        for (let k = from; k < to; k++) {
          const t = bucketData.tris[k];
          if (stamp[t] === gen) continue;
          stamp[t] = gen;
          const a0 = indices[t * 3] * 3 + axisIdx;
          const a1 = indices[t * 3 + 1] * 3 + axisIdx;
          const a2 = indices[t * 3 + 2] * 3 + axisIdx;
          const tmn = Math.min(positions[a0], positions[a1], positions[a2]);
          const tmx = Math.max(positions[a0], positions[a1], positions[a2]);
          if (tmn > pos || tmx < pos) continue;
          const i = t * 3;
          const a = indices[i] * 3;
          const bb = indices[i + 1] * 3;
          const d = indices[i + 2] * 3;
          const pa = positions[a + axisIdx] - pos;
          const pb = positions[bb + axisIdx] - pos;
          const pc = positions[d + axisIdx] - pos;
          const cy0 = [0, 0, 0];
          let cnt = 0;
          const edge = (ia: number, ib: number, ta: number, tb: number) => {
            if ((ta > 0 && tb > 0) || (ta < 0 && tb < 0)) return;
            const denom = tb - ta;
            const tt = Math.abs(denom) < 1e-12 ? 0 : -ta / denom;
            if (tt < -1e-6 || tt > 1 + 1e-6) return;
            const x = positions[ia] + (positions[ib] - positions[ia]) * tt;
            const y = positions[ia + 1] + (positions[ib + 1] - positions[ia + 1]) * tt;
            const z = positions[ia + 2] + (positions[ib + 2] - positions[ia + 2]) * tt;
            if (cnt === 0) {
              cy0[0] = x;
              cy0[1] = y;
              cy0[2] = z;
              cnt = 1;
            } else if (cnt === 1) {
              segments.push({ componentId: c.info.id, a: [cy0[0], cy0[1], cy0[2]], b: [x, y, z] });
              elevs.push(cy0[1], y);
              zs.push(cy0[2], z);
              cx += cy0[0] + x;
              cy += cy0[1] + y;
              cz += cy0[2] + z;
              n += 2;
              cnt = 2;
            }
          };
          edge(a, bb, pa, pb);
          edge(bb, d, pb, pc);
          edge(d, a, pc, pa);
        }
      }
      if (!elevs.length) continue;
      const mn = Math.min(...elevs);
      const mx = Math.max(...elevs);
      elevMin = Math.min(elevMin, mn);
      elevMax = Math.max(elevMax, mx);
      comps.push({
        componentId: c.info.id,
        name: c.info.name,
        type: c.info.type,
        elevMin: mn,
        elevMax: mx,
        offsetMin: zs.length ? Math.min(...zs) : 0,
        offsetMax: zs.length ? Math.max(...zs) : 0,
        centroid: [cx / n, cy / n, cz / n],
      });
    }
    if (!comps.length) return null;
    comps.sort((a, b) => a.elevMax - b.elevMax);
    const chainage = this.bridge.config.stationStart + (this.clipAxis === 'x' ? pos : this.bridge.length / 2);
    const stationLabel =
      this.clipAxis === 'x'
        ? `桩号 ${formatSt(this.bridge.config.stationStart + pos)}`
        : this.clipAxis === 'y'
          ? `标高 ${pos.toFixed(2)} m 水平剖切`
          : `偏距 ${pos.toFixed(2)} m 纵剖`;
    return {
      axis: this.clipAxis,
      pos,
      stationLabel,
      elevMin,
      elevMax,
      chainage,
      components: comps,
      segments,
    };
  }

  // ------------------------------------------------------------ 标注渲染

  clearDefectVisuals() {
    clearGroup(this.defectGroup);
  }

  clearOverlay() {
    clearGroup(this.overlayGroup);
  }

  private lineWidth: number = 2;

  setLineScale(v: number) {
    this.lineWidth = v;
    this.resize();
  }

  drawCrack(g: CrackGeometry, color: number, widthPx = 4, opacity = 1) {
    if (g.path.length < 2) return null;
    const n = new THREE.Vector3(g.normal[0], g.normal[1], g.normal[2]);
    if (n.lengthSq() < 1e-9) n.set(0, 1, 0);
    n.normalize();
    const offset = 0.015;
    const pts: number[] = [];
    for (const p of g.path) {
      pts.push(p[0] + n.x * offset, p[1] + n.y * offset, p[2] + n.z * offset);
    }
    const geo = new LineGeometry();
    geo.setPositions(pts);
    const mat = new LineMaterial({
      color,
      linewidth: widthPx,
      transparent: opacity < 1,
      opacity,
      depthTest: true,
      worldUnits: false,
      alphaToCoverage: true,
    });
    this.applyResolution(mat);
    const line = new Line2(geo, mat);
    line.computeLineDistances();
    line.renderOrder = 12;
    line.userData.isDefect = true;
    this.defectGroup.add(line);
    return line;
  }

  drawVolume(g: VolumeGeometry, color: number, opacity = 0.42) {
    const geo = new THREE.BoxGeometry(g.size[0], g.size[1], g.size[2]);
    const mat = new THREE.MeshPhysicalMaterial({
      color,
      transparent: true,
      opacity,
      roughness: 0.4,
      metalness: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(g.center[0], g.center[1], g.center[2]);
    mesh.rotation.y = g.yaw;
    mesh.renderOrder = 11;
    mesh.userData.isDefect = true;
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 }),
    );
    edges.renderOrder = 13;
    mesh.add(edges);
    this.defectGroup.add(mesh);
    return mesh;
  }

  setDefects(defects: Defect[], labels: boolean = true) {
    this.clearDefectVisuals();
    const sources: LabelSource[] = [];
    for (const d of defects) {
      const color = severityHex(d.severity);
      const hex = `#${color.toString(16).padStart(6, '0')}`;
      if (d.geometry.kind === 'crack') {
        this.drawCrack(d.geometry, color, d.severity === 'critical' ? 5 : d.severity === 'warning' ? 4 : 3, 1);
      } else {
        this.drawVolume(d.geometry, color, d.severity === 'critical' ? 0.5 : 0.4);
      }
      const a = defectAnchor(d);
      sources.push({
        id: d.id,
        kind: 'defect',
        title: d.code,
        subtitle:
          d.geometry.kind === 'crack'
            ? `${d.geometry.widthMm.toFixed(2)}mm · ${(d.geometry.lengthMm / 1000).toFixed(2)}m`
            : `${d.geometry.areaM2.toFixed(2)}m² · ${d.geometry.depthMm.toFixed(0)}mm`,
        color: hex,
        severity: d.severity,
        point: [a.x, a.y, a.z],
      });
    }
    this.setLabels(sources);
    this.showDefectLabels = labels;
  }

  setCrackPreview(preview: CrackPreview | null) {
    const existing = this.overlayGroup.getObjectByName('crack-preview');
    if (existing) {
      this.overlayGroup.remove(existing);
      disposeObject(existing);
    }
    if (!preview || preview.path.length < 2) return;
    const color = severityHex(preview.severity);
    const n = new THREE.Vector3(preview.normal[0], preview.normal[1], preview.normal[2]);
    if (n.lengthSq() < 1e-9) n.set(0, 1, 0);
    n.normalize();
    const pts: number[] = [];
    for (const p of preview.path) pts.push(p[0] + n.x * 0.025, p[1] + n.y * 0.025, p[2] + n.z * 0.025);
    const geo = new LineGeometry();
    geo.setPositions(pts);
    const mat = new LineMaterial({ color, linewidth: 6, worldUnits: false });
    this.applyResolution(mat);
    const line = new Line2(geo, mat);
    line.name = 'crack-preview';
    line.renderOrder = 25;
    this.overlayGroup.add(line);
    const group = new THREE.Group();
    group.name = 'crack-preview';
    for (const p of [preview.path[0], preview.path[preview.path.length - 1]]) {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.105, 14, 12),
        new THREE.MeshBasicMaterial({ color }),
      );
      s.position.set(p[0], p[1], p[2]);
      s.renderOrder = 26;
      this.overlayGroup.add(s);
    }
    void group;
  }

  setFirstPoint(p: Vec3 | null) {
    const existing = this.overlayGroup.getObjectByName('first-point');
    if (existing) {
      this.overlayGroup.remove(existing);
      disposeObject(existing);
    }
    if (!p) return;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x63a4ff }),
    );
    mesh.position.set(p[0], p[1], p[2]);
    mesh.name = 'first-point';
    mesh.renderOrder = 27;
    this.overlayGroup.add(mesh);
  }

  setVolumePreview(g: VolumeGeometry | null) {
    const existing = this.overlayGroup.getObjectByName('volume-preview');
    if (existing) {
      this.overlayGroup.remove(existing);
      disposeObject(existing);
    }
    if (!g) return;
    const geo = new THREE.BoxGeometry(g.size[0], g.size[1], g.size[2]);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: 0xe8b033,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    mesh.position.set(g.center[0], g.center[1], g.center[2]);
    mesh.rotation.y = g.yaw;
    mesh.name = 'volume-preview';
    mesh.renderOrder = 22;
    mesh.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffd166 }),
      ),
    );
    this.overlayGroup.add(mesh);
  }

  highlightComponent(id: string | null, mode: 'select' | 'hover') {
    for (const c of this.components) {
      const active = c.info.id === id;
      if (active) {
        c.material.emissive.setHex(mode === 'select' ? 0x16324d : 0x2a3c4e);
        c.material.emissiveIntensity = mode === 'select' ? 0.55 : 0.3;
      } else {
        c.material.emissive.setHex(0x000000);
        c.material.emissiveIntensity = 0;
      }
    }
    if (mode !== 'select') return;
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox = null;
    }
    const comp = this.components.find((c) => c.info.id === id);
    if (comp) {
      const box = new THREE.Box3().setFromObject(comp.mesh);
      this.selectionBox = new THREE.Box3Helper(box, new THREE.Color(0x6fa8ff));
      this.scene.add(this.selectionBox);
    }
  }

  setComponentVisibility(hidden: Set<string>, viewMode: 'solid' | 'xray' | 'wireframe') {
    for (const c of this.components) {
      c.mesh.visible = !hidden.has(c.info.id);
      const isXray = viewMode === 'xray';
      const isWire = viewMode === 'wireframe';
      c.material.wireframe = isWire;
      c.material.transparent = isXray;
      c.material.opacity = isXray ? 0.22 : 1;
      c.material.depthWrite = !isXray;
      c.material.needsUpdate = true;
    }
  }

  setLabelVisibility(defects: boolean, section: boolean) {
    this.showDefectLabels = defects;
    this.showSectionLabels = section;
  }

  setLabels(sources: LabelSource[]) {
    this.labelSources = sources;
  }

  /** 剖切读数标签：贴在剖切面旁 */
  setSectionLabels(items: { id: string; title: string; subtitle: string; point: Vec3; color: string }[]) {
    const others = this.labelSources.filter((l) => l.kind !== 'section');
    this.labelSources = [
      ...others,
      ...items.map((i) => ({ ...i, kind: 'section' as LabelKind })),
    ];
  }

  private applyResolution(mat: LineMaterial) {
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    mat.resolution.set(w, h);
  }

  screenOf(p: Vec3) {
    const v = new THREE.Vector3(p[0], p[1], p[2]);
    const proj = v.clone().project(this.camera);
    const w = this.renderer.domElement.clientWidth;
    const h = this.renderer.domElement.clientHeight;
    const inFront = proj.z > -1 && proj.z < 1;
    return {
      x: (proj.x * 0.5 + 0.5) * w,
      y: (-proj.y * 0.5 + 0.5) * h,
      visible: inFront && Math.abs(proj.x) < 1.25 && Math.abs(proj.y) < 1.25,
      depth: proj.z,
    };
  }

  fitView(center?: Vec3, radius?: number) {
    const c = center ?? [this.bridge.length / 2, 40, 0];
    const r = radius ?? Math.max(26, this.bridge.length * 0.6);
    this.controls.target.set(c[0], c[1], c[2]);
    const dir = new THREE.Vector3(-0.55, 0.42, 0.72).normalize();
    this.camera.position.copy(new THREE.Vector3(c[0], c[1], c[2]).add(dir.multiplyScalar(r * 1.9)));
    this.controls.update();
  }

  focusComponent(id: string) {
    const c = this.components.find((x) => x.info.id === id);
    if (!c) return;
    const box = new THREE.Box3().setFromObject(c.mesh);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const dir = new THREE.Vector3(-0.45, 0.35, 0.82).normalize();
    this.controls.target.copy(sphere.center);
    this.camera.position.copy(sphere.center.clone().add(dir.multiplyScalar(Math.max(2.4, sphere.radius * 3))));
    this.controls.update();
  }

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.defectGroup.traverse((o) => {
      const m = (o as Line2).material as LineMaterial;
      if (m && (m as LineMaterial).isLineMaterial) m.resolution.set(w, h);
    });
    this.overlayGroup.traverse((o) => {
      const m = (o as Line2).material as LineMaterial;
      if (m && (m as LineMaterial).isLineMaterial) m.resolution.set(w, h);
    });
  }

  private loop = () => {
    if (this.disposed) return;
    this.frameId = requestAnimationFrame(this.loop);
    const t = performance.now();
    const dt = t - this.lastT;
    this.lastT = t;
    this.fpsAcc += dt;
    this.fpsFrames++;
    if (this.fpsAcc >= 500) {
      this.fps = Math.round((this.fpsFrames * 1000) / this.fpsAcc);
      this.fpsAcc = 0;
      this.fpsFrames = 0;
    }
    this.controls.update();
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.emitLabels();
  };

  private emitLabels() {
    const out: LabelItem[] = [];
    for (const src of this.labelSources) {
      if (src.kind === 'defect' && !this.showDefectLabels) continue;
      if (src.kind === 'section' && !this.showSectionLabels) continue;
      const s = this.screenOf(src.point);
      if (!s.visible) continue;
      out.push({
        id: src.id,
        kind: src.kind,
        title: src.title,
        subtitle: src.subtitle,
        color: src.color,
        severity: src.severity,
        x: s.x,
        y: s.y,
        depth: s.depth,
      });
    }
    this.callbacks.onLabels?.(out);
  }

  dispose() {
    BridgeViewer.lastCamera = {
      pos: [this.camera.position.x, this.camera.position.y, this.camera.position.z],
      target: [this.controls.target.x, this.controls.target.y, this.controls.target.z],
    };
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointermove', this.onPointerMove);
    canvas.removeEventListener('pointerleave', this.onPointerLeave);
    this.controls.dispose();
    for (const c of this.components) {
      c.mesh.geometry.dispose();
      c.material.dispose();
    }
    for (const m of this.capMeshes.values()) (m.material as THREE.Material).dispose();
    this.capMeshes.clear();
    if (this.capPlane) {
      this.capPlane.geometry.dispose();
      (this.capPlane.material as THREE.Material).dispose();
    }
    this.clearDefectVisuals();
    this.clearOverlay();
    this.renderer.dispose();
    canvas.remove();
  }
}

function clearGroup(g: THREE.Group) {
  for (const child of [...g.children]) {
    g.remove(child);
    disposeObject(child);
  }
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose?.();
  });
}

function formatSt(m: number) {
  const km = Math.floor(m / 1000);
  return `K${km}+${(m - km * 1000).toFixed(1).padStart(5, '0')}`;
}
