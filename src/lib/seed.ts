// 示例数据：程序生成绣娘手部/绣针/绣线/绷架/底稿图层，内置课目与历史提交
import type { Course, PartDef, Submission, TrackData, User } from '../types';
import { EASE_EASING, LINEAR_EASING } from '../types';
import { autoCheckSubmission, defaultActions, uid } from './anim';
import type { BlobRecord } from './idb';

const CANVAS_W = 960;
const CANVAS_H = 600;

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function drawBase(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(CANVAS_W, CANVAS_H);
  // 缎面底色
  const g = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  g.addColorStop(0, '#fdf8ef');
  g.addColorStop(1, '#f3e7d3');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // 织物细纹
  ctx.strokeStyle = 'rgba(160,130,90,0.10)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_W; x += 8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y < CANVAS_H; y += 8) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }
  // 底稿花样：一枝梅花线稿
  ctx.strokeStyle = 'rgba(120,90,120,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(380, 430);
  ctx.bezierCurveTo(420, 360, 430, 320, 470, 260);
  ctx.stroke();
  const flower = (cx: number, cy: number, r: number) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, r * 0.55, r * 0.35, a, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2); ctx.stroke();
  };
  flower(475, 250, 26);
  flower(425, 320, 18);
  flower(505, 330, 14);
  return c;
}

