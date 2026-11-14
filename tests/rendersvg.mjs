import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const width = Number(process.argv[4] ?? 1120);
const height = Number(process.argv[5] ?? 900);
await page.setViewport({ width, height, deviceScaleFactor: 1 });
const svg = readFileSync(process.argv[2] ?? 'tests/out/glyphs.svg', 'utf8');
await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
await page.screenshot({ path: process.argv[3] ?? 'tests/out/glyphs.png', fullPage: true });
await browser.close();
console.log('ok');
