// 动画数学：2D 仿射矩阵、三次贝塞尔缓动、关键帧求值、动作区间复制、自动核对
import type {
  ActionSpan,
  AutoCheck,
  AutoIssue,
  Course,
  Easing,
  JointDef,
  JointPose,
  JointTrack,
  Keyframe,
  PartDef,
  StagePart,
  TrackData,
} from '../types';
import { EASE_EASING, LINEAR_EASING } from '../types';

export const uid = (prefix = 'id'): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;

const deg2rad = (d: number): number => (d * Math.PI) / 180;

// ---------- 2D 仿射矩阵（列主序，兼容 WGSL uniform） ----------
// [a c tx; b d ty; 0 0 1]，Float32Array(6) = [a, b, tx, c, d, ty]

export type Mat2D = Float32Array;

export function identity(): Mat2D {
  return new Float32Array([1, 0, 0, 0, 1, 0]);
}

export function clone(m: Mat2D): Mat2D {
  return new Float32Array(m);
}

export function multiply(a: Mat2D, b: Mat2D): Mat2D {
  // a * b
  const out = new Float32Array(6);
  out[0] = a[0] * b[0] + a[3] * b[1];
  out[1] = a[1] * b[0] + a[4] * b[1];
  out[2] = a[2] * b[0] + a[5] * b[1] + a[2];
  out[3] = a[0] * b[3] + a[3] * b[4];
  out[4] = a[1] * b[3] + a[4] * b[4];
  out[5] = a[2] * b[3] + a[5] * b[4] + a[5];
  return out;
}

export function translate(x: number, y: number): Mat2D {
  return new Float32Array([1, 0, x, 0, 1, y]);
}

export function rotate(rad: number): Mat2D {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return new Float32Array([c, s, 0, -s, c, 0]);
}

// ---------- 三次贝塞尔缓动（与 CSS cubic-bezier 同算法） ----------

function cubicBezierComponent(t: number, p1: number, p2: number): number {
  // B(t) = 3(1-t)^2 t p1 + 3(1-t) t^2 p2 + t^3
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
}

function solveBezierT(x: number, x1: number, x2: number): number {
  // x 轴单调，牛顿迭代 + 二分兜底
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const xt = cubicBezierComponent(t, x1, x2) - x;
    if (Math.abs(xt) < 1e-5) return t;
    const d = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
    if (Math.abs(d) < 1e-6) break;
    t -= xt / d;
  }
  let lo = 0;
  let hi = 1;
  t = x;
  while (lo < hi) {
    const xt = cubicBezierComponent(t, x1, x2);
    if (Math.abs(xt - x) < 1e-5) return t;
    if (xt < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return t;
}

/** 整条缓动曲线：(0,0) 经缓入控制点 (inX,inY)、缓出控制点 (outX,outY) 到 (1,1)，
 *  即标准 cubic-bezier(inX,inY,outX,outY)，缓入/缓出可独立调节 */
export function applyEasing(progress: number, e: Easing): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  const t = solveBezierT(progress, e.inX, e.outX);
  return cubicBezierComponent(t, e.inY, e.outY);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

// ---------- 关键帧求值 ----------

function sortedKfs(kfs: Keyframe[]): Keyframe[] {
  return [...kfs].sort((a, b) => a.frame - b.frame);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}

export function evalJointTrack(track: JointTrack | undefined, frame: number, rest: JointDef): JointPose {
  const kfs = track ? sortedKfs(track.keyframes) : [];
  if (kfs.length === 0) return { x: rest.x, y: rest.y, rotation: 0 };
  if (frame <= kfs[0].frame) {
    const k = kfs[0];
    return { x: k.x, y: k.y, rotation: deg2rad(k.rotation) };
  }
  const last = kfs[kfs.length - 1];
  if (frame >= last.frame) return { x: last.x, y: last.y, rotation: deg2rad(last.rotation) };

  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const raw = (frame - a.frame) / Math.max(1, b.frame - a.frame);
      const t = applyEasing(raw, a.easing);
      return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
        rotation: deg2rad(lerpAngle(a.rotation, b.rotation, t)),
      };
    }
  }
  return { x: last.x, y: last.y, rotation: deg2rad(last.rotation) };
}

export function evalTrack(track: TrackData, frame: number, joints: JointDef[]): Map<string, JointPose> {
  const poses = new Map<string, JointPose>();
  for (const j of joints) {
    const jt = track.joints.find((t) => t.jointId === j.id);
    poses.set(j.id, evalJointTrack(jt, frame, j));
  }
  return poses;
}

