/**
 * 基于 BVH 的射线拾取与曲面吸附采样器（浏览器端）。
 * 与 core/surface.ts 的纯 TS 采样器接口一致，前端直接复用 traceOnSurface / unfoldPolyline。
 */
import * as THREE from 'three';
import type { Vec3 } from '@core/types';
import type { SurfaceHit, SurfaceSampler } from '@core/surface';
import { MeshBVH } from 'three-mesh-bvh';
import type { ComponentObject } from './scene';

export interface MeshSampler extends SurfaceSampler {
  componentId: string;
  object: THREE.Mesh;
}

const tmpRay = new THREE.Ray();
const tmpBox = new THREE.Box3();
const tmpV = new THREE.Vector3();
const tmpN = new THREE.Vector3();
const tri = new THREE.Triangle();
const closest = new THREE.Vector3();

export function makeMeshSampler(comp: ComponentObject): MeshSampler {
  const mesh = comp.mesh;
  const geom = mesh.geometry;
  const bvh = geom.boundsTree as MeshBVH;
  const posAttr = geom.getAttribute('position') as THREE.BufferAttribute;
  const index = geom.getIndex()!;

  const hit = (p: Vec3, maxDistance = Infinity): SurfaceHit | null => {
    if (!bvh) return null;
    const point = new THREE.Vector3(p[0], p[1], p[2]);
    const target: { point?: THREE.Vector3; distance?: number; faceIndex?: number } = {};
    const res = bvh.closestPointToPoint(point, target as any, 0, maxDistance);
    if (!res) return null;
    const faceIndex = res.faceIndex ?? 0;
    // 面法向
    const i0 = index.getX(faceIndex * 3);
    const i1 = index.getX(faceIndex * 3 + 1);
    const i2 = index.getX(faceIndex * 3 + 2);
    tri.a.fromBufferAttribute(posAttr as any, i0);
    tri.b.fromBufferAttribute(posAttr as any, i1);
    tri.c.fromBufferAttribute(posAttr as any, i2);
    tri.getNormal(tmpN);
    return {
      point: [res.point.x, res.point.y, res.point.z],
      normal: [tmpN.x, tmpN.y, tmpN.z],
      triangle: faceIndex,
      distance: res.distance ?? 0,
    };
  };

  return {
    componentId: comp.info.id,
    object: mesh,
    triangleCount: bvh ? (geom.index?.count ?? 0) / 3 : 0,
    hit,
  };
}

export interface ScenePick {
  component: ComponentObject;
  point: Vec3;
  normal: Vec3;
  distance: number;
}

/** 用射线拾取所有可交互构件，返回最近命中 */
export function raycastComponents(
  raycaster: THREE.Raycaster,
  comps: ComponentObject[],
): ScenePick | null {
  const hits = raycaster.intersectObjects(
    comps.map((c) => c.mesh),
    false,
  );
  for (const h of hits) {
    if (!h.face) continue;
    const comp = comps.find((c) => c.mesh === h.object);
    if (!comp) continue;
    const p = h.point;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
    return {
      component: comp,
      point: [p.x, p.y, p.z],
      normal: [n.x, n.y, n.z],
      distance: h.distance,
    };
  }
  return null;
}

/** 屏幕坐标 → 拾取结果；若未命中任何实体，返回 null（前端据此提示“请点在构件上”） */
export function pickAtScreen(
  raycaster: THREE.Raycaster,
  ndc: THREE.Vector2,
  camera: THREE.Camera,
  comps: ComponentObject[],
): ScenePick | null {
  raycaster.setFromCamera(ndc, camera);
  return raycastComponents(raycaster, comps);
}
