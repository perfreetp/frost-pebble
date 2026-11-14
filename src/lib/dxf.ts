import DxfParser from 'dxf-parser'
import type { Obstacle, ObstacleType, Point2, Roof, RoofPlane } from '../types'
import { uid } from './defaults'

interface RawEntity {
  /** dxf-parser 输出实体类型字符串，如 LWPOLYLINE / POLYLINE / LINE / CIRCLE */
  type: string
  layer?: string
  vertices?: { x: number; y: number; z?: number }[]
  x?: number
  y?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
  center?: { x: number; y: number }
  radius?: number
  shape?: boolean
  closed?: boolean
}

const LAYER_RULES: { type: ObstacleType; keywords: string[] }[] = [
  { type: 'parapet', keywords: ['女儿墙', 'parapet'] },
  { type: 'skylight', keywords: ['天窗', 'skylight', '采光'] },
  { type: 'fan', keywords: ['风机', 'fan', '风帽'] },
  { type: 'shaft', keywords: ['排烟', 'shaft', '烟道', '井'] },
]

function matchObstacle(layer: string): ObstacleType | 'outline' | null {
  const name = layer.toLowerCase()
  if (['屋面', '屋顶', 'roof', 'outline', '轮廓'].some((k) => name.includes(k.toLowerCase()))) {
    return 'outline'
  }
  for (const rule of LAYER_RULES) {
    if (rule.keywords.some((k) => name.includes(k.toLowerCase()))) return rule.type
  }
  return null
}

function entityPolygon(e: RawEntity): Point2[] | null {
  if ((e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.vertices && e.vertices.length >= 2) {
    return e.vertices.map((p) => ({ x: p.x, y: p.y }))
  }
  if (e.type === 'LINE' && e.x1 !== undefined && e.y1 !== undefined) {
    // LINE，调用方按图层聚合
    return [{ x: e.x1, y: e.y1 as number }, { x: e.x2 as number, y: e.y2 as number }]
  }
  if (e.type === 'CIRCLE' && e.center && e.radius) {
    // CIRCLE → 16 边形近似
    const pts: Point2[] = []
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      pts.push({
        x: e.center.x + e.radius * Math.cos(a),
        y: e.center.y + e.radius * Math.sin(a),
      })
    }
    return pts
  }
  return null
}

/** 把断线按端点拼接成闭合环 */
function joinSegments(segs: Point2[][]): Point2[][] {
  const remaining = segs.map((s) => s.map((p) => ({ ...p })))
  const rings: Point2[][] = []
  const tol = 1e-4
  while (remaining.length) {
    const ring = remaining.pop()!
    let changed = true
    while (changed) {
      changed = false
      for (let i = remaining.length - 1; i >= 0; i--) {
        const seg = remaining[i]
        const head = ring[0]
        const tail = ring[ring.length - 1]
        const s0 = seg[0]
        const s1 = seg[seg.length - 1]
        if (Math.hypot(tail.x - s0.x, tail.y - s0.y) < tol) {
          ring.push(...seg.slice(1))
          remaining.splice(i, 1)
          changed = true
        } else if (Math.hypot(tail.x - s1.x, tail.y - s1.y) < tol) {
          ring.push(...[...seg].reverse().slice(1))
          remaining.splice(i, 1)
          changed = true
        } else if (Math.hypot(head.x - s1.x, head.y - s1.y) < tol) {
          ring.unshift(...seg.slice(0, -1))
          remaining.splice(i, 1)
          changed = true
        } else if (Math.hypot(head.x - s0.x, head.y - s0.y) < tol) {
          ring.unshift(...[...seg].reverse().slice(0, -1))
          remaining.splice(i, 1)
          changed = true
        }
      }
    }
    if (ring.length >= 3) rings.push(ring)
  }
  return rings
}

export interface ImportResult {
  roof: Roof
  /** 未识别图层名，提示用户在界面上手工指定 */
  unknownLayers: string[]
}

