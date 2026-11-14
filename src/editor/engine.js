// Canvas 渲染引擎：底图层 / 物件层 / 标注层，优先使用 OffscreenCanvas
import { plotRect, areaSize, pathRects, GRID } from '../data/cemetery.js'
import { objCorners } from './geometry.js'

export function createLayer(w, h) {
  let c
  if (typeof OffscreenCanvas !== 'undefined') {
    c = new OffscreenCanvas(w, h)
  } else {
    c = document.createElement('canvas')
    c.width = w
    c.height = h
  }
  return c
}

export const OBJ_DEFS = {
  stele:   { name: '墓碑', color: '#7d8590', border: '#4c525a' },
  railing: { name: '石栏', color: '#b3a88f', border: '#7e7458', w: 1.2, h: 0.15 },
  plant:   { name: '绿植', color: '#5a9a52', border: '#35652f', w: 0.4, h: 0.4 },
  table:   { name: '供桌', color: '#b08968', border: '#7a5636', w: 0.6, h: 0.4 }
}

// 调用前由外层把 transform 设好（世界坐标，单位米）
export function drawBase(ctx, area, opts) {
  const { scale, occupied, ownPlot, taken } = opts
  const { w: aw, h: ah } = areaSize(area)

  ctx.fillStyle = '#e9ecdf'
  ctx.fillRect(0, 0, aw, ah)

  // 30cm 网格（过密时省略）
  if (GRID * scale >= 5) {
    ctx.strokeStyle = 'rgba(120,125,100,0.12)'
    ctx.lineWidth = 1 / scale
    ctx.beginPath()
    for (let x = 0; x <= aw + 1e-6; x += GRID) { ctx.moveTo(x, 0); ctx.lineTo(x, ah) }
    for (let y = 0; y <= ah + 1e-6; y += GRID) { ctx.moveTo(0, y); ctx.lineTo(aw, y) }
    ctx.stroke()
  }

  // 通道
  ctx.fillStyle = '#d3ccb9'
  for (const pr of pathRects(area)) ctx.fillRect(pr.x, pr.y, pr.w, pr.h)

  // 墓位
  const showLabel = area.plotW * scale > 42
  for (let r = 0; r < area.rows; r++) {
    for (let c = 0; c < area.cols; c++) {
      const rect = plotRect(area, r, c)
      const key = r + ',' + c
      const isOwn = ownPlot && ownPlot.r === r && ownPlot.c === c
      const isOcc = occupied.has(key)
      const isTaken = taken && taken.has(key)
      if (isOwn) {
        ctx.fillStyle = '#e2f2cf'
      } else if (isTaken) {
        ctx.fillStyle = '#e4d9c8'
      } else if (isOcc) {
        ctx.fillStyle = '#dcd9d2'
      } else {
        ctx.fillStyle = '#f6f4ea'
      }
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
      ctx.strokeStyle = isOwn ? '#4e9a3e' : '#b9b29a'
      ctx.lineWidth = (isOwn ? 2.5 : 1) / scale
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)

      if (isOcc && !isOwn) {
        // 已有墓：画一个灰色小碑
        ctx.fillStyle = '#9a978e'
        ctx.fillRect(rect.x + rect.w * 0.3, rect.y + 0.12, rect.w * 0.4, 0.16)
      }
      if (showLabel) {
        ctx.fillStyle = isOwn ? '#2f6b24' : '#8a8574'
        ctx.font = `${11 / scale}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${r + 1}-${c + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2)
      }
    }
  }

  // 边界
  ctx.strokeStyle = '#6b6a5e'
  ctx.lineWidth = 2 / scale
  ctx.strokeRect(0, 0, aw, ah)
}

export function drawObjects(ctx, objects, opts) {
  const { scale, selectedId } = opts
  for (const o of objects) {
    const def = OBJ_DEFS[o.type]
    ctx.save()
    ctx.translate(o.x, o.y)
    ctx.rotate(o.rot || 0)
    const hw = o.w / 2, hh = o.h / 2

    if (o.type === 'plant') {
      ctx.fillStyle = def.color
      ctx.beginPath()
      ctx.arc(0, 0, o.w / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = def.border
      ctx.lineWidth = 1.5 / scale
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.arc(-o.w * 0.1, -o.w * 0.1, o.w / 5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.fillStyle = def.color
      ctx.fillRect(-hw, -hh, o.w, o.h)
      ctx.strokeStyle = def.border
      ctx.lineWidth = 1.5 / scale
      ctx.strokeRect(-hw, -hh, o.w, o.h)
      if (o.type === 'stele') {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        ctx.lineWidth = 1 / scale
        ctx.strokeRect(-hw * 0.7, -hh * 0.55, o.w * 0.7, o.h * 1.1)
      } else if (o.type === 'railing') {
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'
        ctx.lineWidth = 1 / scale
        const seg = 0.3
        ctx.beginPath()
        for (let x = -hw + seg; x < hw; x += seg) { ctx.moveTo(x, -hh); ctx.lineTo(x, hh) }
        ctx.stroke()
      } else if (o.type === 'table') {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'
        ctx.lineWidth = 1 / scale
        ctx.strokeRect(-hw * 0.75, -hh * 0.6, o.w * 0.75, o.h * 1.2)
      }
    }

    // 碰撞：变红提示
    if (o.invalid) {
      ctx.fillStyle = 'rgba(220,38,38,0.4)'
      ctx.fillRect(-hw, -hh, o.w, o.h)
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth = 2.5 / scale
      ctx.setLineDash([6 / scale, 4 / scale])
      ctx.strokeRect(-hw, -hh, o.w, o.h)
      ctx.setLineDash([])
    }
    ctx.restore()

    if (o.id === selectedId && !o.invalid) {
      // 选中态在标注层画，这里不重复
    }
  }
}

// 标注层：选中框 + 旋转/缩放手柄 + 尺寸标注
export function drawAnnotations(ctx, obj, opts) {
  const { scale } = opts
  if (!obj) return
  const corners = objCorners(obj)

  ctx.strokeStyle = '#2563eb'
  ctx.lineWidth = 1.5 / scale
  ctx.setLineDash([5 / scale, 4 / scale])
  ctx.beginPath()
  corners.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
  ctx.closePath()
  ctx.stroke()
  ctx.setLineDash([])

  // 缩放手柄（四角方块）
  const hs = 9 / scale
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#2563eb'
  ctx.lineWidth = 1.5 / scale
  for (const p of corners) {
    ctx.fillRect(p.x - hs / 2, p.y - hs / 2, hs, hs)
    ctx.strokeRect(p.x - hs / 2, p.y - hs / 2, hs, hs)
  }

  // 旋转手柄（顶边中点上方）
  const rot = obj.rot || 0
  const mx = obj.x + Math.sin(rot) * (obj.h / 2)
  const my = obj.y - Math.cos(rot) * (obj.h / 2)
  const off = 26 / scale
  const hx = obj.x + Math.sin(rot) * (obj.h / 2 + off)
  const hy = obj.y - Math.cos(rot) * (obj.h / 2 + off)
  ctx.beginPath()
  ctx.moveTo(mx, my)
  ctx.lineTo(hx, hy)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(hx, hy, 7 / scale, 0, Math.PI * 2)
  ctx.fillStyle = '#2563eb'
  ctx.fill()

  // 尺寸标注
  ctx.fillStyle = '#1e3a8a'
  ctx.font = `${12 / scale}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const label = `${obj.w.toFixed(2)}m × ${obj.h.toFixed(2)}m`
  ctx.fillText(label, obj.x, obj.y + obj.h / 2 + 8 / scale)
}

// 旋转手柄的世界坐标（用于命中检测）
export function rotateHandlePos(obj, scale) {
  const rot = obj.rot || 0
  const off = 26 / scale
  return {
    x: obj.x + Math.sin(rot) * (obj.h / 2 + off),
    y: obj.y - Math.cos(rot) * (obj.h / 2 + off)
  }
}
