import { expect, test, type Page } from '@playwright/test';

/** 直接写入一份提交到 localStorage，模拟学员已完成训练 */
async function seedSubmission(page: Page) {
  await page.goto('/#/');
  await page.waitForSelector('[data-testid=student-select]');
  await page.evaluate(async () => {
    const mod = await import('/src/data/scenarios.ts' as string);
    const engine = await import('/src/game/engine.ts' as string);
    const scenario = mod.SCENARIOS[0];
    const assignments = mod.referenceAssignments(scenario);
    const result = engine.simulateRun(scenario, assignments);
    const blocked = [
      {
        id: 'blk-1',
        rule: 'draft',
        message: '长风 吃水 11.4 m，超过 1号泊位 · 浅水 限吃水 7.8 m（超出 3.6 m），会触底。',
        atMin: 0,
        shipId: 's-02',
        shipName: '长风',
        berthName: '1号泊位 · 浅水',
        attemptedAt: new Date().toISOString(),
        scenarioId: scenario.id,
      },
      {
        id: 'blk-2',
        rule: 'pilot-overlap',
        message: '引航员 陈引航 在 06:20–07:15 正在引 海鸥，与本次计划重叠 30 分钟。',
        atMin: 0,
        shipId: 's-02',
        shipName: '长风',
        attemptedAt: new Date().toISOString(),
        scenarioId: scenario.id,
      },
    ];
    const sub = {
      id: 'sub-e2e-1',
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      tier: scenario.tier,
      studentId: 'stu-01',
      studentName: '林川',
      classCode: '引航 2401',
      scenario,
      assignments,
      result,
      blocked,
      submittedAt: new Date().toISOString(),
      durationSec: 640,
    };
    localStorage.setItem('pilot-trainer:v1:submissions', JSON.stringify([sub]));
  });
  await page.reload();
}

test('教师端复核：回放、扣分、写评语，成绩同步到学员端', async ({ page }) => {
  await seedSubmission(page);
  await page.goto('/#/teacher');
  await expect(page.getByRole('heading', { name: '教师端' })).toBeVisible();
  await page.click('[data-testid=tab-review]');
  await page.click('[data-testid=review-sub-e2e-1]');
  await expect(page.locator('[data-testid=review-scrub]')).toBeVisible();

  await page.locator('[data-testid=review-scrub]').fill('120');
  await page.waitForTimeout(300);

  await page.fill('[data-testid=deduction-input]', '8');
  await page.fill('[data-testid=comment-input]', '潮窗判断正确，但引航员转场留得过紧，扣 8 分。');
  await page.click('[data-testid=save-review]');

  // 回到复核队列，应显示已复核
  await page.goto('/#/teacher');
  await page.click('[data-testid=tab-review]');
  await page.selectOption('select.select.small', 'done');
  await expect(page.locator('text=已复核 -8')).toBeVisible();

  // 班级成绩中最终分 = 客观分 - 8
  await page.click('[data-testid=tab-classes]');
  await expect(page.locator('text=引航 2401').first()).toBeVisible();
  await expect(page.locator('td:has-text("-8")')).toBeVisible();
});

test('错题本按类型归类统计并显示例子', async ({ page }) => {
  await seedSubmission(page);
  await page.goto('/#/teacher');
  await page.click('[data-testid=tab-mistakes]');
  const list = page.locator('[data-testid=mistake-list]');
  await expect(list).toContainText('吃水超泊位限制');
  await expect(list).toContainText('引航员时间重叠');
  await expect(list).toContainText('会触底');
});

test('出题：设定船舶、泊位、潮汐与时限后保存，学员端出现新题', async ({ page }) => {
  await page.goto('/#/teacher');
  await page.click('[data-testid=tab-author]');
  await page.fill('[data-testid=scenario-title]', '自编 · 三船晚潮');
  await page.fill('[data-testid=scenario-horizon]', '240');
  await page.click('[data-testid=add-ship]');
  await page.click('[data-testid=preview-scenario]');
  await expect(page.locator('text=存在可行排班')).toBeVisible({ timeout: 15000 });
  await page.click('[data-testid=save-scenario]');

  await page.goto('/#/');
  // 新增关卡出现在列表
  const custom = page.locator('button.levelCard', { hasText: '自编 · 三船晚潮' });
  await expect(custom).toBeVisible();
  await expect(custom).toContainText('4 船');
});

test('学员端：教师自编题可进入并正常渲染画布', async ({ page }) => {
  await page.goto('/#/teacher');
  await page.click('[data-testid=tab-author]');
  await page.fill('[data-testid=scenario-title]', '自编 · 渲染检查');
  await page.click('[data-testid=save-scenario]');
  await page.goto('/#/');
  await page.selectOption('[data-testid=student-select]', 'stu-02');
  await page.locator('button.levelCard', { hasText: '自编 · 渲染检查' }).click();
  await expect(page.locator('[data-testid=canvas-host]')).toBeVisible();
  await expect(page.locator('[data-testid=canvas-host] canvas')).toBeVisible();
  await expect(page.locator('h1')).toContainText('自编 · 渲染检查');
});
