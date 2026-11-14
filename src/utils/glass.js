// 玻璃配置与板块计算规则
export const GLASS_CONFIGS = [
  { id: '6+12A+6', label: '6+12A+6 中空钢化', kgPerM2: 30 },
  { id: '8+12A+8', label: '8+12A+8 中空钢化', kgPerM2: 40 },
  { id: '10+12A+10', label: '10+12A+10 中空钢化', kgPerM2: 50 },
  { id: '6+1.14PVB+6', label: '6+1.14PVB+6 夹胶钢化', kgPerM2: 30 },
  { id: '8+1.52PVB+8', label: '8+1.52PVB+8 夹胶钢化', kgPerM2: 40 }
]

export const MAX_WEIGHT_KG = 120
export const MAX_SIDE_M = 2.4

export function configById(id) {
  return GLASS_CONFIGS.find(c => c.id === id) || GLASS_CONFIGS[0]
}

// 单块重量(kg) = 面积(m²) × 面密度
export function calcWeight(panel) {
  const cfg = configById(panel.config)
  return Math.round(panel.w * panel.h * cfg.kgPerM2 * 10) / 10
}

// 超限判定:重量>120kg 或 任一边长>2.4m
export function isViolation(panel) {
  const w = panel.weight ?? calcWeight(panel)
  return w > MAX_WEIGHT_KG || Math.max(panel.w, panel.h) > MAX_SIDE_M
}

export function violationReason(panel) {
  const reasons = []
  const w = panel.weight ?? calcWeight(panel)
  if (w > MAX_WEIGHT_KG) reasons.push(`重量 ${w}kg 超过 ${MAX_WEIGHT_KG}kg`)
  if (Math.max(panel.w, panel.h) > MAX_SIDE_M) {
    reasons.push(`边长 ${Math.max(panel.w, panel.h).toFixed(2)}m 超过 ${MAX_SIDE_M}m`)
  }
  return reasons.join(';')
}

export function mm(m) {
  return Math.round(m * 1000)
}
