import type {
  PanelIssue,
  PlacedPanel,
  PVModule,
  RoofPlane,
  Scheme,
  SchemeSettings,
  SchemeStats,
  StringInfo,
} from '../types'
import { OBSTACLE_LABEL } from '../types'
import {
  angleDiff,
  bbox,
  pointInPolygon,
  rectCorners,
  rectIntersectsPolygon,
  rectToPolygonEdgeDist,
  requiredRowSpacing,
} from './geometry'

const MODULE_MAP_CACHE = new Map<string, PVModule>()

export function setModuleCache(modules: PVModule[]): void {
  MODULE_MAP_CACHE.clear()
  modules.forEach((m) => MODULE_MAP_CACHE.set(m.id, m))
}

export function getModule(id: string): PVModule | undefined {
  return MODULE_MAP_CACHE.get(id)
}

function panelHalf(panel: PlacedPanel, mod: PVModule) {
  // rotation 0：长边沿 u
  const alongU = panel.rotationDeg % 180 === 0
  return {
    halfU: (alongU ? mod.length : mod.width) / 2,
    halfV: (alongU ? mod.width : mod.length) / 2,
  }
}

export function panelCorners(panel: PlacedPanel, mod: PVModule) {
  const { halfU, halfV } = panelHalf(panel, mod)
  return rectCorners({ x: panel.u, y: panel.v }, halfU, halfV, panel.rotationDeg)
}

/** 单个组件在指定屋面上的全部校核问题 */
export function checkPanel(
  panel: PlacedPanel,
  plane: RoofPlane,
  mod: PVModule,
  settings: SchemeSettings,
  allPanels: PlacedPanel[],
): PanelIssue[] {
  const issues: PanelIssue[] = []
  const { halfU, halfV } = panelHalf(panel, mod)
  const center = { x: panel.u, y: panel.v }
  const corners = rectCorners(center, halfU, halfV, panel.rotationDeg)

  // 1. 出屋面
  if (!corners.every((c) => pointInPolygon(c, plane.outline))) {
    issues.push({
      panelId: panel.id,
      level: 'red',
      code: 'out-of-roof',
      message: '组件超出屋面轮廓',
    })
  }

  // 2. 女儿墙：轮廓退距不足（压到女儿墙）
  if (plane.parapetHeight > 0) {
    const edge = rectToPolygonEdgeDist(center, halfU, halfV, panel.rotationDeg, plane.outline)
    if (edge < settings.safetyMargin) {
      issues.push({
        panelId: panel.id,
        level: 'red',
        code: 'parapet-margin',
        message: `距女儿墙 ${edge.toFixed(2)}m，小于安全退距 ${settings.safetyMargin}m`,
      })
    }
  }

  // 3. 障碍物（天窗/风机基础/排烟井 + 独立女儿墙段）碰撞与退距
  for (const ob of plane.obstacles) {
    if (rectIntersectsPolygon(center, halfU, halfV, panel.rotationDeg, ob.polygon)) {
      issues.push({
        panelId: panel.id,
        level: 'red',
        code: 'overlap-obstacle',
        message: `与${OBSTACLE_LABEL[ob.type]}${ob.name ?? ''}重叠`,
      })
    } else {
      const d = rectToPolygonEdgeDist(center, halfU, halfV, panel.rotationDeg, ob.polygon)
      if (d < settings.safetyMargin) {
        issues.push({
          panelId: panel.id,
          level: 'red',
          code: 'overlap-obstacle',
          message: `距${OBSTACLE_LABEL[ob.type]}${ob.name ?? ''} ${d.toFixed(2)}m，小于退距 ${settings.safetyMargin}m`,
        })
      }
    }
  }

  // 4. 朝向偏差：组件长边与屋面等坡线（u 轴）的夹角
  const orientErr = angleDiff(panel.rotationDeg, 0)
  if (orientErr > settings.orientationLimitDeg) {
    issues.push({
      panelId: panel.id,
      level: 'red',
      code: 'orientation',
      message: `朝向偏差 ${orientErr.toFixed(1)}°，超过限值 ${settings.orientationLimitDeg}°`,
    })
  }

  // 5. 前后排阴影：与正后方（-v 方向）最近同 u 带组件的净距
  const tilt = plane.slopeDeg > 0 ? plane.slopeDeg : settings.tiltDegOnFlat
  const need = requiredRowSpacing(
    mod.width,
    tilt,
    settings.latitudeDeg,
    settings.shadowHour,
  )
  const behind = allPanels
    .filter(
      (p) =>
        p.id !== panel.id &&
        p.planeId === panel.planeId &&
        p.moduleId === panel.moduleId &&
        p.rotationDeg === panel.rotationDeg &&
        p.v < panel.v - halfV &&
        Math.abs(p.u - panel.u) <= halfU * 1.5,
    )
    .sort((a, b) => b.v - a.v)[0]
  if (behind) {
    const behindMod = getModule(behind.moduleId) ?? mod
    const behindHalfV = panelHalf(behind, behindMod).halfV
    const clearance = panel.v - halfV - (behind.v + behindHalfV)
    if (clearance + 1e-9 < need) {
      issues.push({
        panelId: panel.id,
        level: 'warn',
        code: 'shadow',
        message: `前后排净距 ${clearance.toFixed(2)}m，冬至${settings.shadowHour}:00 阴影间距需 ${need.toFixed(2)}m`,
      })
    }
  }

  // 6. 组件互相重叠
  for (const other of allPanels) {
    if (other.id >= panel.id || other.planeId !== panel.planeId) continue
    const om = getModule(other.moduleId)
    if (!om) continue
    const oh = panelHalf(other, om)
    if (
      rectIntersectsPolygon(
        { x: other.u, y: other.v },
        oh.halfU,
        oh.halfV,
        other.rotationDeg,
        corners,
      )
    ) {
      issues.push({
        panelId: panel.id,
        level: 'red',
        code: 'panel-overlap',
        message: '与相邻组件重叠',
      })
      break
    }
  }

  return issues
}

