// three.js 风筝三维场景:渲染 + 射线拾取拖拽 + 超差标红 + 尺寸标注
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CheckIssue, KiteState, Vec3 } from '../types';
import { stripPoints } from '../lib/generator';

export interface SceneCallbacks {
  onDragStrip: (stripId: string, offset: Vec3) => void;
  onDragSeam: (seamId: string, offset: Vec3) => void;
  onDragBridle: (knot: Vec3) => void;
  onSelect: (info: SelectionInfo | null) => void;
}

export interface SelectionInfo {
  kind: 'strip' | 'seam' | 'bridle';
  id: string;
  name: string;
}

type PickKind = 'strip' | 'seam' | 'bridle';

const COLOR_BAMBOO = 0x8a5a2b;
const COLOR_SELECT = 0xff8f00;
const COLOR_ERROR = 0xd32f2f;
const COLOR_SEAM = 0x1f6fbf;
const COLOR_BRIDLE = 0x444444;

export class KiteScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.OrthographicCamera;
  private controls: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private kiteGroup: THREE.Group | null = null;
  private kite: KiteState | null = null;
  private errorIds = new Set<string>();
  private cb: SceneCallbacks;
  private raf = 0;
  private resizeObs: ResizeObserver;
  private drag: {
    kind: PickKind; id: string; plane: THREE.Plane;
    startHit: THREE.Vector3; startOffset: Vec3 | null;
    moved: boolean;
  } | null = null;
  private selected: SelectionInfo | null = null;
  private label: THREE.Sprite;

  constructor(private container: HTMLElement, cb: SceneCallbacks) {
    this.cb = cb;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0xf4f1ea);
    container.appendChild(this.renderer.domElement);

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;
    this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);
    this.camera.position.set(0, 0, 6);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.12;

    const amb = new THREE.AmbientLight(0xffffff, 1.6);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(2, 3, 6);
    this.scene.add(amb, dir);
    this.scene.add(new THREE.GridHelper(4, 24, 0xcfc8bb, 0xe2ddd2));

    this.label = this.makeTextSprite('');
    this.label.visible = false;
    this.scene.add(this.label);

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.resize();

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);

    const loop = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  // ---------- 对外更新 ----------

  update(kite: KiteState, issues: CheckIssue[], selection: SelectionInfo | null) {
    this.kite = kite;
    this.selected = selection;
    this.errorIds = new Set(
      issues.filter(i => !i.pass && i.targetId).map(i => i.targetId as string),
    );
    this.rebuild();
    this.fitCamera();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.controls.dispose();
    this.clearGroup();
    this.renderer.dispose();
    dom.remove();
  }

  // ---------- 构建 ----------

  private clearGroup() {
    if (!this.kiteGroup) return;
    this.kiteGroup.traverse(o => {
      const mesh = o as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      const disposeOne = (m: THREE.Material) => {
        const withMap = m as THREE.Material & { map?: THREE.Texture | null };
        withMap.map?.dispose();
        m.dispose();
      };
      if (Array.isArray(mat)) mat.forEach(disposeOne);
      else if (mat) disposeOne(mat);
    });
    this.scene.remove(this.kiteGroup);
    this.kiteGroup = null;
  }

  private rebuild() {
    if (!this.kite) return;
    this.clearGroup();
    const g = new THREE.Group();
    this.kiteGroup = g;
    this.scene.add(g);

    // 蒙面分片(半透明,双面)
    for (const panel of this.kite.panels) {
      const shape = new THREE.Shape();
      panel.vertices.forEach((p, i) => {
        const sx = p.x * 1000;
        const sy = p.y * 1000;
        if (i === 0) shape.moveTo(sx, sy);
        else shape.lineTo(sx, sy);
      });
      shape.closePath();
      const geom = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(panel.color), transparent: true, opacity: 0.5,
        side: THREE.DoubleSide, roughness: 0.9, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.z = -2;
      g.add(mesh);
      // 分片边界(接缝线)
      const pts = [...panel.vertices, panel.vertices[0]].map(p => new THREE.Vector3(p.x * 1000, p.y * 1000, -1));
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x4a7a5c }),
      );
      g.add(line);
    }

    // 竹条
    for (const strip of this.kite.strips) {
      const pts = stripPoints(strip, 18).map(p => new THREE.Vector3(p.x * 1000, p.y * 1000, p.z * 1000));
      const curve = new THREE.CatmullRomCurve3(pts);
      const radius = strip.role === 'spine' ? 7 : strip.role === 'cross' ? 6 : 4.5;
      const geom = new THREE.TubeGeometry(curve, 24, radius, 8, false);
      const isErr = this.errorIds.has(strip.id);
      const isSel = this.selected?.kind === 'strip' && this.selected.id === strip.id;
      const mat = new THREE.MeshStandardMaterial({
        color: isErr ? COLOR_ERROR : isSel ? COLOR_SELECT : COLOR_BAMBOO,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { pick: 'strip' as PickKind, id: strip.id, name: strip.name };
      g.add(mesh);
    }

    // 接缝点(可拖拽,放大拾取球)
    for (const seam of this.kite.seams) {
      const isErr = this.errorIds.has(seam.id);
      const isSel = this.selected?.kind === 'seam' && this.selected.id === seam.id;
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(isSel ? 11 : 8, 16, 12),
        new THREE.MeshStandardMaterial({ color: isErr ? COLOR_ERROR : isSel ? COLOR_SELECT : COLOR_SEAM }),
      );
      sphere.position.set(seam.pos.x * 1000, seam.pos.y * 1000, seam.pos.z * 1000 + 4);
      sphere.userData = { pick: 'seam' as PickKind, id: seam.id, name: `接缝 ${seam.id}` };
      g.add(sphere);
    }

    // 提线:附着点 → 汇交点
    const b = this.kite.bridle;
    const attach = new THREE.Vector3(b.attach.x * 1000, b.attach.y * 1000, b.attach.z * 1000);
    const knot = new THREE.Vector3(b.knot.x * 1000, b.knot.y * 1000, b.knot.z * 1000);
    const bridleErr = this.errorIds.has('bridle');
    const lineGeo = new THREE.BufferGeometry().setFromPoints([attach, knot]);
    g.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: bridleErr ? COLOR_ERROR : COLOR_BRIDLE })));
    const attachMesh = new THREE.Mesh(
      new THREE.SphereGeometry(7, 14, 10),
      new THREE.MeshStandardMaterial({ color: bridleErr ? COLOR_ERROR : 0x666666 }),
    );
    attachMesh.position.copy(attach);
    g.add(attachMesh);
    const knotSel = this.selected?.kind === 'bridle';
    const knotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(knotSel ? 13 : 10, 18, 14),
      new THREE.MeshStandardMaterial({ color: bridleErr ? COLOR_ERROR : knotSel ? COLOR_SELECT : 0x222222 }),
    );
    knotMesh.position.copy(knot);
    knotMesh.userData = { pick: 'bridle' as PickKind, id: 'bridle', name: '提线汇交点' };
    g.add(knotMesh);

    // 翼展尺寸标注
    this.addDimension(g);

    // 选中标签
    if (this.selected) {
      this.label.visible = true;
      this.label.material.map?.dispose();
      const tex = this.makeTextTexture(this.selected.name);
      this.label.material.map = tex;
      this.label.material.needsUpdate = true;
      const target = this.selectionWorldPos();
      if (target) this.label.position.set(target.x, target.y + 40, target.z);
    } else {
      this.label.visible = false;
    }  }

  private addDimension(g: THREE.Group) {
    if (!this.kite) return;
    const W = this.kite.params.wingspan * 1000;
    const ys = this.kite.silhouette.map(p => p.y * 1000);
    const y = Math.min(...ys) - 55;
    const mat = new THREE.LineBasicMaterial({ color: 0x333333 });
    const pts = [
      new THREE.Vector3(-W / 2, y, 0), new THREE.Vector3(W / 2, y, 0),
      new THREE.Vector3(-W / 2, y - 8, 0), new THREE.Vector3(-W / 2, y + 8, 0),
      new THREE.Vector3(W / 2, y - 8, 0), new THREE.Vector3(W / 2, y + 8, 0),
    ];
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat));
    const label = this.makeTextSprite(`翼展 ${(this.kite.params.wingspan * 1000).toFixed(0)} mm`);
    label.position.set(0, y - 28, 0);
    label.scale.set(150, 34, 1);
    g.add(label);
  }

  private selectionWorldPos(): THREE.Vector3 | null {
    if (!this.kite || !this.selected) return null;
    if (this.selected.kind === 'strip') {
      const s = this.kite.strips.find(x => x.id === this.selected!.id);
      if (!s) return null;
      return new THREE.Vector3((s.a.x + s.b.x) / 2 * 1000, (s.a.y + s.b.y) / 2 * 1000, 20);
    }
    if (this.selected.kind === 'seam') {
      const p = this.kite.seams.find(x => x.id === this.selected!.id);
      return p ? new THREE.Vector3(p.pos.x * 1000, p.pos.y * 1000, 20) : null;
    }
    return new THREE.Vector3(this.kite.bridle.knot.x * 1000, this.kite.bridle.knot.y * 1000, this.kite.bridle.knot.z * 1000);
  }

  private fitCamera() {
    if (!this.kiteGroup) return;
    const box = new THREE.Box3().setFromObject(this.kiteGroup);
    const size = box.getSize(new THREE.Vector3());
    const w = this.container.clientWidth || 800;
    const h = this.container.clientHeight || 600;
    const frustumH = Math.max(size.y * 1.25, size.x * (h / w) * 1.15, 300);
    this.camera.left = -frustumH * w / h / 2;
    this.camera.right = frustumH * w / h / 2;
    this.camera.top = frustumH / 2;
    this.camera.bottom = -frustumH / 2;
    this.camera.updateProjectionMatrix();
    const center = box.getCenter(new THREE.Vector3());
    this.controls.target.copy(center);
    this.camera.position.set(center.x, center.y, 800);
  }

  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.fitCamera();
  }

  // ---------- 拾取与拖拽 ----------

  private setPointer(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private pick(): THREE.Object3D | null {
    if (!this.kiteGroup) return null;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.kiteGroup.children, true);
    return hits.find(h => h.object.userData.pick)?.object ?? null;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.kite || e.button !== 0) return;
    this.setPointer(e);
    const obj = this.pick();
    if (!obj) {
      this.selected = null;
      this.cb.onSelect(null);
      this.rebuild();
      return;
    }
    const kind = obj.userData.pick as PickKind;
    const id = obj.userData.id as string;
    const name = obj.userData.name as string;
    this.selected = { kind, id, name };
    this.cb.onSelect(this.selected);

    const planeNormal = kind === 'bridle'
      ? new THREE.Vector3(0, -1, 0)   // 提线汇交点在竖直面内调(x-z 平面)
      : new THREE.Vector3(0, 0, 1);  // 竹条/接缝在蒙面平面内调(x-y 平面)
    const plane = new THREE.Plane(planeNormal, 0);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(plane, hit)) {
      this.controls.enabled = true;
      return;
    }

    const startOffset = kind === 'strip' ? (this.kite.overrides.stripOffset[id] ?? { x: 0, y: 0, z: 0 })
      : kind === 'seam' ? (this.kite.overrides.seamOffset[id] ?? { x: 0, y: 0, z: 0 })
        : null;
    this.drag = { kind, id, plane, startHit: hit, startOffset, moved: false };
    this.controls.enabled = false;
    this.rebuild();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.drag || !this.kite) {
      // 悬停光标
      if (!e.buttons) {
        this.setPointer(e);
        const obj = this.pick();
        this.renderer.domElement.style.cursor = obj ? 'grab' : 'default';
      }
      return;
    }
    this.setPointer(e);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.drag.plane, hit)) return;
    const dx = (hit.x - this.drag.startHit.x) / 1000;
    const dy = (hit.y - this.drag.startHit.y) / 1000;
    const dz = (hit.z - this.drag.startHit.z) / 1000;
    if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > 0.002) this.drag.moved = true;

    const base = this.drag.startOffset ?? { x: 0, y: 0, z: 0 };
    if (this.drag.kind === 'strip') {
      this.cb.onDragStrip(this.drag.id, { x: base.x + dx, y: base.y + dy, z: 0 });
    } else if (this.drag.kind === 'seam') {
      this.cb.onDragSeam(this.drag.id, { x: base.x + dx, y: base.y + dy, z: 0 });
    } else {
      // 提线:拖动给出绝对位置(毫米→米),y 保持附着高度
      const attachY = this.kite.bridle.attach.y;
      this.cb.onDragBridle({ x: hit.x / 1000, y: attachY, z: Math.max(0.02, hit.z / 1000) });
    }
  };

  private onPointerUp = () => {
    if (this.drag) {
      this.drag = null;
      this.controls.enabled = true;
    }
  };

  // ---------- 文字精灵 ----------

  private makeTextSprite(text: string): THREE.Sprite {
    const tex = this.makeTextTexture(text);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(120, 28, 1);
    return sp;
  }

  private makeTextTexture(text: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#999';
    ctx.strokeRect(0, 5, 255, 54);
    ctx.fillStyle = '#222';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }
}
