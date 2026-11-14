import type { PlacedPanel, PVModule, Roof, Scheme, SchemeStats } from '../types'
import { OBSTACLE_LABEL } from '../types'

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob(['﻿' + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const safeName = (s: string) => s.replace(/[\\/:*?"<>|]/g, '_')

// ---------- 排布图 SVG（屋面局部坐标 2D 平面图） ----------
export function exportLayoutSvg(roof: Roof, scheme: Scheme, modules: PVModule[], stats: SchemeStats): void {
  const modMap = new Map(modules.map((m) => [m.id, m]))
  const issueMap = new Map(stats.issues.map((i) => [i.panelId, i.level]))
  const scale = 12 // px per m
  const pad = 40

  let width = 0
  let height = 0
  for (const plane of roof.planes) {
    const xs = plane.outline.map((p) => p.x)
    const ys = plane.outline.map((p) => p.y)
    width = Math.max(width, Math.max(...xs) - Math.min(...xs))
    height = Math.max(height, Math.max(...ys) - Math.min(...ys))
  }
  const W = (width + pad * 2 / scale) * scale
  const H = (height + pad * 2 / scale) * scale

  const pts = (poly: { x: number; y: number }[]) =>
    poly.map((p) => `${p.x * scale + pad},${H - (p.y * scale + pad)}`).join(' ')

  const panelsByPlane = new Map<string, PlacedPanel[]>()
  for (const p of scheme.panels) {
    if (!panelsByPlane.has(p.planeId)) panelsByPlane.set(p.planeId, [])
    panelsByPlane.get(p.planeId)!.push(p)
  }

  const svg: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="sans-serif" font-size="10">`,
    `<rect width="${W}" height="${H}" fill="#0f172a"/>`,
    `<text x="${pad}" y="20" fill="#e2e8f0" font-size="14">${safeName(roof.name)} — ${safeName(scheme.name)} 排布图（比例 1:${Math.round(1000 / scale)})</text>`,
  ]

  for (const plane of roof.planes) {
    svg.push(`<polygon points="${pts(plane.outline)}" fill="#1e293b" stroke="#94a3b8" stroke-width="2"/>`)
    for (const ob of plane.obstacles) {
      const color = { parapet: '#b5474e', skylight: '#7dd3fc', fan: '#f59e0b', shaft: '#a78bfa' }[ob.type]
      svg.push(
        `<polygon points="${pts(ob.polygon)}" fill="${color}" opacity="0.8" stroke="#fff" stroke-width="0.5"/>`,
        `<text x="${ob.polygon[0].x * scale + pad}" y="${H - ob.polygon[0].y * scale - pad - 2}" fill="#fff">${OBSTACLE_LABEL[ob.type]}${ob.name ?? ''}</text>`,
      )
    }
    for (const p of panelsByPlane.get(plane.id) ?? []) {
      const mod = modMap.get(p.moduleId)
      if (!mod) continue
      const l = (p.rotationDeg % 180 === 0 ? mod.length : mod.width) * scale
      const w = (p.rotationDeg % 180 === 0 ? mod.width : mod.length) * scale
      const cx = p.u * scale + pad
      const cy = H - (p.v * scale + pad)
      const fill = issueMap.get(p.id) === 'red' ? '#d92d20' : issueMap.get(p.id) === 'warn' ? '#e8890c' : '#2f7de1'
      svg.push(
        `<g transform="rotate(${-p.rotationDeg} ${cx} ${cy})"><rect x="${cx - l / 2}" y="${cy - w / 2}" width="${l}" height="${w}" fill="${fill}" stroke="#0f172a" stroke-width="0.4"/></g>`,
      )
    }
  }

  // 组串编号标注
  const stringColor = new Map(stats.strings.flatMap((st) => st.panelIds.map((id) => [id, st.id])))
  for (const p of scheme.panels) {
    const sid = stringColor.get(p.id)
    if (!sid) continue
    svg.push(
      `<text x="${p.u * scale + pad - 12}" y="${H - (p.v * scale + pad) + 3}" fill="#fff" font-size="8">${sid}</text>`,
    )
  }

  svg.push('</svg>')
  download(`${safeName(roof.name)}_${safeName(scheme.name)}_排布图.svg`, svg.join('\n'), 'image/svg+xml')
}

// ---------- 组串表 CSV ----------
export function exportStringCsv(roof: Roof, scheme: Scheme, stats: SchemeStats): void {
  const planeName = (id: string) => roof.planes.find((p) => p.id === id)?.name ?? id
  const rows = [
    ['组串号', '屋面分区', '组件数', '容量(kWp)', '组件ID列表'],
    ...stats.strings.map((st) => [
      st.id,
      planeName(st.planeId),
      String(st.panelIds.length),
      (st.powerW / 1000).toFixed(3),
      st.panelIds.join(' '),
    ]),
    [],
    ['汇总', '', String(stats.panelCount), stats.capacityKw.toFixed(2), `${stats.strings.length} 串`],
  ]
  download(
    `${safeName(roof.name)}_${safeName(scheme.name)}_组串表.csv`,
    rows.map((r) => r.join(',')).join('\n'),
    'text/csv;charset=utf-8',
  )
}

// ---------- 业主收益估算（HTML 可打印） ----------
export function exportIncomeReport(roof: Roof, scheme: Scheme, stats: SchemeStats): void {
  const s = scheme.settings
  const annual: string[] = []
  for (let y = 1; y <= 25; y++) {
    const kwh = stats.firstYearKwh * Math.pow(1 - s.annualDegrade, y - 1)
    annual.push(
      `<tr><td>第 ${y} 年</td><td>${kwh.toFixed(0)}</td><td>${(kwh * s.tariff).toFixed(0)}</td></tr>`,
    )
  }
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<title>${safeName(roof.name)} 容量与收益估算</title>
<style>
body{font-family:"Microsoft YaHei",sans-serif;max-width:820px;margin:32px auto;color:#1e293b;padding:0 16px}
h1{font-size:22px}h2{font-size:16px;margin-top:28px;border-left:4px solid #2f7de1;padding-left:8px}
table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #cbd5e1;padding:6px 10px;text-align:left}
th{background:#f1f5f9}.kpi{display:flex;gap:12px;flex-wrap:wrap}.kpi div{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;min-width:150px}
.kpi strong{display:block;font-size:20px;color:#2f7de1;margin-top:4px}.note{color:#64748b;font-size:12px;margin-top:24px}
@media print{.noprint{display:none}}
</style></head><body>
<h1>${roof.name} · 分布式光伏容量与收益估算（${scheme.name}）</h1>
<div class="kpi">
<div>装机容量<strong>${stats.capacityKw.toFixed(2)} kWp</strong></div>
<div>组件数量<strong>${stats.panelCount} 块 / ${stats.strings.length} 串</strong></div>
<div>屋面利用率<strong>${(stats.utilization * 100).toFixed(1)}%</strong></div>
<div>首年发电量<strong>${stats.firstYearKwh.toFixed(0)} kWh</strong></div>
<div>总投资<strong>${(stats.totalCost / 10000).toFixed(1)} 万元</strong></div>
<div>静态回收期<strong>${Number.isFinite(stats.paybackYears) ? stats.paybackYears.toFixed(1) + ' 年' : '—'}</strong></div>
<div>25年累计发电<strong>${(stats.total25YKwh / 10000).toFixed(1)} 万 kWh</strong></div>
<div>25年累计收益<strong>${(stats.total25YIncome / 10000).toFixed(1)} 万元</strong></div>
</div>
<h2>测算参数</h2>
<table><tr><th>等效利用小时</th><td>${s.fullLoadHours} h</td><th>电价</th><td>${s.tariff} 元/kWh</td></tr>
<tr><th>单位造价</th><td>${s.costPerWp} 元/Wp</td><th>年衰减率</th><td>${(s.annualDegrade * 100).toFixed(2)}%</td></tr></table>
<h2>逐年发电与收益</h2>
<table><thead><tr><th>年份</th><th>发电量 (kWh)</th><th>收益 (元)</th></tr></thead><tbody>${annual.join('')}</tbody></table>
<p class="note">说明：本估算为方案阶段测算，未计运维费用、税费调整与电价波动；实际收益以可研及并网批复为准。红色校核问题数：${stats.redCount}，黄色警告：${stats.warnCount}。</p>
<button class="noprint" onclick="window.print()" style="margin-top:20px;padding:8px 20px;font-size:14px">打印 / 另存 PDF</button>
</body></html>`
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
