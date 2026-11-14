// 规则与统计：折弯半径告警、超长度/接头、变压器选型、带载余量
import type {
  AcrylicElement,
  ProjectData,
  QuoteLine,
  QuoteResult,
  SignElement,
  StatsResult,
  TransformerPick,
} from '../types';
import { boundsOf, polygonArea, tubePathLength } from './geometry';

export interface ElementMeasure {
  id: string;
  kind: SignElement['kind'];
  lengthMm: number;
  watts: number;
}

/** 单元素测量：长度与功率 */
export function measureElement(el: SignElement, settings: ProjectData['settings']): ElementMeasure {
  if (el.kind === 'acrylic') {
    const areaSqm = acrylicArea(el) / 1e6;
    return {
      id: el.id,
      kind: el.kind,
      lengthMm: 0,
      watts: areaSqm * settings.acrylicWattsPerSqm,
    };
  }
  const lengthMm = tubePathLength(el.points, el.cornerRadii);
  return {
    id: el.id,
    kind: el.kind,
    lengthMm,
    watts: (lengthMm / 1000) * settings.wattsPerM,
  };
}

export function acrylicArea(el: AcrylicElement): number {
  if (el.contours.length === 0) return 0;
  let area = 0;
  for (const ring of el.contours) area += Math.abs(polygonArea(ring));
  return area;
}

/** 单根灯管需要的接头数量：每超过一个 2.4m 段加一个接头 */
export function connectorJoints(lengthMm: number, maxTubeLength: number): number {
  if (lengthMm <= maxTubeLength) return 0;
  return Math.ceil(lengthMm / maxTubeLength) - 1;
}

/** 在满足带载余量的前提下选最小容量档；无合适档位返回最大档并标记超载 */
export function pickTransformer(loadW: number, settings: ProjectData['settings']): TransformerPick {
  const series = [...settings.transformerSeries].sort((a, b) => a - b);
  const cap = (va: number) => va * settings.loadMargin;
  let chosen = series.find((va) => cap(va) >= loadW);
  let overloaded = false;
  let suggestVA: number | undefined;
  if (!chosen) {
    chosen = series[series.length - 1];
    overloaded = true;
    suggestVA = Math.ceil(loadW / settings.loadMargin / 50) * 50;
  }
  return {
    capacityVA: chosen,
    loadW,
    loadRatio: loadW / cap(chosen),
    memberIds: [],
    overloaded,
    suggestVA,
  };
}

/**
 * 贪心装箱：按功率降序把元素分配到变压器，单台不超过容量×余量；
 * 放不下就新开一台。任何一台超载都会给出换大一号建议。
 */
export function allocateTransformers(
  measures: ElementMeasure[],
  settings: ProjectData['settings'],
): TransformerPick[] {
  const series = [...settings.transformerSeries].sort((a, b) => a - b);
  const maxVA = series[series.length - 1];
  const cap = maxVA * settings.loadMargin;
  const sorted = [...measures].sort((a, b) => b.watts - a.watts);
  const picks: TransformerPick[] = [];

  for (const m of sorted) {
    if (m.watts <= 0) continue;
    const bin = picks.find((p) => p.loadW + m.watts <= p.capacityVA * settings.loadMargin);
    if (bin) {
      bin.loadW += m.watts;
      bin.memberIds.push(m.id);
      continue;
    }
    const pick = pickTransformer(m.watts, settings);
    pick.memberIds = [m.id];
    picks.push(pick);
  }

  for (const p of picks) {
    p.loadRatio = p.loadW / (p.capacityVA * settings.loadMargin);
    if (p.loadW > cap) {
      p.overloaded = true;
      p.suggestVA = Math.ceil(p.loadW / settings.loadMargin / 50) * 50;
    }
  }
  return picks;
}

