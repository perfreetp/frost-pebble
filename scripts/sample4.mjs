import { chromium } from 'playwright-core';
const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: exe, args: ['--enable-unsafe-webgpu','--use-angle=d3d11','--enable-features=WebGPU'], headless: true });
const page = await browser.newPage({ viewport: { width: 1560, height: 940 } });
await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const dump = async (tag) => console.log(tag, await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('gas-street-riser.v1') || 'null');
  if (!s) return 'null';
  const o = s.orders.find(x => x.community.includes('槐荫里'));
  return { id: o.id, status: o.status, seq: o.submitSeq, sampled: o.qcSampled, photos: o.photos.length, rounds: o.qcRounds.length, last3: o.log.slice(-3).map(l => l.action) };
}));
await dump('初始:');
await page.selectOption('.user-switch select', 'u-f1');
await page.waitForTimeout(800);
const rows = page.locator('.list-row');
for (let i = 0; i < (await rows.count()); i++) {
  if ((await rows.nth(i).innerText()).includes('槐荫里')) { await rows.nth(i).click(); break; }
}
await page.waitForTimeout(800);
await page.click('button:has-text("完工提交")');
await page.waitForTimeout(400);
await page.locator('button:has-text("模拟拍摄")').first().click();
await page.waitForTimeout(200);
await page.locator('button:has-text("模拟拍摄")').first().click();
await page.waitForTimeout(300);
await page.locator('.modal button:has-text("提交完工")').click();
await page.waitForTimeout(1500);
await dump('提交后:');
const body = await page.locator('body').innerText();
console.log('页面含"免抽检":', body.includes('免抽检'), '| "等待质检":', body.includes('等待质检'), '| "质检已通过":', body.includes('质检已通过'));
await page.screenshot({ path: 'scripts/s14-after-submit.png' });
await browser.close();
