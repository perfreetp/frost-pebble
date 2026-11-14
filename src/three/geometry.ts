import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { VehicleType } from '../types';
import {
  makeGlassMaterial,
  makeHubMaterial,
  makeTireMaterial,
  makeTrimMaterial,
  makeWrapMaterial,
  makeSeamMaterial,
} from './materials';
import type { PanelAppearance } from '../types';

export type ZoneName =
  | 'hood' | 'roof' | 'trunk'
  | 'leftDoor' | 'rightDoor'
  | 'leftFender' | 'rightFender'
  | 'leftQuarter' | 'rightQuarter'
  | 'frontBumper' | 'rearBumper'
  | 'tailgate' | 'bedSideL' | 'bedSideR';

export interface CarModel {
  root: THREE.Group;
  /** 可贴膜分块 mesh（raycast 目标） */
  zones: Record<ZoneName, THREE.Mesh[]>;
  /** 红色接缝标记，按 zone 名索引 */
  seams: Record<string, THREE.Object3D[]>;
  seamMaterial: THREE.MeshStandardMaterial;
  dispose(): void;
}

type SeamDir = 'long' | 'vert' | 'horiz';

const SEAM_DIR: Record<ZoneName, SeamDir> = {
  hood: 'long',
  roof: 'long',
  trunk: 'horiz',
  leftDoor: 'vert',
  rightDoor: 'vert',
  leftFender: 'vert',
  rightFender: 'vert',
  leftQuarter: 'vert',
  rightQuarter: 'vert',
  frontBumper: 'vert',
  rearBumper: 'vert',
  tailgate: 'vert',
  bedSideL: 'horiz',
  bedSideR: 'horiz',
};

function rbox(w: number, h: number, d: number, r: number, mat: THREE.Material): THREE.Mesh {
  const radius = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.max(radius, 0.005)), mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function placed(mesh: THREE.Mesh, x: number, y: number, z: number): THREE.Mesh {
  mesh.position.set(x, y, z);
  return mesh;
}

interface BuilderCtx {
  group: THREE.Group;
  zones: Record<ZoneName, THREE.Mesh[]>;
  seamGroup: THREE.Group;
  seams: Record<string, THREE.Object3D[]>;
  seamMat: THREE.MeshStandardMaterial;
  wrapMat: THREE.MeshPhysicalMaterial;
  disposables: { dispose(): void }[];
  /** 超过膜卷宽度、需要标出红色接缝的分块 id 集合 */
  overWidthPanelIds: Set<string>;
}

const ZONE_TO_PANEL: Record<ZoneName, string> = {
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

function addZone(ctx: BuilderCtx, zone: ZoneName, mesh: THREE.Mesh): THREE.Mesh {
  mesh.userData.zone = zone;
  ctx.zones[zone] = ctx.zones[zone] ?? [];
  ctx.zones[zone].push(mesh);
  ctx.group.add(mesh);
  if (ctx.overWidthPanelIds.has(ZONE_TO_PANEL[zone])) addSeam(ctx, zone, mesh);
  return mesh;
}

/** 依据分块包围盒生成一条红色接缝标记 */
function addSeam(ctx: BuilderCtx, zone: ZoneName, mesh: THREE.Mesh): void {
  mesh.geometry.computeBoundingBox();
  const bb = mesh.geometry.boundingBox!;
  const size = new THREE.Vector3();
  bb.getSize(size);
  const dir = SEAM_DIR[zone];
  let marker: THREE.Mesh;
  if (dir === 'long') {
    marker = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.82, 0.016, 0.028), ctx.seamMat);
    marker.position.set(mesh.position.x, mesh.position.y + size.y / 2 + 0.012, mesh.position.z);
  } else if (dir === 'horiz') {
    marker = new THREE.Mesh(new THREE.BoxGeometry(size.x * 0.82, 0.016, 0.016), ctx.seamMat);
    marker.position.set(mesh.position.x, mesh.position.y + size.y * 0.18, mesh.position.z + Math.sign(mesh.position.z || 1) * (size.z / 2 + 0.012));
  } else {
    // vert：侧面分块竖缝（B 柱 / 棱线位置），端面分块中缝
    const onSide = Math.abs(mesh.position.z) > Math.abs(mesh.position.x);
    marker = new THREE.Mesh(new THREE.BoxGeometry(0.022, size.y * 0.85, 0.016), ctx.seamMat);
    if (onSide) {
      marker.position.set(mesh.position.x + size.x * 0.18, mesh.position.y, mesh.position.z + Math.sign(mesh.position.z) * (size.z / 2 + 0.012));
    } else {
      marker.position.set(mesh.position.x + Math.sign(mesh.position.x || 1) * (size.x / 2 + 0.012), mesh.position.y, mesh.position.z);
    }
  }
  marker.castShadow = false;
  ctx.seamGroup.add(marker);
  ctx.seams[zone] = ctx.seams[zone] ?? [];
  ctx.seams[zone].push(marker);
}

