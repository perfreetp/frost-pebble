// DXF 导入往返测试：生成带标准图层的最小 DXF，验证四类禁布区自动识别
import { parseDxf } from '../src/lib/dxf.ts'

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

/** 生成 LWPOLYLINE 段（闭合矩形，单位 mm）。逐顶点输出 10/20 组码 */
function lwpoly(layer: string, pts: [number, number][]): string {
  const head = `0\nLWPOLYLINE\n8\n${layer}\n90\n${pts.length}\n70\n1\n`
  const body = pts.map(([x, y]) => `10\n${x}\n20\n${y}`).join('\n')
  return head + body
}

const entities = [
  lwpoly('屋面轮廓', [
    [0, 0],
    [60000, 0],
    [60000, 30000],
    [0, 30000],
  ]),
  lwpoly('女儿墙-北', [
    [0, 29000],
    [60000, 29000],
    [60000, 30000],
    [0, 30000],
  ]),
  lwpoly('天窗-1', [
    [12000, 8000],
    [22000, 8000],
    [22000, 10500],
    [12000, 10500],
  ]),
  lwpoly('风机基础-1', [
    [8000, 20000],
    [10400, 20000],
    [10400, 22400],
    [8000, 22400],
  ]),
  lwpoly('排烟井-1', [
    [44000, 4000],
    [49000, 4000],
    [49000, 8000],
    [44000, 8000],
  ]),
  lwpoly('无关家具层', [
    [1000, 1000],
    [2000, 1000],
    [2000, 2000],
    [1000, 2000],
  ]),
].join('\n')

const dxf = [
  '0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1015', '0', 'ENDSEC',
  '0', 'SECTION', '2', 'TABLES', '0', 'ENDSEC',
  '0', 'SECTION', '2', 'ENTITIES',
  entities,
  '0', 'ENDSEC', '0', 'EOF',
].join('\n')
const result = parseDxf('测试厂房.dxf', dxf)
const plane = result.roof.planes[0]

console.log('1. 屋面轮廓')
assert(!!plane, '解析出一个屋面平面')
assert(Math.abs(plane.outline[1].x - 60) < 0.01, '毫米自动换算为米（60000mm → 60m）')
assert(plane.outline.length === 4, '矩形轮廓 4 个顶点')

console.log('2. 禁布区图层识别')
const types = plane.obstacles.map((o) => o.type).sort()
assert(types.includes('parapet'), '识别女儿墙')
assert(types.includes('skylight'), '识别天窗')
assert(types.includes('fan'), '识别风机基础')
assert(types.includes('shaft'), '识别排烟井')
assert(plane.obstacles.length === 4, `共 4 处禁布区（实际 ${plane.obstacles.length}，无关图层被忽略）`)
assert(
  plane.parapetHeight === 0,
  '存在独立女儿墙图层时不再重复加整体女儿墙高度',
)

console.log('3. 未识别图层提示')
assert(result.unknownLayers.includes('无关家具层'), '未识别图层名回传提示')

console.log('4. 异常输入')
let threw = false
try {
  parseDxf('坏文件', '0\nEOF\n')
} catch {
  threw = true
}
assert(threw, '缺少屋面轮廓时抛出明确错误')

console.log(`\n结果：${pass} 通过 / ${fail} 失败`)
if (fail) process.exit(1)
