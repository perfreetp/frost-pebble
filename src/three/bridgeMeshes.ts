/**
 * 把 core 的程序化桥梁转换为 three 用的 mesh 数据。
 * 细分只影响渲染密度（压力测试），几何与病害计算始终使用同一坐标。
 */
import type { Bridge } from '@core/types';
import type { MeshData } from '@core/geom';
import { buildBridge as buildBridgeCore } from '@core/bridgeModel';
import { MeshBuilder } from '@core/geom';

export function buildBridgeMeshes(
  bridge: Bridge,
  subdivide = 0,
): { bridge: Bridge; meshes: Record<string, MeshData>; colors: Record<string, number> } {
  const built = buildBridgeCore(bridge.config);
  const colors = built.colors;
  let meshes = built.meshes;

  if (subdivide > 0) {
    const next: Record<string, MeshData> = {};
    for (const [id, md] of Object.entries(meshes)) {
      next[id] = subdivideMeshData(md, subdivide);
    }
    meshes = next;
  }
  return { bridge: built.bridge, meshes, colors };
}

/** 在三角面片上做 n 次 1→4 细分（只增加面数，不改变形状） */
export function subdivideMeshData(md: MeshData, times: number): MeshData {
  let positions = Array.from(md.positions);
  let indices = Array.from(md.indices);
  for (let t = 0; t < times; t++) {
    const nextPos = positions.slice();
    const nextIdx: number[] = [];
    const cache = new Map<string, number>();
    const mid = (i0: number, i1: number) => {
      const key = i0 < i1 ? `${i0}_${i1}` : `${i1}_${i0}`;
      const cached = cache.get(key);
      if (cached !== undefined) return cached;
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
  return {
    positions: new Float32Array(positions),
    indices: new Uint32Array(indices),
  };
}

/** 生成“倾斜摄影 / 点云”风格的高密度替代网格（用于性能演示） */
export function makeScanLikeMesh(): MeshData {
  const mb = new MeshBuilder();
  mb.box(0, 0, 0, 1, 1, 1);
  return mb.build();
}
