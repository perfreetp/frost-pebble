import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
const results = [];
const check = (n, c, x = '') => results.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' :: ' + x : ''}`);
await page.goto('http://127.0.0.1:8391');

// 几何层规则验证(纯函数,稳定)
const geo = await page.evaluate(async () => {
  const { validateShed } = await import('/src/lib/geometry.js');
  const mk = (type, x, z, y = 0) => ({ id: type + x + z + y, type, code: type, x, z, y, rotY: 0, size: { w: 1.5, d: 5, h: 2.6 } });
  // 叠 5 层(同 x,z,不同 y),位置选在棚内合法区
  const stack = [];
  for (let i = 0; i < 5; i++) stack.push(mk('rack', 6, 15, i * 2.6));
  const overStack = validateShed({ w: 12, d: 30, objects: stack });
  // 叠 4 层应通过
  const okStack = validateShed({ w: 12, d: 30, objects: stack.slice(0, 4) });
  // 越界
  const oob = validateShed({ w: 12, d: 30, objects: [mk('rack', 13, 15)] });
  // 贴地检查:层架悬空(唯一层架且 y>0)
  const flying = validateShed({ w: 12, d: 30, objects: [mk('rack', 6, 15, 1.0)] });
  return {
    over4: overStack.violations.some((v) => v.reason.includes('超过 4 层')),
    exactly4: okStack.violations.length,
    outOfBounds: oob.violations.some((v) => v.reason.includes('越出')),
    flying: flying.violations.some((v) => v.reason.includes('未贴地'))
  };
});
check('叠放 5 层触发 >4 层告警', geo.over4);
check('叠放 4 层(上限内)无告警', geo.exactly4 === 0, `${geo.exactly4} 项`);
check('越出棚区边界告警', geo.outOfBounds);
check('层架未贴地告警', geo.flying);

// 返工 >2 次标红:造数据看 UI
await page.evaluate(() => {
  const data = { user: { name: '制作员·李工', role: 'maker' }, projects: [{
    id: 'p1', code: 'JD-2026-888', name: '返工标红', customer: 'c', maker: '制作员·李工', supervisor: 's',
    shedCount: 1, layers: 4, loadPerLayer: 100, deadline: '2026-12-01', status: '已退回',
    reworkCount: 3, shedRework: { s1: 3 }, version: 'v1.3', deliveredAt: null, packageId: null,
    createdAt: 'x', timeline: [], returnReason: '第三次退回',
    sheds: [{ id: 's1', index: 1, name: '1号棚', w: 12, d: 30, h: 4.5, objects: [] }]
  }]};
  localStorage.setItem('mushroom-delivery-v1', JSON.stringify(data));
});
await page.reload();
await page.waitForTimeout(500);
await page.getByRole('button', { name: '项目列表' }).click();
await page.waitForTimeout(300);
const listHtml = await page.locator('table tbody tr').first().innerText();
check('列表显示返工 3 次', listHtml.includes('3 次'), listHtml.replace(/\n/g, ' '));
const redBadge = await page.locator('.badge.red').count();
check('返工超 2 次出现红色标记', redBadge >= 1, `${redBadge} 个红标`);

console.log(results.join('\n'));
await browser.close();
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
