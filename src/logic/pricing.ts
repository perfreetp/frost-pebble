import type { Project, ProjectSpec, QuoteLine, SurfaceId } from '../types';
import { SURFACE_NAMES } from '../types';
import {
  BASE_LEAD_DAYS,
  CEILING_DEFS,
  HANDRAIL_DEF,
  MATERIALS,
  RECOMMENDED_LUX,
  WEIGHT_WARN_RATIO,
} from '../data/catalog';
import { doorOpeningHeight, doorOpeningWidth } from './validation';

const MM2_TO_M2 = 1e-6;

/** 各表面净面积 m²(扣除门洞) */
export function surfaceAreas(spec: ProjectSpec): Record<SurfaceId, number> {
  const w = spec.width, d = spec.depth, h = spec.height;
  const openW = doorOpeningWidth(spec);
  const openH = doorOpeningHeight(spec);
  return {
    ceiling: w * d * MM2_TO_M2,
    floor: w * d * MM2_TO_M2,
    'wall-left': d * h * MM2_TO_M2,
    'wall-right': d * h * MM2_TO_M2,
    'wall-rear': w * h * MM2_TO_M2,
    // 门套/前壁:前壁面积扣门洞
    'door-frame': Math.max(0, (w * h - openW * openH) * MM2_TO_M2),
  };
}

export interface QuoteResult {
  lines: QuoteLine[];
  totalAreaM2: number;
  totalWeightKg: number;
  totalPrice: number;
  leadDays: number;
  weightWarn: boolean;
  weightLimitKg: number;
  lampCount: number;
  suggestedLux: number;
}

export function buildQuote(project: Project): QuoteResult {
  const { spec, config } = project;
  const areas = surfaceAreas(spec);
  const lines: QuoteLine[] = [];
  let totalWeight = 0;
  let totalPrice = 0;
  let leadDays = 0;

  (Object.keys(areas) as SurfaceId[]).forEach((sid) => {
    const mat = MATERIALS[config.materials[sid]];
    const area = areas[sid];
    const weight = area * mat.unitWeight;
    const amount = area * mat.unitPrice;
    totalWeight += weight;
    totalPrice += amount;
    leadDays = Math.max(leadDays, mat.leadDays);
    lines.push({
      item: SURFACE_NAMES[sid],
      material: `${mat.name}(${mat.fireRating})`,
      areaM2: round2(area),
      weightKg: round2(weight),
      unitPrice: mat.unitPrice,
      amount: Math.round(amount),
    });
  });

  // 吊顶
  const ceil = CEILING_DEFS[config.ceilingType];
  const ceilArea = areas.ceiling;
  const ceilWeight = ceilArea * ceil.weightPerM2;
  const ceilPrice = ceil.basePrice + ceilArea * ceil.pricePerM2;
  totalWeight += ceilWeight;
  totalPrice += ceilPrice;
  leadDays = Math.max(leadDays, ceil.leadDays);
  lines.push({
    item: `吊顶-${ceil.name}`,
    material: ceil.name,
    areaM2: round2(ceilArea),
    weightKg: round2(ceilWeight),
    unitPrice: ceil.pricePerM2,
    amount: Math.round(ceilPrice),
  });

  // 扶手
  if (config.handrail.enabled) {
    const lenM = config.handrail.length / 1000;
    const w = lenM * HANDRAIL_DEF.weightPerM;
    const p = lenM * HANDRAIL_DEF.pricePerM;
    totalWeight += w;
    totalPrice += p;
    leadDays = Math.max(leadDays, HANDRAIL_DEF.leadDays);
    lines.push({
      item: '扶手',
      material: HANDRAIL_DEF.name,
      areaM2: 0,
      weightKg: round2(w),
      unitPrice: HANDRAIL_DEF.pricePerM,
      amount: Math.round(p),
    });
  }

  const totalArea = lines.reduce((s, l) => s + l.areaM2, 0);
  const weightLimit = spec.load * WEIGHT_WARN_RATIO;

  // 灯具数量与照度建议
  const lampCount =
    config.ceilingType === 'luminous'
      ? 0 // 发光顶整体发光,不计筒灯
      : Math.max(2, Math.ceil(ceilArea * ceil.lampsPerM2));
  const suggestedLux = RECOMMENDED_LUX[spec.carType] ?? 120;

  return {
    lines,
    totalAreaM2: round2(totalArea),
    totalWeightKg: round2(totalWeight),
    totalPrice: Math.round(totalPrice),
    leadDays: leadDays + BASE_LEAD_DAYS,
    weightWarn: totalWeight > weightLimit,
    weightLimitKg: round2(weightLimit),
    lampCount,
    suggestedLux,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
