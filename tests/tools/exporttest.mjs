// Manual smoke: opens the app, exports a delivery zip and writes it next to this script.
// Run with the dev server on :5173 — `node tests/tools/exporttest.mjs`.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5173/#/projects', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const r = document.querySelector('farm-app').shadowRoot.querySelector('main .view').shadowRoot;
  [...r.querySelectorAll('.card')].find((c) => c.textContent.includes('越冬的守望')).click();
});
await page.evaluate(() => document.querySelector('farm-app').shadowRoot.querySelector('nav [data-view="animate"]').click());
await page.waitForTimeout(1800);
await page.evaluate(() => document.querySelector('farm-app').shadowRoot.querySelector('main .view').shadowRoot.querySelector('#btn-export').click());
await page.waitForTimeout(400);
const dl = page.waitForEvent('download', { timeout: 120000 });
await page.evaluate(() => document.querySelector('.modal-backdrop [data-ok]').click());
const download = await dl;
const out = path.join(here, 'delivery.zip');
await download.saveAs(out);
console.log(`saved ${download.suggestedFilename()} → ${out} (${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB)`);
await browser.close();
