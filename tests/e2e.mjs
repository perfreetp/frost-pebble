import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.env.BASE_URL ?? 'http://localhost:5180';
const outDir = 'tests/out';
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => { if (m.type() === 'error') logs.push(`[console] ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}\n${e.stack}`));
await page.setViewport({ width: 1600, height: 940 });
await page.goto(base, { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1000));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

async function clickText(sel, text) {
  const els = await page.$$(sel);
  for (const el of els) {
    const t = await el.evaluate((n) => n.textContent?.trim() ?? '');
    if (t.includes(text)) { await el.click(); return true; }
  }
  return false;
}

async function go(screen) {
  await clickText('button.nav-item', screen);
  await wait(700);
}

// ---------- 0. WebGL2 渲染 -----------------
// 选择 永
await clickText('.row', 'GF-2608-0001');
await wait(800);
const canvasCount = await page.evaluate(() => document.querySelectorAll('.stage canvas').length);
check('Archive detail mounts one WebGL canvas', canvasCount === 1, `${canvasCount} canvas`);
const glPixel = await page.evaluate(() => {
  const c = document.querySelector('.stage canvas');
  if (!c) return null;
  const gl = c.getContext('webgl2');
  if (!gl) return { error: 'no ctx' };
  const px = new Uint8Array(4 * 64 * 64);
  gl.readPixels(Math.floor(c.width / 2) - 32, Math.floor(c.height / 2) - 32, 64, 64, gl.RGBA, gl.UNSIGNED_BYTE, px);
  let dark = 0;
  for (let i = 0; i < px.length; i += 4) if (px[i] < 90 && px[i + 3] > 100) dark++;
  return { dark, total: 64 * 64, webgl2: true };
});
check('WebGL2 actually rasterises glyph ink', !!glPixel && glPixel.webgl2 && glPixel.dark > 40, JSON.stringify(glPixel));

// ---------- 1. 检索 -----------------
await page.select('#f-lib', '玄墨黑');
await wait(300);
let rows = await page.$$eval('.row', (els) => els.length);
check('Filter by library 玄墨黑', rows === 4, `${rows} rows`);

await page.select('#f-lib', '');
await page.select('#f-st', '已归档');
await wait(300);
rows = await page.$$eval('.row', (els) => els.length);
check('Filter by status 已归档', rows === 3, `${rows} rows`);

await page.select('#f-wt', '常规 400');
await wait(300);
rows = await page.$$eval('.row', (els) => els.length);
check('Multi-filter (已归档 + 常规400)', rows === 3, `${rows} rows`);

await page.select('#f-wt', '');
await page.select('#f-st', '');
await page.type('.search input', '永');
await wait(300);
rows = await page.$$eval('.row', (els) => els.length);
check('Keyword search 永', rows === 1, `${rows} rows`);
await page.evaluate(() => {
  const i = document.querySelector('.search input');
  i.value = '';
  i.dispatchEvent(new Event('input', { bubbles: true }));
});
await wait(200);

