import type { Point2, RoofPlane } from '../types'

// ---------- 基础向量 ----------
export const v = (x: number, y: number): Point2 => ({ x, y })
export const add = (a: Point2, b: Point2): Point2 => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Point2, b: Point2): Point2 => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Point2, s: number): Point2 => ({ x: a.x * s, y: a.y * s })
export const cross = (a: Point2, b: Point2): number => a.x * b.y - a.y * b.x
export const dot = (a: Point2, b: Point2): number => a.x * b.x + a.y * b.y
export const len = (a: Point2): number => Math.hypot(a.x, a.y)
export const dist = (a: Point2, b: Point2): number => len(sub(a, b))

export function rot(p: Point2, deg: number): Point2 {
  const r = (deg * Math.PI) / 180
  const c = Math.cos(r)
  const s = Math.sin(r)
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }
}

const EPS = 1e-9

/** 多边形有向面积（正=逆时针） */
export function polygonArea(poly: Point2[]): number {
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

export function polygonCentroid(poly: Point2[]): Point2 {
  let cx = 0
  let cy = 0
  let a = 0
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]
    const q = poly[(i + 1) % poly.length]
    const f = p.x * q.y - q.x * p.y
    a += f
    cx += (p.x + q.x) * f
    cy += (p.y + q.y) * f
  }
  a /= 2
  if (Math.abs(a) < EPS) return poly[0]
  return { x: cx / (6 * a), y: cy / (6 * a) }
}

/** 点是否在多边形内（含边界） */
export function pointInPolygon(p: Point2, poly: Point2[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const pi = poly[i]
    const pj = poly[j]
    const intersect =
      pi.y > p.y !== pj.y > p.y &&
      p.x < ((pj.x - pi.x) * (p.y - pi.y)) / (pj.y - pi.y) + pi.x
    if (intersect) inside = !inside
  }
  return inside
}

/** 点到线段距离 */
export function pointSegDist(p: Point2, a: Point2, b: Point2): number {
  const ab = sub(b, a)
  const l2 = dot(ab, ab)
  if (l2 < EPS) return dist(p, a)
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2))
  return dist(p, add(a, scale(ab, t)))
}

/** 点到多边形边界的最小距离（内部为正、外部为负的判定由调用方结合 pointInPolygon） */
export function pointToPolygonEdge(p: Point2, poly: Point2[]): number {
  let d = Infinity
  for (let i = 0; i < poly.length; i++) {
    d = Math.min(d, pointSegDist(p, poly[i], poly[(i + 1) % poly.length]))
  }
  return d
}

/** 线段是否与多边形相交（含端点接触） */
export function segIntersectsPolygon(a: Point2, b: Point2, poly: Point2[]): boolean {
  if (pointInPolygon(a, poly) || pointInPolygon(b, poly)) return true
  for (let i = 0; i < poly.length; i++) {
    const c = poly[i]
    const d = poly[(i + 1) % poly.length]
    if (segmentsIntersect(a, b, c, d)) return true
  }
  return false
}

function segmentsIntersect(p1: Point2, p2: Point2, p3: Point2, p4: Point2): boolean {
  const d1 = cross(sub(p4, p3), sub(p1, p3))
  const d2 = cross(sub(p4, p3), sub(p2, p3))
  const d3 = cross(sub(p2, p1), sub(p3, p1))
  const d4 = cross(sub(p2, p1), sub(p4, p1))
  return ((d1 > EPS && d2 < -EPS) || (d1 < -EPS && d2 > EPS)) &&
    ((d3 > EPS && d4 < -EPS) || (d3 < -EPS && d4 > EPS))
}

/** 矩形（中心 + 半尺寸 + 旋转角）四角点 */
export function rectCorners(
  center: Point2,
  halfL: number,
  halfW: number,
  rotationDeg: number,
): Point2[] {
  const local = [
    { x: -halfL, y: -halfW },
    { x: halfL, y: -halfW },
    { x: halfL, y: halfW },
    { x: -halfL, y: halfW },
  ]
  return local.map((p) => add(rot(p, rotationDeg), center))
}

/** 凸/凹多边形是否与矩形相交（SAT 不够通用，用采样+边相交近似精确判定） */
export function rectIntersectsPolygon(
  center: Point2,
  halfL: number,
  halfW: number,
  rotationDeg: number,
  poly: Point2[],
): boolean {
  const corners = rectCorners(center, halfL, halfW, rotationDeg)
  // 矩形任一角在多边形内
  if (corners.some((c) => pointInPolygon(c, poly))) return true
  // 多边形任一点在矩形内（矩形当作多边形处理）
  if (poly.some((p) => pointInPolygon(p, corners))) return true
  // 边相交
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % corners.length]
    for (let j = 0; j < poly.length; j++) {
      if (segmentsIntersect(a, b, poly[j], poly[(j + 1) % poly.length])) return true
    }
  }
  return false
}

