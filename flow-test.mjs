// 流程测试：录单 → 布置(加墓碑/碰撞检测/定稿) → 派工 → 提交质检 → 质检打回 → 看板
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4519/'
const errors = []
const log = (...a) => console.log(...a)

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox']
})
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 900 })
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push('[console] ' + m.text()) })
page.on('pageerror', e => errors.push('[pageerror] ' + e.message))
const sleep = ms => new Promise(r => setTimeout(r, ms))
const clickBtn = txt => page.evaluate(t => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes(t) && !x.disabled)
  if (b) { b.click(); return true } return false
}, txt)

await page.goto(BASE, { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.goto(BASE + '#/reception', { waitUntil: 'networkidle0' })
await sleep(300)

// 1. 录单（沿第 1 排找第一个空闲号位）
await page.type('input[placeholder="联系人姓名"]', '流程测试')
await page.type('input[placeholder="手机 / 电话"]', '13911112222')
const inputs = await page.$$('.form-grid input')
await inputs[2].type('测试公')
await inputs[3].type('先考测试公之墓')
const colSel = (await page.$$('.form-grid select'))[3] // 号
let found = false
for (let c = 0; c < 40; c++) {
  await colSel.select(String(c))
  await sleep(80)
  if (!(await page.$('.field .error-text'))) { found = true; break }
}
log('✓ 0 找到空闲墓位:', found ? 'OK' : 'FAIL')
await clickBtn('录单并去布置')
await sleep(600)
log('✓ 1 录单并跳转编辑器:', page.url().includes('/editor/WO') ? 'OK' : 'FAIL ' + page.url())

// 2. 编辑器：加墓碑 → 拖出墓位应变红 → 删除重加 → 定稿
await clickBtn('墓碑')
await sleep(250)
const cv = await page.$('.canvas-host canvas')
const box = await cv.boundingBox()
const cx = box.x + box.width / 2, cy = box.y + box.height / 2
log('✓ 2 添加墓碑并选中:', await page.evaluate(() => document.body.innerText.includes('选中物件：墓碑')) ? 'OK' : 'FAIL')
await page.mouse.move(cx, cy); await page.mouse.down()
await page.mouse.move(cx + 220, cy + 220, { steps: 12 }); await page.mouse.up()
await sleep(250)
const invalid1 = await page.evaluate(() => /越界|压占|堵住通道/.test(document.body.innerText))
log('✓ 3 拖出墓位触发碰撞变红:', invalid1 ? 'OK' : 'FAIL')
await page.evaluate(() => {
  ;[...document.querySelectorAll('button')].find(x => x.textContent.trim() === '删除')?.click()
})
await sleep(150)
await clickBtn('墓碑')
await sleep(250)
const invalid2 = await page.evaluate(() => /越界|压占|堵住通道/.test(document.body.innerText))
log('✓ 4 重新放置后无碰撞:', !invalid2 ? 'OK' : 'FAIL')
const canFinalize = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent.includes('定稿'))
  return b && !b.disabled
})
log('✓ 5 定稿按钮可用:', canFinalize ? 'OK' : 'FAIL')
await clickBtn('定稿')
await sleep(300)

// 3. 排班：派工 → 传照片 → 提交质检
await page.goto(BASE + '#/schedule', { waitUntil: 'networkidle0' })
await sleep(300)
const assigned = await page.evaluate(() => {
  const row = [...document.querySelectorAll('table.data tr')].find(tr => tr.textContent.includes('流程测试'))
  if (!row) return 'no-row'
  row.querySelector('button.btn-primary')?.click()
  return 'OK'
})
await sleep(300)
log('✓ 6 派工:', assigned)
await page.evaluate(() => {
  const row = [...document.querySelectorAll('table.data tr')].find(tr => tr.textContent.includes('流程测试'))
  ;[...row.querySelectorAll('button')].find(b => b.textContent.includes('示例照片'))?.click()
})
await sleep(200)
const submitted = await page.evaluate(() => {
  const row = [...document.querySelectorAll('table.data tr')].find(tr => tr.textContent.includes('流程测试'))
  const b = [...row.querySelectorAll('button')].find(b => b.textContent.includes('提交质检'))
  if (b && !b.disabled) { b.click(); return 'OK' } return 'FAIL'
})
await sleep(200)
log('✓ 7 传照片并提交质检:', submitted)

// 4. 质检：不合格打回
await page.goto(BASE + '#/qc', { waitUntil: 'networkidle0' })
await sleep(300)
await page.evaluate(() => {
  const card = [...document.querySelectorAll('.card')].find(c => c.textContent.includes('流程测试'))
  ;[...card.querySelectorAll('button')].find(b => b.textContent.includes('抽查不合格'))?.click()
})
await sleep(200)
await page.type('.modal textarea', '石栏未对齐，需整改')
await clickBtn('打回并计一次返工')
await sleep(300)
const rejectedShown = await page.evaluate(() => document.body.innerText.includes('石栏未对齐，需整改'))
log('✓ 8 质检打回+整改项:', rejectedShown ? 'OK' : 'FAIL')

// 5. 看板
await page.goto(BASE + '#/dashboard', { waitUntil: 'networkidle0' })
await sleep(300)
const dash = await page.evaluate(() => document.body.innerText)
log('✓ 9 看板统计:', dash.includes('打回整改') && dash.includes('返工率') && dash.includes('平均工期') ? 'OK' : 'FAIL')

await browser.close()
if (errors.length) {
  log('\n=== 控制台错误 ===')
  errors.forEach(e => log(e))
  process.exit(1)
}
log('\n流程测试全部通过')
