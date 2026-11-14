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

// 切到质检员
await page.selectOption('.user-switch select', 'u-qc');
await page.waitForTimeout(1400);
let body = await page.locator('body').innerText();
console.log('质检页打开:', body.includes('待质检队列'));
console.log('队列条目:', (await page.locator('.list-row').count()));
await page.screenshot({ path: 'scripts/s8-qc.png' });

// 退回整改
await page.click('button:has-text("不合格 · 退回整改")');
await page.waitForTimeout(500);
const modalOpen = (await page.locator('.modal').count()) > 0;
console.log('退回弹窗:', modalOpen);
if (modalOpen) {
  const boxes = page.locator('.modal .check-row input[type=checkbox]');
  await boxes.nth(0).check();
  await boxes.nth(4).check();
  await page.locator('.modal textarea').fill('表箱固定与防腐不达标，整改后复检');
  await page.click('.modal button:has-text("确认退回")');
  await page.waitForTimeout(800);
}
body = await page.locator('body').innerText();
console.log('已退回并进入返工:', body.includes('退回整改') || body.includes('整改'));
await page.screenshot({ path: 'scripts/s9-reject.png' });

// 再通过一单
const passBtn = page.locator('button:has-text("合格通过")');
if (await passBtn.count()) {
  const nameBefore = await page.locator('.list-row').first().innerText();
  await passBtn.first().click();
  await page.waitForTimeout(800);
  console.log('通过操作后队列数:', await page.locator('.list-row').count());
}

// 看板
await page.click('.nav-item:has-text("施工看板")');
await page.waitForTimeout(1000);
body = await page.locator('body').innerText();
console.log('看板标题:', body.includes('施工看板'));
console.log('含返工率:', body.includes('返工率'), '| 含超期:', body.includes('超期'));
const tableRows = await page.locator('.table tbody tr').count();
console.log('看板表格行数:', tableRows);
await page.screenshot({ path: 'scripts/s10-board.png' });
console.log('errors', errors.slice(0, 8));
await browser.close();