function wheel(ctx: BuilderCtx, x: number, z: number, radius: number, width: number): void {
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 28), makeTireMaterial());
  tire.rotation.x = Math.PI / 2;
  tire.position.set(x, radius, z);
  tire.castShadow = true;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, width + 0.02, 20), makeHubMaterial());
  hub.rotation.x = Math.PI / 2;
  hub.position.copy(tire.position);
  ctx.disposables.push(tire.geometry, hub.geometry, tire.material, hub.material);
  ctx.group.add(tire, hub);
}

function sedanCabin(mat: THREE.Material, disposables: { dispose(): void }[]): THREE.Mesh {
  const shape = new THREE.Shape();
  const pts: [number, number][] = [
    [-1.05, 0],
    [-0.62, 0.6],
    [-0.52, 0.68],
    [0.78, 0.68],
    [1.18, 0],
  ];
  shape.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  geo.translate(0, 0, -0.75);
  disposables.push(geo);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0.12, 0.98, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function headLamp(emissive: number, color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.45, roughness: 0.25 });
}

function buildSedan(ctx: BuilderCtx): void {
  const { group, wrapMat } = ctx;
  const glass = makeGlassMaterial();
  const trim = makeTrimMaterial();
  ctx.disposables.push(glass, trim);

  const body = rbox(4.6, 0.72, 1.82, 0.14, wrapMat);
  body.position.set(0, 0.66, 0);
  group.add(body);

  group.add(sedanCabin(wrapMat, ctx.disposables));

  // 玻璃
  const windshield = rbox(0.06, 0.58, 1.34, 0.02, glass);
  windshield.position.set(-0.62, 1.42, 0);
  windshield.rotation.z = -0.62;
  const rearGlass = rbox(0.06, 0.55, 1.3, 0.02, glass);
  rearGlass.position.set(1.12, 1.4, 0);
  rearGlass.rotation.z = 0.6;
  const winL = rbox(1.45, 0.4, 0.03, 0.02, glass);
  winL.position.set(0.18, 1.36, 0.77);
  const winR = winL.clone();
  winR.position.z = -0.77;
  group.add(windshield, rearGlass, winL, winR);

  // 贴膜分块
  addZone(ctx, 'hood', placed(rbox(1.15, 0.05, 1.55, 0.05, wrapMat), -1.55, 1.04, 0));
  addZone(ctx, 'roof', placed(rbox(1.45, 0.05, 1.48, 0.05, wrapMat), 0.18, 1.69, 0));
  addZone(ctx, 'trunk', placed(rbox(0.85, 0.05, 1.5, 0.05, wrapMat), 1.78, 1.04, 0));
  for (const s of [-1, 1]) {
    const z = s * 0.925;
    addZone(ctx, s > 0 ? 'leftDoor' : 'rightDoor', placed(rbox(2.15, 0.55, 0.05, 0.04, wrapMat), 0.12, 0.72, z));
    addZone(ctx, s > 0 ? 'leftFender' : 'rightFender', placed(rbox(0.85, 0.5, 0.05, 0.04, wrapMat), -1.78, 0.72, z));
    addZone(ctx, s > 0 ? 'leftQuarter' : 'rightQuarter', placed(rbox(0.95, 0.55, 0.05, 0.04, wrapMat), 1.62, 0.72, z));
    const skirt = rbox(3.9, 0.12, 0.06, 0.02, trim);
    skirt.position.set(0, 0.4, s * 0.93);
    group.add(skirt);
  }
  addZone(ctx, 'frontBumper', placed(rbox(0.14, 0.42, 1.7, 0.05, wrapMat), -2.32, 0.6, 0));
  addZone(ctx, 'rearBumper', placed(rbox(0.14, 0.42, 1.7, 0.05, wrapMat), 2.32, 0.6, 0));

  // 灯 / 格栅
  const grille = rbox(0.05, 0.18, 0.8, 0.02, trim);
  grille.position.set(-2.4, 0.8, 0);
  group.add(grille);
  for (const s of [-1, 1]) {
    const head = rbox(0.06, 0.12, 0.36, 0.02, headLamp(0x99a7b5, 0xeef2f5));
    head.position.set(-2.4, 0.9, s * 0.56);
    const tail = rbox(0.06, 0.12, 0.3, 0.02, headLamp(0x550000, 0x7a0d12));
    tail.position.set(2.4, 0.92, s * 0.62);
    ctx.disposables.push(head.material as THREE.Material, tail.material as THREE.Material);
    group.add(head, tail);
  }

  wheel(ctx, -1.45, 0.95, 0.36, 0.26);
  wheel(ctx, -1.45, -0.95, 0.36, 0.26);
  wheel(ctx, 1.5, 0.95, 0.36, 0.26);
  wheel(ctx, 1.5, -0.95, 0.36, 0.26);
}

