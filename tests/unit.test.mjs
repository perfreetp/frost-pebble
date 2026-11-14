// Logic checks for the animation core, run with `node --test tests/unit.test.mjs`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

let vite;
test.before(async () => {
  vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
});
test.after(async () => vite.close());

const load = async (mod) => vite.ssrLoadModule(`/src/core/${mod}`);

const canvasStub = () => {
  const ctx = {
    beginPath() {}, moveTo() {}, lineTo() {}, arcTo() {}, closePath() {}, fill() {}, stroke() {},
    quadraticCurveTo() {}, bezierCurveTo() {}, ellipse() {}, save() {}, restore() {}, translate() {},
    scale() {}, rotate() {}, drawImage() {}, setTransform() {}, clearRect() {}, arc() {},
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
  };
  return { toDataURL: () => 'data:image/png;base64,', getContext: () => ctx, width: 0, height: 0 };
};

const installDomStubs = () => {
  globalThis.localStorage = {
    store: new Map(),
    getItem(k) { return this.store.get(k) ?? null; },
    setItem(k, v) { this.store.set(k, v); },
    removeItem(k) { this.store.delete(k); },
    clear() { this.store.clear(); },
  };
  globalThis.Image = class {
    set src(_v) { setTimeout(() => this.onload?.(), 0); }
  };
  globalThis.document = { createElement: () => canvasStub() };
};

