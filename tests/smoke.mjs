// 端到端冒烟测试:走完整业务链路(纯内存路由,导航全部走 UI 点击)
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8391';
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

const results = [];
const check = (name, cond, extra = '') => {
  results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`);
};
const nav = (label) => page.getByRole('button', { name: label }).first().click();
const loginAs = (who) => nav(new RegExp(who));

// 1. 客户登录下单
await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await page.waitForTimeout(500);
await loginAs('客户·张社长');
await page.waitForSelector('text=工作台');
await nav('下需求单');
await page.locator('input').first().fill('冒烟测试菇棚项目');
await nav('提交需求单并生成棚区');
await page.waitForTimeout(500);
await page.waitForSelector('text=逐棚布置');
const code = (await page.locator('b').filter({ hasText: /JD-/ }).first().innerText()).trim();
check('客户下单并生成项目', /JD-\d{4}-\d{3}/.test(code), code);
check('生成 3 个棚', (await page.getByText(/^\d号棚$/).count()) === 3);

// 2. 制作员登录,进入三维编辑器
await nav('切换账号');
await loginAs('制作员·李工');
await nav('项目列表');
await page.waitForSelector('text=冒烟测试菇棚项目');
await nav('进入');
await page.waitForSelector('text=逐棚布置');
await nav('进入三维布置');
await page.waitForSelector('canvas');
await page.waitForTimeout(800);

// 3. 摆放五类设备
for (const name of ['层架', '托盘', '加湿管道', '环流风机', '采光灯']) {
  await page.getByRole('button', { name: new RegExp('\\+ ' + name) }).first().click();
  await page.waitForTimeout(120);
}
await page.waitForTimeout(300);
const bomText = await page.locator('.card').filter({ hasText: '本棚物料' }).innerText();
check('五类设备已摆放并计入本棚物料',
  /层架\(套\)\s*1/.test(bomText) && /灯具\(盏\)\s*1/.test(bomText) && /管道\(米\)\s*4/.test(bomText),
  bomText.replace(/\n/g, ' '));
check('安全槽摆放初始零碰撞', (await page.locator('.alert.error').count()) === 0,
  (await page.locator('.alert.error').allInnerTexts()).join('; '));

// 4. 俯视图切换与走道标注
await nav('一键俯视图');
await page.waitForTimeout(300);
check('俯视图可切换', (await page.locator('text=退出俯视图').count()) === 1);
await nav('退出俯视图');

// 5. 再放层架,通过应用数据通道把它挪到立柱上 -> 实时标红
await page.getByRole('button', { name: /\+ 层架/ }).first().click();
await page.waitForTimeout(200);
const collision = await page.evaluate(async () => {
  const data = JSON.parse(localStorage.getItem('mushroom-delivery-v1'));
  const shed = data.projects[0].sheds[0];
  const col = shed.objects.find((o) => o.type === 'column');
  const rack = [...shed.objects].reverse().find((o) => o.type === 'rack');
  window.__moveObject(rack.id, col.x, col.z);
  const { validateShed } = await import('/src/lib/geometry.js');
  const live = JSON.parse(localStorage.getItem('mushroom-delivery-v1')).projects[0].sheds[0];
  const res = validateShed(live);
  return {
    colCode: col.code,
    count: res.violations.length,
    reason: res.violations.find((v) => v.reason.includes('立柱'))?.reason ?? '',
    rackId: rack.id
  };
});
check('压立柱立即检出并写明原因', collision.count > 0 && collision.reason.includes('立柱'),
  `${collision.colCode} / ${collision.reason}`);
await page.waitForTimeout(300);
check('场景右侧实时出现红色告警', (await page.locator('.alert.error').count()) >= 1);

// 6. 有违规时禁止提交
await nav('返回项目');
await nav('提交主管审核');
await page.waitForTimeout(200);
const blockMsg = await page.locator('.alert.error').first().innerText();
check('有违规禁止提交', blockMsg.includes('无法提交'), blockMsg);

// 7. 回到三维场景修复,再提交
await nav('进入三维布置');
await page.waitForSelector('canvas');
await page.waitForTimeout(500);
const fixed = await page.evaluate(async () => {
  const data = JSON.parse(localStorage.getItem('mushroom-delivery-v1'));
  const shed = data.projects[0].sheds[0];
  const rack = [...shed.objects].reverse().find((o) => o.type === 'rack');
  window.__moveObject(rack.id, 1.5, 15);
  const { validateShed } = await import('/src/lib/geometry.js');
  const live = JSON.parse(localStorage.getItem('mushroom-delivery-v1')).projects[0].sheds[0];
  return validateShed(live).violations.length;
});
check('修复后几何层零告警', fixed === 0, `剩余 ${fixed} 项`);
await nav('返回项目');
await nav('提交主管审核');
await page.waitForTimeout(300);
check('无违规提交审核', (await page.locator('.badge.待审核').count()) >= 1);

// 8. 主管审核台:逐棚查看后整单退回
await nav('切换账号');
await loginAs('主管·王主任');
await nav('审核台');
await page.getByRole('button', { name: new RegExp(code) }).click();
await page.waitForSelector('canvas');
await page.waitForTimeout(800);
check('审核页列出逐棚标签', (await page.getByRole('button', { name: /号棚/ }).count()) === 3);
await nav('整单退回');
await page.locator('textarea').fill('冒烟测试:走道偏窄请调整');
await nav('确认退回');
await page.waitForTimeout(300);
const rejectState = await page.evaluate(
  () => JSON.parse(localStorage.getItem('mushroom-delivery-v1')).projects[0]
);
check('整单退回并计一次返工',
  rejectState.status === '已退回' && rejectState.reworkCount === 1 && rejectState.version === 'v1.1',
  `${rejectState.status}/${rejectState.reworkCount}/${rejectState.version}`);

// 9. 制作员返工重新提交,主管通过打包
await nav('切换账号');
await loginAs('制作员·李工');
await nav('项目列表');
await nav('进入');
await nav('返工后重新提交');
await page.waitForTimeout(300);
check('返工后重新进入待审核', (await page.locator('.badge.待审核').count()) >= 1);
await nav('切换账号');
await loginAs('主管·王主任');
await nav('审核台');
await page.getByRole('button', { name: new RegExp(code) }).click();
await page.waitForTimeout(600);
await nav('通过并打包交付');
await page.waitForTimeout(1600);
const delivered = await page.evaluate(
  () => JSON.parse(localStorage.getItem('mushroom-delivery-v1')).projects[0]
);
check('通过后状态为已交付', delivered.status === '已交付' && !!delivered.deliveredAt && !!delivered.packageId,
  `${delivered.status}/${delivered.packageId}`);
const body = await page.locator('body').innerText();
check('记录交付时间、版本号与交付包编号', /v1\.\d+/.test(body) && /PKG-/.test(body));

// 10. 导出交付包与物料清单
const dlPkg = page.waitForEvent('download', { timeout: 5000 });
await nav('下载交付包 JSON');
const dl1 = await dlPkg;
check('交付包 JSON 可导出', !!dl1, dl1.suggestedFilename());
const dlCsv = page.waitForEvent('download', { timeout: 5000 });
await nav('导出物料清单 CSV');
const dl2 = await dlCsv;
check('物料清单 CSV 可导出', /\.csv$/.test(dl2.suggestedFilename()), dl2.suggestedFilename());

// 11. 时间线含操作人
const timeline = await page.locator('.timeline').first().innerText();
check('时间线记录操作人与动作',
  timeline.includes('主管·王主任') && timeline.includes('打包') && timeline.includes('整单退回'));

// 12. 看板统计
await nav('首页看板');
const stats = await page.locator('.stat').allInnerTexts();
check('看板四统计(待办/在审/本周/超期)', stats.length === 4,
  stats.map((s) => s.replace(/\n/g, '=')).join(' | '));

// 13. 项目列表状态筛选与超期栏
await nav('项目列表');
await page.getByRole('button', { name: '已交付' }).click();
await page.waitForTimeout(200);
const rows = await page.locator('table tbody tr').count();
check('按状态筛选已交付', rows >= 1 && (await page.locator('.badge.已交付').count()) >= 1);

console.log(results.join('\n'));
console.log('\n浏览器控制台错误:', errors.length ? '\n' + errors.join('\n') : '无');
await browser.close();
const failed = results.filter((r) => r.startsWith('FAIL')).length;
process.exit(failed ? 1 : 0);
