import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = process.env.BASE_URL ?? 'http://localhost:5180';
const outDir = 'tests/out';
mkdirSync(outDir, { recursive: true });

const flow = process.argv[2] ?? 'archive';
const w = Number(process.argv[3] ?? 1600);
const h = Number(process.argv[4] ?? 940);

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => { if (m.type() !== 'debug') logs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
await page.goto(base, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1200));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function clickText(sel, text) {
  const els = await page.$$(sel);
  for (const el of els) {
    const t = await el.evaluate((n) => n.textContent?.trim() ?? '');
    if (t.includes(text)) { await el.click(); return true; }
  }
  return false;
}

if (flow === 'archive') {
  await clickText('.row', 'GF-2608-0001');
  await wait(900);
} else if (flow === 'generate') {
  await clickText('.row', 'GF-2608-0001');
  await wait(400);
  await clickText('button.nav-item', '生成台');
  await wait(1000);
} else if (flow === 'compare') {
  await clickText('.row', 'GF-2608-0001');
  await wait(300);
  await clickText('button.nav-item', '版本比对');
  await wait(1200);
} else if (flow === 'review') {
  await clickText('.row', 'GF-2609-0002');
  await wait(300);
  await clickText('button.nav-item', '审稿归档');
  await wait(1000);
} else if (flow === 'create') {
  await clickText('.lhead button', '建档');
  await wait(900);
}

await page.screenshot({ path: `${outDir}/${flow}.png` });
if (logs.length) console.log(logs.join('\n'));
console.log('shot ->', `${outDir}/${flow}.png`);
await browser.close();
