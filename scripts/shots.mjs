import { openApp } from './harness.mjs';
const { browser, page, errors } = await openApp();
await page.waitForTimeout(1800);
await page.screenshot({ path: 'scripts/s1-all.png', clip: { x: 336, y: 60, width: 870, height: 860 } });
// 近观
await page.click('.view-hud-btn:has-text("全览")');
await page.waitForTimeout(900);
await page.screenshot({ path: 'scripts/s2-detail.png', clip: { x: 336, y: 60, width: 870, height: 860 } });
// 回到全览再切俯视
await page.click('.view-hud-btn:has-text("近观")');
await page.waitForTimeout(600);
await page.click('.view-hud-btn:has-text("俯视视图")');
await page.waitForTimeout(900);
await page.screenshot({ path: 'scripts/s3-top.png', clip: { x: 336, y: 60, width: 870, height: 860 } });
console.log('errors', errors.slice(0,5));
await browser.close();
