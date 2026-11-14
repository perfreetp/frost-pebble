import { chromium } from 'playwright-core';
const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath: exe, args: ['--enable-unsafe-webgpu','--use-angle=d3d11','--enable-features=WebGPU'], headless: true });
const page = await browser.newPage({ viewport: { width: 1560, height: 940 } });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://127.0.0.1:8123/', { waitUntil: 'networkidle' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// 录入
await page.locator('input').nth(0).fill('新建测试小区');
await page.locator('input').nth(1).fill('测试路 1 号');
await page.locator('input').nth(2).fill('测试员 13000000000');
// 楼栋 2 层 8 户 4
const nums = page.locator('.form-grid input[type=number]');
await nums.nth(0).fill('2');
await nums.nth(1).fill('8');
await nums.nth(2).fill('4');
await page.waitForTimeout(400);
// 选师傅
await page.locator('select').last().selectOption('u-f2');
const fp = await page.locator('.panel-head .mono').first().innerText();
console.log('预览指纹:', fp);
await page.locator('button:has-text("生成排布并建单")').click();
await page.waitForTimeout(900);
const body = await page.locator('body').innerText();
console.log('建单成功提示:', body.includes('已建单'));
console.log('工单出现在列表:', body.includes('新建测试小区'));
console.log('新工单号:', (body.match(/GD-\d{4}-\d{3}/g) || []).slice(0,3));
await page.screenshot({ path: 'scripts/s11-created.png' });

// 用同样参数再生一次，验证指纹一致
await page.locator('input').nth(0).fill('新建测试小区2');
await nums.nth(0).fill('2');
await nums.nth(1).fill('8');
await nums.nth(2).fill('4');
await page.waitForTimeout(300);
const fp2 = await page.locator('.panel-head .mono').first().innerText();
console.log('二次指纹一致:', fp === fp2, fp, fp2);

console.log('errors', errors.slice(0, 6));

// 验证数据持久化
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const body2 = await page.locator('body').innerText();
console.log('刷新后仍存在:', body2.includes('新建测试小区'));
console.log('工单总数行:', (body2.match(/共 (\d+) 单/) || [])[1]);
await browser.close();