export function parseDxf(name: string, text: string): ImportResult {
  const parser = new DxfParser()
  const dxf = parser.parseSync(text)
  if (!dxf || !dxf.entities) throw new Error('DXF 解析失败：文件为空或格式不受支持')

  const entities = dxf.entities as unknown as RawEntity[]
  const outlinePolys: Point2[][] = []
  const obstaclePolys = new Map<ObstacleType, Point2[][]>()
  const lineSegs = new Map<string, Point2[][]>()
  const unknownLayers = new Set<string>()

  for (const e of entities) {
    const layer = e.layer ?? '0'
    const kind = matchObstacle(layer)
    if (!kind) {
      if (layer !== '0') unknownLayers.add(layer)
      continue
    }
    const poly = entityPolygon(e)
    if (!poly) continue
    if (poly.length === 2) {
      if (!lineSegs.has(layer)) lineSegs.set(layer, [])
      lineSegs.get(layer)!.push(poly)
    } else if (kind === 'outline') {
      outlinePolys.push(poly)
    } else {
      if (!obstaclePolys.has(kind)) obstaclePolys.set(kind, [])
      obstaclePolys.get(kind)!.push(poly)
    }
  }

  // 线段拼成环后再归类
  for (const [layer, segs] of lineSegs) {
    const kind = matchObstacle(layer)
    if (!kind) continue
    for (const ring of joinSegments(segs)) {
      if (kind === 'outline') outlinePolys.push(ring)
      else {
        if (!obstaclePolys.has(kind)) obstaclePolys.set(kind, [])
        obstaclePolys.get(kind)!.push(ring)
      }
    }
  }

  if (!outlinePolys.length) throw new Error('未找到屋面轮廓：请将轮廓放在名称含“屋面/roof”的图层')

  // 单位推断：包围盒 > 1000 视为毫米
  const all = outlinePolys.flat()
  const maxCoord = Math.max(...all.map((p) => Math.abs(p.x)), ...all.map((p) => Math.abs(p.y)))
  const unitScale = maxCoord > 1000 ? 0.001 : 1

  const norm = (poly: Point2[]): Point2[] => poly.map((p) => ({ x: p.x * unitScale, y: p.y * unitScale }))

  // 取面积最大的环作主轮廓
  const area = (poly: Point2[]) => {
    let a = 0
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i]
      const q = poly[(i + 1) % poly.length]
      a += p.x * q.y - q.x * p.y
    }
    return Math.abs(a) / 2
  }
  const outline = norm(outlinePolys.sort((a, b) => area(b) - area(a))[0])

  const minX = Math.min(...outline.map((p) => p.x))
  const minY = Math.min(...outline.map((p) => p.y))
  const shifted = (poly: Point2[]) => poly.map((p) => ({ x: p.x - minX, y: p.y - minY }))

  const obstacles: Obstacle[] = []
  const heightGuess: Record<ObstacleType, number> = {
    parapet: 1.2,
    skylight: 0.6,
    fan: 0.8,
    shaft: 1.5,
  }
  for (const [type, polys] of obstaclePolys) {
    polys.forEach((poly, idx) => {
      obstacles.push({
        id: uid('ob'),
        type,
        polygon: shifted(norm(poly)),
        height: heightGuess[type],
        name: `${idx + 1}`,
      })
    })
  }

  const hasParapet = obstacles.some((o) => o.type === 'parapet')
  const plane: RoofPlane = {
    id: uid('pl'),
    name: '主屋面',
    outline: shifted(outline),
    slopeDeg: 0,
    aspectDeg: 180,
    parapetHeight: hasParapet ? 0 : 1.1,
    obstacles,
  }

  const roof: Roof = {
    id: uid('roof'),
    name,
    origin: { x: 0, y: 0, z: 0 },
    planes: [plane],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  return { roof, unknownLayers: [...unknownLayers] }
}
