import type {
  Bridge,
  BridgeConfig,
  ComponentInfo,
  ComponentType,
  SupportInfo,
  Vec3,
} from './types';
import { MeshBuilder, mergeMeshes, type MeshData } from './geom';
import { bboxOf, padBBox, bboxIntersects, dist } from './math';

export const DEFAULT_CONFIG: BridgeConfig = {
  id: 'qingshui-river',
  name: '清水河大桥（右幅）',
  structureType: '3×30 m 预应力混凝土连续箱梁桥',
  stationStart: 1250,
  elevationStart: 42.5,
  gradePercent: 1.2,
  spans: [30, 30, 30],
  deckWidth: 12,
  girderDepth: 1.8,
  pierHeight: 8,
  deckThickness: 0.1,
  railingHeight: 1.1,
  bearingHeight: 0.25,
  leftSideDefinition: '顺里程方向前进时的左手侧为左侧（上游侧）',
  owner: '市交通局桥梁养护中心',
  designLoad: '公路—I 级',
  builtYear: 2012,
};

export interface BridgeAssembly {
  bridge: Bridge;
  meshes: Record<string, MeshData>;
  /** 组件的显示颜色 */
  colors: Record<string, number>;
}

export const COMPONENT_COLORS: Record<ComponentType, number> = {
  girder: 0xb9c2cc,
  pier: 0x9aa6b2,
  bearing: 0x59636e,
  deck: 0x6f7780,
  railing: 0x8d949c,
  abutment: 0xa8b0b8,
};

export function spanStarts(config: BridgeConfig): number[] {
  const starts = [0];
  for (const s of config.spans) starts.push(starts[starts.length - 1] + s);
  return starts;
}

/** 桥面铺装顶面标高（世界坐标 x 处的绝对高程） */
export function deckElevationAt(config: BridgeConfig, x: number): number {
  return config.elevationStart + (config.gradePercent / 100) * x;
}

export function girderBottomAt(config: BridgeConfig, x: number): number {
  return deckElevationAt(config, x) - config.deckThickness - config.girderDepth;
}

/** 世界坐标点 → 里程桩号（米） */
export function pointChainage(config: BridgeConfig, p: Vec3): number {
  return config.stationStart + p[0];
}

/** 世界坐标点 → 横向偏距（米），左侧为负 */
export function pointOffset(p: Vec3): number {
  return p[2];
}

/** 由桩号计算世界 x */
export function chainageToX(config: BridgeConfig, chainage: number): number {
  return chainage - config.stationStart;
}

export function makeSupports(config: BridgeConfig): SupportInfo[] {
  const starts = spanStarts(config);
  return starts.map((x, i) => {
    const isEnd = i === 0 || i === starts.length - 1;
    const top = girderBottomAt(config, x) - config.bearingHeight;
    return {
      index: i,
      x,
      chainage: config.stationStart + x,
      topElevation: top,
      kind: isEnd ? 'abutment' : 'pier',
      label: isEnd ? `${i === 0 ? 0 : config.spans.length}# 桥台` : `P${i}# 墩`,
    } as SupportInfo;
  });
}

const SUPPORT_BEARING_OFFSETS = [-4.2, -1.4, 1.4, 4.2];
const BEARING_SIDE_LABEL = ['左外', '左内', '右内', '右外'];

/** 单个箱梁截面：外框 + 内孔，返回 [z,y] 环 */
function boxGirderProfile(config: BridgeConfig, yBottom: number, yTop: number) {
  const half = (config.deckWidth - 1.2) / 2;
  const wall = 0.32;
  const bottomSlab = 0.28;
  const outer: [number, number][] = [
    [-half, yBottom],
    [half, yBottom],
    [half, yTop],
    [-half, yTop],
  ];
  const inner: [number, number][] = [
    [-half + wall, yBottom + bottomSlab],
    [half - wall, yBottom + bottomSlab],
    [half - wall, yTop - wall],
    [-half + wall, yTop - wall],
  ];
  return { outer, inner };
}

