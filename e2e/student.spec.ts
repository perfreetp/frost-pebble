import { expect, test, type Page } from '@playwright/test';

interface Geom {
  layout: { width: number; height: number };
  ships: Array<{ shipId: string; x: number; y: number; w: number; h: number }>;
  berths: Array<{ berthId: string; y: number; h: number }>;
  timeSpan: { x0: number; x1: number; horizon: number };
}

async function geom(page: Page): Promise<{ g: Geom; box: { x: number; y: number }; scale: number }> {
  const host = page.locator('[data-testid=canvas-host]');
  await expect(host).toHaveAttribute('data-geometry', /.+/, { timeout: 15000 });
  const g = JSON.parse((await host.getAttribute('data-geometry'))!) as Geom;
  const box = (await host.boundingBox())!;
  const scale = box.width / g.layout.width;
  return { g, box, scale };
}

async function dragShip(page: Page, shipId: string, berthIndex: number, startMin: number) {
  const { g, box, scale } = await geom(page);
  const ship = g.ships.find((s) => s.shipId === shipId)!;
  const berth = g.berths[berthIndex];
  const sx = box.x + (ship.x + ship.w / 2) * scale;
  const sy = box.y + (ship.y + ship.h / 2) * scale;
  const targetMin = Math.min(g.timeSpan.horizon, Math.max(0, startMin));
  const tx = box.x + (g.timeSpan.x0 + (targetMin / g.timeSpan.horizon) * (g.timeSpan.x1 - g.timeSpan.x0)) * scale;
  const ty = box.y + (berth.y + berth.h / 2) * scale;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 12, sy + 6, { steps: 3 });
  await page.mouse.move(tx, ty, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);
}

async function selectStudent(page: Page) {
  await page.goto('/#/');
  await page.waitForSelector('[data-testid=student-select]');
  await page.selectOption('[data-testid=student-select]', 'stu-01');
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid=need-student]');
    return !el;
  });
}

test('着陆页显示 8 个关卡，2 到 8 船递增', async ({ page }) => {
  await page.goto('/#/');
  const tiles = page.locator('[data-testid^=level-]');
  await expect(tiles).toHaveCount(8);
  await expect(page.locator('[data-testid=level-lv-2]')).toContainText('2 船');
  await expect(page.locator('[data-testid=level-adv-4]')).toContainText('8 船');
});

test('未选学员时提示需要选择身份', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.locator('[data-testid=need-student]')).toBeVisible();
  await page.selectOption('[data-testid=student-select]', 'stu-02');
  await expect(page.locator('[data-testid=need-student]')).toHaveCount(0);
});

test('拖拽船到浅水泊位被吃水规则拦截并说明原因', async ({ page }) => {
  await selectStudent(page);
  await page.click('[data-testid=level-lv-2]');
  await expect(page.locator('[data-testid=canvas-host]')).toBeVisible();
  // 长风吃水 11.4m，浅水泊位限 7.8m
  await dragShip(page, 's-02', 0, 40);
  const toast = page.locator('[data-testid=toast-error]');
  await expect(toast).toContainText('吃水');
  await expect(toast).toContainText('会触底');
  // 没有创建作业块
  await expect(page.locator('[data-row=plan-s-02]')).toContainText('未排');
});

test('引航员时段重叠当场拦截', async ({ page }) => {
  await selectStudent(page);
  await page.click('[data-testid=level-lv-2]');
  // 海鸥 -> 1号泊位 06:20
  await dragShip(page, 's-01', 0, 20);
  await page.selectOption('[data-testid=pilot-select]', 'pilot-a');
  await page.click('[data-testid=place-ship]');
  await expect(page.locator('[data-row=plan-s-01]')).not.toContainText('未排');

  // 长风 -> 2号泊位 06:40，同一引航员
  await dragShip(page, 's-02', 1, 40);
  await page.selectOption('[data-testid=pilot-select]', 'pilot-a');
  await page.click('[data-testid=place-ship]');
  const toast = page.locator('[data-testid=toast-error]');
  await expect(toast).toContainText('引航员');
  await expect(toast).toContainText('转场');
});

test('错过潮窗当场拦截', async ({ page }) => {
  await selectStudent(page);
  await page.click('[data-testid=level-lv-2]');
  // 长风潮窗 06:30-09:40，作业 75 分钟；排到 8:40 结束 9:55 超过潮窗
  const { g, box, scale } = await geom(page);
  const ship = g.ships.find((s) => s.shipId === 's-02')!;
  const berth = g.berths[1];
  const sx = box.x + (ship.x + ship.w / 2) * scale;
  const sy = box.y + (ship.y + ship.h / 2) * scale;
  const tx = box.x + (g.timeSpan.x0 + (160 / g.timeSpan.horizon) * (g.timeSpan.x1 - g.timeSpan.x0)) * scale;
  const ty = box.y + (berth.y + berth.h / 2) * scale;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 14, sy + 8, { steps: 3 });
  await page.mouse.move(tx, ty, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  await expect(page.locator('[data-testid=toast-error]')).toContainText('潮窗');
});

test('完整流程：排程 → 推演 → 提交 → 有客观分', async ({ page }) => {
  await selectStudent(page);
  await page.click('[data-testid=level-lv-2]');
  await dragShip(page, 's-01', 0, 20);
  await page.selectOption('[data-testid=pilot-select]', 'pilot-a');
  await page.click('.tugToggle >> nth=0');
  await page.click('[data-testid=place-ship]');

  await dragShip(page, 's-02', 1, 40);
  await page.selectOption('[data-testid=pilot-select]', 'pilot-b');
  await page.click('.tugToggle >> nth=1');
  await page.click('.tugToggle >> nth=2');
  await page.click('[data-testid=place-ship]');

  await expect(page.locator('[data-row=plan-s-01]')).toContainText('陈引航');
  await expect(page.locator('[data-row=plan-s-02]')).toContainText('周引航');

  await page.click('[data-testid=run-toggle]');
  // 拖到末尾，加速推演结束
  await page.click('[data-testid=scrub]');
  await page.locator('[data-testid=scrub]').fill('240');
  await expect(page.locator('[data-testid=submit-run]')).toBeEnabled({ timeout: 15000 });
  await expect(page.locator('[data-testid=no-incidents]')).toBeVisible();

  await page.click('[data-testid=submit-run]');
  await page.click('[data-testid=confirm-submit]');
  await page.waitForSelector('[data-testid=open-replay]');
  await expect(page.locator('text=最终得分')).toBeVisible();
  const scoreText = await page.locator('.scoreDial b').first().textContent();
  expect(Number(scoreText)).toBeGreaterThan(90);
});