function buildSUV(ctx: BuilderCtx): void {
  const { group, wrapMat } = ctx;
  const glass = makeGlassMaterial();
  const trim = makeTrimMaterial();
  ctx.disposables.push(glass, trim);

  const body = rbox(4.55, 0.85, 1.9, 0.14, wrapMat);
  body.position.set(0, 0.72, 0);
  group.add(body);

  const cabin = rbox(2.7, 0.78, 1.72, 0.1, wrapMat);
  cabin.position.set(0.35, 1.45, 0);
  group.add(cabin);

  const winL = rbox(2.25, 0.38, 0.03, 0.02, glass);
  winL.position.set(0.35, 1.56, 0.87);
  const winR = winL.clone();
  winR.position.z = -0.87;
  const windshield = rbox(0.05, 0.52, 1.4, 0.02, glass);
  windshield.position.set(-1.02, 1.5, 0);
  windshield.rotation.z = -0.18;
  const rearGlass = rbox(0.05, 0.5, 1.35, 0.02, glass);
  rearGlass.position.set(1.71, 1.5, 0);
  group.add(winL, winR, windshield, rearGlass);

  addZone(ctx, 'hood', placed(rbox(1.2, 0.05, 1.6, 0.05, wrapMat), -1.62, 1.17, 0));
  addZone(ctx, 'roof', placed(rbox(2.5, 0.05, 1.62, 0.05, wrapMat), 0.35, 1.86, 0));
  addZone(ctx, 'tailgate', placed(rbox(0.07, 0.95, 1.55, 0.04, wrapMat), 1.73, 1.42, 0));
  for (const s of [-1, 1]) {
    const z = s * 0.965;
    addZone(ctx, s > 0 ? 'leftDoor' : 'rightDoor', placed(rbox(2.15, 0.6, 0.05, 0.04, wrapMat), 0.25, 0.76, z));
    addZone(ctx, s > 0 ? 'leftFender' : 'rightFender', placed(rbox(0.8, 0.55, 0.05, 0.04, wrapMat), -1.82, 0.74, z));
    addZone(ctx, s > 0 ? 'leftQuarter' : 'rightQuarter', placed(rbox(0.8, 0.6, 0.05, 0.04, wrapMat), 1.72, 0.78, z));
    const skirt = rbox(4.0, 0.14, 0.06, 0.02, trim);
    skirt.position.set(0, 0.38, s * 0.97);
    group.add(skirt);
  }
  addZone(ctx, 'frontBumper', placed(rbox(0.15, 0.46, 1.78, 0.05, wrapMat), -2.3, 0.62, 0));
  addZone(ctx, 'rearBumper', placed(rbox(0.15, 0.44, 1.78, 0.05, wrapMat), 2.3, 0.6, 0));

  const grille = rbox(0.05, 0.22, 0.9, 0.02, trim);
  grille.position.set(-2.39, 0.86, 0);
  group.add(grille);
  for (const s of [-1, 1]) {
    const head = rbox(0.06, 0.14, 0.38, 0.02, headLamp(0x99a7b5, 0xeef2f5));
    head.position.set(-2.39, 0.98, s * 0.58);
    const tail = rbox(0.06, 0.16, 0.32, 0.02, headLamp(0x550000, 0x7a0d12));
    tail.position.set(2.39, 1.2, s * 0.6);
    ctx.disposables.push(head.material as THREE.Material, tail.material as THREE.Material);
    group.add(head, tail);
  }

  wheel(ctx, -1.5, 1.0, 0.4, 0.28);
  wheel(ctx, -1.5, -1.0, 0.4, 0.28);
  wheel(ctx, 1.55, 1.0, 0.4, 0.28);
  wheel(ctx, 1.55, -1.0, 0.4, 0.28);
}

