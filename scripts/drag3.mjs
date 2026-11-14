import { chromium } from 'playwright-core';

const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({
  executablePath: exe,
  args: ['--enable-unsafe-webgpu', '--use-angle=d3d11', '--enable-features=WebGPU'],
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1560, height: 940 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

await page.selectOption('.user-switch select', 'u-f1');
await page.waitForTimeout(1000);
const rows = page.locator('.list-row');
for (let i = 0; i < (await rows.count()); i++) {
  if ((await rows.nth(i).innerText()).includes('槐荫里')) { await rows.nth(i).click(); break; }
}
await page.waitForTimeout(1100);

const toScreen = async (x, y) => {
  const dbg = await page.evaluate(() => window.__layoutDebug);
  const box = await page.evaluate(() => {
    const r = document.querySelector('.viewport canvas').getBoundingClientRect();
    return { left: r.left, top: r.top, w: r.width, h: r.height };
  });
  return { px: box.left + (x / dbg.size.w) * box.w, py: box.top + (y / dbg.size.h) * box.h };
};

// ---- 1. 拖动立管段（高度） ----
let dbg = await page.evaluate(() => window.__layoutDebug);
const seg = dbg.segments.find((s) => s.visible && s.y > 200 && s.x > 400 && s.x < 700);
const sp = await toScreen(seg.x, seg.y);
await page.mouse.move(sp.px, sp.py);
await page.waitForTimeout(150);
const tip = (await page.locator('.viewport-tip').count()) ? await page.locator('.viewport-tip').first().innerText() : '(none)';
console.log('segment hover:', tip.replace(/\n/g, ' '));

await page.mouse.down();
for (let i = 1; i <= 8; i++) { await page.mouse.move(sp.px, sp.py - i * 4); await page.waitForTimeout(16); }
await page.mouse.up();
await page.waitForTimeout(600);
let panel = await page.locator('.panel', { hasText: '选中对象' }).first().innerText();
console.log('段面板:', panel.split('\n').filter((l) => l.trim()).slice(0, 8).join(' | '));

// ---- 2. 俯视下拖动表箱（进深） ----
await page.click('.view-hud-btn:has-text("俯视视图")');
await page.waitForTimeout(1000);
dbg = await page.evaluate(() => window.__layoutDebug);
const box = dbg.boxes.find((b) => b.visible && b.x > 200 && b.x < 800 && b.y > 100 && b.y < 650);
console.log('俯视表箱:', box?.label, box?.x?.toFixed(0), box?.y?.toFixed(0));
if (box) {
  const bp = await toScreen(box.x, box.y);
  await page.mouse.move(bp.px, bp.py);
  await page.waitForTimeout(200);
  const t2 = (await page.locator('.viewport-tip').count()) ? await page.locator('.viewport-tip').first().innerText() : '(none)';
  console.log('俯视 hover:', t2.replace(/\n/g, ' '));
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(bp.px, bp.py + i * 3); await page.waitForTimeout(16); }
  await page.mouse.up();
  await page.waitForTimeout(600);
  panel = await page.locator('.panel', { hasText: '选中对象' }).first().innerText();
  console.log('箱面板:', panel.split('\n').filter((l) => l.trim()).slice(0, 10).join(' | '));
}
const body = await page.locator('body').innerText();
console.log('手工标记数:', body.match(/手工标记\s+(\d+)\s+处/)?.[1]);
console.log('有未保存标记:', body.includes('未保存'));
await page.screenshot({ path: 'scripts/s12-topdrag.png' });
console.log('errors', errors.slice(0, 6));
await browser.close();