export function computeStats(project: ProjectData): StatsResult {
  const { settings, elements } = project;
  const radiusWarnings: StatsResult['radiusWarnings'] = [];
  const lengthWarnings: StatsResult['lengthWarnings'] = [];
  const connectorDetail: StatsResult['connectorDetail'] = [];
  const measures: ElementMeasure[] = [];

  let totalTubeMm = 0;
  let connectorCount = 0;
  let acrylicAreaSqm = 0;
  let acrylicMaxHeight = 0;

  for (const el of elements) {
    const m = measureElement(el, settings);
    measures.push(m);

    if (el.kind !== 'acrylic') {
      totalTubeMm += m.lengthMm;
      // 折弯半径检查：半径 < 直径 × 系数 → 标红
      const minR = el.diameter * settings.minRadiusFactor;
      el.cornerRadii.forEach((r, i) => {
        if (r < minR) radiusWarnings.push({ id: el.id, cornerIndex: i, radius: r, min: minR });
      });
      const joints = connectorJoints(m.lengthMm, settings.maxTubeLength);
      if (joints > 0) {
        connectorCount += joints;
        connectorDetail.push({ id: el.id, joints });
        lengthWarnings.push({ id: el.id, lengthM: m.lengthMm / 1000 });
      }
    } else {
      acrylicAreaSqm += acrylicArea(el) / 1e6;
      const b = boundsOf(el.contours.flat());
      acrylicMaxHeight = Math.max(acrylicMaxHeight, b.maxY - b.minY);
    }
  }

  const transformers = allocateTransformers(measures, settings);
  const totalWatts = measures.reduce((s, m) => s + m.watts, 0);
  const totalCapacity = transformers.reduce((s, t) => s + t.capacityVA * settings.loadMargin, 0);
  const overallMargin = totalCapacity > 0 ? 1 - totalWatts / totalCapacity : 1;

  return {
    totalTubeM: totalTubeMm / 1000,
    connectorCount,
    connectorDetail,
    radiusWarnings,
    lengthWarnings,
    transformers,
    totalWatts,
    overallMargin,
    acrylicAreaSqm,
    acrylicMaxHeight,
  };
}

/** 按材料单价生成报价单 */
export function computeQuote(project: ProjectData, stats: StatsResult): QuoteResult {
  const { settings, elements, wall } = project;
  const p = settings.prices;
  const lines: QuoteLine[] = [];

  let singleM = 0;
  let dualM = 0;
  for (const el of elements) {
    if (el.kind === 'tube-single') singleM += measureElement(el, settings).lengthMm / 1000;
    if (el.kind === 'tube-dual') dualM += measureElement(el, settings).lengthMm / 1000;
  }
  if (singleM > 0) {
    lines.push({
      item: '单色霓虹灯管', spec: `LED 软管 Φ${settings.defaultTubeDiameter}`, qty: round2(singleM),
      unit: '米', unitPrice: p.tubeSinglePerM, amount: round2(singleM * p.tubeSinglePerM),
    });
  }
  if (dualM > 0) {
    lines.push({
      item: '双色霓虹灯管', spec: '双色交替 LED 软管', qty: round2(dualM),
      unit: '米', unitPrice: p.tubeDualPerM, amount: round2(dualM * p.tubeDualPerM),
    });
  }
  if (stats.connectorCount > 0) {
    lines.push({
      item: '灯管接头', spec: `单根超 ${settings.maxTubeLength / 1000}m 接驳`,
      qty: stats.connectorCount, unit: '个', unitPrice: p.connectorEach,
      amount: round2(stats.connectorCount * p.connectorEach),
    });
  }
  for (const t of stats.transformers) {
    const unitPrice = p.transformerByVA[t.capacityVA] ?? 0;
    lines.push({
      item: `变压器 ${t.capacityVA}VA`,
      spec: t.overloaded ? `超载！建议换 ≥${t.suggestVA}VA` : `负载 ${t.loadW.toFixed(1)}W（${(t.loadRatio * 100).toFixed(0)}%）`,
      qty: 1, unit: '台', unitPrice, amount: unitPrice,
    });
  }
  const acrylics = elements.filter((e) => e.kind === 'acrylic') as AcrylicElement[];
  for (const el of acrylics) {
    const b = boundsOf(el.contours.flat());
    const hCm = Math.max(1, (b.maxY - b.minY) / 10);
    lines.push({
      item: '亚克力发光字', spec: `字高 ${hCm.toFixed(1)}cm`, qty: 1, unit: '个',
      unitPrice: round2(hCm * p.acrylicPerCmHeight),
      amount: round2(hCm * p.acrylicPerCmHeight),
    });
  }
  const wallSqm = (wall.width * wall.height) / 1e6;
  if (wallSqm > 0) {
    lines.push({
      item: '墙面底板', spec: `${wall.width}×${wall.height}mm`, qty: round2(wallSqm),
      unit: '㎡', unitPrice: p.wallPanelPerSqm, amount: round2(wallSqm * p.wallPanelPerSqm),
    });
  }

  const total = round2(lines.reduce((s, l) => s + l.amount, 0));
  return { lines, total };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
