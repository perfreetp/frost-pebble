// 核心引擎冒烟测试（node --experimental-strip-types 直接跑 TS）
import { createSampleRoof } from '../src/lib/sampleRoof.ts'
import { DEFAULT_MODULES, DEFAULT_SETTINGS } from '../src/lib/defaults.ts'
import { autoLayoutPlane, duplicatePanels } from '../src/lib/autoLayout.ts'
import { computeStats } from '../src/lib/check.ts'
import { requiredRowSpacing, solarPosition, pointInPolygon } from '../src/lib/geometry.ts'
import type { Scheme } from '../src/types.ts'

let pass = 0
let fail = 0
const assert = (cond: boolean, msg: string) => {
  if (cond) {
    pass++
    console.log(`  ✓ ${msg}`)
  } else {
    fail++
    console.error(`  ✗ ${msg}`)
  }
}

console.log('1. 示例屋面')
const roof = createSampleRoof()
assert(roof.planes.length === 2, `两个屋面分区（实际 ${roof.planes.length}）`)
const main = roof.planes[0]
assert(main.obstacles.length === 7, `主屋面 7 处禁布区（实际 ${main.obstacles.length}）`)
assert(main.parapetHeight === 1.1, '女儿墙高度 1.1m')

console.log('2. 自动排布不硬塞')
const mod = DEFAULT_MODULES[0]
const result = autoLayoutPlane(main, mod, DEFAULT_SETTINGS, 0)
assert(result.placed > 100, `主屋面布下 ${result.placed} 块`)
assert(result.skipped.length > 0, `有跳过原因：${result.skipped.map((s) => s.reason).join('、')}`)
// 每块都必须在屋面内
const allInside = result.panels.every((p) => {
  const hl = mod.length / 2
  const hw = mod.width / 2
  return [
    { x: p.u - hl, y: p.v - hw },
    { x: p.u + hl, y: p.v - hw },
    { x: p.u + hl, y: p.v + hw },
    { x: p.u - hl, y: p.v + hw },
  ].every((c) => pointInPolygon(c, main.outline))
})
assert(allInside, '所有组件四角都在屋面轮廓内')
// 无一块压到障碍
const noHit = result.panels.every((p) =>
  main.obstacles.every(
    (ob) =>
      !pointInPolygon({ x: p.u, y: p.v }, ob.polygon),
  ),
)
assert(noHit, '没有组件中心落入禁布区')

console.log('3. 统计与组串')
const scheme: Scheme = {
  id: 'test',
  roofId: roof.id,
  name: '测试方案',
  version: 1,
  panels: result.panels,
  settings: DEFAULT_SETTINGS,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
const stats = computeStats(scheme, roof.planes, DEFAULT_MODULES)
assert(stats.panelCount === result.placed, `统计组件数一致（${stats.panelCount}）`)
assert(stats.capacityKw > 50, `装机容量 ${stats.capacityKw.toFixed(1)} kWp`)
assert(stats.strings.length > 0, `生成 ${stats.strings.length} 个组串`)
assert(stats.strings[0].id.startsWith('S'), '组串编号 S001 格式')
assert(
  stats.strings.reduce((s, st) => s + st.panelIds.length, 0) === stats.panelCount,
  '组串组件数之和 = 总组件数',
)
assert(stats.utilization > 0.3 && stats.utilization < 0.95, `利用率 ${(stats.utilization * 100).toFixed(1)}% 合理`)
assert(stats.firstYearKwh > 0 && stats.total25YIncome > 0, '收益估算为正')
assert(Number.isFinite(stats.paybackYears), '回收期有限值')

console.log('4. 阴影间距物理量')
const sun9 = solarPosition(31.2, 9)
assert(sun9.altitudeDeg > 18 && sun9.altitudeDeg < 23, `冬至 9 点太阳高度角 ${sun9.altitudeDeg.toFixed(1)}°（参考 ~20.4°）`)
assert(sun9.azimuthDeg > 130 && sun9.azimuthDeg < 142, `冬至 9 点方位角 ${sun9.azimuthDeg.toFixed(1)}°（东南，参考 ~136°）`)
const sun12 = solarPosition(31.2, 12)
assert(Math.abs(sun12.azimuthDeg - 180) < 1, `正午太阳在正南（${sun12.azimuthDeg.toFixed(1)}°）`)
const d = requiredRowSpacing(mod.width, 20, 31.2, 9)
assert(d > 0.5 && d < 5, `阴影间距 ${d.toFixed(2)}m 量级合理`)
const dNoon = requiredRowSpacing(mod.width, 20, 31.2, 12)
assert(dNoon >= 0 && dNoon < d, `正午间距 ${dNoon.toFixed(2)}m 小于 9 点间距（太阳更高）`)

console.log('5. 框选批量复制')
const maxV = Math.max(...result.panels.map((p) => p.v))
const row = result.panels.filter((p) => Math.abs(p.v - maxV) < 0.2)
// 横向平移到屋面另一侧空当（避开既有列）
const dup = duplicatePanels(
  row,
  { du: 0, dv: 0 },
  result.panels.filter((p) => !row.some((r) => r.id === p.id)),
  main,
  DEFAULT_SETTINGS,
  DEFAULT_MODULES,
)
assert(dup.created.length > 0, `复制出 ${dup.created.length} 块`)
assert(
  dup.created.every((p) => pointInPolygon({ x: p.u, y: p.v }, main.outline)),
  '复制件均在屋面内',
)
// 往远处大量复制直到越界，验证不硬塞
let pool = result.panels
let totalRejected = 0
for (let k = 0; k < 30; k++) {
  const r = duplicatePanels(row, { du: 0, dv: (k + 2) * (mod.width + DEFAULT_SETTINGS.gapY) }, pool, main, DEFAULT_SETTINGS, DEFAULT_MODULES)
  pool = [...pool, ...r.created]
  totalRejected += r.rejected
}
assert(totalRejected > 0, `屋面边界外共拒绝 ${totalRejected} 块，未硬塞`)

console.log('6. 红色问题：故意越界布板')
const bad = {
  ...scheme,
  panels: [
    ...scheme.panels,
    { id: 'bad1', moduleId: mod.id, planeId: main.id, u: -5, v: -5, rotationDeg: 0 },
    { id: 'bad2', moduleId: mod.id, planeId: main.id, u: 5, v: 5, rotationDeg: 30 },
  ],
}
const badStats = computeStats(bad, roof.planes, DEFAULT_MODULES)
assert(badStats.redCount > stats.redCount, `越界+朝向问题被标红（红 ${badStats.redCount}）`)
const orient = badStats.issues.find((i) => i.code === 'orientation')
assert(!!orient && orient.message.includes('朝向偏差'), '朝向超限写明原因')
const out = badStats.issues.find((i) => i.code === 'out-of-roof')
assert(!!out, '出屋面问题被识别')

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
if (fail) process.exit(1)