/** 由关节姿态生成部件渲染姿态 */
export function buildStageParts(
  parts: PartDef[],
  poses: Map<string, JointPose>,
  images: Map<string, HTMLImageElement>,
): StagePart[] {
  return parts
    .filter((p) => p.visible && images.has(p.blobId))
    .map((p) => {
      const pose = p.jointId ? poses.get(p.jointId) : undefined;
      if (pose) {
        // 关节位置 = 部件枢轴点世界坐标
        return {
          image: images.get(p.blobId)!,
          x: pose.x - p.pivotX,
          y: pose.y - p.pivotY,
          width: p.width,
          height: p.height,
          pivotX: p.pivotX,
          pivotY: p.pivotY,
          rotation: pose.rotation,
          visible: true,
          z: p.z,
        };
      }
      return {
        image: images.get(p.blobId)!,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        pivotX: p.pivotX,
        pivotY: p.pivotY,
        rotation: 0,
        visible: true,
        z: p.z,
      };
    })
    .sort((a, b) => a.z - b.z);
}

// ---------- 关键帧编辑 ----------

export function upsertKeyframe(track: TrackData, jointId: string, kf: Keyframe): TrackData {
  const joints = track.joints.map((jt) => {
    if (jt.jointId !== jointId) return jt;
    const filtered = jt.keyframes.filter((k) => k.frame !== kf.frame);
    return { ...jt, keyframes: sortedKfs([...filtered, kf]) };
  });
  if (!joints.some((jt) => jt.jointId === jointId)) {
    joints.push({ jointId, keyframes: [kf] });
  }
  return { ...track, joints };
}

export function removeKeyframe(track: TrackData, jointId: string, frame: number): TrackData {
  return {
    ...track,
    joints: track.joints.map((jt) =>
      jt.jointId === jointId ? { ...jt, keyframes: jt.keyframes.filter((k) => k.frame !== frame) } : jt,
    ),
  };
}

export function findKeyframe(track: TrackData, jointId: string, frame: number): Keyframe | undefined {
  return track.joints
    .find((jt) => jt.jointId === jointId)
    ?.keyframes.find((k) => k.frame === frame);
}

/** 把 [srcStart, srcEnd] 的动作复制到目标起始帧（同一套关键动作可复用） */
export function copyActionRange(
  track: TrackData,
  srcStart: number,
  srcEnd: number,
  destStart: number,
): TrackData {
  const offset = destStart - srcStart;
  const span = srcEnd - srcStart;
  const joints = track.joints.map((jt) => {
    const copied = jt.keyframes
      .filter((k) => k.frame >= srcStart && k.frame <= srcEnd)
      .map((k) => ({ ...k, frame: k.frame + offset, easing: { ...k.easing } }));
    if (copied.length === 0) return jt;
    // 目标区间内原有关键帧被覆盖
    const kept = jt.keyframes.filter((k) => k.frame < destStart || k.frame > destStart + span);
    return { ...jt, keyframes: sortedKfs([...kept, ...copied]) };
  });
  const maxFrame = Math.max(track.duration, destStart + span);
  return { ...track, joints, duration: maxFrame };
}

export function emptyTrack(duration: number, fps = 24): TrackData {
  return { duration, fps, joints: [], actions: [] };
}

export function ensureJointTracks(track: TrackData, joints: JointDef[]): TrackData {
  const existing = new Set(track.joints.map((j) => j.jointId));
  const added = joints.filter((j) => !existing.has(j.id)).map((j) => ({ jointId: j.id, keyframes: [] }));
  return { ...track, joints: [...track.joints, ...added] };
}

export function countKeyframes(track: TrackData): number {
  return track.joints.reduce((sum, jt) => sum + jt.keyframes.length, 0);
}

export function trackMaxFrame(track: TrackData): number {
  let max = 0;
  for (const jt of track.joints) for (const k of jt.keyframes) max = Math.max(max, k.frame);
  return max;
}

// ---------- 自动核对 ----------

const DURATION_TOLERANCE = 5; // 时长误差容忍 5 帧
const LOOP_POS_TOLERANCE = 6; // px
const LOOP_ROT_TOLERANCE = 8; // 度

