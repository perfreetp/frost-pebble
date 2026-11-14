import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Helpers for reaching into the nested shadow roots of the web-component shell.
const appRoot = (page: Page) => page.locator('farm-app');
const viewRoot = (page: Page) => appRoot(page).locator('main .view');

async function gotoView(page: Page, view: string) {
  await page.goto(`/#/${view}`);
  await page.waitForTimeout(1400);
}

async function seedReset(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

/** Selects a project in the header picker by its title fragment. */
async function selectProject(page: Page, title: string) {
  const value = await page.evaluate((t) => {
    const sel = document.querySelector('farm-app')!.shadowRoot!.querySelector('#project-select') as HTMLSelectElement;
    const opt = [...sel.options].find((o) => o.textContent?.includes(t));
    return opt?.value ?? null;
  }, title);
  expect(value).not.toBeNull();
  await appRoot(page).locator('#project-select').selectOption(value!);
  await page.waitForTimeout(700);
}

/** Reads a bone's live transform out of the running stage. */
async function boneState(page: Page, name: string) {
  return page.evaluate((n) => {
    const r = document.querySelector('farm-app')!.shadowRoot!.querySelector('main .view')!.shadowRoot!;
    const st = r.querySelector('farm-stage') as unknown as {
      project: { rig: { bones: Array<{ name: string; x: number; y: number; rotation: number; locked: boolean }> } };
    };
    const b = st.project.rig.bones.find((x) => x.name === n)!;
    return { x: b.x, y: b.y, rotation: b.rotation, locked: b.locked };
  }, name);
}

test.describe('禾影工坊 · 作物骨骼动画工作台', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/projects');
    await seedReset(page);
    await page.reload();
    await page.waitForTimeout(1600);
  });

  test('项目总览：按作物分组、超期标红、状态计数', async ({ page }) => {
    const root = viewRoot(page);
    await expect(root.locator('.card')).toHaveCount(6);
    await expect(root.locator('.group-head .crop-badge')).toHaveCount(5);

    // the 退回 水稻 project is past its delivery date and carries the red rail
    const overdue = root.locator('.card.overdue');
    await expect(overdue.first()).toBeVisible();
    const overdueText = await overdue.first().innerText();
    expect(overdueText).toContain('已超期');

    // status tabs filter the grid
    await root.locator('[data-status="已采用"]').click();
    await expect(root.locator('.card')).toHaveCount(1);
    await root.locator('[data-status="全部"]').click();
    await expect(root.locator('.card')).toHaveCount(6);

    // crop filter
    await root.locator('[data-crop="水稻"]').click();
    await expect(root.locator('.card')).toHaveCount(2);
  });

  test('工作台：拖关节建骨、拖拽位移、锁定零件不可误拖', async ({ page }) => {
    await gotoView(page, 'animate');
    const root = viewRoot(page);
    const stage = root.locator('farm-stage');

    // the seeded rig is present with all five part types
    await expect(root.locator('#bone-tree [data-bone]')).toHaveCount(10);
    await expect(root.locator('#asset-list .asset')).toHaveCount(5);

    // select the head bone through the outliner
    await root.locator('#bone-tree [data-bone]', { hasText: '头部' }).click();
    await expect(root.locator('#bone-name')).toHaveValue('头部');

    // drag the head joint on canvas and confirm the transform changed
    const joint = await page.evaluate(() => {
      const r = document.querySelector('farm-app')!.shadowRoot!.querySelector('main .view')!.shadowRoot!;
      const st = r.querySelector('farm-stage') as unknown as {
        getBoundingClientRect(): DOMRect;
        camera: { zoom: number; panX: number; panY: number };
        rig: { getPose(): Map<string, { joint: { x: number; y: number } }> };
        project: { rig: { bones: Array<{ id: string; name: string }> } };
      };
      const box = st.getBoundingClientRect();
      const head = st.project.rig.bones.find((b) => b.name === '头部')!;
      const pose = st.rig.getPose().get(head.id)!;
      return {
        x: box.x + pose.joint.x * st.camera.zoom + st.camera.panX,
        y: box.y + pose.joint.y * st.camera.zoom + st.camera.panY,
      };
    });
    const before = await root.locator('#v-x').inputValue();
    await page.mouse.move(joint.x, joint.y);
    await page.mouse.down();
    await page.mouse.move(joint.x + 48, joint.y + 18, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(350);
    const after = await root.locator('#v-x').inputValue();
    expect(Number(after)).not.toBe(Number(before));

    // lock the bone, then a drag must not move it
    await root.locator('#lock-switch').click();
    await expect(root.locator('#lock-switch')).toHaveClass(/on/);
    const lockedState = await boneState(page, '头部');
    expect(lockedState.locked).toBe(true);
    const joint2 = await page.evaluate(() => {
      const r = document.querySelector('farm-app')!.shadowRoot!.querySelector('main .view')!.shadowRoot!;
      const st = r.querySelector('farm-stage') as unknown as {
        getBoundingClientRect(): DOMRect;
        camera: { zoom: number; panX: number; panY: number };
        rig: { getPose(): Map<string, { joint: { x: number; y: number } }> };
        project: { rig: { bones: Array<{ id: string; name: string }> } };
      };
      const box = st.getBoundingClientRect();
      const head = st.project.rig.bones.find((b) => b.name === '头部')!;
      const pose = st.rig.getPose().get(head.id)!;
      return {
        x: box.x + pose.joint.x * st.camera.zoom + st.camera.panX,
        y: box.y + pose.joint.y * st.camera.zoom + st.camera.panY,
      };
    });
    await page.mouse.move(joint2.x, joint2.y);
    await page.mouse.down();
    await page.mouse.move(joint2.x + 70, joint2.y + 40, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(350);
    const afterLockDrag = await boneState(page, '头部');
    expect(afterLockDrag.x).toBe(lockedState.x);
    expect(afterLockDrag.y).toBe(lockedState.y);
    // and the lock is reflected in the outliner
    await expect(root.locator('#bone-tree [data-bone]', { hasText: '头部' }).locator('.lk')).toBeVisible();
  });

  test('工作台：打关键帧、三种缓动切换、播放头预览', async ({ page }) => {
    await gotoView(page, 'animate');
    const root = viewRoot(page);
    await root.locator('#bone-tree [data-bone]', { hasText: '胸腔' }).click();

    const timeline = root.locator('farm-timeline');
    const keysBefore = await timeline.locator('.key').count();

    // jump to frame 8 and key the current pose
    await root.locator('#frame-in').fill('8');
    await root.locator('#frame-in').press('Enter');
    await page.waitForTimeout(250);
    await root.locator('#v-key').click();
    await page.waitForTimeout(400);
    const keysAfter = await timeline.locator('.key').count();
    expect(keysAfter).toBeGreaterThan(keysBefore);
    await expect(timeline.locator('#frame-label')).toContainText('第 8 帧');

    // each easing button changes the selected key's easing
    for (const easing of ['step', 'bezier', 'easeInOut']) {
      await root.locator('#bone-tree [data-bone]', { hasText: '胸腔' }).click();
      await timeline.locator('.key').nth(0).click();
      await timeline.locator(`[data-easing="${easing}"]`).click();
      await page.waitForTimeout(250);
      const cls = await timeline.locator('.key').nth(0).getAttribute('class');
      if (easing === 'step') expect(cls).toContain('ease-step');
      if (easing === 'bezier') expect(cls).toContain('ease-bezier');
    }

    // dragging the playhead scrubs the preview
    const ruler = timeline.locator('.ruler');
    const box = (await ruler.boundingBox())!;
    await page.mouse.move(box.x + 180, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 320, box.y + 20, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const frameLabel = await timeline.locator('#frame-label').innerText();
    expect(frameLabel).not.toContain('第 0 帧');

    // playback advances the frame counter
    await root.locator('#play-btn').click();
    await page.waitForTimeout(900);
    const playingFrame = Number(await root.locator('#frame-in').inputValue());
    expect(playingFrame).toBeGreaterThan(0);
    await root.locator('#play-btn').click();
  });

  test('提交拦截：未处理批注挡住定稿，处理完后版本号递增', async ({ page }) => {
    await gotoView(page, 'review');
    const root = viewRoot(page);

    // the 退回 project shows an explicit gate
    await expect(root.locator('.gate.block').first()).toContainText('不能定稿');
    await expect(root.locator('.ann-card .status-chip.pending').first()).toBeVisible();

    // animator replies to each open note
    for (let i = 0; i < 2; i++) {
      await page.evaluate(() => {
        const r = document.querySelector('farm-app')!.shadowRoot!.querySelector('main .view')!.shadowRoot!;
        const card = r.querySelector('.ann-card .status-chip.pending')!.closest('.ann-card') as HTMLElement;
        (card.querySelector('textarea[data-reply]') as HTMLTextAreaElement).value = '已改：按批注调整幅度与穿模';
        (card.querySelector('[data-act="resolved"]') as HTMLElement).click();
      });
      await page.waitForTimeout(350);
    }
    await expect(root.locator('.gate.ok').first()).toContainText('可定稿');
    await expect(root.locator('.ann-card .status-chip.pending')).toHaveCount(0);

    const versionsBefore = await root.locator('.ver-pill').count();
    await root.locator('#foot-submit').click();
    await page.waitForTimeout(700);
    await expect(root.locator('#topbar')).toContainText('待审核');
    const versionsAfter = await root.locator('.ver-pill').count();
    expect(versionsAfter).toBe(versionsBefore + 1);
    // the newly created version is the highest number
    const numbers = await root.locator('.ver-pill').allInnerTexts();
    const parsed = numbers.map((t) => Number(t.replace('v', '')));
    expect(Math.max(...parsed)).toBe(Math.max(...parsed.filter((n) => n !== Math.max(...parsed))) + 1);

    // reviewer can now adopt, and the transition is recorded with operator + time
    await appRoot(page).locator('#role-switch [data-role="reviewer"]').click();
    await page.waitForTimeout(500);
    await expect(root.locator('#btn-approve')).toBeEnabled();
    await root.locator('#review-note').fill('穗幅与穿模已修正，镜头可用。');
    await root.locator('#btn-approve').click();
    await page.waitForTimeout(700);
    await expect(root.locator('#topbar')).toContainText('已采用');
    const log = await root.locator('.a-row').first().innerText();
    expect(log).toContain('审核采用');
    expect(log).toContain('待审核');
  });

  test('审核批注：画面上点位置写批注，批注落到具体帧并退回制作方', async ({ page }) => {
    await gotoView(page, 'review');
    const root = viewRoot(page);
    await appRoot(page).locator('#role-switch [data-role="reviewer"]').click();
    await page.waitForTimeout(400);

    // pick the 待审核 小麦 project, which has open notes and a clean canvas point
    await selectProject(page, '越冬的守望');

    await root.locator('#write-toggle').click();
    await page.waitForTimeout(300);
    const stageBox = (await root.locator('#stage-box').boundingBox())!;
    await page.mouse.click(stageBox.x + stageBox.width / 2, stageBox.y + stageBox.height / 2);
    await page.waitForTimeout(400);
    const pop = page.locator('.draft-pop');
    await expect(pop).toBeVisible();
    await pop.locator('textarea').fill('这一帧根须颜色与土壤层次不协调，建议压暗一档。');
    await pop.locator('[data-ok]').click();
    await page.waitForTimeout(600);

    const notes = await root.locator('.ann-card').allInnerTexts();
    expect(notes.some((n) => n.includes('根须颜色'))).toBe(true);
    // the new note is pinned to the current frame and shows in the timeline strip
    expect(await root.locator('.scrub .tick').count()).toBeGreaterThan(0);
    // writing during review bounces the project back to the animator
    await expect(root.locator('#topbar')).toContainText('退回');
    const log = (await root.locator('.a-row').allInnerTexts()).join(' | ');
    expect(log).toContain('批注');
  });

  test('版本比对：并排两个版本并标出差异帧', async ({ page }) => {
    await gotoView(page, 'compare');
    const root = viewRoot(page);
    await expect(root.locator('.pane')).toHaveCount(2);
    await expect(root.locator('#v-a')).toBeVisible();
    await expect(root.locator('#v-b')).toBeVisible();

    // the timeline reports a non-trivial set of differing frames
    const info = await root.locator('.strip-head').innerText();
    const diffCount = Number(info.match(/(\d+)\s*帧不同/)?.[1] ?? 0);
    expect(diffCount).toBeGreaterThan(3);
    expect(await root.locator('.strip .seg.diff').count()).toBeGreaterThan(3);

    // jumping to a differing frame updates both panes and the readout
    await root.locator('#c-jump-diff').click();
    await page.waitForTimeout(400);
    const label = await root.locator('.frame-mono').innerText();
    expect(label).not.toContain('第 0 /');

    // side-by-side and overlay modes both render
    await root.locator('[data-mode="overlay"]').click();
    await page.waitForTimeout(1200);
    await expect(root.locator('.pane')).toHaveCount(2);
    await root.locator('[data-mode="side"]').click();
    await page.waitForTimeout(1200);
    await expect(root.locator('.pane')).toHaveCount(2);
  });

  test('导出交付包：序列帧 + 角色配置 zip', async ({ page }) => {
    await gotoView(page, 'review');
    await selectProject(page, '越冬的守望');
    await gotoView(page, 'animate');
    const root = viewRoot(page);
    const downloadPromise = page.waitForEvent('download', { timeout: 120_000 });
    await root.locator('#btn-export').click();
    await page.waitForTimeout(300);
    await page.locator('.modal-backdrop [data-ok]').click();
    const download = await downloadPromise;
    const target = path.join(os.tmpdir(), `heying-delivery-${Date.now()}.zip`);
    await download.saveAs(target);
    expect(download.suggestedFilename()).toContain('禾影_小麦');
    expect(fs.statSync(target).size).toBeGreaterThan(200_000);

    // unzip and validate structure
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(fs.readFileSync(target));
    const names = Object.keys(zip.files);
    expect(names.filter((n) => n.endsWith('.png') && n.includes('frames/')).length).toBeGreaterThan(40);
    const cfgName = names.find((n) => n.endsWith('character.json'))!;
    const cfg = JSON.parse(await zip.file(cfgName)!.async('string'));
    expect(cfg.schema).toBe('heying.character/1');
    expect(cfg.bones.length).toBe(10);
    expect(cfg.tracks.length).toBeGreaterThan(0);
    expect(cfg.assets.map((a: { kind: string }) => a.kind)).toEqual(
      expect.arrayContaining(['head', 'torso', 'leaf', 'ear', 'roots']),
    );
    const seqName = names.find((n) => n.endsWith('sequence.json'))!;
    const seq = JSON.parse(await zip.file(seqName)!.async('string'));
    expect(seq.fps).toBe(24);
    expect(seq.count).toBe(seq.totalFrames);

    // exported frame is a real transparent 960×640 PNG
    const frameName = names.find((n) => n.endsWith('frame_0000.png'))!;
    const buf = await zip.file(frameName)!.async('uint8array');
    expect([...buf.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const width = (buf[16] << 24) | (buf[17] << 16) | (buf[18] << 8) | buf[19];
    const height = (buf[20] << 24) | (buf[21] << 16) | (buf[22] << 8) | buf[23];
    expect([width, height]).toEqual([960, 640]);
    expect(buf[25]).toBe(6); // RGBA colour type
    fs.rmSync(target, { force: true });
  });

  test('角色配置可回读：导出配置再导入，骨架与曲线保持一致', async ({ page }) => {
    await gotoView(page, 'animate');
    const root = viewRoot(page);
    const before = await root.locator('#bone-tree [data-bone]').allInnerTexts();
    const keyCountBefore = await root.locator('farm-timeline').locator('.key').count();

    const cfg = await page.evaluate(async () => {
      const mod = await import('/src/core/exporter.ts');
      const r = document.querySelector('farm-app')!.shadowRoot!.querySelector('main .view')!.shadowRoot!;
      const view = r.host as unknown as { project: unknown };
      return JSON.stringify(mod.rigConfig(view.project as never));
    });
    const parsed = JSON.parse(cfg);
    expect(parsed.bones.length).toBe(10);
    expect(parsed.tracks.length).toBeGreaterThan(0);

    // round-trip through the parser
    const roundTrip = await page.evaluate(async (raw: string) => {
      const mod = await import('/src/core/exporter.ts');
      const res = mod.parseConfig(JSON.parse(raw));
      return res ? { bones: res.rig.bones.length, tracks: res.timeline.tracks.length, fps: res.timeline.fps } : null;
    }, cfg);
    expect(roundTrip).not.toBeNull();
    expect(roundTrip!.bones).toBe(10);
    expect(roundTrip!.tracks).toBe(parsed.tracks.length);
    expect(roundTrip!.fps).toBe(24);
    expect(await root.locator('#bone-tree [data-bone]').allInnerTexts()).toEqual(before);
    expect(await root.locator('farm-timeline').locator('.key').count()).toBe(keyCountBefore);
  });
});
