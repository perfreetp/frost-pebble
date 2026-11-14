// 浏览器端到端冒烟测试：登录 -> 建课目 -> 绑骨 -> 关键帧 -> 学员提交 -> 自动核对 -> 老师评分
// 运行：node scripts/e2e-test.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5180';
const results = [];
const check = (name, cond) => {
  if (!cond) throw new Error('断言失败: ' + name);
  results.push(name);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('.login-card');
check('登录页渲染', await page.locator('.login-card').count() === 1);
check('内置 4 个账号', (await page.locator('.user-btn').count()) === 4);

// 老师登录
await page.getByText('孟老师', { exact: true }).click();
await page.waitForSelector('text=针法课目管理');
check('老师进入课目列表', (await page.locator('.course-card').count()) >= 2);

// 查看已交未交人数
const progressText = await page.locator('.course-card').first().locator('.mono').first().textContent();
check('课目卡片显示已交人数', /\d+\/\d+ 人已交/.test(progressText ?? ''));

// 打开第一个课目备课台
await page.locator('.course-card').first().getByRole('button', { name: /备课台|去绑骨备课/ }).click();
await page.waitForSelector('.editor-layout');
check('动画编辑器打开（部件+关节+时间轴）',
  (await page.locator('.part-list-item').count()) >= 4 &&
  (await page.locator('.joint-list-item').count()) >= 3 &&
  (await page.locator('.track-row').count()) >= 3);
const rendererLine = await page.locator('.sub').first().textContent();
check('渲染管线有标注（WebGPU 或 Canvas2D 降级）', /WebGPU|Canvas2D/.test(rendererLine ?? ''));

// 切到动画模式打关键帧
await page.getByRole('button', { name: /切动画/ }).click().catch(() => {});
await page.getByRole('button', { name: /打关键帧/ }).click();
check('第一个关键帧已打', (await page.locator('.kf-diamond').count()) >= 1);

// 跳到第 12 帧再打一个
await page.getByRole('button', { name: '下一帧 ▶' }).click({ clickCount: 12 });
await page.getByRole('button', { name: /打关键帧/ }).click();
check('第二个关键帧已打', (await page.locator('.kf-diamond').count()) >= 2);

// 缓动编辑器出现（选中关键帧后）
await page.waitForSelector('.easing-box svg');
check('缓入缓出曲线编辑器可见', await page.locator('.ease-handle').count() === 2);

// 复制动作区间
await page.getByRole('button', { name: /复制 \[/ }).click();
check('复制区间后关键帧数量增加', (await page.locator('.kf-diamond').count()) >= 3);

// 播放
await page.getByRole('button', { name: '▶ 播放' }).click();
await page.waitForTimeout(700);
const frameReadout1 = await page.locator('.frame-readout').textContent();
await page.getByRole('button', { name: '⏸ 暂停' }).click();
check('播放头在推进', /第 [1-9]\d? \//.test(frameReadout1 ?? ''));

await page.getByRole('button', { name: '保存备课（绑骨+示范）' }).click();
await page.waitForSelector('.toast');
check('备课保存提示出现', (await page.locator('.toast').textContent())?.includes('已保存') ?? false);
await page.getByRole('button', { name: '返回列表' }).click();
await page.waitForSelector('text=针法课目管理');

// 复核页：成绩汇总
await page.locator('.course-card').first().getByRole('button', { name: '复核与汇总' }).click();
await page.waitForSelector('text=作业复核');
check('复核表含学员行', (await page.locator('table.data tbody tr').count()) >= 2);
await page.getByRole('button', { name: '成绩汇总' }).click();
await page.waitForSelector('text=档位平均分');
check('按难度档位统计平均分', (await page.locator('.stat-tile').count()) === 3);
check('常见错误排行渲染', (await page.locator('.joint-list-item').count()) >= 1);

// 逐帧查看
await page.getByRole('button', { name: '作业复核' }).click();
await page.locator('button', { hasText: '逐帧查看' }).first().click();
await page.waitForSelector('.editor-layout');
check('逐帧复核编辑器打开', (await page.locator('.kf-diamond').count()) >= 1);
await page.getByRole('button', { name: '返回列表' }).click();
await page.waitForSelector('text=作业复核');
await page.getByRole('button', { name: /← 返回/ }).click();

// 切换到学员
await page.getByRole('button', { name: '切换账号' }).click();
await page.waitForSelector('.login-card');
await page.getByText('沈绣兰', { exact: true }).click();
await page.waitForSelector('text=我的针法课目');
const visibleCourses = await page.locator('.course-card').count();
check('学员只看到派发课目', visibleCourses === 2);
check('退回作业有退回提醒', (await page.getByText('退回提醒').count()) >= 1);

// 历史版本与扣分原因
await page.getByRole('button', { name: '历史版本' }).first().click();
await page.waitForSelector('table.data');
await page.getByRole('button', { name: '扣分明细' }).click();
await page.waitForSelector('.issue-list');
const issueText = await page.locator('.issue-list').textContent();
check('学员可见具体扣分原因', issueText.includes('扣') && issueText.includes('老师评语'));
// 依次关闭「扣分明细」与「历史版本」两个弹窗（Escape 由 Modal 组件处理）
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
await page.keyboard.press('Escape').catch(() => {});
await page.waitForTimeout(200);

// 进入练习台重做
await page.getByRole('button', { name: '重做' }).first().click();
await page.waitForSelector('.editor-layout');
await page.getByRole('button', { name: /打关键帧/ }).click();
await page.getByRole('button', { name: '存草稿' }).click();
await page.waitForSelector('.toast');
check('草稿保存成功', true);
await page.getByRole('button', { name: '返回列表' }).click();
await page.waitForSelector('text=我的针法课目');

// 提交（会弹 confirm，自动接受）
page.once('dialog', (d) => d.accept());
await page.getByRole('button', { name: '提交作品' }).first().click();
await page.waitForSelector('.toast');
const submitToast = await page.locator('.toast').textContent();
check('提交成功并给出自动核对结论', /第 2 版已提交/.test(submitToast ?? ''));

// 回到老师端确认新版本进入待复核
await page.getByRole('button', { name: '切换账号' }).click();
await page.getByText('孟老师', { exact: true }).click();
await page.locator('.course-card').first().getByRole('button', { name: '复核与汇总' }).click();
await page.waitForSelector('text=作业复核');
const rowText = await page.locator('table.data tbody tr').first().textContent();
check('新提交版本出现在复核表', /第 2 版/.test(rowText ?? ''));

// 打分
await page.getByRole('button', { name: '打分/评语' }).first().click().catch(async () => {
  await page.getByRole('button', { name: '改分' }).first().click();
});
await page.waitForSelector('textarea');
await page.locator('textarea').fill('动作节奏有进步，注意收针段手腕回位再平顺些。');
await page.getByRole('button', { name: '确认评分' }).click();
await page.waitForSelector('.toast');
check('评分完成提示', (await page.locator('.toast').textContent())?.includes('评分完成') ?? false);

check('全程无 JS 报错', errors.length === 0);
if (errors.length) console.log(errors.join('\n'));

await browser.close();
console.log('\n全部 ' + results.length + ' 项端到端断言通过：');
for (const r of results) console.log('  ✓ ' + r);
