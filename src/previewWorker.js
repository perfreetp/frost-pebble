// 曲面预览渲染 Worker:接收母线采样点,在 OffscreenCanvas 上实时绘制旋转曲面
import { patternMask, blendLayers } from './geometry'

let canvas = null
let ctx = null
let dpr = 1
let state = null // { samples, layers, patternId }
let rotY = 0
let timer = null

const SEGS = 48 // 周向分段
const RINGS = 96 // 母线向分段

function buildMesh(samples) {
  // 把母线重采样到 RINGS 环
  const n = samples.length
  const rings = []
  for (let i = 0; i < RINGS; i++) {
    const idx = Math.min(n - 1, Math.round((i / (RINGS - 1)) * (n - 1)))
    rings.push(samples[idx])
  }
  const pts = [] // [ring][seg] = {x,y,z, nx,ny,nz, u, v}
  for (let i = 0; i < RINGS; i++) {
    const p = rings[i]
    const prev = rings[Math.max(0, i - 1)]
    const next = rings[Math.min(RINGS - 1, i + 1)]
    // 母线切向 (dr, dy)
    let tr = next.r - prev.r, ty = next.y - prev.y
    const tm = Math.hypot(tr, ty) || 1
    tr /= tm; ty /= tm
    const row = []
    for (let j = 0; j < SEGS; j++) {
      const th = (j / SEGS) * Math.PI * 2
      const cos = Math.cos(th), sin = Math.sin(th)
      // 法向 = 母线法向绕轴旋转:子午面内法向 (-ty, tr) 的径向分量
      let nx = -ty * cos, ny = tr, nz = -ty * sin
      const nm = Math.hypot(nx, ny, nz) || 1
      row.push({
        x: p.r * cos, y: p.y, z: p.r * sin,
        nx: nx / nm, ny: ny / nm, nz: nz / nm,
        u: j / SEGS, v: i / (RINGS - 1),
      })
    }
    pts.push(row)
  }
  return pts
}

function render() {
  if (!ctx || !state) return
  rotY += 0.012
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)

  // 背景
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#1a2027')
  bg.addColorStop(1, '#0d1114')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const { mesh, baseCol, patternId } = state
  const tilt = 0.32
  const cosT = Math.cos(tilt), sinT = Math.sin(tilt)
  const cosR = Math.cos(rotY), sinR = Math.sin(rotY)

  // 计算包围盒定缩放
  let maxR = 1, minY = Infinity, maxY = -Infinity
  for (const row of mesh) for (const p of row) {
    maxR = Math.max(maxR, Math.abs(p.x), Math.abs(p.z))
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y)
  }
  const span = Math.max(maxY - minY, maxR * 2)
  const scale = (Math.min(W, H) * 0.78) / span
  const cx = W / 2, cy = H / 2 + ((maxY + minY) / 2) * scale * 0

  const light = norm3([-0.5, 0.8, 0.6])
  const accent = [245, 240, 225]

  // 生成所有四边形并排序(画家算法)
  const quads = []
  for (let i = 0; i < RINGS - 1; i++) {
    for (let j = 0; j < SEGS; j++) {
      const j2 = (j + 1) % SEGS
      const corners = [mesh[i][j], mesh[i][j2], mesh[i + 1][j2], mesh[i + 1][j]]
      let depth = 0
      const proj = []
      for (const p of corners) {
        const x1 = p.x * cosR + p.z * sinR
        const z1 = -p.x * sinR + p.z * cosR
        const y2 = p.y * cosT - z1 * sinT
        const z2 = p.y * sinT + z1 * cosT
        depth += z2
        proj.push([cx + x1 * scale, cy - (y2 - (maxY + minY) / 2) * scale])
      }
      // 面法向(旋转后)
      const a = corners[0], b = corners[2]
      let nx = (a.nx + b.nx) / 2, ny = (a.ny + b.ny) / 2, nz = (a.nz + b.nz) / 2
      const nx1 = nx * cosR + nz * sinR
      const nz1 = -nx * sinR + nz * cosR
      const ny2 = ny * cosT - nz1 * sinT
      const nz2 = ny * sinT + nz1 * cosT
      quads.push({ proj, depth: depth / 4, n: [nx1, ny2, nz2], u: (a.u + b.u) / 2, v: (a.v + b.v) / 2 })
    }
  }
  quads.sort((q1, q2) => q1.depth - q2.depth)

  for (const q of quads) {
    const lam = Math.max(0, q.n[0] * light[0] + q.n[1] * light[1] + q.n[2] * light[2])
    const spec = Math.pow(Math.max(0, q.n[2]), 24) * 90
    let col = baseCol
    if (patternId && patternId !== 'none' && patternMask(patternId, q.u, q.v)) {
      col = [baseCol[0] * 0.35 + accent[0] * 0.65, baseCol[1] * 0.35 + accent[1] * 0.65, baseCol[2] * 0.35 + accent[2] * 0.65]
    }
    const amb = 0.32
    const r = Math.min(255, col[0] * (amb + 0.75 * lam) + spec)
    const g = Math.min(255, col[1] * (amb + 0.75 * lam) + spec)
    const bch = Math.min(255, col[2] * (amb + 0.75 * lam) + spec)
    ctx.fillStyle = `rgb(${r | 0},${g | 0},${bch | 0})`
    ctx.beginPath()
    ctx.moveTo(q.proj[0][0], q.proj[0][1])
    for (let k = 1; k < 4; k++) ctx.lineTo(q.proj[k][0], q.proj[k][1])
    ctx.closePath()
    ctx.fill()
  }

  // 地面参考线
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.moveTo(W * 0.1, cy + ((maxY - minY) / 2) * scale + 8)
  ctx.lineTo(W * 0.9, cy + ((maxY - minY) / 2) * scale + 8)
  ctx.stroke()
}

function norm3(v) {
  const m = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / m, v[1] / m, v[2] / m]
}

self.onmessage = (e) => {
  const msg = e.data
  if (msg.type === 'init') {
    canvas = msg.canvas
    dpr = msg.dpr || 1
    canvas.width = msg.width * dpr
    canvas.height = msg.height * dpr
    ctx = canvas.getContext('2d')
    if (!timer) timer = setInterval(render, 40)
  } else if (msg.type === 'resize') {
    if (!canvas) return
    canvas.width = msg.width * dpr
    canvas.height = msg.height * dpr
  } else if (msg.type === 'params') {
    const mesh = buildMesh(msg.samples)
    state = { mesh, baseCol: blendLayers(msg.layers), patternId: msg.patternId }
  }
}