test('easing: step holds, easeInOut is smooth, bezier passes through endpoints', async () => {
  const { easeFactor, cubicBezierEase, sampleKeys } = await load('easing.ts');
  assert.equal(easeFactor('step', [0.42, 0, 0.58, 1], 0.99), 0);
  assert.equal(easeFactor('easeInOut', [0.42, 0, 0.58, 1], 0), 0);
  assert.equal(easeFactor('easeInOut', [0.42, 0, 0.58, 1], 1), 1);
  assert.ok(Math.abs(easeFactor('easeInOut', [0.42, 0, 0.58, 1], 0.5) - 0.5) < 0.01);
  const bez = cubicBezierEase(0.25, 1, 0.5, 1);
  assert.ok(Math.abs(bez(0) - 0) < 0.02);
  assert.ok(Math.abs(bez(1) - 1) < 0.02);
  assert.ok(bez(0.3) > 0.3, 'an ease-out curve leads the linear ramp');

  const keys = [
    { id: 'a', frame: 0, value: 0, easing: 'step', bezier: [0.42, 0, 0.58, 1] },
    { id: 'b', frame: 10, value: 100, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
  ];
  assert.equal(sampleKeys(keys, 5), 0, 'a step key keeps the previous value');
  assert.equal(sampleKeys(keys, 10), 100);
  assert.equal(sampleKeys(keys, -3), 0, 'clamps before the first key');
  assert.deepEqual(sampleKeys([
    { id: 'a', frame: 0, value: { x: 0, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
    { id: 'b', frame: 10, value: { x: 10, y: 20 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
  ], 10), { x: 10, y: 20 });
});

test('rig: pose resolution honours the parent chain and cycles are guarded', async () => {
  const { resolvePose } = await load('rig.ts');
  const bones = [
    { id: 'a', parentId: null, x: 100, y: 100, rotation: 0, scaleX: 1, scaleY: 1, z: 0 },
    { id: 'b', parentId: 'a', x: 0, y: -50, rotation: 0, scaleX: 1, scaleY: 1, z: 1 },
    { id: 'c', parentId: 'b', x: 25, y: 0, rotation: 90, scaleX: 1, scaleY: 1, z: 2 },
  ];
  const pose = resolvePose({ bones }, null, 0);
  assert.deepEqual([pose.get('a').joint.x, pose.get('a').joint.y], [100, 100]);
  assert.deepEqual([pose.get('b').joint.x, pose.get('b').joint.y], [100, 50]);
  assert.deepEqual([pose.get('c').joint.x, pose.get('c').joint.y], [125, 50]);

  bones[0].rotation = 90;
  const rotated = resolvePose({ bones }, null, 0);
  // a 90° parent turns the child's (0,-50) offset into a +50px horizontal one
  assert.ok(Math.abs(rotated.get('b').joint.x - 150) < 1, 'parent rotation cascades to the child');
  assert.ok(Math.abs(rotated.get('b').joint.y - 100) < 1);

  bones[0].parentId = 'c';
  const cyclic = resolvePose({ bones }, null, 0);
  assert.equal(cyclic.size, 3, 'a cycle still resolves all three bones');
});

test('rig: sampling a timeline overrides base transforms', async () => {
  const { resolvePose } = await load('rig.ts');
  const bones = [{ id: 'a', parentId: null, x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, z: 0 }];
  const timeline = {
    fps: 24,
    duration: 24,
    tracks: [{
      boneId: 'a',
      channels: {
        position: { kind: 'position', keys: [
          { id: 'k1', frame: 0, value: { x: 0, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
          { id: 'k2', frame: 24, value: { x: 240, y: -120 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        ] },
        rotation: { kind: 'rotation', keys: [] },
        scale: { kind: 'scale', keys: [] },
      },
    }],
  };
  const mid = resolvePose({ bones }, timeline, 12);
  assert.ok(Math.abs(mid.get('a').joint.x - 120) < 1);
  const end = resolvePose({ bones }, timeline, 24);
  assert.equal(end.get('a').joint.x, 240);
  assert.equal(end.get('a').joint.y, -120);
});

test('rig: parenting constraints reject descendant parents', async () => {
  const { canParent, subtreeIds } = await load('rig.ts');
  const bones = [
    { id: 'root', parentId: null }, { id: 'mid', parentId: 'root' }, { id: 'leaf', parentId: 'mid' },
    { id: 'other', parentId: null },
  ];
  assert.equal(canParent({ bones }, 'root', 'leaf'), false);
  assert.equal(canParent({ bones }, 'root', 'other'), true);
  assert.equal(canParent({ bones }, 'leaf', 'other'), true);
  assert.equal(canParent({ bones }, 'mid', null), true);
  assert.deepEqual(subtreeIds({ bones }, 'root'), ['root', 'mid', 'leaf']);
});

test('rig: diffFrames reports exactly the frames whose pose changed', async () => {
  const { diffFrames } = await load('rig.ts');
  const makeRig = (x) => ({ bones: [{ id: 'a', parentId: null, x, y: 0, rotation: 0, scaleX: 1, scaleY: 1, z: 0 }] });
  const tl = (from, to) => ({
    fps: 24, duration: 24,
    tracks: [{
      boneId: 'a',
      channels: {
        position: { kind: 'position', keys: [
          { id: 'k1', frame: 0, value: { x: from, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
          { id: 'k2', frame: 24, value: { x: to, y: 0 }, easing: 'easeInOut', bezier: [0.42, 0, 0.58, 1] },
        ] },
        rotation: { kind: 'rotation', keys: [] },
        scale: { kind: 'scale', keys: [] },
      },
    }],
  });
  const identical = diffFrames({ rig: makeRig(0), timeline: tl(0, 100) }, { rig: makeRig(0), timeline: tl(0, 100) }, 24);
  assert.deepEqual(identical, []);
  const moved = diffFrames({ rig: makeRig(0), timeline: tl(0, 100) }, { rig: makeRig(0), timeline: tl(0, 160) }, 24);
  assert.ok(moved.length > 5, 'a different swing amplitude shows on many frames');
  assert.ok(!moved.includes(0), 'frame 0 matches and is excluded');
  assert.ok(moved.length < 25, 'not every frame is flagged');
});

test('exporter: config snapshot carries bones, bind poses and per-key easing', async () => {
  installDomStubs();
  const { rigConfig } = await load('exporter.ts');
  const project = {
    id: 'p1', crop: '水稻', episode: 3, title: '抽穗', deliveryDate: '2026-11-20',
    rig: { bones: [
      { id: 'b1', name: '根骨', parentId: null, partId: 'a1', x: 10, y: 20, rotation: 5, scaleX: 1, scaleY: 1,
        bindX: 0, bindY: 0, bindRotation: 0, bindScaleX: 1, bindScaleY: 1, locked: false, z: 0, color: '#fff' },
    ] },
    timeline: { fps: 24, duration: 48, tracks: [{
      boneId: 'b1',
      channels: {
        position: { kind: 'position', keys: [{ id: 'k', frame: 6, value: { x: 3, y: 4 }, easing: 'bezier', bezier: [0.3, 0.1, 0.7, 1] }] },
        rotation: { kind: 'rotation', keys: [{ id: 'r', frame: 6, value: 30, easing: 'step', bezier: [0.42, 0, 0.58, 1] }] },
        scale: { kind: 'scale', keys: [] },
      },
    }] },
    assets: [{ id: 'a1', name: '躯干', kind: 'torso', width: 2, height: 2, anchorX: 1, anchorY: 1, builtinKey: '水稻:torso' }],
    versions: [{ number: 4 }],
  };
  const cfg = rigConfig(project);
  assert.equal(cfg.schema, 'heying.character/1');
  assert.equal(cfg.version, 1, 'falls back to versions.length when no snapshot is passed');
  assert.equal(cfg.bones[0].bind.rotation, 0);
  assert.equal(cfg.tracks[0].channels.position[0].easing, 'bezier');
  assert.equal(cfg.tracks[0].channels.rotation[0].easing, 'step');
  assert.equal(cfg.assets[0].builtin, '水稻:torso');
});

test('store workflow: version numbers increment and pending notes block sign-off', async () => {
  installDomStubs();
  const { Store } = await load('store.ts');
  const store = new Store();
  const p = store.state.projects[0];
  store.state.currentProjectId = p.id;
  const pending = store.pendingAnnotations(p);
  assert.ok(pending.length > 0, 'the退回 project starts with open notes');
  const blocked = store.submitVersion('尝试定稿');
  assert.equal(blocked.ok, false);
  assert.match(blocked.message, /未处理/);

  store.replyAnnotation(pending[0].id, '已改：收小摆动', 'resolved');
  const stillBlocked = store.submitVersion('再次提交');
  assert.equal(stillBlocked.ok, false, 'one open note still blocks sign-off');

  store.replyAnnotation(store.pendingAnnotations(p)[0].id, '保留：抽穗弹性', 'explained');
  const beforeMax = Math.max(...p.versions.map((v) => v.number));
  const ok = store.submitVersion('按批注修订');
  assert.equal(ok.ok, true);
  assert.equal(ok.version.number, beforeMax + 1, 'version numbers increment continuously');
  assert.equal(p.status, '待审核');
  assert.equal(p.activity[0].to, '待审核');
  assert.ok(p.activity[0].by.length > 0, 'transition logs the operator');
  assert.ok(p.activity[0].at > 0, 'transition logs a timestamp');

  const reviewed = store.review('已采用', '镜头可用');
  assert.equal(reviewed.ok, true);
  assert.equal(p.status, '已采用');
  const next = store.review('已采用', '再次通过');
  assert.equal(next.ok, false, 'an adopted version cannot be re-approved');
});

test('review gate: reviewer cannot adopt while a note is open, and must justify a return', async () => {
  installDomStubs();
  const { Store } = await load('store.ts');
  const store = new Store();
  store.state.role = 'reviewer';
  const p = store.state.projects.find((x) => x.status === '待审核');
  store.state.currentProjectId = p.id;
  assert.ok(store.pendingAnnotations(p).length > 0);

  const res = store.review('已采用', '没问题');
  assert.equal(res.ok, false);
  assert.match(res.message, /批注/);

  const back = store.review('退回', '   ');
  assert.equal(back.ok, false, 'returning requires a written reason');

  const backOk = store.review('退回', '穗子穿模，请修');
  assert.equal(backOk.ok, true);
  assert.equal(p.status, '退回');
  assert.ok(p.activity.some((a) => a.action.includes('退回') && a.by.length > 0 && a.at > 0));
});

test('annotations: adding a note on a pending review returns the project to the animator', async () => {
  installDomStubs();
  const { Store } = await load('store.ts');
  const store = new Store();
  const p = store.state.projects.find((x) => x.status === '待审核');
  store.state.currentProjectId = p.id;
  store.state.role = 'reviewer';
  const ann = store.addAnnotation(18, 480, 300, '这一帧根须穿出土面了');
  assert.ok(ann);
  assert.equal(p.status, '退回');
  assert.equal(ann.status, 'pending');
  assert.ok(p.activity.some((a) => a.from === '待审核' && a.to === '退回'));

  store.reopenAnnotation(ann.id);
  assert.equal(ann.status, 'pending');
  store.deleteAnnotation(ann.id);
  assert.ok(!p.annotations.some((a) => a.id === ann.id));
});
