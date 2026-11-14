// 导出功能测试：拦截下载，验证图片/拼图/TXT/JSON 输出
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = fileURLToPath(new URL('../test-output/exports/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const downloads = [];
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

  const client = await page.target().createCDPSession();
  await client.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: OUT,
    eventsEnabled: true,
  });
  client.on('Browser.downloadProgress', (e) => {
    if (e.state === 'completed') downloads.push(e);
  });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('canvas');
  await new Promise((r) => setTimeout(r, 600));

  // 切到报价页
  await page.$eval('[data-tab="quote"]', (el) => el.click());
  await new Promise((r) => setTimeout(r, 400));

  // 1) 导出图片
  await page.$eval('#btn-export-imgs', (el) => el.click());
  await waitUntil(() => downloads.length >= 4, 15000);
  console.log('图片下载文件数:', downloads.length);

  // 2) TXT 报价单
  const n0 = downloads.length;
  await page.$eval('#btn-export-txt', (el) => el.click());
  await waitUntil(() => downloads.length >= n0 + 1, 5000);

  // 3) JSON 方案
  const n1 = downloads.length;
  await page.$eval('#btn-export-json', (el) => el.click());
  await waitUntil(() => downloads.length >= n1 + 1, 5000);

  await new Promise((r) => setTimeout(r, 800));
  const files = (await import('node:fs')).readdirSync(OUT);
  console.log('导出目录文件:', files.join(' | '));

  // 校验 PNG 魔数与体积
  const pngs = files.filter((f) => f.endsWith('.png'));
  const fs = await import('node:fs/promises');
  let pngOk = 0;
  for (const f of pngs) {
    const b = await fs.readFile(OUT + f);
    const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    if (isPng && b.length > 50_000) pngOk++;
  }
  console.log(`有效 PNG（魔数+>50KB）: ${pngOk}/${pngs.length}`);

  const txt = files.find((f) => f.endsWith('.txt'));
  if (txt) {
    const content = await fs.readFile(OUT + txt, 'utf8');
    const txtOk = content.includes('报价总计') && content.includes('耗损');
    console.log('TXT 报价单含关键字:', txtOk);
    console.log('TXT 前两行:', content.split('\n').slice(0, 2).join(' / '));
  }
  const json = files.find((f) => f.endsWith('.json'));
  let jsonOk = false;
  if (json) {
    const data = JSON.parse(await fs.readFile(OUT + json, 'utf8'));
    jsonOk = !!(data.state && data.state.vehicle && data.state.base);
    console.log('JSON 方案结构合法:', jsonOk, '| vehicle =', data.state?.vehicle);
  }

  console.log('\n==== 导出结论 ====');
  const pass = pngOk >= 4 && !!txt && jsonOk && errors.length === 0;
  console.log(pass ? '全部导出功能通过 ✓' : '存在失败 ✗');
  if (errors.length) errors.forEach((e) => console.log('  ✗', e));
  process.exitCode = pass ? 0 : 1;
} finally {
  await browser.close();
}

function waitUntil(cond, timeout) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const tick = () => (cond() ? resolve() : Date.now() - t0 > timeout ? reject(new Error('waitUntil timeout')) : setTimeout(tick, 150));
    tick();
  });
}
