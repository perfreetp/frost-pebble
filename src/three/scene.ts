/**
 * 场景构建：程序化桥梁 → 每构件独立 BufferGeometry + BVH。
 * 同时负责把“病害几何”转换成可渲染对象，保证三维标注与导出的二维分布图使用同一坐标系。
 */
import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import type { MeshData } from '@core/geom';
import type { Bridge, ComponentInfo, Defect } from '@core/types';
import type { MeshSampler } from './sampler';

export interface ComponentObject {
  info: ComponentInfo;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  baseColor: number;
}

export function makeStandardMaterial(color: number, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.08,
    roughness: 0.82,
    flatShading: false,
    ...opts,
  });
}

export function geometryFromMeshData(md: MeshData): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(md.positions, 3));
  g.setIndex(new THREE.BufferAttribute(md.indices, 1));
  g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/** 三角形细分（压力测试 / 让轻量模型接近实景网格密度） */
export function subdivideGeometry(geom: THREE.BufferGeometry, times: number): THREE.BufferGeometry {
  let pos = geom.getAttribute('position') as THREE.BufferAttribute;
  let idx = geom.getIndex()!;
  let positions = Array.from(pos.array as Float32Array);
  let indices = Array.from(idx.array as ArrayLike<number>);

  for (let t = 0; t < times; t++) {
    const nextPos = positions.slice();
    const nextIdx: number[] = [];
    const cache = new Map<string, number>();
    const mid = (i0: number, i1: number) => {
      const key = i0 < i1 ? `${i0}_${i1}` : `${i1}_${i0}`;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const a = i0 * 3;
      const b = i1 * 3;
      nextPos.push(
        (positions[a] + positions[b]) / 2,
        (positions[a + 1] + positions[b + 1]) / 2,
        (positions[a + 2] + positions[b + 2]) / 2,
      );
      const ni = nextPos.length / 3 - 1;
      cache.set(key, ni);
      return ni;
    };
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i];
      const b = indices[i + 1];
      const c = indices[i + 2];
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      nextIdx.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    positions = nextPos;
    indices = nextIdx;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  return g;
}

/** 由构建器产出的 mesh 集合生成场景对象 */
export function buildComponentObjects(
  bridge: Bridge,
  meshes: Record<string, MeshData>,
  colors: Record<string, number>,
  opts: { subdivide?: number } = {},
): ComponentObject[] {
  const out: ComponentObject[] = [];
  for (const info of bridge.components) {
    const md = meshes[info.id];
    if (!md) continue;
    let geom = geometryFromMeshData(md);
    if (opts.subdivide && opts.subdivide > 0) geom = subdivideGeometry(geom, opts.subdivide);
    geom.boundsTree = new MeshBVH(geom, { maxLeafTris: 16 });
    const color = colors[info.id] ?? 0xb9c2cc;
    const material = makeStandardMaterial(color);
    const mesh = new THREE.Mesh(geom, material);
    mesh.name = info.id;
    mesh.userData.componentId = info.id;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    out.push({ info, mesh, material, baseColor: color });
  }
  return out;
}

// ---------------------------------------------------------------- defects

export interface DefectVisual {
  defect: Defect;
  group: THREE.Group;
  line?: unknown;
  fill?: THREE.Mesh;
  marker?: THREE.Mesh;
  /** 屏幕标签锚点 */
  anchor: THREE.Vector3;
}

export function severityHex(sev: 'critical' | 'warning' | 'normal'): number {
  return sev === 'critical' ? 0xe5484d : sev === 'warning' ? 0xe8b033 : 0x4f9a68;
}

export function defectAnchor(d: Defect): THREE.Vector3 {
  if (d.geometry.kind === 'crack') {
    const p = d.geometry.path[Math.floor(d.geometry.path.length / 2)] ?? d.geometry.endpoints[0];
    return new THREE.Vector3(p[0], p[1], p[2]);
  }
  const c = d.geometry.center;
  return new THREE.Vector3(c[0], c[1], c[2]);
}