export function buildBridge(config: BridgeConfig): BridgeAssembly {
  const supports = makeSupports(config);
  const starts = spanStarts(config);
  const components: ComponentInfo[] = [];
  const meshes: Record<string, MeshData> = {};
  const colors: Record<string, number> = {};

  const addComponent = (
    partial: Omit<ComponentInfo, 'bboxMin' | 'bboxMax' | 'chainageStart' | 'chainageEnd'>,
    mesh: MeshData,
    color: number,
  ) => {
    const pts: Vec3[] = [];
    for (let i = 0; i < mesh.positions.length; i += 3) {
      pts.push([mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]]);
    }
    const bb = bboxOf(pts);
    const info: ComponentInfo = {
      ...partial,
      bboxMin: bb.min,
      bboxMax: bb.max,
      // 桩号按设计范围挂载（护栏立柱的 6 cm 外挑不应让桩号“回退”），几何范围另存于 bbox
      chainageStart: config.stationStart + partial.x0,
      chainageEnd: config.stationStart + partial.x1,
    };
    components.push(info);
    meshes[info.id] = mesh;
    colors[info.id] = color;
  };

  for (let i = 0; i < config.spans.length; i++) {
    const x0 = starts[i];
    const x1 = starts[i + 1];
    const span = i + 1;
    const yBottom0 = girderBottomAt(config, x0);
    const yBottom1 = girderBottomAt(config, x1);
    const yTop0 = deckElevationAt(config, x0) - config.deckThickness;
    const yTop1 = deckElevationAt(config, x1) - config.deckThickness;

    // 箱梁体（沿纵坡倾斜 —— 采用分段拉伸近似，12 段足够贴合）
    {
      const mb = new MeshBuilder();
      const seg = 12;
      for (let s = 0; s < seg; s++) {
        const xa = x0 + ((x1 - x0) * s) / seg;
        const xb = x0 + ((x1 - x0) * (s + 1)) / seg;
        const ya0 = girderBottomAt(config, xa);
        const ya1 = deckElevationAt(config, xa) - config.deckThickness;
        const yb0 = girderBottomAt(config, xb);
        const yb1 = deckElevationAt(config, xb) - config.deckThickness;
        const pa = boxGirderProfile(config, ya0, ya1);
        const pb = boxGirderProfile(config, yb0, yb1);
        // 外侧 4 边
        for (let k = 0; k < 4; k++) {
          const a0 = pa.outer[k];
          const a1 = pa.outer[(k + 1) % 4];
          const b0 = pb.outer[k];
          const b1 = pb.outer[(k + 1) % 4];
          mb.quad([xa, a0[1], a0[0]], [xa, a1[1], a1[0]], [xb, b1[1], b1[0]], [xb, b0[1], b0[0]]);
        }
        // 内孔 4 边（朝内）
        for (let k = 0; k < 4; k++) {
          const a0 = pa.inner[k];
          const a1 = pa.inner[(k + 1) % 4];
          const b0 = pb.inner[k];
          const b1 = pb.inner[(k + 1) % 4];
          mb.quad([xa, a0[1], a0[0]], [xb, b0[1], b0[0]], [xb, b1[1], b1[0]], [xa, a1[1], a1[0]]);
        }
        // 端面（首尾）
        if (s === 0) {
          const ring = pa.outer.map(([z, y]) => [x0, y, z] as Vec3);
          const hole = pa.inner.map(([z, y]) => [x0, y, z] as Vec3);
          for (let k = 0; k < 4; k++) {
            const k2 = (k + 1) % 4;
            mb.tri(ring[k], hole[k2], ring[k2]);
            mb.tri(ring[k], hole[k], hole[k2]);
          }
        }
        if (s === seg - 1) {
          const ring = pb.outer.map(([z, y]) => [x1, y, z] as Vec3);
          const hole = pb.inner.map(([z, y]) => [x1, y, z] as Vec3);
          for (let k = 0; k < 4; k++) {
            const k2 = (k + 1) % 4;
            mb.tri(ring[k], ring[k2], hole[k2]);
            mb.tri(ring[k], hole[k2], hole[k]);
          }
        }
      }
      addComponent(
        {
          id: `span-${span}-girder`,
          name: `第 ${span} 跨 箱梁`,
          type: 'girder',
          spanIndex: span,
          x0,
          x1,
          elevMin: Math.min(yBottom0, yBottom1),
          elevMax: Math.max(yTop0, yTop1),
          z0: -(config.deckWidth - 1.2) / 2,
          z1: (config.deckWidth - 1.2) / 2,
          assetCode: `QL-GL-${String(span).padStart(2, '0')}-01`,
        },
        mb.build(),
        COMPONENT_COLORS.girder,
      );
    }

    // 桥面铺装（全宽，含悬臂）
    {
      const mb = new MeshBuilder();
      const seg = 6;
      for (let s = 0; s < seg; s++) {
        const xa = x0 + ((x1 - x0) * s) / seg;
        const xb = x0 + ((x1 - x0) * (s + 1)) / seg;
        const ya = deckElevationAt(config, xa);
        const yb = deckElevationAt(config, xb);
        const za = -config.deckWidth / 2;
        const zb = config.deckWidth / 2;
        const thick = config.deckThickness;
        mb.quad([xa, ya, za], [xa, ya, zb], [xb, yb, zb], [xb, yb, za]); // 顶面
        mb.quad([xa, ya - thick, za], [xb, yb - thick, za], [xb, yb - thick, zb], [xa, ya - thick, zb]);
        mb.quad([xa, ya - thick, za], [xa, ya - thick, zb], [xa, ya, zb], [xa, ya, za]);
        mb.quad([xb, yb - thick, za], [xb, yb, za], [xb, yb, zb], [xb, yb - thick, zb]);
        mb.quad([xa, ya - thick, za], [xb, yb - thick, za], [xb, yb, za], [xa, ya, za]);
        mb.quad([xa, ya - thick, zb], [xa, ya, zb], [xb, yb, zb], [xb, yb - thick, zb]);
      }
      addComponent(
        {
          id: `span-${span}-deck`,
          name: `第 ${span} 跨 桥面铺装`,
          type: 'deck',
          spanIndex: span,
          x0,
          x1,
          elevMin: Math.min(deckElevationAt(config, x0), deckElevationAt(config, x1)) - config.deckThickness,
          elevMax: Math.max(deckElevationAt(config, x0), deckElevationAt(config, x1)),
          z0: -config.deckWidth / 2,
          z1: config.deckWidth / 2,
          assetCode: `QL-QM-${String(span).padStart(2, '0')}-01`,
        },
        mb.build(),
        COMPONENT_COLORS.deck,
      );
    }

    // 两侧护栏
    for (const side of ['left', 'right'] as const) {
      const sign = side === 'left' ? -1 : 1;
      const zc = sign * (config.deckWidth / 2 - 0.16);
      const mb = new MeshBuilder();
      const seg = 6;
      const railThick = 0.06;
      for (let s = 0; s < seg; s++) {
        const xa = x0 + ((x1 - x0) * s) / seg;
        const xb = x0 + ((x1 - x0) * (s + 1)) / seg;
        const ya = deckElevationAt(config, xa);
        const yb = deckElevationAt(config, xb);
        const h = config.railingHeight;
        // 立柱
        const postCount = Math.max(2, Math.round((xb - xa) / 2.5));
        for (let k = 0; k <= postCount; k++) {
          const xp = xa + ((xb - xa) * k) / postCount;
          const yp = deckElevationAt(config, xp);
          mb.box(xp - 0.06, yp, zc - 0.06, xp + 0.06, yp + h, zc + 0.06);
        }
        // 三道横梁
        for (const frac of [0.35, 0.65, 0.98]) {
          const y0a = ya + h * frac - railThick / 2;
          const y0b = yb + h * frac - railThick / 2;
          mb.quad(
            [xa, y0a, zc - 0.09],
            [xa, y0a, zc + 0.09],
            [xb, y0b, zc + 0.09],
            [xb, y0b, zc - 0.09],
          );
          mb.quad(
            [xa, y0a, zc - 0.09],
            [xb, y0b, zc - 0.09],
            [xb, y0b + railThick, zc - 0.09],
            [xa, y0a + railThick, zc - 0.09],
          );
          mb.quad(
            [xa, y0a, zc + 0.09],
            [xa, y0a + railThick, zc + 0.09],
            [xb, y0b + railThick, zc + 0.09],
            [xb, y0b, zc + 0.09],
          );
        }
      }
      addComponent(
        {
          id: `span-${span}-railing-${side}`,
          name: `第 ${span} 跨 护栏（${side === 'left' ? '左' : '右'}侧）`,
          type: 'railing',
          spanIndex: span,
          x0,
          x1,
          elevMin: Math.min(deckElevationAt(config, x0), deckElevationAt(config, x1)),
          elevMax: Math.max(deckElevationAt(config, x0), deckElevationAt(config, x1)) + config.railingHeight,
          z0: zc - 0.12,
          z1: zc + 0.12,
          side,
          assetCode: `QL-HL-${String(span).padStart(2, '0')}-${side === 'left' ? 'L' : 'R'}`,
        },
        mb.build(),
        COMPONENT_COLORS.railing,
      );
    }
  }

  // 桥台
  for (const i of [0, config.spans.length]) {
    const sup = supports[i];
    const x = sup.x;
    const mb = new MeshBuilder();
    const half = config.deckWidth / 2 + 0.4;
    const top = sup.topElevation;
    mb.box(x - 1.2, 0, -half, x + 1.2, top, half);
    // 台帽
    mb.box(x - 0.9, top - 0.9, -half + 0.2, x + 0.9, top, half - 0.2);
    addComponent(
      {
        id: `support-${i}-abutment`,
        name: `${i === 0 ? 0 : config.spans.length}# 桥台`,
        type: 'abutment',
        spanIndex: i === 0 ? 1 : config.spans.length,
        x0: x - 1.2,
        x1: x + 1.2,
        elevMin: 0,
        elevMax: top,
        z0: -half,
        z1: half,
        supportIndex: i,
        assetCode: `QL-QT-${String(i).padStart(2, '0')}`,
      },
      mb.build(),
      COMPONENT_COLORS.abutment,
    );
  }

  // 墩柱（含盖梁）
  for (let i = 1; i < config.spans.length; i++) {
    const sup = supports[i];
    const top = sup.topElevation;
    const mb = new MeshBuilder();
    const capDepth = 1.1;
    const capTop = top;
    const capBottom = top - capDepth;
    const half = config.deckWidth / 2 - 0.6;
    mb.box(sup.x - 0.9, capBottom, -half, sup.x + 0.9, capTop, half);
    // 双柱
    const colR = 0.85;
    for (const z of [-config.deckWidth / 4, config.deckWidth / 4]) {
      mb.cylinder(sup.x, 0, z, colR, capBottom, 20);
      // 基础
      mb.cylinder(sup.x, 0, z, colR + 0.35, 0.6, 20);
    }
    addComponent(
      {
        id: `support-${i}-pier`,
        name: `${i}# 墩柱（含盖梁）`,
        type: 'pier',
        spanIndex: i,
        x0: sup.x - 1.0,
        x1: sup.x + 1.0,
        elevMin: 0,
        elevMax: capTop,
        z0: -(config.deckWidth / 2 - 0.6),
        z1: config.deckWidth / 2 - 0.6,
        supportIndex: i,
        assetCode: `QL-DZ-${String(i).padStart(2, '0')}`,
      },
      mb.build(),
      COMPONENT_COLORS.pier,
    );
  }

  // 支座（每个墩台 4 个）
  for (const sup of supports) {
    const y0 = sup.topElevation;
    const y1 = girderBottomAt(config, sup.x);
    for (let k = 0; k < SUPPORT_BEARING_OFFSETS.length; k++) {
      const z = SUPPORT_BEARING_OFFSETS[k];
      const mb = new MeshBuilder();
      const h = Math.max(0.12, y1 - y0);
      mb.box(sup.x - 0.3, y0, z - 0.22, sup.x + 0.3, y0 + 0.03, z + 0.22); // 下钢板
      mb.box(sup.x - 0.26, y0 + 0.03, z - 0.18, sup.x + 0.26, y0 + h - 0.09, z + 0.18); // 橡胶体
      mb.box(sup.x - 0.3, y0 + h - 0.09, z - 0.22, sup.x + 0.3, y1, z + 0.22); // 上钢板
      const sideLabel =
        z < 0
          ? `${BEARING_SIDE_LABEL[k]}（左侧）`
          : `${BEARING_SIDE_LABEL[k]}（右侧）`;
      addComponent(
        {
          id: `support-${sup.index}-bearing-${k}`,
          name: `${sup.label} 支座 ${k + 1}# · ${sideLabel}`,
          type: 'bearing',
          spanIndex: Math.max(1, Math.min(config.spans.length, sup.index === 0 ? 1 : sup.index)),
          x0: sup.x - 0.3,
          x1: sup.x + 0.3,
          elevMin: y0,
          elevMax: y1,
          z0: z - 0.22,
          z1: z + 0.22,
          side: z < 0 ? 'left' : 'right',
          supportIndex: sup.index,
          assetCode: `QL-ZZ-${String(sup.index).padStart(2, '0')}-${k + 1}`,
        },
        mb.build(),
        COMPONENT_COLORS.bearing,
      );
    }
  }

  const length = starts[starts.length - 1];
  const bridge: Bridge = {
    config,
    components,
    supports,
    length,
  };
  return { bridge, meshes, colors };
}