export function autoCheckSubmission(course: Course, track: TrackData): AutoCheck {
  const issues: AutoIssue[] = [];
  let score = 100;
  const keyframeCount = countKeyframes(track);

  if (keyframeCount === 0) {
    issues.push({ code: 'empty', message: '时间轴上没有任何关键帧，作品为空', deduction: 100 });
    return {
      passed: false,
      score: 0,
      issues,
      keyframeCount: 0,
      duration: 0,
      durationDelta: course.requiredDuration,
      loopClosed: false,
      loopError: { dx: 0, dy: 0, dRot: 0 },
      actionsFound: course.requiredActions.map((name) => ({ name, found: false, keyframeCount: 0 })),
      checkedAt: Date.now(),
    };
  }

  // 1. 时长误差（±5 帧）
  const actualDuration = trackMaxFrame(track);
  const durationDelta = actualDuration - course.requiredDuration;
  if (Math.abs(durationDelta) > DURATION_TOLERANCE) {
    const deduction = 15;
    score -= deduction;
    issues.push({
      code: 'duration',
      message: `时长 ${actualDuration} 帧，与要求 ${course.requiredDuration} 帧相差 ${Math.abs(durationDelta)} 帧（容忍 ±${DURATION_TOLERANCE} 帧）`,
      deduction,
    });
  }

  // 2. 关键动作核对：每个动作区间内是否有关键帧
  const actionsFound = course.requiredActions.map((name) => {
    const span = track.actions.find((a) => a.name === name);
    let kfInSpan = 0;
    if (span) {
      for (const jt of track.joints) {
        kfInSpan += jt.keyframes.filter((k) => k.frame >= span.startFrame && k.frame <= span.endFrame).length;
      }
    }
    return { name, found: !!span && kfInSpan > 0, keyframeCount: kfInSpan };
  });
  for (const a of actionsFound) {
    if (!a.found) {
      const deduction = 20;
      score -= deduction;
      issues.push({
        code: 'action_missing',
        message: `必须出现的关键动作「${a.name}」在对应帧区间内没有关键帧`,
        deduction,
      });
    }
  }

  // 3. 关键帧数量：每个已覆盖动作至少 2 个关键帧（起止姿态），总数低于动作数*2 扣分
  const expectedMin = Math.max(4, course.requiredActions.length * 2);
  if (keyframeCount < expectedMin) {
    const deduction = 10;
    score -= deduction;
    issues.push({
      code: 'keyframe_count',
      message: `关键帧共 ${keyframeCount} 个，低于建议下限 ${expectedMin} 个（每个动作需有起止姿态）`,
      deduction,
    });
  }

  // 4. 循环首尾闭合：比较第 0 帧与末帧各关节姿态
  const firstPoses = evalTrack(track, 0, course.joints);
  const lastPoses = evalTrack(track, actualDuration, course.joints);
  let maxDx = 0;
  let maxDy = 0;
  let maxDRot = 0;
  for (const j of course.joints) {
    const a = firstPoses.get(j.id)!;
    const b = lastPoses.get(j.id)!;
    maxDx = Math.max(maxDx, Math.abs(b.x - a.x));
    maxDy = Math.max(maxDy, Math.abs(b.y - a.y));
    let dRot = Math.abs(((b.rotation - a.rotation) * 180) / Math.PI) % 360;
    if (dRot > 180) dRot = 360 - dRot;
    maxDRot = Math.max(maxDRot, dRot);
  }
  const loopClosed = maxDx <= LOOP_POS_TOLERANCE && maxDy <= LOOP_POS_TOLERANCE && maxDRot <= LOOP_ROT_TOLERANCE;
  if (!loopClosed) {
    const deduction = 15;
    score -= deduction;
    issues.push({
      code: 'loop_close',
      message: `循环首尾未闭合（位置偏差最大 ${maxDx.toFixed(1)}/${maxDy.toFixed(1)}px，角度偏差 ${maxDRot.toFixed(1)}°，容忍 ${LOOP_POS_TOLERANCE}px/${LOOP_ROT_TOLERANCE}°）`,
      deduction,
    });
  }

  score = Math.max(0, Math.min(100, score));
  return {
    passed: issues.length === 0,
    score,
    issues,
    keyframeCount,
    duration: actualDuration,
    durationDelta,
    loopClosed,
    loopError: { dx: maxDx, dy: maxDy, dRot: maxDRot },
    actionsFound,
    checkedAt: Date.now(),
  };
}

// ---------- 缓动预设 ----------

export const EASING_PRESETS: { name: string; easing: Easing }[] = [
  { name: '线性', easing: LINEAR_EASING },
  { name: '缓入缓出', easing: EASE_EASING },
  { name: '缓入', easing: { inX: 0.42, inY: 0, outX: 1, outY: 1 } },
  { name: '缓出', easing: { inX: 0, inY: 0, outX: 0.58, outY: 1 } },
  { name: '回弹预备', easing: { inX: 0.3, inY: 1.2, outX: 0.7, outY: 1 } },
];

export function defaultActions(required: string[], duration: number): ActionSpan[] {
  if (required.length === 0) return [];
  const seg = Math.floor(duration / required.length);
  return required.map((name, i) => ({
    id: uid('act'),
    name,
    startFrame: i * seg,
    endFrame: i === required.length - 1 ? duration : (i + 1) * seg,
  }));
}
