// three.js 菇棚三维编辑器:点选 / 变换手柄 / 0.5m 吸附 / 实时碰撞标红 / 俯视标注
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GRID, EQUIP_TYPES } from './constants.js';
import { objectAABB } from './geometry.js';

const RED = 0xff3b30;
const SELECT = 0xffd54f;

export class SceneEditor {
  constructor(container, shed, opts = {}) {
    this.container = container;
    this.shed = shed;
    this.layers = opts.layers ?? 4;
    this.onChange = opts.onChange ?? (() => {});
    this.onSelect = opts.onSelect ?? (() => {});

    this.meshes = new Map();       // objId -> { group, mats:Material[], base:number[], label, code }
    this.aisleLabels = [];
    this.violations = new Map();   // objId -> reason
    this.selectedId = null;
    this.topMode = false;
    this._savedCam = null;
    this._dirty = false;

    this.#initRenderer();
    this.#initScene();
    this.#initControls();
    this.#buildShed();
    for (const o of shed.objects) this.addMesh(o);

    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(container);
    this._raycaster = new THREE.Raycaster();
    this._pointer = new THREE.Vector2();
    this._downPos = null;
    container.addEventListener('pointerdown', this.#handleDown);
    container.addEventListener('pointerup', this.#handleUp);

    this.#loop();
    // 构造完成后通知宿主推送当前校验结果(处理刷新/外部改数据场景)
    queueMicrotask(() => opts.onReady?.(this));
  }

  #initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(55, this.container.clientWidth / this.container.clientHeight, 0.1, 300);
    this.camera.position.set(this.shed.w * 1.15, this.shed.w * 0.9, this.shed.d * 0.75);
  }

  #initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xeef2f5);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(this.shed.w * 0.8, 18, this.shed.d * 0.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = 30;
    sun.shadow.camera.left = -sc; sun.shadow.camera.right = sc;
    sun.shadow.camera.top = sc; sun.shadow.camera.bottom = -sc;
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xdfefff, 0.35);
    fill.position.set(-10, 8, -10);
    this.scene.add(fill);
  }

  #initControls() {
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.maxPolarAngle = Math.PI / 2 - 0.04;
    this.orbit.target.set(this.shed.w / 2, 0, this.shed.d / 2);
    this.orbit.update();

    this.transform = new TransformControls(this.camera, this.renderer.domElement);
    this.transform.setTranslationSnap(GRID);
    this.transform.setRotationSnap(Math.PI / 2);
    this.transform.setSize(0.9);
    this.transform.addEventListener('dragging-changed', (e) => {
      this.orbit.enabled = !e.value;
      if (!e.value) this.#syncSelected(true);
    });
    this.transform.addEventListener('objectChange', () => {
      this.#syncSelected(false);
    });
    this.scene.add(this.transform.getHelper ? this.transform.getHelper() : this.transform);
  }

  #buildShed() {
    const { w, d, h } = this.shed;
    // 地面
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: 0xe6efe8, roughness: 0.95 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(w / 2, 0, d / 2);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 0.5m 网格
    const size = Math.ceil(Math.max(w, d) / GRID) * GRID;
    const grid = new THREE.GridHelper(size, size / GRID, 0x9bb5a5, 0xc9d8cf);
    grid.position.set(w / 2, 0.005, d / 2);
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    this.scene.add(grid);

    // 棚体边框
    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
      new THREE.LineBasicMaterial({ color: 0x37474f })
    );
    frame.position.set(w / 2, h / 2, d / 2);
    this.scene.add(frame);

    this.labelGroup = new THREE.Group();
    this.scene.add(this.labelGroup);
  }

  // ---------- 物体网格 ----------
  addMesh(o) {
    const t = EQUIP_TYPES[o.type];
    const group = new THREE.Group();
    const mats = [];
    const mat = (color, extra = {}) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.15, ...extra });
      mats.push(m);
      return m;
    };
    const box = (bw, bh, bd, color, x = 0, y = 0, z = 0, extra) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), mat(color, extra));
      mesh.position.set(x, y, z);
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };

    if (o.type === 'rack') {
      const { w, d, h: hh } = o.size;
      const post = 0.06;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        box(post, hh, post, 0x6d4c41, sx * (w / 2 - post / 2), hh / 2, sz * (d / 2 - post / 2));
      }
      const boards = Math.max(2, this.layers);
      for (let i = 0; i < boards; i++) {
        const y = (hh / boards) * (i + 0.5);
        box(w, 0.05, d, t.color, 0, y, 0);
      }
    } else if (o.type === 'tray') {
      const { w, d, h: hh } = o.size;
      box(w, hh, d, t.color);
      box(w + 0.04, 0.06, d + 0.04, 0x8d6e63, 0, hh + 0.03, 0);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        box(0.08, 0.12, 0.08, 0x6d4c41, sx * (w / 2 - 0.06), -hh / 2 - 0.06, sz * (d / 2 - 0.06));
      }
    } else if (o.type === 'pipe') {
      const { d: len } = o.size;
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, len, 16),
        mat(t.color)
      );
      cyl.rotation.x = Math.PI / 2;
      cyl.castShadow = true;
      group.add(cyl);
      for (let i = -1; i <= 1; i++) {
        box(0.18, 0.04, 0.05, 0x78909c, 0, 0, i * len * 0.35);
      }
    } else if (o.type === 'fan') {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.22, 24),
        mat(t.color)
      );
      ring.rotation.z = Math.PI / 2;
      ring.castShadow = true;
      group.add(ring);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.26, 16), mat(0x455a64));
      hub.rotation.z = Math.PI / 2;
      group.add(hub);
      for (let i = 0; i < 3; i++) {
        const blade = box(0.02, 0.26, 0.09, 0xcfd8dc, 0, 0, 0);
        blade.rotation.x = (i * Math.PI * 2) / 3;
      }
      box(0.08, 0.5, 0.08, 0x546e7a, 0, -0.55, 0);
    } else if (o.type === 'light') {
      const { w, d } = o.size;
      box(w, 0.08, d, 0xfbc02d, 0, 0, 0, { emissive: 0xffb300, emissiveIntensity: 0.55 });
      box(0.04, 0.25, 0.04, 0x78909c, 0, 0.16, 0);
    } else if (o.type === 'column') {
      const { h: hh } = o.size;
      box(o.size.w, hh, o.size.d, t.color, 0, hh / 2, 0);
      box(o.size.w + 0.12, 0.05, o.size.d + 0.12, 0x455a64, 0, 0.025, 0);
    }

    group.position.set(o.x, o.y + this.#lift(o), o.z);
    group.rotation.y = o.rotY || 0;
    group.userData.objId = o.id;
    this.scene.add(group);

    const label = this.#makeTextSprite(o.code, 0x2e7d4f);
    label.position.set(0, o.size.h / 2 + 0.45, 0);
    label.visible = false;
    group.add(label);

    this.meshes.set(o.id, {
      group, mats, base: mats.map((m) => m.color.getHex()), label, code: o.code
    });
  }

  // 几何体中心相对物体 y(底面)的抬升
  #lift(o) {
    if (o.type === 'fan') return 0.9;      // 支架落地,环体抬高
    return o.size.h / 2;
  }

  #makeTextSprite(text, bgColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 72;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false }));
    const scale = Math.max(1.4, text.length * 0.22);
    sprite.scale.set(scale, 0.42, 1);
    sprite.renderOrder = 10;
    this.#drawLabel(canvas, sprite.material, text, bgColor);
    sprite.userData.canvas = canvas;
    return sprite;
  }

  #drawLabel(canvas, material, text, bgColor) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 256, 72);
    ctx.fillStyle = `#${bgColor.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.roundRect(4, 8, 248, 56, 14);
    ctx.fill();
    ctx.font = 'bold 30px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 38);
    if (material.map) material.map.dispose();
    material.map = new THREE.CanvasTexture(canvas);
    material.needsUpdate = true;
  }

  removeMesh(id) {
    const rec = this.meshes.get(id);
    if (!rec) return;
    this.scene.remove(rec.group);
    rec.group.traverse((m) => {
      if (m.geometry) m.geometry.dispose();
    });
    rec.mats.forEach((m) => m.dispose());
    this.meshes.delete(id);
    if (this.selectedId === id) {
      this.transform.detach();
      this.selectedId = null;
    }
  }

  // 外部(数据层)修改物体后,把坐标/旋转同步回三维网格
  syncObject(id) {
    const rec = this.meshes.get(id);
    const obj = this.shed.objects.find((o) => o.id === id);
    if (!rec || !obj) return;
    rec.group.position.set(obj.x, obj.y + this.#lift(obj), obj.z);
    rec.group.rotation.y = obj.rotY || 0;
  }

  // ---------- 选择 ----------
  #handleDown = (e) => {
    this._downPos = { x: e.clientX, y: e.clientY };
  };

  #handleUp = (e) => {
    if (!this._downPos) return;
    const moved = Math.hypot(e.clientX - this._downPos.x, e.clientY - this._downPos.y);
    this._downPos = null;
    if (moved > 5 || this.transform.dragging) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this._pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this._pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this._raycaster.setFromCamera(this._pointer, this.camera);
    const hits = this._raycaster.intersectObjects([...this.meshes.values()].map((r) => r.group), true);
    if (!hits.length) {
      this.select(null);
      return;
    }
    let node = hits[0].object;
    while (node && !node.userData.objId) node = node.parent;
    this.select(node?.userData.objId ?? null);
  };

  select(id) {
    this.selectedId = id;
    if (!id) {
      this.transform.detach();
      this.onSelect(null);
      this.#refreshColors();
      return;
    }
    const rec = this.meshes.get(id);
    const obj = this.shed.objects.find((o) => o.id === id);
    if (!rec || !obj) return;
    this.transform.attach(rec.group);
    // 落地类设备禁用 Y 轴平移
    const grounded = obj.type !== 'pipe' && obj.type !== 'light';
    this.transform.showY = !grounded;
    this.onSelect(obj);
    this.#refreshColors();
  }

  #syncSelected(finished) {
    if (!this.selectedId) return;
    const rec = this.meshes.get(this.selectedId);
    const obj = this.shed.objects.find((o) => o.id === this.selectedId);
    if (!rec || !obj) return;
    obj.x = rec.group.position.x;
    obj.z = rec.group.position.z;
    obj.y = +(rec.group.position.y - this.#lift(obj)).toFixed(3);
    obj.rotY = rec.group.rotation.y;
    if (obj.type !== 'pipe' && obj.type !== 'light') obj.y = 0;
    this.onChange(obj, finished);
  }

  // ---------- 碰撞标红 ----------
  setViolations(map) {
    this.violations = map;
    this.#refreshColors();
  }

  #refreshColors() {
    for (const [id, rec] of this.meshes) {
      const reason = this.violations.get(id);
      const selected = id === this.selectedId;
      rec.mats.forEach((m, i) => {
        if (reason) {
          m.color.setHex(RED);
          m.emissive?.setHex(0x550000);
        } else if (selected) {
          m.color.setHex(SELECT);
          m.emissive?.setHex(0x332200);
        } else {
          m.color.setHex(rec.base[i]);
          m.emissive?.setHex(0x000000);
        }
      });
      this.#drawLabel(
        rec.label.userData.canvas,
        rec.label.material,
        reason ? `${rec.code} !` : rec.code,
        reason ? RED : 0x2e7d4f
      );
    }
  }

  // ---------- 俯视标注 ----------
  setAisles(aisleMap) {
    for (const s of this.aisleLabels) {
      this.labelGroup.remove(s);
      s.material.map?.dispose();
      s.material.dispose();
    }
    this.aisleLabels = [];
    if (!this.topMode) return;
    for (const g of aisleMap.rows || []) {
      const tight = g.gap < aisleMap.minAisle;
      const sprite = this.#makeTextSprite(`走道 ${g.gap}m`, tight ? RED : 0x1565c0);
      sprite.position.set(g.x, 0.35, g.z);
      this.labelGroup.add(sprite);
      this.aisleLabels.push(sprite);
    }
  }

  toggleTopView() {
    this.topMode = !this.topMode;
    const { w, d } = this.shed;
    if (this.topMode) {
      this._savedCam = {
        pos: this.camera.position.clone(),
        target: this.orbit.target.clone(),
        polar: this.orbit.maxPolarAngle
      };
      const dist = Math.max(w, d) * 1.05;
      this.camera.position.set(w / 2, dist, d / 2 + 0.01);
      this.orbit.target.set(w / 2, 0, d / 2);
      this.orbit.maxPolarAngle = 0.05;
      this.orbit.update();
    } else {
      this.camera.position.copy(this._savedCam.pos);
      this.orbit.target.copy(this._savedCam.target);
      this.orbit.maxPolarAngle = this._savedCam.polar;
      this.orbit.update();
    }
    for (const rec of this.meshes.values()) rec.label.visible = this.topMode;
    this.setAisles(this._lastAisles ?? { rows: [] });
    return this.topMode;
  }

  resetView() {
    this.camera.position.set(this.shed.w * 1.15, this.shed.w * 0.9, this.shed.d * 0.75);
    this.orbit.target.set(this.shed.w / 2, 0, this.shed.d / 2);
    this.orbit.update();
  }

  screenshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  setMode(mode) {
    if (this.selectedId) this.transform.setMode(mode);
  }

  resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  #loop() {
    this._raf = requestAnimationFrame(() => this.#loop());
    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }

  // 外部数据变化后(撤销/删除)刷新标签
  refreshAisles(aisleMap) {
    this._lastAisles = aisleMap;
    this.setAisles(aisleMap);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this._ro.disconnect();
    this.container.removeEventListener('pointerdown', this.#handleDown);
    this.container.removeEventListener('pointerup', this.#handleUp);
    this.transform.detach();
    this.transform.dispose();
    this.orbit.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

// 供页面直接取包围盒做提示
export { objectAABB };