export interface ComponentGroup {
  type: ComponentType;
  label: string;
  components: ComponentInfo[];
}

/** 按构件类型 + 跨序组织的构件树 */
export function groupComponents(components: ComponentInfo[]): ComponentGroup[] {
  const order: ComponentType[] = ['girder', 'deck', 'railing', 'pier', 'bearing', 'abutment'];
  const labels: Record<ComponentType, string> = {
    girder: '梁体',
    deck: '桥面铺装',
    railing: '护栏',
    pier: '墩柱',
    bearing: '支座',
    abutment: '桥台',
  };
  return order
    .map((type) => ({
      type,
      label: labels[type],
      components: components
        .filter((c) => c.type === type)
        .sort((a, b) => a.spanIndex - b.spanIndex || a.name.localeCompare(b.name, 'zh')),
    }))
    .filter((g) => g.components.length > 0);
}

/** 点所属构件：优先包含，其次最近包围盒 */
export function componentAtPoint(
  components: ComponentInfo[],
  p: Vec3,
  pad = 0.05,
): ComponentInfo | null {
  let best: ComponentInfo | null = null;
  let bestScore = Infinity;
  for (const c of components) {
    const pb = padBBox(c.bboxMin, c.bboxMax, pad);
    const inside = bboxIntersects(p, p, pb.min, pb.max) && distToBBox(p, c) <= pad;
    const d = distToBBox(p, c);
    const score = inside ? d - 1e3 : d;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

export function distToBBox(p: Vec3, c: ComponentInfo): number {
  const q: Vec3 = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    q[i] = p[i] < c.bboxMin[i] ? c.bboxMin[i] : p[i] > c.bboxMax[i] ? c.bboxMax[i] : p[i];
  }
  return dist(p, q);
}

/** 将多个构件网格合并（用于剖切盖面 / 包围盒加速） */
export function mergedMesh(meshes: Record<string, MeshData>): MeshData {
  return mergeMeshes(Object.values(meshes));
}

/** 构件按位置排序，便于树中展示 */
export function sortComponentsForTree(a: ComponentInfo, b: ComponentInfo): number {
  const typeOrder: ComponentType[] = ['girder', 'deck', 'railing', 'pier', 'bearing', 'abutment'];
  return (
    typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) ||
    a.spanIndex - b.spanIndex ||
    a.chainageStart - b.chainageStart ||
    a.name.localeCompare(b.name, 'zh')
  );
}
