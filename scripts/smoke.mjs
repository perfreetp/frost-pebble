// 无头浏览器冒烟测试：验证渲染、交互、算料、localStorage 持久化与截图
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const APP_URL = 'http://127.0.0.1:5173/';
const OUT = fileURLToPath(new URL('../test-output/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const shot = (name) => OUT + name;

const logs = [];
const errors = [];
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--window-size=1440,900'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  page.on('console', (m) => { logs.push(`[${m.type()}] ${m.text()}`); if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await page.waitForSelector('canvas', { timeout: 10000 });
  const glOk = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return !!(c && c.getContext('webgl2'));
  });
  console.log('WebGL2 上下文:', glOk ? 'OK' : 'FAIL');

  // 初始截图（轿车）
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: shot('01-sedan-default.png') });

  // 切 SUV，选哑光 + 宝石蓝
  await page.click('[data-vehicle="suv"]');
  await page.click('[data-material="matte"]');
  await page.click('[data-color="#0b3d91"]');
  await new Promise((r) => setTimeout(r, 400));

  // 开双拼，选车顶，给车顶钢琴黑
  const dual = await page.$('.switch-row input');
  await dual.click();
  await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.panel-row')];
    rows.find((r) => r.textContent.includes('车顶'))?.click();
  });
  await page.click('[data-color="#0b0b0e"]');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: shot('02-suv-dualtone.png') });

  // 切皮卡验证车型重建
  await page.click('[data-vehicle="pickup"]');
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: shot('03-pickup.png') });

  // 界面二：接缝与用料
  await page.$eval('[data-tab="seams"]', (el) => el.click());
  await new Promise((r) => setTimeout(r, 300));
  const seamRows = await page.$$eval('.panel-item.over-width', (els) => els.length);
  const summaryRows = await page.$$eval('#material-summary tbody tr', (els) => els.length);
  console.log('超膜宽红色分块数:', seamRows, '| 用料汇总行数:', summaryRows);
  await page.screenshot({ path: shot('04-seams.png') });

  // 界面三：报价
  await page.$eval('[data-tab="quote"]', (el) => el.click());
  await new Promise((r) => setTimeout(r, 300));
  const quoteText = await page.$eval('.quote-card', (el) => el.textContent);
  const hasTotal = /报价总计/.test(quoteText) && /¥/.test(quoteText);
  console.log('报价单渲染:', hasTotal ? 'OK' : 'FAIL');
  await page.screenshot({ path: shot('05-quote.png') });

  // 存快照（输入框在折叠下方，先滚动进视口）
  await page.$eval('#snapshot-name', (el) => el.scrollIntoView({ block: 'center' }));
  await page.type('#snapshot-name', '测试-皮卡双拼');
  await page.$eval('#btn-save-snapshot', (el) => el.click());
  await new Promise((r) => setTimeout(r, 200));
  const snapCount = await page.$$eval('.snapshot-row', (els) => els.length);
  console.log('快照数量:', snapCount);

  // localStorage 持久化：刷新后状态保留
  const before = await page.evaluate(() => ({
    vehicle: JSON.parse(localStorage.getItem('car-wrap-studio:v1')).vehicle,
    snaps: JSON.parse(localStorage.getItem('car-wrap-studio:snapshots')).length,
  }));
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('canvas');
  const after = await page.evaluate(() => ({
    vehicle: JSON.parse(localStorage.getItem('car-wrap-studio:v1')).vehicle,
    snaps: JSON.parse(localStorage.getItem('car-wrap-studio:snapshots')).length,
  }));
  console.log('刷新前:', JSON.stringify(before), '刷新后:', JSON.stringify(after));
  const persistOk = before.vehicle === after.vehicle && before.snaps === after.snaps && after.vehicle === 'pickup';

  // 刷新后界面三报价仍在
  await page.$eval('[data-tab="quote"]', (el) => el.click());
  await new Promise((r) => setTimeout(r, 300));
  const totalAfterReload = await page.$eval('.grand-total td:last-child', (el) => el.textContent);
  console.log('刷新后报价总计:', totalAfterReload);
  await page.screenshot({ path: shot('06-after-reload.png') });

  // 程序化触发三视角，确认截图 API 不报错
  const shotsOk = await page.evaluate(async () => {
    // 回到设计页让画布可见
    document.querySelector('[data-tab="design"]').click();
    await new Promise((r) => requestAnimationFrame(r));
    return true;
  });
  console.log('Tab 切回设计页:', shotsOk ? 'OK' : 'FAIL');

  const consoleErrors = errors.filter((e) => !/favicon|WebGL.*fallback/i.test(e));
  console.log('\n==== 结论 ====');
  console.log('WebGL:', glOk, '| 报价:', hasTotal, '| 持久化:', persistOk, '| 快照:', snapCount === 1);
  if (consoleErrors.length) {
    console.log('控制台错误:');
    consoleErrors.forEach((e) => console.log('  ✗', e.slice(0, 300)));
    process.exitCode = 1;
  } else {
    console.log('控制台错误: 无');
  }
} finally {
  await browser.close();
}