/** 矩形中心到多边形边界的最小距离 */
export function rectToPolygonEdgeDist(
  center: Point2,
  halfL: number,
  halfW: number,
  rotationDeg: number,
  poly: Point2[],
): number {
  const corners = rectCorners(center, halfL, halfW, rotationDeg)
  let d = Infinity
  for (const c of corners) d = Math.min(d, pointToPolygonEdge(c, poly))
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % corners.length]
    for (let j = 0; j < poly.length; j++) {
      d = Math.min(d, pointSegDist(poly[j], a, b))
    }
  }
  return d
}

/** 多边形外扩/内缩 margin（仅支持凸多边形的简单法向偏移，屋面轮廓按凸包处理足够） */
export function offsetPolygon(poly: Point2[], margin: number): Point2[] {
  if (Math.abs(margin) < EPS) return poly.map((p) => ({ ...p }))
  const c = polygonCentroid(poly)
  return poly.map((p) => {
    const dir = sub(p, c)
    const l = len(dir)
    if (l < EPS) return p
    return add(p, scale(dir, margin / l))
  })
}

// ---------- 屋面局部坐标 → 世界坐标（贴坡） ----------
export interface WorldPoint {
  x: number
  y: number
  z: number
}

/**
 * 屋面平面映射：局部 (u, v) → 世界 (x, y, z)
 * 坡度沿 v 方向抬升；坡向 aspectDeg 为 +v 轴的世界方位角（南=180，顺时针，北=0）
 */
export function planeToWorld(plane: RoofPlane, u: number, v: number): WorldPoint {
  const slope = (plane.slopeDeg * Math.PI) / 180
  const aspect = (plane.aspectDeg * Math.PI) / 180
  // +v 的水平投影方向
  const dx = Math.sin(aspect)
  const dy = -Math.cos(aspect)
  const horizontal = v * Math.cos(slope)
  const z = v * Math.sin(slope)
  return {
    x: u * 1 + dx * horizontal,
    y: 0 + dy * horizontal,
    z,
  }
}

/** 世界方位角差（归一化到 0~180） */
export function angleDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360
  if (d > 180) d = 360 - d
  return d
}

// ---------- 阴影间距 ----------
/**
 * 冬至日指定时刻太阳高度角/方位角
 * @param latitudeDeg 纬度
 * @param hour 真太阳时（小时）
 */
export function solarPosition(
  latitudeDeg: number,
  hour: number,
): { altitudeDeg: number; azimuthDeg: number } {
  const phi = (latitudeDeg * Math.PI) / 180
  const decl = -23.45 * (Math.PI / 180) // 冬至赤纬
  const omega = ((hour - 12) * 15 * Math.PI) / 180
  const sinAlt = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(omega)
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)))
  const cosAlt = Math.cos(altitude)
  // 太阳方向的东、北分量
  const east = -Math.cos(decl) * Math.sin(omega)
  const north = Math.sin(decl) * Math.cos(phi) - Math.cos(decl) * Math.cos(omega) * Math.sin(phi)
  // 北=0、顺时针方位角（东=90、南=180、西=270）
  const azNorth = (Math.atan2(east, north) + 2 * Math.PI) % (2 * Math.PI)
  return { altitudeDeg: (altitude * 180) / Math.PI, azimuthDeg: (azNorth * 180) / Math.PI }
}

/**
 * 前后排阴影间距 D = H / tan(h) * cos(γ) + 安全余量
 * H = 前排遮挡高度（板宽 * sin(支架倾角) + 支架离地）
 * @returns 推荐前后排中心线净距 m（纵向 gapY 校核基准）
 */
export function requiredRowSpacing(
  moduleWidth: number,
  tiltDeg: number,
  latitudeDeg: number,
  hour: number,
  clearance = 0.3,
): number {
  const { altitudeDeg, azimuthDeg } = solarPosition(latitudeDeg, hour)
  const h = (altitudeDeg * Math.PI) / 180
  // 组件朝向正南（方位 180），太阳与正南的方位夹角
  const gamma = ((angleDiff(azimuthDeg, 180) * Math.PI) / 180)
  const H = moduleWidth * Math.sin((tiltDeg * Math.PI) / 180) + clearance
  // cos(γ) 为负时表示阳光从组件侧后方来、不产生前后排遮挡，间距取下限 0
  const cosGamma = Math.max(0, Math.cos(gamma))
  return Math.max(0, (H / Math.tan(h)) * cosGamma)
}

// ---------- 网格吸附 ----------
export interface SnapGrid {
  /** u 方向步进（组件长 + 横向净距） */
  stepU: number
  /** v 方向步进（组件宽 + 纵向净距） */
  stepV: number
}

export function snap(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function snapPoint(p: Point2, grid: SnapGrid): Point2 {
  return { x: snap(p.x, grid.stepU), y: snap(p.y, grid.stepV) }
}

/** 相对参考点吸附（保持既有排布的网格相位） */
export function snapToReference(value: number, step: number, ref: number): number {
  return ref + Math.round((value - ref) / step) * step
}

/** Bounding box */
export function bbox(poly: Point2[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of poly) {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  }
  return { minX, minY, maxX, maxY }
}
