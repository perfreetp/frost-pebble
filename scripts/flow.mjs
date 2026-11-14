import { chromium } from 'playwright-core';

const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://127.0.0.1:8123/';

const browser = await chromium.launch({
  executablePath: exe,
  args: ['--enable-unsafe-webgpu', '--use-angle=d3d11', '--enable-features=WebGPU'],
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1560, height: 940 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(URL, { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// ---------- 1. 改参数重算，手工标记不动 ----------
await page.selectOption('.user-switch select', 'u-f1');
await page.waitForTimeout(1000);
const rows = page.locator('.list-row');
for (let i = 0; i < (await rows.count()); i++) {
  if ((await rows.nth(i).innerText()).includes('槐荫里')) { await rows.nth(i).click(); break; }
}
await page.waitForTimeout(1000);

const pinnedBefore = await page.evaluate(() => window.__layoutDebug.boxes.filter((b) => b.pinned).map((b) => ({ id: b.id, world: null, sx: b.x, sy: b.y })));
const pinnedLabels = (await page.locator('.panel', { hasText: '校验与手工标记' }).first().innerText());
console.log('之前手工:', pinnedLabels.split('\n').filter((l) => l.includes('手工标记表箱')).join(' | '));

// 面板中第一个数字输入是楼栋数，改成 6
const buildingInput = page.locator('.panel', { hasText: '参数调整' }).locator('input[type=number]').first();
await buildingInput.fill('6');
await buildingInput.dispatchEvent('change');
await page.waitForTimeout(900);

const dbgAfter = await page.evaluate(() => window.__layoutDebug);
const bodyAfter = await page.locator('body').innerText();
console.log('重算后 表箱数:', dbgAfter.boxes.length, '手工:', dbgAfter.boxes.filter((b) => b.pinned).length);
console.log('重算后 楼栋标签:', bodyAfter.includes('6 号楼'));
// 手工箱仍在同一屏幕位置附近（第1栋未动，参数只加楼栋）
const pinnedNow = dbgAfter.boxes.filter((b) => b.pinned);
console.log('手工箱屏幕坐标:', pinnedNow.map((b) => `${b.label}(${b.x.toFixed(0)},${b.y.toFixed(0)})`).join(' '));

// 改层高，检查手工箱屏幕位置随楼栋缩放（但世界坐标不变）→ 用世界坐标作断言
const worldPinned = await page.evaluate(() => {
  // 从 DOM 面板读取世界坐标
  return document.querySelector('.panel-body') ? null : null;
});

// ---------- 2. 提交完工 → 抽查 ----------
await page.click('button:has-text("还原")').catch(() => {});
await page.waitForTimeout(500);
await page.click('button:has-text("完工提交")');
await page.waitForTimeout(600);
console.log('提交弹窗出现:', (await page.locator('.modal').count()) > 0);
// 模拟拍摄 3 张
for (let i = 0; i < 3; i++) {
  await page.click('button:has-text("模拟拍摄")');
  await page.waitForTimeout(250);
}
const photoCount = await page.locator('.photo-card').count();
console.log('照片数:', photoCount);
await page.locator('.modal').locator('textarea').fill('现场安装完成，立管支架已按图加固');
await page.click('.modal button:has-text("提交完工")');
await page.waitForTimeout(900);

const statusText = await page.locator('.topbar').innerText();
const qcBadge = await page.locator('.nav-dot').count();
console.log('点检红点在导航:', qcBadge);
const bodyNow = await page.locator('body').innerText();
console.log('工单进入待质检:', bodyNow.includes('等待质检') || bodyNow.includes('待质检'));
await page.screenshot({ path: 'scripts/s7-submitted.png' });
console.log('errors', errors.slice(0, 6));
await browser.close();
