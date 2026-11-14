import { chromium } from 'playwright-core';

const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'http://127.0.0.1:8123/';

export async function openApp({ width = 1560, height = 940 } = {}) {
  const browser = await chromium.launch({
    executablePath: exe,
    args: ['--enable-unsafe-webgpu', '--use-angle=d3d11', '--enable-features=WebGPU'],
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  return { browser, page, errors };
}

export async function countNonBackgroundPixels(page, selector = '.viewport canvas:first-child') {
  return page.evaluate(async (sel) => {
    const cv = document.querySelector(sel);
    if (!cv) return { ok: false, reason: 'no canvas' };
    const copy = document.createElement('canvas');
    copy.width = cv.width;
    copy.height = cv.height;
    const ctx = copy.getContext('2d');
    if (!ctx) return { ok: false, reason: 'no 2d' };
    ctx.drawImage(cv, 0, 0);
    const d = ctx.getImageData(0, 0, copy.width, copy.height).data;
    let nonBg = 0;
    const total = d.length / 4;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      // 背景清屏色 ~ (22,25,31)
      if (Math.abs(r - 22) > 8 || Math.abs(g - 25) > 8 || Math.abs(b - 31) > 8) nonBg++;
    }
    return { ok: true, w: copy.width, h: copy.height, nonBg, total, ratio: nonBg / total };
  }, selector);
}
