import type { CeilingType, MaterialDef, MaterialId } from '../types';

/** 材质目录:防火等级 / 单方重量 / 单价 / 供货周期 */
export const MATERIALS: Record<MaterialId, MaterialDef> = {
  'ss-brushed': {
    id: 'ss-brushed',
    name: '拉丝不锈钢',
    fireRating: 'A1 不燃',
    unitWeight: 8.0,   // 1.0mm 304 复合
    unitPrice: 680,
    leadDays: 12,
  },
  wood: {
    id: 'wood',
    name: '木饰面',
    fireRating: 'B1 难燃',
    unitWeight: 9.5,   // 含阻燃基层
    unitPrice: 520,
    leadDays: 18,
  },
  rock: {
    id: 'rock',
    name: '岩板',
    fireRating: 'A1 不燃',
    unitWeight: 14.0,  // 薄板复合铝蜂窝
    unitPrice: 880,
    leadDays: 25,
  },
};

export const MATERIAL_LIST: MaterialDef[] = Object.values(MATERIALS);

/** 吊顶参数:基础价 + 单方价 + 单方重量 + 单位面积灯具数(盏/m²) + 供货周期 */
export const CEILING_DEFS: Record<
  CeilingType,
  { name: string; basePrice: number; pricePerM2: number; weightPerM2: number; lampsPerM2: number; leadDays: number }
> = {
  flat:     { name: '平板吊顶', basePrice: 1500, pricePerM2: 120, weightPerM2: 8,  lampsPerM2: 0.8, leadDays: 10 },
  luminous: { name: '发光顶',   basePrice: 3800, pricePerM2: 260, weightPerM2: 12, lampsPerM2: 0,   leadDays: 15 },
  grille:   { name: '格栅吊顶', basePrice: 2200, pricePerM2: 180, weightPerM2: 6,  lampsPerM2: 0.6, leadDays: 12 },
};

/** 扶手:元/m、kg/m */
export const HANDRAIL_DEF = { name: '不锈钢圆管扶手', pricePerM: 180, weightPerM: 2.5, leadDays: 8 };

/** 操纵箱(标配项,仅用于占位与冲突校验) */
export const COP_DEF = { width: 260, height: 1100, depth: 60, bottom: 900 };

/** 扶手直径/占位 */
export const HANDRAIL_DEF_GEOM = { radius: 19, standoff: 60 };

/** 基础生产周期(天),与最长供货周期取加和上限 */
export const BASE_LEAD_DAYS = 15;

/** 增重告警阈值:额定载重比例 */
export const WEIGHT_WARN_RATIO = 0.05;

/** 建议照度(lx)按梯型 */
export const RECOMMENDED_LUX: Record<string, number> = {
  passenger: 150,
  freight: 100,
  home: 120,
};