function drawFrame(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(440, 420);
  ctx.translate(220, 210);
  // 外圈木绷
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 26;
  ctx.beginPath(); ctx.ellipse(0, 0, 190, 175, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#6e441f';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(0, 0, 203, 188, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 177, 162, 0, 0, Math.PI * 2); ctx.stroke();
  // 张紧螺丝
  ctx.fillStyle = '#b08550';
  ctx.fillRect(196, -14, 26, 28);
  ctx.fillStyle = '#6e441f';
  ctx.fillRect(222, -10, 6, 20);
  // 布面
  ctx.fillStyle = 'rgba(253,248,239,0.85)';
  ctx.beginPath(); ctx.ellipse(0, 0, 172, 158, 0, 0, Math.PI * 2); ctx.fill();
  return c;
}

function drawHand(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(180, 160);
  // 手腕
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath();
  ctx.moveTo(0, 110);
  ctx.bezierCurveTo(30, 96, 52, 92, 78, 98);
  ctx.lineTo(70, 150);
  ctx.lineTo(0, 158);
  ctx.closePath();
  ctx.fill();
  // 手掌
  ctx.beginPath();
  ctx.ellipse(105, 92, 62, 52, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // 拇指与食指（捏针姿势）
  ctx.strokeStyle = '#f2c9a0';
  ctx.lineCap = 'round';
  ctx.lineWidth = 20;
  ctx.beginPath(); ctx.moveTo(96, 70); ctx.quadraticCurveTo(70, 44, 44, 34); ctx.stroke();
  ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(118, 62); ctx.quadraticCurveTo(100, 34, 82, 20); ctx.stroke();
  // 指甲
  ctx.fillStyle = '#f7ddc4';
  ctx.beginPath(); ctx.arc(42, 33, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(80, 19, 5, 0, Math.PI * 2); ctx.fill();
  // 袖口
  ctx.fillStyle = '#7a4f86';
  ctx.beginPath();
  ctx.moveTo(0, 108); ctx.lineTo(26, 100); ctx.lineTo(20, 160); ctx.lineTo(0, 160);
  ctx.closePath(); ctx.fill();
  return c;
}

function drawNeedle(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(150, 24);
  ctx.strokeStyle = '#9aa4ad';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(8, 12); ctx.lineTo(128, 12); ctx.stroke();
  // 针尖
  ctx.fillStyle = '#b8c0c8';
  ctx.beginPath(); ctx.moveTo(128, 12); ctx.lineTo(146, 8); ctx.lineTo(146, 16); ctx.closePath(); ctx.fill();
  // 针鼻
  ctx.fillStyle = '#f9f4ec';
  ctx.beginPath(); ctx.ellipse(16, 12, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7c858d';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(16, 12, 5, 3, 0, 0, Math.PI * 2); ctx.stroke();
  return c;
}

function drawThread(): HTMLCanvasElement {
  const [c, ctx] = makeCanvas(260, 200);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(10, 30);
  ctx.bezierCurveTo(90, 10, 120, 90, 170, 70);
  ctx.bezierCurveTo(210, 55, 230, 120, 250, 170);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(192,57,43,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, 36);
  ctx.bezierCurveTo(92, 18, 122, 98, 172, 78);
  ctx.bezierCurveTo(212, 64, 232, 128, 250, 176);
  ctx.stroke();
  return c;
}

export interface SeedBundle {
  users: User[];
  courses: Course[];
  submissions: Submission[];
  blobs: BlobRecord[];
}

function blobOf(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob 生成失败'))), 'image/png'),
  );
}

export async function buildSeedBundle(): Promise<SeedBundle> {
  const images = {
    base: drawBase(),
    frame: drawFrame(),
    hand: drawHand(),
    needle: drawNeedle(),
    thread: drawThread(),
  };
  const blobs: BlobRecord[] = [];
  const blobIds: Record<string, string> = {};
  for (const [key, canvas] of Object.entries(images)) {
    const id = uid('blob');
    blobIds[key] = id;
    blobs.push({ id, blob: await blobOf(canvas) });
  }

  const users: User[] = [
    { id: 'u_teacher', name: '孟老师', role: 'teacher' },
    { id: 'u_stu1', name: '沈绣兰', role: 'student' },
    { id: 'u_stu2', name: '周锦瑟', role: 'student' },
    { id: 'u_stu3', name: '顾青鸾', role: 'student' },
  ];

  // 关节定义
  const joints = [
    { id: 'j_frame', name: '绷架关节', x: 480, y: 300, parentId: null },
    { id: 'j_thread', name: '绣线关节', x: 430, y: 280, parentId: 'j_frame' },
    { id: 'j_hand', name: '手腕关节', x: 650, y: 320, parentId: null },
    { id: 'j_needle', name: '针身关节', x: 540, y: 270, parentId: 'j_hand' },
  ];

  const part = (
    id: string, name: string, kind: PartDef['kind'], blobKey: string,
    x: number, y: number, w: number, h: number, jointId: string | null, z: number,
  ): PartDef => ({
    id, name, kind, blobId: blobIds[blobKey], width: w, height: h,
    x, y,
    jointId,
    pivotX: jointId ? (joints.find((j) => j.id === jointId)!.x - x) : 0,
    pivotY: jointId ? (joints.find((j) => j.id === jointId)!.y - y) : 0,
    z, visible: true,
  });

  const parts: PartDef[] = [
    part('p_base', '底稿图层', 'base', 'base', 0, 0, CANVAS_W, CANVAS_H, null, 0),
    part('p_frame', '木质绷架', 'frame', 'frame', 260, 90, 440, 420, 'j_frame', 1),
    part('p_thread', '红色绣线', 'thread', 'thread', 300, 180, 260, 200, 'j_thread', 2),
    part('p_hand', '绣娘手部', 'hand', 'hand', 560, 240, 180, 160, 'j_hand', 3),
    part('p_needle', '钢绣针', 'needle', 'needle', 465, 258, 150, 24, 'j_needle', 4),
  ];

  // 老师示范动画（48 帧，首尾闭合）
  const demoTrack: TrackData = {
    duration: 48,
    fps: 24,
    actions: defaultActions(['起针', '行针', '收针'], 48),
    joints: [
      {
        jointId: 'j_frame',
        keyframes: [{ frame: 0, x: 480, y: 300, rotation: 0, easing: { ...LINEAR_EASING } }],
      },
      {
        jointId: 'j_thread',
        keyframes: [
          { frame: 0, x: 430, y: 280, rotation: 0, easing: { ...EASE_EASING } },
          { frame: 16, x: 410, y: 250, rotation: 6, easing: { ...EASE_EASING } },
          { frame: 32, x: 435, y: 275, rotation: -6, easing: { ...EASE_EASING } },
          { frame: 48, x: 430, y: 280, rotation: 0, easing: { ...EASE_EASING } },
        ],
      },
      {
        jointId: 'j_hand',
        keyframes: [
          { frame: 0, x: 650, y: 320, rotation: 0, easing: { ...EASE_EASING } },
          { frame: 16, x: 600, y: 282, rotation: -12, easing: { ...EASE_EASING } },
          { frame: 32, x: 648, y: 302, rotation: 8, easing: { ...EASE_EASING } },
          { frame: 48, x: 650, y: 320, rotation: 0, easing: { ...EASE_EASING } },
        ],
      },
      {
        jointId: 'j_needle',
        keyframes: [
          { frame: 0, x: 540, y: 270, rotation: 0, easing: { ...EASE_EASING } },
          { frame: 16, x: 472, y: 232, rotation: -25, easing: { ...EASE_EASING } },
          { frame: 32, x: 540, y: 262, rotation: 15, easing: { ...EASE_EASING } },
          { frame: 48, x: 540, y: 270, rotation: 0, easing: { ...EASE_EASING } },
        ],
      },
    ],
  };

  const course1: Course = {
    id: 'c_satin',
    name: '苏绣套针',
    difficulty: '进阶',
    requiredDuration: 48,
    requiredActions: ['起针', '行针', '收针'],
    assigneeIds: ['u_stu1', 'u_stu2', 'u_stu3'],
    parts,
    joints,
    demoTrack,
    createdAt: Date.now() - 86400000 * 6,
  };

  const course2: Course = {
    id: 'c_seed',
    name: '平针入门',
    difficulty: '入门',
    requiredDuration: 32,
    requiredActions: ['起针', '落针'],
    assigneeIds: ['u_stu1', 'u_stu2'],
    parts: parts.map((p) => ({ ...p, id: uid('p') })),
    joints: joints.map((j) => ({ ...j, id: j.id.replace('j_', 'j2_') })),
    demoTrack: null,
    createdAt: Date.now() - 86400000 * 2,
  };
  // 第二课部件关节 id 重映射
  const remap: Record<string, string> = { j_frame: 'j2_frame', j_thread: 'j2_thread', j_hand: 'j2_hand', j_needle: 'j2_needle' };
  course2.parts.forEach((p, i) => {
    const orig = parts[i].jointId;
    p.jointId = orig ? remap[orig] : null;
  });

  // 学员 A 的问题作业：时长超 12 帧、首尾不闭合、缺「收针」区间关键帧
  const badTrack: TrackData = {
    duration: 60,
    fps: 24,
    actions: defaultActions(['起针', '行针', '收针'], 60),
    joints: [
      {
        jointId: 'j_frame',
        keyframes: [{ frame: 0, x: 480, y: 300, rotation: 0, easing: { ...LINEAR_EASING } }],
      },
      {
        jointId: 'j_thread',
        keyframes: [
          { frame: 0, x: 430, y: 280, rotation: 0, easing: { ...EASE_EASING } },
          { frame: 20, x: 400, y: 240, rotation: 10, easing: { ...EASE_EASING } },
        ],
      },
      {
        jointId: 'j_hand',
        keyframes: [
          { frame: 0, x: 650, y: 320, rotation: 0, easing: { ...EASE_EASING } },
          { frame: 20, x: 590, y: 270, rotation: -18, easing: { ...EASE_EASING } },
          { frame: 40, x: 630, y: 290, rotation: 10, easing: { ...EASE_EASING } },
        ],
      },
      {
        jointId: 'j_needle',
        keyframes: [
          { frame: 0, x: 540, y: 270, rotation: 0, easing: { ...EASE_EASING } },
          { frame: 20, x: 460, y: 220, rotation: -30, easing: { ...EASE_EASING } },
        ],
      },
    ],
  };
  const badCheck = autoCheckSubmission(course1, badTrack);
  const sub1: Submission = {
    id: uid('sub'),
    courseId: course1.id,
    studentId: 'u_stu1',
    version: 1,
    status: 'returned',
    track: badTrack,
    autoCheck: badCheck,
    teacherScore: null,
    comment: '行针节奏可以，但时长超出要求且循环没有收回到起针位，收针动作缺失。请按扣分项逐条修正后重新提交。',
    submittedAt: Date.now() - 86400000 * 3,
    reviewedAt: Date.now() - 86400000 * 2,
  };

  // 学员 B 的合格作业
  const goodTrack: TrackData = JSON.parse(JSON.stringify(demoTrack)) as TrackData;
  goodTrack.joints.find((j) => j.jointId === 'j_hand')!.keyframes[1].x = 606;
  const goodCheck = autoCheckSubmission(course1, goodTrack);
  const sub2: Submission = {
    id: uid('sub'),
    courseId: course1.id,
    studentId: 'u_stu2',
    version: 1,
    status: 'graded',
    track: goodTrack,
    autoCheck: { ...goodCheck, score: Math.min(goodCheck.score, 92) },
    teacherScore: 88,
    comment: '手势连贯，针脚方向清楚。注意行针段手腕下压再稳一点，继续保持。',
    submittedAt: Date.now() - 86400000 * 2,
    reviewedAt: Date.now() - 86400000,
  };

  return { users, courses: [course1, course2], submissions: [sub1, sub2], blobs };
}
