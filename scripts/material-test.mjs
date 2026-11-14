// 四种材质渲染验证：亮面/哑光/电镀/变色龙
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = fileURLToPath(new URL('../test-output/materials/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--window-size=1440,900'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('canvas');
  await new Promise((r) => setTimeout(r, 600));

  const mats = [
    { key: 'glossy', name: '亮面' },
    { key: 'matte', name: '哑光' },
    { key: 'chrome', name: '电镀' },
    { key: 'chameleon', name: '变色龙' },
  ];
  for (const m of mats) {
    await page.$eval(`[data-material="${m.key}"]`, (el) => el.click());
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: `${OUT}${m.key}.png` });
  }

  // 膜宽联动：切到界面二，把膜宽改成 1.8m，超宽分块应减少
  await page.$eval('[data-tab="seams"]', (el) => el.click());
  await new Promise((r) => setTimeout(r, 300));
  const before = await page.$$eval('.panel-item.over-width', (els) => els.length);
  const rollInput = await page.$('.params-grid input');
  await rollInput.click({ count: 3 });
  await rollInput.type('1.80');
  await rollInput.evaluate((el) => el.dispatchEvent(new Event('change', { bubbles: true })));
  await new Promise((r) => setTimeout(r, 400));
  const after = await page.$$eval('.panel-item.over-width', (els) => els.length);
  console.log(`膜宽 1.52m 超宽分块 ${before} 个 → 膜宽 1.80m 超宽分块 ${after} 个`);

  console.log('材质渲染错误:', errors.length ? errors : '无');
  const pass = errors.length === 0 && after < before;
  console.log(pass ? '材质与膜宽联动验证通过 ✓' : '验证失败 ✗');
  process.exitCode = pass ? 0 : 1;
} finally {
  await browser.close();
}
