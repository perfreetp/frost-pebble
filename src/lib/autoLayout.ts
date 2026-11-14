import type { PlacedPanel, PVModule, Roof, RoofPlane, SchemeSettings } from '../types'
import { uid } from './defaults'
import { bbox, pointInPolygon, rectIntersectsPolygon, rectToPolygonEdgeDist } from './geometry'

export interface AutoLayoutResult {
  panels: PlacedPanel[]
  placed: number
  /** 被跳过的格位数与原因统计 */
  skipped: { reason: string; count: number }[]
}

/**
 * 网格自动排布：从屋面 bbox 左下角起按间距铺格，逐格做合法性检查，
 * 不合法就跳过（绝不硬塞），并汇总跳过原因。
 */
export function autoLayoutPlane(
  plane: RoofPlane,
  module: PVModule,
  settings: SchemeSettings,
  rotationDeg = 0,
): AutoLayoutResult {
  const panels: PlacedPanel[] = []
  const skippedMap = new Map<string, number>()
  const skip = (reason: string) => skippedMap.set(reason, (skippedMap.get(reason) ?? 0) + 1)

  const alongU = rotationDeg % 180 === 0
  const sizeU = alongU ? module.length : module.width
  const sizeV = alongU ? module.width : module.length
  const halfU = sizeU / 2
  const halfV = sizeV / 2
  const stepU = sizeU + settings.gapX
  const stepV = sizeV + settings.gapY

  const box = bbox(plane.outline)
  const margin = settings.safetyMargin

  let v = box.minY + margin + halfV
  while (v + halfV <= box.maxY - margin + 1e-9) {
    let u = box.minX + margin + halfU
    while (u + halfU <= box.maxX - margin + 1e-9) {
      const center = { x: u, y: v }
      let valid = true

      // 四角在轮廓内 + 退女儿墙
      const corners = [
        { x: u - halfU, y: v - halfV },
        { x: u + halfU, y: v - halfV },
        { x: u + halfU, y: v + halfV },
        { x: u - halfU, y: v + halfV },
      ]
      if (!corners.every((c) => pointInPolygon(c, plane.outline))) {
        skip('超出屋面轮廓')
        valid = false
      } else if (
        plane.parapetHeight > 0 &&
        rectToPolygonEdgeDist(center, halfU, halfV, rotationDeg, plane.outline) < margin
      ) {
        skip('女儿墙安全退距不足')
        valid = false
      }

      if (valid) {
        for (const ob of plane.obstacles) {
          if (rectIntersectsPolygon(center, halfU, halfV, rotationDeg, ob.polygon)) {
            skip(`碰撞${ob.type === 'skylight' ? '天窗' : ob.type === 'fan' ? '风机基础' : ob.type === 'parapet' ? '女儿墙' : '排烟井'}`)
            valid = false
            break
          }
          if (rectToPolygonEdgeDist(center, halfU, halfV, rotationDeg, ob.polygon) < margin) {
            skip('禁布区安全退距不足')
            valid = false
            break
          }
        }
      }

      if (valid) {
        panels.push({
          id: uid('pn'),
          moduleId: module.id,
          planeId: plane.id,
          u,
          v,
          rotationDeg,
        })
      }
      u += stepU
    }
    v += stepV
  }

  return {
    panels,
    placed: panels.length,
    skipped: [...skippedMap.entries()].map(([reason, count]) => ({ reason, count })),
  }
}

/** 框选：返回矩形范围内的组件 id（局部坐标矩形） */
export function panelsInRect(
  panels: PlacedPanel[],
  rect: { minU: number; minV: number; maxU: number; maxV: number },
): string[] {
  return panels
    .filter(
      (p) =>
        p.u >= rect.minU && p.u <= rect.maxU && p.v >= rect.minV && p.v <= rect.maxV,
    )
    .map((p) => p.id)
}

/**
 * 批量复制：按给定偏移复制组件；冲突（与既有组件重叠或出屋面/入禁布区）的不复制，
 * 返回新组件与被拒绝数量。
 */
export function duplicatePanels(
  source: PlacedPanel[],
  delta: { du: number; dv: number },
  existing: PlacedPanel[],
  plane: RoofPlane,
  settings: SchemeSettings,
  modules: PVModule[],
): { created: PlacedPanel[]; rejected: number } {
  const created: PlacedPanel[] = []
  let rejected = 0
  const margin = settings.safetyMargin
  const modMap = new Map(modules.map((m) => [m.id, m]))

  for (const p of source) {
    const mod = modMap.get(p.moduleId)
    if (!mod) {
      rejected += 1
      continue
    }
    const np: PlacedPanel = {
      ...p,
      id: uid('pn'),
      u: p.u + delta.du,
      v: p.v + delta.dv,
    }
    const alongU = np.rotationDeg % 180 === 0
    const halfU = (alongU ? mod.length : mod.width) / 2
    const halfV = (alongU ? mod.width : mod.length) / 2
    const center = { x: np.u, y: np.v }
    const corners = [
      { x: np.u - halfU, y: np.v - halfV },
      { x: np.u + halfU, y: np.v - halfV },
      { x: np.u + halfU, y: np.v + halfV },
      { x: np.u - halfU, y: np.v + halfV },
    ]
    const inside = corners.every((c) => pointInPolygon(c, plane.outline))
    const hitObstacle = plane.obstacles.some(
      (ob) =>
        rectIntersectsPolygon(center, halfU, halfV, 0, ob.polygon) ||
        rectToPolygonEdgeDist(center, halfU, halfV, 0, ob.polygon) < margin,
    )
    const overlap = [...existing, ...created].some((q) => {
      if (q.planeId !== np.planeId) return false
      const qm = modMap.get(q.moduleId)
      if (!qm) return false
      const qAlongU = q.rotationDeg % 180 === 0
      const qHalfU = (qAlongU ? qm.length : qm.width) / 2
      const qHalfV = (qAlongU ? qm.width : qm.length) / 2
      // 两轴中心距均小于半宽之和即重叠（横平竖直矩形）
      return Math.abs(q.u - np.u) < qHalfU + halfU - 1e-6 &&
        Math.abs(q.v - np.v) < qHalfV + halfV - 1e-6
    })
    if (inside && !hitObstacle && !overlap) created.push(np)
    else rejected += 1
  }
  return { created, rejected }
}
