// 器型母线几何核心:Catmull-Rom 样条采样、弧长重采样、曲率、等距偏移、可吹制性校验、曲面展开
// 坐标约定:母线在 (r, y) 半平面内,r >= 0 为到旋转轴的距离(mm),y 为高度(mm)

/** 向心 Catmull-Rom 插值 + 弧长均匀重采样 */
export function sampleProfile(points, n = 240) {
  const pts = points.map((p) => [Math.max(0, p.r), p.y])
  const P = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))]
  const raw = []
  const segs = pts.length - 1
  const per = Math.max(6, Math.round((n * 1.5) / segs))
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2)
    for (let j = 0; j < per; j++) {
      const t = j / per
      const t2 = t * t, t3 = t2 * t
      raw.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ])
    }
  }
  raw.push(pts[pts.length - 1].slice())
  raw.forEach((p) => { p[0] = Math.max(0, p[0]) })

  // 弧长重采样
  const cum = [0]
  for (let i = 1; i < raw.length; i++) {
    const dx = raw[i][0] - raw[i - 1][0], dy = raw[i][1] - raw[i - 1][1]
    cum.push(cum[i - 1] + Math.hypot(dx, dy))
  }
  const L = cum[cum.length - 1] || 1
  const out = []
  let k = 0
  for (let i = 0; i < n; i++) {
    const s = (L * i) / (n - 1)
    while (k < cum.length - 2 && cum[k + 1] < s) k++
    const f = (s - cum[k]) / Math.max(1e-9, cum[k + 1] - cum[k])
    out.push({
      r: Math.max(0, raw[k][0] + (raw[k + 1][0] - raw[k][0]) * f),
      y: raw[k][1] + (raw[k + 1][1] - raw[k][1]) * f,
      s,
    })
  }
  return out
}

/** 计算切向、内法向(指向旋转轴)、曲率(1/mm,带符号) */
export function computeGeometry(samples) {
  const n = samples.length
  const ds = (samples[n - 1].s - samples[0].s) / (n - 1) || 1
  for (let i = 0; i < n; i++) {
    const a = samples[Math.max(0, i - 1)], b = samples[Math.min(n - 1, i + 1)]
    let tr = (b.r - a.r) / (2 * ds), ty = (b.y - a.y) / (2 * ds)
    const m = Math.hypot(tr, ty) || 1
    tr /= m; ty /= m
    // 二阶差分求曲率
    const d2r = (b.r - 2 * samples[i].r + a.r) / (ds * ds)
    const d2y = (b.y - 2 * samples[i].y + a.y) / (ds * ds)
    const kappa = tr * d2y - ty * d2r // 已除以 |v|^3(v 为单位切向)
    // 内法向:指向 r 减小方向
    let nr = -ty, ny = tr
    if (nr > 0) { nr = -nr; ny = -ny }
    samples[i].t = [tr, ty]
    samples[i].n = [nr, ny]
    samples[i].kappa = kappa
  }
  return samples
}

/** 等距偏移:外表面沿内法向偏移 wallMm 得到壁内表面 */
export function offsetCurve(samples, wallMm) {
  return samples.map((p) => ({
    r: Math.max(0, p.r + p.n[0] * wallMm),
    y: p.y + p.n[1] * wallMm,
    s: p.s,
  }))
}

