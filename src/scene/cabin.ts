import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type {
  CabinConfig,
  Conflict,
  LightingPreset,
  MaterialId,
  Project,
  ProjectSpec,
  SurfaceId,
  ViewMode,
} from '../types';
import { COP_DEF, HANDRAIL_DEF_GEOM } from '../data/catalog';
import { doorOpeningHeight, doorOpeningWidth, doorStackWidth } from '../logic/validation';
import { brushedSteelMaps, rockMaps, woodMaps } from './textures';

const MM = 0.001; // mm → m

interface SurfaceMeshes {
  meshes: THREE.Mesh[];
  renderMats: THREE.Material[];
}

export class CabinScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private cabin = new THREE.Group();
  private lights = new THREE.Group();
  private surfaces = new Map<SurfaceId, SurfaceMeshes>();
  private materialLib: Record<MaterialId, THREE.MeshStandardMaterial>;
  private clayMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.9, metalness: 0.0 });
  private mode: ViewMode = 'clay';
  private project: Project | null = null;
  private conflicts: Conflict[] = [];
  private frameId = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x22262b);

    // 环境反射(金属材质必需)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.05, 100);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.55;

    // 材质库
    const steel = brushedSteelMaps();
    const wood = woodMaps();
    const rock = rockMaps();
    this.materialLib = {
      'ss-brushed': new THREE.MeshStandardMaterial({
        map: steel.map, roughnessMap: steel.roughnessMap,
        metalness: 0.95, roughness: 0.4, envMapIntensity: 1.2,
      }),
      wood: new THREE.MeshStandardMaterial({
        map: wood.map, roughnessMap: wood.roughnessMap,
        metalness: 0.0, roughness: 0.55, envMapIntensity: 0.5,
      }),
      rock: new THREE.MeshStandardMaterial({
        map: rock.map, roughnessMap: rock.roughnessMap,
        metalness: 0.05, roughness: 0.3, envMapIntensity: 0.8,
      }),
    };

    this.scene.add(this.cabin, this.lights);
    this.setLighting('office');
    this.resize();

    const loop = () => {
      this.frameId = requestAnimationFrame(loop);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  dispose() {
    cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
  }

  resize() {
    const w = this.canvas.clientWidth || this.canvas.parentElement!.clientWidth;
    const h = this.canvas.clientHeight || this.canvas.parentElement!.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setMode(mode: ViewMode) {
    this.mode = mode;
    this.applyMaterials();
  }

  setProject(project: Project, conflicts: Conflict[]) {
    this.project = project;
    this.conflicts = conflicts;
    this.rebuild();
  }

  setConflicts(conflicts: Conflict[]) {
    this.conflicts = conflicts;
    this.applyMaterials();
  }

  setLighting(preset: LightingPreset) {
    this.lights.clear();
    const presets: Record<LightingPreset, { bg: number; ambient: [number, number]; key: [number, number]; fill: [number, number]; exposure: number }> = {
      office:      { bg: 0x2a2e33, ambient: [0xffffff, 0.55], key: [0xfff6e8, 45], fill: [0xdfe8ff, 12], exposure: 1.0 },
      residential: { bg: 0x2b2723, ambient: [0xffe9c8, 0.4],  key: [0xffd9a0, 28], fill: [0xffe0b8, 8],  exposure: 0.95 },
      garage:      { bg: 0x1c1f24, ambient: [0xcfd8e6, 0.25], key: [0xbfd0e8, 14], fill: [0x9fb2cc, 5],  exposure: 0.85 },
    };
    const p = presets[preset];
    this.scene.background = new THREE.Color(p.bg);
    this.renderer.toneMappingExposure = p.exposure;

    this.lights.add(new THREE.AmbientLight(p.ambient[0], p.ambient[1]));
    const key = new THREE.PointLight(p.key[0], p.key[1], 0, 2);
    key.position.set(0, 2.2, 0);
    key.castShadow = true;
    this.lights.add(key);
    const fill = new THREE.PointLight(p.fill[0], p.fill[1], 0, 2);
    fill.position.set(0, 1.2, 0.8);
    this.lights.add(fill);
    // 轿厢外轮廓光,便于看外形
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(3, 4, 5);
    this.lights.add(rim);
  }

  // ---------- 构建 ----------

  private rebuild() {
    if (!this.project) return;
    this.cabin.clear();
    this.surfaces.clear();
    const { spec, config } = this.project;
    const W = spec.width * MM, D = spec.depth * MM, H = spec.height * MM;
    const T = 0.02; // 板厚

    // 地板
    this.addSurface('floor', box(W, T, D, 0, -T / 2, 0));
    // 左/右/后壁
    this.addSurface('wall-left', box(T, H, D, -W / 2 - T / 2, H / 2, 0));
    this.addSurface('wall-right', box(T, H, D, W / 2 + T / 2, H / 2, 0));
    this.addSurface('wall-rear', box(W, H, T, 0, H / 2, -D / 2 - T / 2));

    // 前壁:门洞两侧壁垛 + 门楣
    const openW = doorOpeningWidth(spec) * MM;
    const openH = doorOpeningHeight(spec) * MM;
    const jamb = (W - openW) / 2;
    const front: THREE.Mesh[] = [];
    if (jamb > 0.001) {
      front.push(box(jamb, H, T, -W / 2 + jamb / 2, H / 2, D / 2 + T / 2));
      front.push(box(jamb, H, T, W / 2 - jamb / 2, H / 2, D / 2 + T / 2));
    }
    front.push(box(openW, H - openH, T, 0, openH + (H - openH) / 2, D / 2 + T / 2));
    // 门套:沿门洞的边框(轿厢内侧)
    const frameT = 0.06, frameD = 0.08;
    front.push(box(frameT, openH, frameD, -openW / 2 - frameT / 2, openH / 2, D / 2 - frameD / 2));
    front.push(box(frameT, openH, frameD, openW / 2 + frameT / 2, openH / 2, D / 2 - frameD / 2));
    front.push(box(openW + frameT * 2, frameT, frameD, 0, openH + frameT / 2, D / 2 - frameD / 2));
    this.addSurface('door-frame', ...front);

    // 门扇(关闭状态,轿厢内侧可见)
    const doorMat = this.materialLib['ss-brushed'];
    if (spec.doorType === 'center') {
      this.cabin.add(box(openW / 2, openH, 0.03, -openW / 4, openH / 2, D / 2 - 0.03, doorMat));
      this.cabin.add(box(openW / 2, openH, 0.03, openW / 4, openH / 2, D / 2 - 0.03, doorMat));
    } else {
      this.cabin.add(box(openW, openH, 0.03, 0, openH / 2, D / 2 - 0.03, doorMat));
    }

    // 门机(前壁顶部箱体,内侧)+ 旁开/双折的门垛导轨
    const machineMat = new THREE.MeshStandardMaterial({ color: 0x8a9099, roughness: 0.6, metalness: 0.7 });
    const machW = spec.doorType === 'center' ? openW * 1.6 : openW * 1.3;
    this.cabin.add(box(machW, 0.18, 0.12, 0, openH + 0.12, D / 2 - 0.08, machineMat));
    if (spec.doorType !== 'center') {
      const stackW = doorStackWidth(spec) * MM;
      const sx = spec.doorStackSide === 'left' ? -W / 2 + stackW / 2 : W / 2 - stackW / 2;
      this.cabin.add(box(stackW, openH, 0.06, sx, openH / 2, D / 2 - 0.05, machineMat));
    }

    // 吊顶
    this.buildCeiling(spec, config, W, D, H);

    // 操纵箱
    this.buildCop(spec, config, W, D);

    // 扶手
    if (config.handrail.enabled) this.buildHandrail(spec, config, W, D);

    // 相机取景:置于轿厢内靠门位置,看向轿厢中心
    const maxDim = Math.max(W, D, H);
    this.camera.position.set(0, H * 0.6, D / 2 - 0.25);
    this.controls.target.set(0, H * 0.48, -D * 0.08);
    this.controls.maxDistance = maxDim * 1.1;
    this.controls.minDistance = 0.2;
    this.controls.update();

    this.applyMaterials();
  }

  private buildCeiling(spec: ProjectSpec, config: CabinConfig, W: number, D: number, H: number) {
    const inset = 0.05;
    if (config.ceilingType === 'flat') {
      const slab = box(W - inset, 0.04, D - inset, 0, H - 0.07, 0);
      this.addSurface('ceiling', slab);
      // 筒灯
      const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff5e0, emissiveIntensity: 1.6 });
      const nx = Math.max(1, Math.round(W / 0.7));
      const nz = Math.max(1, Math.round(D / 0.7));
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < nz; j++) {
          const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 20), lampMat);
          lamp.position.set((i + 0.5) * (W / nx) - W / 2, H - 0.092, (j + 0.5) * (D / nz) - D / 2);
          this.cabin.add(lamp);
        }
      }
    } else if (config.ceilingType === 'luminous') {
      const frame = box(W - inset, 0.05, D - inset, 0, H - 0.075, 0);
      this.addSurface('ceiling', frame);
      const glow = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.82, 0.02, D * 0.82),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff8ec, emissiveIntensity: 2.2 })
      );
      glow.position.set(0, H - 0.1, 0);
      this.cabin.add(glow);
    } else {
      // 格栅:边框 + 纵横格栅条
      const frame = box(W - inset, 0.03, D - inset, 0, H - 0.045, 0);
      this.addSurface('ceiling', frame);
      const grilleMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.5, metalness: 0.6 });
      const step = 0.15;
      for (let x = -W / 2 + step; x < W / 2 - 0.03; x += step) {
        this.cabin.add(box(0.012, 0.06, D - inset, x, H - 0.09, 0, grilleMat));
      }
      for (let z = -D / 2 + step; z < D / 2 - 0.03; z += step) {
        this.cabin.add(box(W - inset, 0.06, 0.012, 0, H - 0.09, z, grilleMat));
      }
      // 格栅内灯盘
      const lampMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf2f6ff, emissiveIntensity: 1.8 });
      const n = Math.max(2, Math.round((W * D) / 1.2));
      for (let i = 0; i < n; i++) {
        const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.01, 0.12), lampMat);
        lamp.position.set(((i + 0.5) / n - 0.5) * (W - 0.3), H - 0.13, 0);
        this.cabin.add(lamp);
      }
    }
  }

  private buildCop(spec: ProjectSpec, config: CabinConfig, W: number, D: number) {
    const w = COP_DEF.width * MM, h = COP_DEF.height * MM, dep = COP_DEF.depth * MM;
    const y = Math.min(spec.height - 200, COP_DEF.bottom + COP_DEF.height) * MM - h / 2;
    const mat = new THREE.MeshStandardMaterial({ color: 0x30343a, roughness: 0.35, metalness: 0.8 });
    const cop = new THREE.Mesh(new THREE.BoxGeometry(w, h, dep), mat);
    cop.name = 'cop';
    const openW = doorOpeningWidth(spec) * MM;
    const jamb = (W - openW) / 2;
    switch (config.copPosition) {
      case 'front-left':
        cop.position.set(-W / 2 + jamb / 2, y, D / 2 - dep / 2 - 0.001);
        break;
      case 'front-right':
        cop.position.set(W / 2 - jamb / 2, y, D / 2 - dep / 2 - 0.001);
        break;
      case 'side-left':
        cop.rotation.y = Math.PI / 2;
        cop.position.set(-W / 2 + dep / 2 + 0.001, y, D / 2 - 0.1 - w / 2);
        break;
      case 'side-right':
        cop.rotation.y = -Math.PI / 2;
        cop.position.set(W / 2 - dep / 2 - 0.001, y, D / 2 - 0.1 - w / 2);
        break;
    }
    this.cabin.add(cop);
    // 记录到 surface 映射便于高亮
    const sid: SurfaceId =
      config.copPosition === 'side-left' ? 'wall-left'
      : config.copPosition === 'side-right' ? 'wall-right'
      : 'door-frame';
    const entry = this.surfaces.get(sid);
    if (entry) entry.meshes.push(cop);
  }

  private buildHandrail(spec: ProjectSpec, config: CabinConfig, W: number, D: number) {
    const hr = config.handrail;
    const L = hr.length * MM;
    const r = HANDRAIL_DEF_GEOM.radius * MM;
    const standoff = HANDRAIL_DEF_GEOM.standoff * MM;
    const y = hr.height * MM;
    const mat = new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 0.95, roughness: 0.25, envMapIntensity: 1.2 });
    const group = new THREE.Group();
    // 横杆沿局部 x 方向
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 20), mat);
    bar.rotation.z = Math.PI / 2;
    group.add(bar);
    // 支座:沿局部 -z 顶向壁面
    for (const t of [-L / 2 + 0.1, 0, L / 2 - 0.1]) {
      const mount = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.6, standoff, 12), mat);
      mount.rotation.x = Math.PI / 2;
      mount.position.set(t, 0, -(standoff / 2 + r));
      group.add(mount);
    }
    if (hr.wall === 'wall-rear') {
      group.position.set(0, y, -D / 2 + standoff + r);
    } else if (hr.wall === 'wall-left') {
      group.rotation.y = Math.PI / 2;
      group.position.set(-W / 2 + standoff + r, y, 0);
    } else {
      group.rotation.y = -Math.PI / 2;
      group.position.set(W / 2 - standoff - r, y, 0);
    }
    this.cabin.add(group);
  }

  private addSurface(id: SurfaceId, ...meshes: THREE.Mesh[]) {
    const entry: SurfaceMeshes = { meshes: [], renderMats: [] };
    const matId: MaterialId = this.project ? this.project.config.materials[id] : 'ss-brushed';
    const renderMat = this.materialLib[matId];
    for (const m of meshes) {
      m.receiveShadow = true;
      entry.meshes.push(m);
      entry.renderMats.push(renderMat);
      this.cabin.add(m);
    }
    this.surfaces.set(id, entry);
  }

  /** 按当前模式与冲突状态刷新材质 */
  private applyMaterials() {
    if (!this.project) return;
    const conflictSurfaces = new Set(this.conflicts.map((c) => c.surface));
    for (const [id, entry] of this.surfaces) {
      const highlighted = conflictSurfaces.has(id);
      entry.meshes.forEach((m, i) => {
        const base = this.mode === 'clay' ? this.clayMaterial : entry.renderMats[i % entry.renderMats.length];
        if (highlighted) {
          const hm = (base as THREE.MeshStandardMaterial).clone();
          hm.emissive = new THREE.Color(0xff2d2d);
          hm.emissiveIntensity = 0.65;
          m.material = hm;
        } else {
          m.material = base;
        }
      });
    }
  }
}

function box(w: number, h: number, d: number, x: number, y: number, z: number, mat?: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat ?? new THREE.MeshStandardMaterial());
  m.position.set(x, y, z);
  return m;
}
