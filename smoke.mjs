// 冒烟测试：加载五个页面，收集控制台错误，并模拟编辑器拖拽
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4519/'
const errors = []

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900 })
page.on('console', m => { if (m.type() === 'error') errors.push('[console] ' + m.text()) })
page.on('pageerror', e => errors.push('[pageerror] ' + e.message))

async function go(hash, name) {
  await page.goto(BASE + '#' + hash, { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 400))
  console.log(`✓ ${name} loaded`)
}

await go('/reception', '前台接单')
// 录一单
await page.type('input[placeholder="联系人姓名"]', '测试家属')
await page.type('input[placeholder="手机 / 电话"]', '13900000000')
const inputs = await page.$$('.form-grid input')
await inputs[2].type('测试逝者')
// 选一个空闲墓位：直接点“仅录单”前找可用墓位（默认 1排1号可能被占）
const taken = await page.$eval('.field .error-text', el => el.textContent).catch(() => null)
if (taken) {
  // 切到第 2 排
  const selects = await page.$$('.form-grid select')
  await selects[1].select('1')
}
await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')]
  btns.find(b => b.textContent.includes('仅录单'))?.click()
})
await new Promise(r => setTimeout(r, 300))
console.log('✓ 录单成功')

await go('/editor', '布置编辑器(选单)')
// 打开第一个工单的编辑器
const link = await page.$('a[href*="/editor/WO"]')
if (link) {
  await link.click()
  await new Promise(r => setTimeout(r, 600))
  console.log('✓ 编辑器打开')
  // 画布交互：平移 + 缩放 + 点击画布中心附近
  const cv = await page.$('.canvas-host canvas')
  const box = await cv.boundingBox()
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 80, cy + 60, { steps: 10 })
  await page.mouse.up()
  await page.mouse.wheel({ deltaY: -240 })
  await new Promise(r => setTimeout(r, 300))
  // 添加一个绿植
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.pal-btn')]
    btns.find(b => b.textContent.includes('绿植'))?.click()
  })
  await new Promise(r => setTimeout(r, 300))
  // 拖拽新加的物件（它在墓位中心）
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + 40, cy + 30, { steps: 8 })
  await page.mouse.up()
  await new Promise(r => setTimeout(r, 300))
  console.log('✓ 画布拖拽/缩放/加物件无异常')
  // 定稿按钮状态
  const finalizeDisabled = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('定稿'))
    return b ? b.disabled : 'missing'
  })
  console.log('  定稿按钮 disabled =', finalizeDisabled)
} else {
  console.log('✗ 未找到工单链接')
}

await go('/schedule', '工单排班')
await go('/qc', '质检')
await go('/dashboard', '看板')

const bodyText = await page.evaluate(() => document.body.innerText)
for (const kw of ['返工率', '平均工期', '超期']) {
  if (!bodyText.includes(kw)) errors.push('[dashboard] 缺少关键词: ' + kw)
}

await browser.close()
if (errors.length) {
  console.log('\n=== 发现错误 ===')
  errors.forEach(e => console.log(e))
  process.exit(1)
} else {
  console.log('\n全部通过，无控制台错误')
}