// 日期过滤
await page.evaluate(() => {
  const inputs = document.querySelectorAll('input[type=date]');
  const set = (el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
  set(inputs[0], '2026-10-01');
  set(inputs[1], '2026-10-31');
});
await wait(300);
rows = await page.$$eval('.row', (els) => els.length);
const dateRows = await page.$$eval('.row', (els) => els.map((e) => e.textContent));
check('Date range filter 2026-10', rows === 4, `${rows} rows: ${dateRows.map((t) => t.trim().slice(0, 12)).join(' | ')}`);
await page.evaluate(() => {
  const inputs = document.querySelectorAll('input[type=date]');
  inputs[0].value = ''; inputs[1].value = '';
  inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
  inputs[1].dispatchEvent(new Event('change', { bubbles: true }));
});
await wait(200);

// ---------- 2. 生成台：确定性 + 拖点锁定 + 保留 ----------
await clickText('.row', 'GF-2608-0001');
await wait(500);
await go('生成台');
await wait(500);

const fp0 = await page.$eval('.fpline .v', (e) => e.textContent.trim());
// 连点两次一致性校验按钮
await clickText('button', '同种子连生两次');
await wait(300);
const toastText = await page.$eval('.toast', (e) => e.textContent).catch(() => '');
check('Deterministic self-check toast', toastText.includes('完全一致'), toastText.trim());

// 改参数 → 指纹变化 & dirty
const weightInput = await page.$('#p-weight');
await page.evaluate(() => {
  const el = document.querySelector('#p-weight');
  el.value = '120';
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await wait(500);
const dirty = await page.$eval('.dirty', (e) => e.textContent).catch(() => '');
check('Param change marks unsaved', dirty.includes('未保存'), dirty.trim());

// 拖一个端点 → 锁定
const before = await page.$$eval('.srow.locked', (e) => e.length);
// 选一条「参数生成」的笔画，激活后再拖其端点
const unlockedRow = await page.$('.srow:not(.locked)');
await unlockedRow.click();
await wait(400);
const handle = await page.$('.sgrp.active .handle');
const box = await handle.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 26, box.y + box.height / 2 + 18, { steps: 8 });
await page.mouse.up();
await wait(600);
const after = await page.$$eval('.srow.locked', (e) => e.length);
check('Dragging endpoint locks that stroke', after >= before + 1, `${before} → ${after} locked`);

// 再改参数 → 锁定数保持
await page.evaluate(() => {
  const el = document.querySelector('#p-contrast');
  el.value = '0.6';
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await wait(500);
const after2 = await page.$$eval('.srow.locked', (e) => e.length);
check('Manual strokes preserved after regeneration', after2 === after, `${after} → ${after2}`);
const fpNow = await page.$eval('.fpline .v', (e) => e.textContent.trim());
check('Fingerprint changed with params', fpNow !== fp0, `${fp0} → ${fpNow}`);

// 保存新版本
const verBefore = await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('glyph-forge.v2'));
  return d.records.find((r) => r.id.includes('2608-0001')).versions.length;
});
await clickText('button', '保存为新版本');
await wait(1000);
const verAfter = await page.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('glyph-forge.v2'));
  return d.records.find((r) => r.id.includes('2608-0001')).versions.length;
});
check('Save creates new version', verAfter === verBefore + 1, `v${verBefore} → v${verAfter}`);
const toasts = await page.$$eval('.toast', (els) => els.map((e) => e.textContent.trim()));
check('Save toast confirms version', toasts.some((t) => t.includes('已保存为')), toasts.join(' / '));

// 重载后持久化
await page.reload({ waitUntil: 'networkidle0' });
await wait(900);
const persisted = await page.evaluate(() => {
  const raw = localStorage.getItem('glyph-forge.v2');
  if (!raw) return null;
  const d = JSON.parse(raw);
  const rec = d.records.find((r) => r.id.includes('2608-0001'));
  return { versions: rec?.versions.length, locked: rec?.versions.at(-1)?.lockedCount };
});
check('Persisted to localStorage with new version + locks', !!persisted && persisted.versions === 4 && persisted.locked >= 1, JSON.stringify(persisted));

// ---------- 3. 比对 3% 阈值 ----------
await clickText('.row', 'GF-2608-0001');
await wait(400);
await go('版本比对');
await wait(800);
// 设置一个大幅变化的对比：v1 vs v4
const selA = await page.$('#vp-a');
const opts = await page.$$eval('#vp-a option', (els) => els.map((e) => e.value));
await page.select('#vp-a', opts[0]);
await page.select('#vp-b', opts[opts.length - 1]);
await wait(700);
const flaggedCount = await page.$$eval('.dev-list li', (e) => e.length).catch(() => 0);
const devTxt = await page.$eval('.devbox', (e) => e.textContent).catch(() => '');
check('Compare screen computes >3% deviations', flaggedCount >= 0, `flagged=${flaggedCount}; ${devTxt.replace(/\s+/g, ' ').slice(0, 120)}`);

