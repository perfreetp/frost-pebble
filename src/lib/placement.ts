// 炮孔布设引擎：阵列生成、边坡/空区/管线自动避让、装药与雷管段位计算
import type {
  BlastDesign,
  BlastHole,
  ChargeParams,
  HoleArray,
  HolePlacement,
  HoleRow,
  XY,
} from '../types';
import {
  interpolateElevation,
  pointInPolygon,
  pointAlong,
  pointToPolygonEdgeDistance,
  pointToPolylineDistance,
  uid,
} from './geometry';

export interface PlacementContext {
  benchPolygon: BlastDesign['benchPolygon'];
  slopes: BlastDesign['slopes'];
  voids: BlastDesign['voids'];
  pipelines: BlastDesign['pipelines'];
  contours: BlastDesign['contours'];
  chargeParams: ChargeParams;
  delays: number[];
}

/** 避让检查：返回 null 表示可布孔，否则返回不能布孔的原因 */
export function checkAvoidance(
  p: XY,
  ctx: PlacementContext,
): string | null {
  if (!pointInPolygon(p, ctx.benchPolygon)) {
    return '超出台阶平面范围';
  }
  for (const v of ctx.voids) {
    if (pointInPolygon(p, v.polygon)) {
      return `位于空区「${v.name}」内（${v.reason}）`;
    }
    const d = pointToPolygonEdgeDistance(p, v.polygon);
    if (d < v.clearance) {
      return `距空区「${v.name}」仅 ${d.toFixed(1)}m，小于安全避让距离 ${v.clearance}m`;
    }
  }
  for (const s of ctx.slopes) {
    const d = pointToPolylineDistance(p, s.polyline);
    if (d < s.clearance) {
      return `距边坡线「${s.name}」仅 ${d.toFixed(1)}m，小于安全距离 ${s.clearance}m`;
    }
  }
  for (const pipe of ctx.pipelines) {
    const d = pointToPolylineDistance(p, pipe.polyline);
    if (d < pipe.clearance) {
      return `距${pipe.kind}管线「${pipe.name}」仅 ${d.toFixed(1)}m，小于安全距离 ${pipe.clearance}m`;
    }
  }
  return null;
}

/** 计算单孔装药量：(孔深 - 堵塞) × 每米装药量 */
export function calcCharge(depth: number, params: ChargeParams): number {
  const chargeLength = Math.max(0, depth - params.stemming);
  return Math.round(chargeLength * params.chargePerMeter * 10) / 10;
}

/** 生成一排中各孔的理论位置（排方向上按孔间距展开） */
export function rowHolePositions(row: HoleRow): XY[] {
  const positions: XY[] = [];
  // 以排中心为锚点向两侧对称展开，保证改间距时排整体围绕中心重排
  const totalLength = (row.plannedCount - 1) * row.spacing;
  const start = pointAlong(row.origin, row.angle + Math.PI, totalLength / 2);
  for (let i = 0; i < row.plannedCount; i++) {
    positions.push(pointAlong(start, row.angle, i * row.spacing));
  }
  return positions;
}

/**
 * 依据阵列中的排定义生成全部炮孔（含避让判定、高程内插、装药与段位）。
 * 阵列首排原点为各排中心的基准；第 n 排中心 = 首排原点沿排法向平移 Σburden，
 * 每排再以自身中心对称展开孔间距。
 */
export function generateHoles(array: HoleArray, ctx: PlacementContext): BlastHole[] {
  const holes: BlastHole[] = [];
  const params = ctx.chargeParams;
  let globalIndex = 0;
  let burdenAccum = 0;
  const firstRow = array.rows[0];
  // 排法向：屏幕坐标系 y 向下为正，angle=0 时排沿 +x 展开，后续排应向 +y 排列
  const normalAngle = firstRow.angle + Math.PI / 2;

  array.rows.forEach((row, rowIdx) => {
    if (rowIdx > 0) burdenAccum += array.rows[rowIdx - 1].burden;
    // 排原点（排中心）：首排用阵列原点，后续排沿法向平移累计排距
    const rowOrigin: XY = pointAlong(firstRow.origin, normalAngle, burdenAccum);
    const effectiveRow: HoleRow = { ...row, origin: rowOrigin };
    const positions = rowHolePositions(effectiveRow);

    positions.forEach((p, i) => {
      const reason = checkAvoidance(p, ctx);
      const elevation = interpolateElevation(p, ctx.contours, 0);
      const depth = Math.round((params.defaultDepth + params.subdrill) * 10) / 10;
      const delayTable = ctx.delays.length > 0 ? ctx.delays : [0];
      const delay = delayTable[globalIndex % delayTable.length];
      holes.push({
        id: uid('hole'),
        code: `R${String(rowIdx + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        x: Math.round(p.x * 100) / 100,
        y: Math.round(p.y * 100) / 100,
        rowId: row.id,
        indexInRow: i,
        placement: row.placement,
        state: reason ? 'skipped' : 'normal',
        skipReason: reason ?? undefined,
        collarElevation: Math.round(elevation * 100) / 100,
        depth,
        diameter: params.diameter,
        inclination: params.inclination,
        charge: reason ? 0 : calcCharge(depth, params),
        detonatorDelay: reason ? -1 : delay,
        stemming: params.stemming,
      });
      globalIndex += 1;
    });
  });

  return holes;
}

export interface ArraySpec {
  name: string;
  origin: XY;
  angle: number; // 排方向角（弧度）
  spacing: number; // 孔间距 m
  burden: number; // 排距 m
  rows: number; // 排数
  holesPerRow: number; // 每排孔数
  placement: HolePlacement;
}

/** 按规格创建阵列骨架（排定义），孔位随后由 generateHoles 填充 */
export function createArray(spec: ArraySpec): HoleArray {
  const rows: HoleRow[] = [];
  for (let r = 0; r < spec.rows; r++) {
    rows.push({
      id: uid('row'),
      origin: spec.origin, // 实际位置在 generateHoles 中按累计排距平移
      angle: spec.angle,
      spacing: spec.spacing,
      burden: spec.burden,
      plannedCount: spec.holesPerRow,
      placement: spec.placement,
    });
  }
  return { id: uid('arr'), name: spec.name, rows, createdAt: new Date().toISOString() };
}

/** 单孔布设：构造只有一排一孔的阵列 */
export function createSingleArray(origin: XY): HoleArray {
  return createArray({
    name: '单孔布设',
    origin,
    angle: 0,
    spacing: 1.2,
    burden: 1.2,
    rows: 1,
    holesPerRow: 1,
    placement: 'single',
  });
}

/** 排孔布设：单排多孔 */
export function createRowArray(origin: XY, count: number, spacing: number, angle: number): HoleArray {
  return createArray({
    name: '排孔布设',
    origin,
    angle,
    spacing,
    burden: spacing,
    rows: 1,
    holesPerRow: count,
    placement: 'row',
  });
}
