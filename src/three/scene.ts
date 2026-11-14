import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { AppState, PanelAppearance, VehicleType } from '../types';
import { buildCarModel, type CarModel, type ZoneName } from './geometry';
import { makeWrapMaterial, replaceMaterial } from './materials';
import { VEHICLES } from '../data/vehicles';
import { calcPanel } from '../calc';

const ZONE_PANEL: Record<ZoneName, string> = {
  hood: 'hood',
  roof: 'roof',
  trunk: 'trunk',
  leftDoor: 'ldoor',
  rightDoor: 'rdoor',
  leftFender: 'lfender',
  rightFender: 'rfender',
  leftQuarter: 'lquarter',
  rightQuarter: 'rquarter',
  frontBumper: 'fbumper',
  rearBumper: 'rbumper',
  tailgate: 'tailgate',
  bedSideL: 'bedsidel',
  bedSideR: 'bedsider',
};

export interface ClickResult {
  panelId: string;
  zone: ZoneName;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private car: CarModel | null = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private ground: THREE.Mesh;
  private raf = 0;
  private container: HTMLElement | null = null;
  private highlight: THREE.LineSegments;
  private panelOfMesh = new WeakMap<THREE.Mesh, string>();

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene.background = new THREE.Color(0xe9edf2);
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    // 车头朝 -X；相机放在车头同侧（-X），z 取负以获得车头左前 45°
    this.camera.position.set(-5.2, 2.6, -4.4);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 3;
    this.controls.maxDistance = 11;
    this.controls.maxPolarAngle = Math.PI / 2.05;
    this.controls.target.set(0, 0.85, 0);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x8a93a0, 0.85);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(-4, 7, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.7);
    fill.position.set(5, 3, -5);
    this.scene.add(hemi, key, fill);

    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(9, 64),
      new THREE.MeshStandardMaterial({ color: 0xdfe4ea, roughness: 0.95 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.highlight = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineBasicMaterial({ color: 0x1e88ff })
    );
    this.highlight.visible = false;
    this.scene.add(this.highlight);

    const onResize = () => this.resize();
    window.addEventListener('resize', onResize);
    this.renderer.domElement.addEventListener('click', this.onClick);
    this.renderer.domElement.addEventListener('dblclick', this.onDoubleClick);

    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  /** 挂到真实容器并按容器尺寸初始化渲染分辨率 */
  mount(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);
    this.resize();
  }

  private onClick = (ev: MouseEvent) => {
    const hit = this.pick(ev);
    if (hit && this.onPick) this.onPick(hit);
  };

  private onDoubleClick = (ev: MouseEvent) => {
    const hit = this.pick(ev);
    if (hit && this.onDoublePick) this.onDoublePick(hit);
  };

  onPick: ((r: ClickResult) => void) | null = null;
  onDoublePick: ((r: ClickResult) => void) | null = null;

  private pick(ev: MouseEvent): ClickResult | null {
    if (!this.car) return null;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const targets = Object.values(this.car.zones).flat();
    const hits = this.raycaster.intersectObjects(targets, false);
    if (!hits.length) return null;
    const mesh = hits[0].object as THREE.Mesh;
    const panelId = this.panelOfMesh.get(mesh);
    const zone = mesh.userData.zone as ZoneName;
    if (!panelId || !zone) return null;
    return { panelId, zone };
  }

  setVehicle(type: VehicleType, state: AppState): void {
    if (this.car) {
      this.scene.remove(this.car.root);
      this.car.dispose();
      this.panelOfMesh = new WeakMap();
    }
    const overWidth = new Set(
      VEHICLES[type].panels
        .filter((p) => calcPanel(p, state.overrides[p.id] ?? state.base, state).overWidth)
        .map((p) => p.id)
    );
    this.car = buildCarModel(type, state.base, overWidth);
    Object.entries(this.car.zones).forEach(([zone, meshes]) => {
      const panelId = ZONE_PANEL[zone as ZoneName];
      meshes.forEach((m) => this.panelOfMesh.set(m, panelId));
    });
    this.scene.add(this.car.root);
    this.applyAppearance(state);
    this.setSeamVisible(state.showSeams);
    this.highlight.visible = false;
  }

  /** 按 state 给所有分块上色 */
  applyAppearance(state: AppState): void {
    if (!this.car) return;
    Object.entries(this.car.zones).forEach(([zone, meshes]) => {
      const panelId = ZONE_PANEL[zone as ZoneName];
      const appearance = state.overrides[panelId] ?? state.base;
      meshes.forEach((mesh) => replaceMaterial(mesh, makeWrapMaterial(appearance)));
    });
  }

  /** 膜宽/搭接等参数变化后，按新的超宽分块重建模型与接缝 */
  rebuildVehicle(state: AppState): void {
    this.setVehicle(state.vehicle, state);
    this.applyAppearance(state);
    this.setSeamVisible(state.showSeams);
    this.highlightPanel(state.dualTone ? state.selectedPanel : null);
  }

  setSeamVisible(visible: boolean): void {
    if (!this.car) return;
    Object.values(this.car.seams).flat().forEach((o) => (o.visible = visible));
  }

  /** 高亮某个分块（双拼选块反馈） */
  highlightPanel(panelId: string | null): void {
    if (!this.car || !panelId) {
      this.highlight.visible = false;
      return;
    }
    const zone = (Object.entries(ZONE_PANEL).find(([, pid]) => pid === panelId)?.[0] ?? null) as ZoneName | null;
    const meshes = zone ? this.car.zones[zone] : null;
    if (!meshes?.length) {
      this.highlight.visible = false;
      return;
    }
    const box = new THREE.Box3();
    meshes.forEach((m) => box.expandByObject(m));
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    this.highlight.position.copy(center);
    this.highlight.scale.set(size.x + 0.03, size.y + 0.03, size.z + 0.03);
    this.highlight.visible = true;
  }

  /** 预设视角：前 45° / 正侧 / 尾部 */
  setView(view: 'front' | 'side' | 'rear'): void {
    const targets: Record<typeof view, THREE.Vector3> = {
      front: new THREE.Vector3(-5.2, 2.4, -3.6),
      side: new THREE.Vector3(0.01, 1.6, -6.2),
      // 尾部从 +z 一侧拍，与前视角对称，画面里车头朝向相反
      rear: new THREE.Vector3(5.2, 2.4, 3.6),
    };
    this.camera.position.copy(targets[view]);
    this.controls.target.set(0, 0.85, 0);
    this.controls.update();
  }

  resize(): void {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  screenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', () => this.resize());
    this.renderer.domElement.removeEventListener('click', this.onClick);
    this.renderer.domElement.removeEventListener('dblclick', this.onDoubleClick);
    this.controls.dispose();
    this.car?.dispose();
    this.ground.geometry.dispose();
    (this.ground.material as THREE.Material).dispose();
    this.highlight.geometry.dispose();
    (this.highlight.material as THREE.Material).dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