/** 器型关键尺寸指标(曲率校验排除底部 12% 高度的底角区——底部由工具整形,不参与吹制) */
export function metrics(samples) {
  let maxR = 0, minY = Infinity, maxY = -Infinity
  for (const p of samples) {
    maxR = Math.max(maxR, p.r)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const H = maxY - minY
  let maxK = 0
  for (const p of samples) {
    if (p.y > minY + H * 0.12) maxK = Math.max(maxK, Math.abs(p.kappa || 0))
  }
  // 最窄处:上半部(颈部区域)的最小直径,吹制时杆/吹管要通过
  let neck = Infinity
  for (const p of samples) if (p.y > minY + H * 0.4) neck = Math.min(neck, p.r * 2)
  if (!isFinite(neck)) neck = maxR * 2
  return {
    height: H,
    maxDiameter: maxR * 2,
    neckDiameter: neck,
    minCurvRadius: maxK > 1e-6 ? 1 / maxK : Infinity,
    arcLength: samples[samples.length - 1].s,
  }
}

/** 三档壁厚的吹制工艺阈值 */
export const WALL_RULES = {
  2: { curv: 15, neck: 12, height: 350, label: '2mm 薄壁(难度大)' },
  3: { curv: 10, neck: 10, height: 400, label: '3mm 标准壁' },
  4: { curv: 6, neck: 8, height: 450, label: '4mm 厚壁(最稳)' },
}

/**
 * 可吹制性 + 尺寸校验
 * 返回 { checks: [{key,label,value,pass,severe}], ok, blowable }
 * severe=true 的项失败即"尺寸超限/壁厚过薄",供后台驳回参考
 */
export function checkBlowability(m, wallMm, template) {
  const rule = WALL_RULES[wallMm]
  const checks = [
    { key: 'curv', label: `最小曲率半径 ≥ ${rule.curv}mm(拐点不过急)`, value: m.minCurvRadius, pass: m.minCurvRadius >= rule.curv, fmt: (v) => `${v === Infinity ? '∞' : v.toFixed(1)}mm` },
    { key: 'neck', label: `最窄处直径 ≥ ${rule.neck}mm(吹杆可通过)`, value: m.neckDiameter, pass: m.neckDiameter >= rule.neck, fmt: (v) => `${v.toFixed(1)}mm` },
    { key: 'blowH', label: `总高 ≤ ${rule.height}mm(该壁厚可吹)`, value: m.height, pass: m.height <= rule.height, fmt: (v) => `${v.toFixed(0)}mm` },
    { key: 'minWall', label: `壁厚 ≥ 模板下限 ${template.minWall}mm`, value: wallMm, pass: wallMm >= template.minWall, severe: true, fmt: (v) => `${v}mm` },
    { key: 'maxH', label: `总高 ≤ 模板上限 ${template.maxHeight}mm`, value: m.height, pass: m.height <= template.maxHeight, severe: true, fmt: (v) => `${v.toFixed(0)}mm` },
    { key: 'maxD', label: `最大直径 ≤ 模板上限 ${template.maxDiameter}mm`, value: m.maxDiameter, pass: m.maxDiameter <= template.maxDiameter, severe: true, fmt: (v) => `${v.toFixed(0)}mm` },
  ]
  const blowable = checks.filter((c) => !c.severe).every((c) => c.pass)
  const ok = checks.every((c) => c.pass)
  return { checks, ok, blowable }
}

/** 曲面展开:把旋转面按 gores 瓣展开成平面下料图数据 */
export function buildNet(samples, gores = 12) {
  const L = samples[samples.length - 1].s
  const stations = samples.map((p) => ({
    s: p.s,
    halfW: (Math.PI * p.r) / gores, // 每瓣半宽 = 周长/2/gores
  }))
  const maxHalfW = Math.max(...stations.map((st) => st.halfW), 1)
  return { gores, stations, length: L, maxWidth: maxHalfW * 2 }
}

/* ---------- 表面纹样(u: 0..1 周向,v: 0..1 沿母线弧长)→ 0..1 遮罩 ---------- */
export const PATTERN_DEFS = [
  { id: 'none', name: '素面(无纹样)' },
  { id: 'stripes', name: '竖条纹' },
  { id: 'spiral', name: '螺旋纹' },
  { id: 'dots', name: '波点' },
  { id: 'grid', name: '网格纹' },
  { id: 'wave', name: '水波纹' },
]

export function patternMask(id, u, v) {
  const frac = (x) => x - Math.floor(x)
  switch (id) {
    case 'stripes': return frac(u * 16) < 0.45 ? 1 : 0
    case 'spiral': return frac(u * 3 + v * 4) < 0.4 ? 1 : 0
    case 'dots': {
      const x = frac(u * 12) - 0.5, y = frac(v * 10) - 0.5
      return x * x + y * y < 0.09 ? 1 : 0
    }
    case 'grid': return frac(u * 12) < 0.12 || frac(v * 12) < 0.12 ? 1 : 0
    case 'wave': return Math.sin(u * Math.PI * 2 * 6 + Math.sin(v * 12) * 2) > 0.3 ? 1 : 0
    default: return 0
  }
}

/** 色料层混合:自下而上按不透明度叠在玻璃基底上 */
export function blendLayers(layers) {
  let col = [232, 240, 244] // 玻璃基底
  for (const l of layers) {
    const c = hexToRgb(l.hex)
    const a = l.opacity ?? 0.85
    col = [
      col[0] * (1 - a) + c[0] * a,
      col[1] * (1 - a) + c[1] * a,
      col[2] * (1 - a) + c[2] * a,
    ]
  }
  return col
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

export function computePrice(template, colors, pattern) {
  return template.basePrice + colors.reduce((s, c) => s + c.surcharge, 0) + (pattern ? pattern.surcharge : 0)
}
