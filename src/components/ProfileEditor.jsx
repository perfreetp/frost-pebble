import { useEffect, useRef, useCallback } from 'react'
import { offsetCurve, WALL_RULES } from '../geometry'

/**
 * 母线编辑器:Canvas2D
 * 拖动控制点编辑样条;双击空白加点;右键删点(至少保留3个)
 * 叠加:曲率梳(红色=该壁厚下拐点过急)、壁厚等距偏移内表面
 */
export default function ProfileEditor({ points, samples, wall, showComb, onChange }) {
  const canvasRef = useRef(null)
  const dragRef = useRef(-1)
  const stateRef = useRef({ points, samples, wall, showComb })
  stateRef.current = { points, samples, wall, showComb }

  const getTransform = useCallback((canvas, pts) => {
    const pad = 46
    let maxR = 30, maxY = 60
    for (const p of pts) { maxR = Math.max(maxR, p.r); maxY = Math.max(maxY, p.y) }
    maxR *= 1.35; maxY *= 1.15
    const sx = (canvas.width * 0.62 - pad) / maxR
    const sy = (canvas.height - pad * 2) / maxY
    const s = Math.min(sx, sy)
    const ox = canvas.width * 0.22
    const oy = canvas.height - pad
    return {
      s, ox, oy,
      toX: (r) => ox + r * s,
      toY: (y) => oy - y * s,
      toR: (x) => (x - ox) / s,
      toYy: (y) => (oy - y) / s,
    }
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { points, samples, wall, showComb } = stateRef.current
    const T = getTransform(canvas, points)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#141a20'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 网格(每 20mm)
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let r = 0; T.toX(r) < canvas.width; r += 20) {
      ctx.beginPath(); ctx.moveTo(T.toX(r), 0); ctx.lineTo(T.toX(r), canvas.height); ctx.stroke()
    }
    for (let y = 0; T.toY(y) > 0; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, T.toY(y)); ctx.lineTo(canvas.width, T.toY(y)); ctx.stroke()
    }

    // 旋转轴
    ctx.strokeStyle = 'rgba(120,200,255,0.5)'
    ctx.setLineDash([6, 5])
    ctx.beginPath(); ctx.moveTo(T.toX(0), 0); ctx.lineTo(T.toX(0), canvas.height); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(120,200,255,0.7)'
    ctx.font = '12px sans-serif'
    ctx.fillText('旋转轴', T.toX(0) + 6, 16)

    // 壁厚等距偏移内表面
    if (samples.length && wall) {
      const inner = offsetCurve(samples, wall)
      ctx.strokeStyle = 'rgba(255,196,80,0.75)'
      ctx.setLineDash([4, 4])
      ctx.lineWidth = 1.5
      ctx.beginPath()
      inner.forEach((p, i) => { i ? ctx.lineTo(T.toX(p.r), T.toY(p.y)) : ctx.moveTo(T.toX(p.r), T.toY(p.y)) })
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 曲率梳
    if (showComb && samples.length) {
      const rule = WALL_RULES[wall]
      const kScale = 900 // 曲率→梳齿长度(mm 坐标)
      for (let i = 0; i < samples.length; i += 4) {
        const p = samples[i]
        const k = p.kappa || 0
        const len = Math.max(-60, Math.min(60, k * kScale))
        const x1 = T.toX(p.r), y1 = T.toY(p.y)
        const x2 = T.toX(p.r - p.n[0] * len), y2 = T.toY(p.y - p.n[1] * len)
        const tooSharp = Math.abs(k) > 1e-6 && 1 / Math.abs(k) < rule.curv
        ctx.strokeStyle = tooSharp ? 'rgba(255,80,80,0.95)' : 'rgba(90,220,160,0.55)'
        ctx.lineWidth = tooSharp ? 1.8 : 1
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      }
    }

    // 母线
    if (samples.length) {
      ctx.strokeStyle = '#7fd4ff'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      samples.forEach((p, i) => { i ? ctx.lineTo(T.toX(p.r), T.toY(p.y)) : ctx.moveTo(T.toX(p.r), T.toY(p.y)) })
      ctx.stroke()
    }

    // 控制点
    points.forEach((p, i) => {
      ctx.beginPath()
      ctx.arc(T.toX(p.r), T.toY(p.y), 7, 0, Math.PI * 2)
      ctx.fillStyle = i === dragRef.current ? '#ffd166' : '#ff8c5a'
      ctx.fill()
      ctx.strokeStyle = '#141a20'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // 尺寸标注
    if (samples.length) {
      let maxR = 0, maxY = 0
      for (const p of samples) { maxR = Math.max(maxR, p.r); maxY = Math.max(maxY, p.y) }
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.font = '12px sans-serif'
      ctx.fillText(`H ≈ ${maxY.toFixed(0)}mm`, 10, canvas.height - 28)
      ctx.fillText(`Ø ≈ ${(maxR * 2).toFixed(0)}mm`, 10, canvas.height - 12)
    }
  }, [getTransform])

  useEffect(() => {
    const canvas = canvasRef.current
    const fit = () => {
      const r = canvas.getBoundingClientRect()
      canvas.width = Math.max(50, r.width)
      canvas.height = Math.max(50, r.height)
      draw()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw])

  useEffect(draw, [points, samples, wall, showComb, draw])

  const hit = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left, y = e.clientY - rect.top
    const T = getTransform(canvas, stateRef.current.points)
    const pts = stateRef.current.points
    for (let i = 0; i < pts.length; i++) {
      if (Math.hypot(T.toX(pts[i].r) - x, T.toY(pts[i].y) - y) < 12) return { idx: i, x, y }
    }
    return { idx: -1, x, y }
  }

  const onPointerDown = (e) => {
    const { idx } = hit(e)
    if (e.button === 2) {
      // 右键删点
      if (idx > 0 && stateRef.current.points.length > 3) {
        onChange(stateRef.current.points.filter((_, i) => i !== idx))
      }
      return
    }
    if (idx >= 0) {
      dragRef.current = idx
      e.target.setPointerCapture(e.pointerId)
    }
  }

  const onPointerMove = (e) => {
    if (dragRef.current < 0) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const T = getTransform(canvas, stateRef.current.points)
    const i = dragRef.current
    const pts = stateRef.current.points.map((p) => ({ ...p }))
    pts[i].r = Math.max(0, Math.round(T.toR(e.clientX - rect.left) * 2) / 2)
    pts[i].y = Math.max(0, Math.round(T.toYy(e.clientY - rect.top) * 2) / 2)
    if (i === 0) pts[0].r = 0 // 底心钉在轴上
    onChange(pts)
  }

  const onPointerUp = () => { dragRef.current = -1 }

  const onDoubleClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const T = getTransform(canvas, stateRef.current.points)
    const r = Math.max(0, T.toR(e.clientX - rect.left))
    const y = Math.max(0, T.toYy(e.clientY - rect.top))
    const pts = [...stateRef.current.points, { r, y }].sort((a, b) => a.y - b.y)
    onChange(pts)
  }

  return (
    <canvas
      ref={canvasRef}
      className="profile-editor"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}
