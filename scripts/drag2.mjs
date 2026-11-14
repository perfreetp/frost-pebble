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
await page.waitForTimeout(1300);

await page.selectOption('.user-switch select', 'u-f1');
await page.waitForTimeout(1300);
const rows = page.locator('.list-row');
const n = await rows.count();
for (let i = 0; i < n; i++) {
  const t = await rows.nth(i).innerText();
  if (t.includes('槐荫里')) { await rows.nth(i).click(); break; }
}
await page.waitForTimeout(1300);

const vp = await page.locator('.viewport').first().boundingBox();
const dbg = await page.evaluate(() => window.__layoutDebug);
console.log('mode', dbg.mode, 'size', dbg.size, 'vp', vp);
const visibleBoxes = dbg.boxes.filter((b) => b.visible && b.x >= 0 && b.y >= 0 && b.x < dbg.size.w && b.y < dbg.size.h);
console.log('visible boxes:', visibleBoxes.length, 'of', dbg.boxes.length);
console.log('sample', visibleBoxes.slice(0, 4));

const dispBox = await page.evaluate(() => {
  const cv = document.querySelector('.viewport canvas');
  const r = cv.getBoundingClientRect();
  return { left: r.left, top: r.top, w: r.width, h: r.height };
});
const target = visibleBoxes.find((b) => b.pinned) ?? visibleBoxes[0];
const px = dispBox.left + (target.x / dbg.size.w) * dispBox.w;
const py = dispBox.top + (target.y / dbg.size.h) * dispBox.h;
console.log('target', target.label, 'screen', px.toFixed(1), py.toFixed(1));

await page.mouse.move(px, py);
await page.waitForTimeout(200);
const tipText = (await page.locator('.viewport-tip').count()) ? (await page.locator('.viewport-tip').first().innerText()).trim() : '(none)';
console.log('hover tip:', tipText);

const beforeText = await page.locator('body').innerText();
const manualBefore = beforeText.match(/手工标记\s+(\d+)\s+处/)?.[1];

await page.mouse.down();
for (let i = 1; i <= 10; i++) {
  await page.mouse.move(px + i * 4, py - i * 3);
  await page.waitForTimeout(16);
}
await page.mouse.up();
await page.waitForTimeout(800);

const selectedText = await page.locator('.panel', { hasText: '选中对象' }).first().innerText();
console.log('--- 选中对象 ---\n' + selectedText.split('\n').slice(0, 10).join(' | '));
const afterText = await page.locator('body').innerText();
const manualAfter = afterText.match(/手工标记\s+(\d+)\s+处/)?.[1];
console.log('manual before/after:', manualBefore, manualAfter, '| dirty:', afterText.includes('未保存'));
await page.screenshot({ path: 'scripts/s5-drag.png' });

const saveBtn = page.locator('button:has-text("保存排布")');
if (await saveBtn.count()) {
  await saveBtn.click();
  await page.waitForTimeout(700);
  console.log('saved:', (await page.locator('body').innerText()).includes('排布已保存'));
}

await page.click('button:has-text("操作记录")');
await page.waitForTimeout(400);
const logText = await page.locator('.modal').innerText();
console.log('--- log ---\n' + logText.split('\n').slice(0, 12).join('\n'));
await page.screenshot({ path: 'scripts/s6-log.png' });

// 刷新页面验证持久化（手工标记仍在）
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.selectOption('.user-switch select', 'u-f1');
await page.waitForTimeout(1200);
const rows2 = page.locator('.list-row');
for (let i = 0; i < (await rows2.count()); i++) {
  if ((await rows2.nth(i).innerText()).includes('槐荫里')) { await rows2.nth(i).click(); break; }
}
await page.waitForTimeout(1200);
const reloaded = await page.locator('body').innerText();
console.log('after reload manual:', reloaded.match(/手工标记\s+(\d+)\s+处/)?.[1]);

console.log('errors', errors.slice(0, 8));
await browser.close();