function buildPickup(ctx: BuilderCtx): void {
  const { group, wrapMat } = ctx;
  const glass = makeGlassMaterial();
  const trim = makeTrimMaterial();
  ctx.disposables.push(glass, trim);

  const body = rbox(5.15, 0.8, 1.92, 0.14, wrapMat);
  body.position.set(0, 0.7, 0);
  group.add(body);

  const cabin = rbox(1.75, 0.82, 1.72, 0.1, wrapMat);
  cabin.position.set(-1.05, 1.46, 0);
  group.add(cabin);

  // 货箱
  const bed = rbox(1.95, 0.58, 1.82, 0.06, wrapMat);
  bed.position.set(1.4, 1.06, 0);
  group.add(bed);
  const bedInner = rbox(1.72, 0.06, 1.52, 0.03, new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.95 }));
  bedInner.position.set(1.4, 1.36, 0);
  ctx.disposables.push(bedInner.material as THREE.Material);
  group.add(bedInner);

  const winL = rbox(1.35, 0.4, 0.03, 0.02, glass);
  winL.position.set(-1.05, 1.58, 0.87);
  const winR = winL.clone();
  winR.position.z = -0.87;
  const windshield = rbox(0.05, 0.5, 1.4, 0.02, glass);
  windshield.position.set(-1.95, 1.52, 0);
  windshield.rotation.z = -0.15;
  group.add(winL, winR, windshield);

  addZone(ctx, 'hood', placed(rbox(1.28, 0.05, 1.62, 0.05, wrapMat), -1.86, 1.13, 0));
  addZone(ctx, 'roof', placed(rbox(1.55, 0.05, 1.56, 0.05, wrapMat), -1.05, 1.89, 0));
  for (const s of [-1, 1]) {
    const z = s * 0.975;
    addZone(ctx, s > 0 ? 'leftDoor' : 'rightDoor', placed(rbox(1.5, 0.6, 0.05, 0.04, wrapMat), -1.05, 0.76, z));
    addZone(ctx, s > 0 ? 'leftFender' : 'rightFender', placed(rbox(0.85, 0.55, 0.05, 0.04, wrapMat), -2.1, 0.74, z));
    addZone(ctx, s > 0 ? 'bedSideL' : 'bedSideR', placed(rbox(1.9, 0.52, 0.05, 0.04, wrapMat), 1.4, 1.08, z));
    const skirt = rbox(4.4, 0.14, 0.06, 0.02, trim);
    skirt.position.set(0, 0.38, s * 0.98);
    group.add(skirt);
  }
  addZone(ctx, 'tailgate', placed(rbox(0.09, 0.62, 1.62, 0.04, wrapMat), 2.42, 1.08, 0));
  addZone(ctx, 'frontBumper', placed(rbox(0.16, 0.46, 1.82, 0.05, wrapMat), -2.62, 0.62, 0));
  addZone(ctx, 'rearBumper', placed(rbox(0.16, 0.36, 1.82, 0.05, wrapMat), 2.62, 0.52, 0));

  const grille = rbox(0.05, 0.24, 0.95, 0.02, trim);
  grille.position.set(-2.71, 0.88, 0);
  group.add(grille);
  for (const s of [-1, 1]) {
    const head = rbox(0.06, 0.15, 0.38, 0.02, headLamp(0x99a7b5, 0xeef2f5));
    head.position.set(-2.71, 1.0, s * 0.6);
    const tail = rbox(0.06, 0.18, 0.3, 0.02, headLamp(0x550000, 0x7a0d12));
    tail.position.set(2.48, 1.15, s * 0.62);
    ctx.disposables.push(head.material as THREE.Material, tail.material as THREE.Material);
    group.add(head, tail);
  }

  wheel(ctx, -1.6, 1.02, 0.42, 0.3);
  wheel(ctx, -1.6, -1.02, 0.42, 0.3);
  wheel(ctx, 1.65, 1.02, 0.42, 0.3);
  wheel(ctx, 1.65, -1.02, 0.42, 0.3);
}

const BUILDERS: Record<VehicleType, (ctx: BuilderCtx) => void> = {
  sedan: buildSedan,
  suv: buildSUV,
  pickup: buildPickup,
};

export function buildCarModel(type: VehicleType, initialWrap: PanelAppearance, overWidthPanelIds: Set<string>): CarModel {
  const group = new THREE.Group();
  const seamGroup = new THREE.Group();
  group.add(seamGroup);
  const wrapMat = makeWrapMaterial(initialWrap);
  const seamMat = makeSeamMaterial();
  const disposables: { dispose(): void }[] = [wrapMat, seamMat];
  const ctx: BuilderCtx = { group, zones: {} as Record<ZoneName, THREE.Mesh[]>, seamGroup, seams: {}, seamMat, wrapMat, disposables, overWidthPanelIds };
  BUILDERS[type](ctx);
  return {
    root: group,
    zones: ctx.zones,
    seams: ctx.seams,
    seamMaterial: seamMat,
    dispose() {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
      disposables.forEach((d) => d.dispose());
    },
  };
}
