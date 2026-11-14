import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = 'http://localhost:5180';
const browser = await puppeteer.launch({
  executablePath: chrome, headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 940 });
await page.goto(base, { waitUntil: 'networkidle0' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(900);

async function clickText(sel, text) {
  for (const el of await page.$$(sel)) {
    const t = await el.evaluate((n) => n.textContent?.trim() ?? '');
    if (t.includes(text)) { await el.click(); return true; }
  }
  return false;
}

await clickText('.row', 'GF-2609-0003');
await wait(400);
await clickText('button.nav-item', '生成台');
await wait(900);

// activate 2nd unlocked stroke and drag its middle node
const rows = await page.$$('.srow:not(.locked)');
if (rows[1]) await rows[1].click();
await wait(400);
let handles = await page.$$('.sgrp.active .handle');
if (!handles.length) handles = await page.$$('.sgrp .handle');
const target = handles[Math.min(1, handles.length - 1)];
const box = await target.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 - 38, box.y + box.height / 2 - 22, { steps: 10 });
await page.mouse.up();
await wait(800);
await page.screenshot({ path: 'tests/out/gen-drag.png' });

// then change weight and confirm locked stays red
await page.evaluate(() => {
  const el = document.querySelector('#p-weight');
  el.value = '130';
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
await wait(700);
await page.screenshot({ path: 'tests/out/gen-drag2.png' });
console.log('done');
await browser.close();
