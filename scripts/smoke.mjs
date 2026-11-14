import { openApp, countNonBackgroundPixels } from './harness.mjs';

const { browser, page, errors } = await openApp();
await page.waitForTimeout(2500);
const px = await countNonBackgroundPixels(page);
console.log('PIXELS front canvas:', JSON.stringify(px));
const info = await page.textContent('.viewport-info').catch(() => null);
console.log('viewport-info:', info);
const text = await page.textContent('body');
console.log('has 待派池:', text.includes('待派池'));
console.log('has fingerprint label:', /生成排布并建单/.test(text));
await page.screenshot({ path: 'scripts/shot-intake.png' });
console.log('errors:', errors.slice(0, 10));
await browser.close();
