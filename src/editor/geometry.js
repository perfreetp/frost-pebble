// 旋转矩形 / 碰撞 / 吸附等几何工具（单位：米，角度：弧度）
import { areaSize, pathRects, plotRect } from '../data/cemetery.js'

export function objCorners(o) {
  const rot = o.rot || 0
  const cos = Math.cos(rot), sin = Math.sin(rot)
  const hw = o.w / 2, hh = o.h / 2
  return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([px, py]) => ({
    x: o.x + px * cos - py * sin,
    y: o.y + px * sin + py * cos
  }))
}

function project(pts, ax, ay) {
  let min = Infinity, max = -Infinity
  for (const p of pts) {
    const d = p.x * ax + p.y * ay
    if (d < min) min = d
    if (d > max) max = d
  }
  return [min, max]
}

// 旋转矩形(OBB) 与 轴对齐矩形(AABB) 的 SAT 相交检测
export function obbIntersectsAabb(o, rect) {
  const c = objCorners(o)
  const rc = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.w, y: rect.y },
    { x: rect.x + rect.w, y: rect.y + rect.h },
    { x: rect.x, y: rect.y + rect.h }
  ]
  const rot = o.rot || 0
  const cos = Math.cos(rot), sin = Math.sin(rot)
  const axes = [[cos, sin], [-sin, cos], [1, 0], [0, 1]]
  for (const [ax, ay] of axes) {
    const [a1, a2] = project(c, ax, ay)
    const [b1, b2] = project(rc, ax, ay)
    if (a2 <= b1 || b2 <= a1) return false
  }
  return true
}

export function pointInObj(o, px, py) {
  const rot = o.rot || 0
  const cos = Math.cos(rot), sin = Math.sin(rot)
  const dx = px - o.x, dy = py - o.y
  const lx = dx * cos + dy * sin
  const ly = -dx * sin + dy * cos
  return Math.abs(lx) <= o.w / 2 && Math.abs(ly) <= o.h / 2
}

// 碰撞检测：越出墓区边界 / 压占他人墓位 / 堵住通道
// ownPlot = { r, c } 本工单墓位（允许覆盖）
export function checkCollision(obj, area, ownPlot) {
  const cs = objCorners(obj)
  const minX = Math.min(...cs.map(p => p.x))
  const maxX = Math.max(...cs.map(p => p.x))
  const minY = Math.min(...cs.map(p => p.y))
  const maxY = Math.max(...cs.map(p => p.y))
  const { w: aw, h: ah } = areaSize(area)
  if (minX < 0 || minY < 0 || maxX > aw || maxY > ah) return '越出墓区边界'
  for (const pr of pathRects(area)) {
    if (obbIntersectsAabb(obj, pr)) return '堵住通道'
  }
  for (let r = 0; r < area.rows; r++) {
    for (let c = 0; c < area.cols; c++) {
      if (ownPlot && r === ownPlot.r && c === ownPlot.c) continue
      const rect = plotRect(area, r, c)
      // AABB 粗筛
      if (rect.x > maxX || rect.x + rect.w < minX || rect.y > maxY || rect.y + rect.h < minY) continue
      if (obbIntersectsAabb(obj, rect)) return `压占相邻墓位 ${r + 1}排${c + 1}号`
    }
  }
  return null
}

export function snap(v, g) {
  return Math.round(v / g) * g
}

// 角度吸附到 90° 的倍数（容差 tol 弧度内）
export function snapRightAngle(rot, tol = Math.PI / 18) {
  const q = Math.PI / 2
  const n = Math.round(rot / q) * q
  let diff = Math.abs(rot - n)
  diff = Math.min(diff, Math.PI * 2 - diff)
  return diff <= tol ? n : rot
}