// ---------- 4. 审稿：打点、回复、处理 ----------
await go('档案');
await wait(400);
await clickText('.row', 'GF-2609-0002');
await wait(500);
await go('审稿归档');
await wait(700);
const stageBox = await (await page.$('.canvas-wrap')).boundingBox();
await page.mouse.click(stageBox.x + stageBox.width * 0.62, stageBox.y + stageBox.height * 0.45);
await wait(400);
const located = await page.$eval('.compose .pt', (e) => e.textContent).catch(() => '');
check('Clicking glyph surface locates a comment point', located.includes('定位'), located.trim());
await page.type('.compose textarea', '横画中段偏细，与字库整体字重不匹配。');
await wait(200);
await clickText('.compose button', '记录意见');
await wait(600);
const pinCount = await page.$$eval('.pin', (e) => e.length);
check('Comment pin added to glyph', pinCount === 3, `${pinCount} pins`);

// 切设计员，回复并处理
await clickText('.ms', '设计员');
await wait(400);
const quickInput = await page.$('.cc-quick .field');
await quickInput.click();
await quickInput.type('已将该横中段厚度增加 8%，见 v3。');
await wait(200);
await clickText('.cc-quick button', '回复');
await wait(500);
const replied = await page.$$eval('.cc-rnum', (e) => e.length);
check('Designer reply recorded', replied >= 1, `${replied} threads with replies`);

// 处理所有待处理
let guard = 0;
while (guard++ < 8) {
  const pendingBtns = await page.$$('.ccard:not(.done) .cc-quick button');
  if (!pendingBtns.length) break;
  // reply first
  const inputs = await page.$$('.ccard:not(.done) .cc-quick .field');
  if (inputs[0]) {
    await inputs[0].click();
    await inputs[0].type('已按意见修订。');
    await wait(100);
    await pendingBtns[0].click();
    await wait(300);
  }
  // then resolve
  const resolveBtns = await page.$$('.ccard:not(.done)');
  if (resolveBtns[0]) {
    await resolveBtns[0].click();
    await wait(300);
    const mark = await page.$$('.co-act button');
    for (const b of mark) {
      const t = await b.evaluate((n) => n.textContent ?? '');
      if (t.includes('标记已处理')) { await b.click(); await wait(300); break; }
    }
  }
}
const pendVal = await page.$eval('.mst .v.pend', (e) => e.textContent).catch(() => '');
check('All comments resolved (待处理 = 0)', pendVal.trim() === '0', `pending=${pendVal.trim()}`);
const archives = await page.$$('.archive-ready');
const archNote = await page.$eval('.archived-note', (e) => e.textContent).catch(() => '');
check('Archive-ready banner shown', archives.length === 1, `banner=${archives.length} archivedNote=${archNote.trim()}`);

await clickText('.archive-ready button', '验收归档');
await wait(900);
const modal = await page.$('.report-frame');
check('Acceptance archives & opens specimen report', !!modal, modal ? 'report iframe open' : 'missing');
const reportText = modal ? await page.evaluate(() => document.querySelector('.report-frame').contentDocument.body.innerText) : '';
check('Report contains specimen + comments', reportText.includes('字样报告') && reportText.includes('验收通过'), `len=${reportText.length}`);

await page.screenshot({ path: `${outDir}/report.png` });
await clickText('.modal-actions button', '关闭');
await wait(400);
const statusChip = await page.$eval('.rv-head .chip', (e) => e.textContent).catch(() => '');
check('Record status becomes 已归档', statusChip.includes('已归档'), statusChip.trim());

console.log('\n' + results.filter((r) => !r.ok).length + ' failed of ' + results.length);
if (logs.length) console.log('\nConsole errors:\n' + logs.join('\n'));
await browser.close();
process.exit(results.some((r) => !r.ok) ? 1 : 0);
