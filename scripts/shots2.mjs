import { openApp } from './harness.mjs';
const { browser, page, errors } = await openApp();
await page.waitForTimeout(1500);
// 切到施工师傅
await page.selectOption('.user-switch select', 'u-f1');
await page.waitForTimeout(1200);
await page.screenshot({ path: 'scripts/s4-workbench.png' });
console.log('errors', errors.slice(0,6));
await browser.close();