/** 组串划分：按屋面、按排（v 坐标）、排内按 u 排序顺序编号 */
export function buildStrings(
  panels: PlacedPanel[],
  modules: PVModule[],
  settings: SchemeSettings,
): StringInfo[] {
  const modMap = new Map(modules.map((m) => [m.id, m]))
  const byPlane = new Map<string, PlacedPanel[]>()
  for (const p of panels) {
    if (!byPlane.has(p.planeId)) byPlane.set(p.planeId, [])
    byPlane.get(p.planeId)!.push(p)
  }

  const strings: StringInfo[] = []
  let stringSeq = 1
  for (const [planeId, list] of byPlane) {
    // 排：v 坐标聚类（容差 0.2m）
    const sorted = [...list].sort((a, b) => a.v - b.v || a.u - b.u)
    const rows: PlacedPanel[][] = []
    for (const p of sorted) {
      const row = rows.find((r) => Math.abs(r[0].v - p.v) < 0.2)
      if (row) row.push(p)
      else rows.push([p])
    }
    for (const row of rows) {
      row.sort((a, b) => a.u - b.u)
      const target = settings.panelsPerString > 0 ? settings.panelsPerString : row.length
      for (let i = 0; i < row.length; i += target) {
        const chunk = row.slice(i, i + target)
        const powerW = chunk.reduce((s, p) => s + (modMap.get(p.moduleId)?.powerW ?? 0), 0)
        strings.push({
          id: `S${String(stringSeq).padStart(3, '0')}`,
          planeId,
          panelIds: chunk.map((p) => p.id),
          powerW,
        })
        stringSeq += 1
      }
    }
  }
  return strings
}

function polygonAreaM2(poly: { x: number; y: number }[]): number {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    a += p.x * q.y - q.x * p.y
  }
  return Math.abs(a) / 2
}

export function computeStats(
  scheme: Scheme,
  planes: RoofPlane[],
  modules: PVModule[],
): SchemeStats {
  setModuleCache(modules)
  const modMap = new Map(modules.map((m) => [m.id, m]))
  const planeMap = new Map(planes.map((p) => [p.id, p]))

  const issues: PanelIssue[] = []
  for (const panel of scheme.panels) {
    const plane = planeMap.get(panel.planeId)
    const mod = modMap.get(panel.moduleId)
    if (!plane || !mod) continue
    issues.push(...checkPanel(panel, plane, mod, scheme.settings, scheme.panels))
  }

  const strings = buildStrings(scheme.panels, modules, scheme.settings)

  const panelCount = scheme.panels.length
  const capacityKw =
    scheme.panels.reduce((s, p) => s + (modMap.get(p.moduleId)?.powerW ?? 0), 0) / 1000

  const panelAreaM2 = scheme.panels.reduce((s, p) => {
    const m = modMap.get(p.moduleId)
    return s + (m ? m.length * m.width : 0)
  }, 0)

  const roofAreaM2 = planes.reduce((s, pl) => s + polygonAreaM2(pl.outline), 0)
  const utilization = roofAreaM2 > 0 ? panelAreaM2 / roofAreaM2 : 0

  const firstYearKwh = capacityKw * scheme.settings.fullLoadHours
  const years = 25
  let totalKwh = 0
  for (let y = 0; y < years; y++) {
    totalKwh += firstYearKwh * Math.pow(1 - scheme.settings.annualDegrade, y)
  }
  const totalIncome = totalKwh * scheme.settings.tariff
  const totalCost = capacityKw * 1000 * scheme.settings.costPerWp
  const annualIncome = firstYearKwh * scheme.settings.tariff
  const payback = annualIncome > 0 ? totalCost / annualIncome : Infinity

  return {
    panelCount,
    capacityKw,
    roofAreaM2,
    panelAreaM2,
    utilization,
    strings,
    issues,
    redCount: issues.filter((i) => i.level === 'red').length,
    warnCount: issues.filter((i) => i.level === 'warn').length,
    firstYearKwh,
    total25YKwh: totalKwh,
    total25YIncome: totalIncome,
    totalCost,
    paybackYears: payback,
  }
}

/** 自动排布前的容量试算：给定屋面可布区域，估算最多能放几块 */
export function estimateCapacity(
  plane: RoofPlane,
  mod: PVModule,
  settings: SchemeSettings,
): { maxRows: number; maxCols: number; total: number } {
  const box = bbox(plane.outline)
  const stepU = mod.length + settings.gapX
  const stepV = mod.width + settings.gapY
  const maxCols = Math.max(0, Math.floor((box.maxX - box.minX - 2 * settings.safetyMargin) / stepU) + 1)
  const maxRows = Math.max(0, Math.floor((box.maxY - box.minY - 2 * settings.safetyMargin) / stepV) + 1)
  return { maxRows, maxCols, total: maxRows * maxCols }
}
