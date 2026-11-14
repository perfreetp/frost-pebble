import { useEffect, useRef } from 'react'
import { buildNet, patternMask, blendLayers, hexToRgb } from '../geometry'

/**
 * 平面贴花下料图:把旋转曲面按 12 瓣展开,
 * 每瓣宽 = 该高度周长/12,高 = 母线弧长;纹样按 (u,v) 映射
 */
export default function FlattenView({ samples, layers, patternId, orderId }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !samples.length) return
    const ctx = canvas.getContext('2d')
    const net = buildNet(samples, 12)
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#f5f2ea' // 纸面底色
    ctx.fillRect(0, 0, W, H)

    const margin = 56
    const gap = 10
    const goreW = (W - margin * 2 - gap * (net.gores - 1)) / net.gores
    const scale = Math.min(goreW / net.maxWidth, (H - margin * 2 - 40) / net.length)
    const baseCol = blendLayers(layers)
    const accent = layers.length > 1 ? hexToRgb(layers[layers.length - 1].hex) : [120, 70, 40]

    const rows = 140, cols = 8
    for (let g = 0; g < net.gores; g++) {
      const cx = margin + g * (goreW + gap) + goreW / 2
      // 瓣轮廓
      ctx.beginPath()
      net.stations.forEach((st, i) => {
        const x = cx - st.halfW * scale
        const y = margin + st.s * scale
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      })
      for (let i = net.stations.length - 1; i >= 0; i--) {
        const st = net.stations[i]
        ctx.lineTo(cx + st.halfW * scale, margin + st.s * scale)
      }
      ctx.closePath()
      // 底色
      ctx.fillStyle = `rgb(${baseCol[0] | 0},${baseCol[1] | 0},${baseCol[2] | 0})`
      ctx.fill()
      // 纹样:在瓣内按 (u,v) 栅格填色
      if (patternId && patternId !== 'none') {
        ctx.save()
        ctx.clip()
        ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},0.85)`
        for (let r = 0; r < rows; r++) {
          const v = (r + 0.5) / rows
          const st = net.stations[Math.min(net.stations.length - 1, Math.floor(v * net.stations.length))]
          const y = margin + v * net.length * scale
          const dy = (net.length * scale) / rows + 0.5
          for (let c = 0; c < cols; c++) {
            const u = (g + (c + 0.5) / cols) / net.gores
            if (patternMask(patternId, u, v)) {
              const x = cx - st.halfW * scale + (c / cols) * st.halfW * 2 * scale
              const w = (st.halfW * 2 * scale) / cols + 0.5
              ctx.fillRect(x, y - dy / 2, w, dy)
            }
          }
        }
        ctx.restore()
      }
      ctx.strokeStyle = '#8a7f68'
      ctx.lineWidth = 1
      ctx.stroke()
      // 瓣号
      ctx.fillStyle = '#8a7f68'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(String(g + 1), cx, margin + net.length * scale + 14)
    }

    // 标题与尺寸
    ctx.fillStyle = '#3a352b'
    ctx.textAlign = 'left'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText(`贴花下料图 ${orderId ? '· 单号 ' + orderId : ''}`, margin, 26)
    ctx.font = '12px sans-serif'
    ctx.fillText(`母线弧长 ${net.length.toFixed(1)}mm · 单瓣最大幅宽 ${net.maxWidth.toFixed(1)}mm · 共 ${net.gores} 瓣`, margin, 44)
    // 比例尺(50mm)
    const sy = H - 20
    ctx.strokeStyle = '#3a352b'
    ctx.beginPath(); ctx.moveTo(margin, sy); ctx.lineTo(margin + 50 * scale, sy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(margin, sy - 4); ctx.lineTo(margin, sy + 4); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(margin + 50 * scale, sy - 4); ctx.lineTo(margin + 50 * scale, sy + 4); ctx.stroke()
    ctx.fillText('50mm', margin + 50 * scale + 6, sy + 4)
  }, [samples, layers, patternId, orderId])

  return <canvas ref={canvasRef} width={980} height={560} className="flatten-view" />
}
