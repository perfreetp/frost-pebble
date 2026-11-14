import type { Bone, ChannelKind, Rig, Timeline, TransformValues } from './types';
import { sampleKeys } from './easing';

export interface Mat {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;
}

export const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

export function mul(m: Mat, n: Mat): Mat {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    tx: m.a * n.tx + m.c * n.ty + m.tx,
    ty: m.b * n.tx + m.d * n.ty + m.ty,
  };
}

export function applyMat(m: Mat, x: number, y: number): { x: number; y: number } {
  return { x: m.a * x + m.c * y + m.tx, y: m.b * x + m.d * y + m.ty };
}

export function invertMat(m: Mat): Mat {
  const det = m.a * m.d - m.b * m.c || 1e-9;
  const a = m.d / det;
  const b = -m.b / det;
  const c = -m.c / det;
  const d = m.a / det;
  return { a, b, c, d, tx: -(a * m.tx + c * m.ty), ty: -(b * m.tx + d * m.ty) };
}

const rad = (deg: number) => (deg * Math.PI) / 180;

export function compose(x: number, y: number, rotationDeg: number, sx: number, sy: number): Mat {
  const r = rad(rotationDeg);
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return { a: cos * sx, b: sin * sx, c: -sin * sy, d: cos * sy, tx: x, ty: y };
}

export interface ResolvedPose {
  /** bone local transform after sampling tracks */
  local: TransformValues;
  world: Mat;
  /** armature-space position of the joint */
  joint: { x: number; y: number };
  /** world position of the part center */
  tip: { x: number; y: number };
}

export function sampleLocal(bone: Bone, timeline: Timeline | null, frame: number): TransformValues {
  const track = timeline?.tracks.find((t) => t.boneId === bone.id);
  const values: TransformValues = {
    x: bone.x,
    y: bone.y,
    rotation: bone.rotation,
    scaleX: bone.scaleX,
    scaleY: bone.scaleY,
  };
  if (!track) return values;
  const pos = sampleKeys(track.channels.position.keys, frame);
  if (pos && typeof pos === 'object') {
    values.x = pos.x;
    values.y = pos.y;
  }
  const rot = sampleKeys(track.channels.rotation.keys, frame);
  if (typeof rot === 'number') values.rotation = rot;
  const scale = sampleKeys(track.channels.scale.keys, frame);
  if (scale && typeof scale === 'object') {
    values.scaleX = scale.x;
    values.scaleY = scale.y;
  }
  return values;
}

export function resolvePose(rig: Rig, timeline: Timeline | null, frame: number): Map<string, ResolvedPose> {
  const result = new Map<string, ResolvedPose>();
  const byId = new Map(rig.bones.map((b) => [b.id, b]));
  const visiting = new Set<string>();

  const resolve = (bone: Bone): ResolvedPose => {
    const cached = result.get(bone.id);
    if (cached) return cached;
    if (visiting.has(bone.id)) {
      // cycle guard: treat as root
      const local = sampleLocal(bone, timeline, frame);
      const world = compose(local.x, local.y, local.rotation, local.scaleX, local.scaleY);
      const pose = { local, world, joint: { x: world.tx, y: world.ty }, tip: { x: world.tx, y: world.ty } };
      result.set(bone.id, pose);
      return pose;
    }
    visiting.add(bone.id);
    const local = sampleLocal(bone, timeline, frame);
    const parent = bone.parentId ? byId.get(bone.parentId) : undefined;
    const parentWorld = parent ? resolve(parent).world : IDENTITY;
    const world = mul(parentWorld, compose(local.x, local.y, local.rotation, local.scaleX, local.scaleY));
    const joint = applyMat(parentWorld, local.x, local.y);
    const tip = applyMat(world, 0, 0);
    const pose = { local, world, joint: { x: world.tx, y: world.ty }, tip: { x: joint.x, y: joint.y } };
    // joint is the bone origin in armature space; tip duplicates it but scaled parts use `world`
    pose.tip = { x: world.tx, y: world.ty };
    result.set(bone.id, pose);
    visiting.delete(bone.id);
    return pose;
  };

  for (const bone of rig.bones) resolve(bone);
  return result;
}

/** Descendant ids including the bone itself. */
export function subtreeIds(rig: Rig, boneId: string): string[] {
  const ids = [boneId];
  let grew = true;
  while (grew) {
    grew = false;
    for (const b of rig.bones) {
      if (b.parentId && ids.includes(b.parentId) && !ids.includes(b.id)) {
        ids.push(b.id);
        grew = true;
      }
    }
  }
  return ids;
}

/** Prevents a parent being moved under its own descendant. */
export function canParent(rig: Rig, boneId: string, parentId: string | null): boolean {
  if (!parentId) return true;
  if (boneId === parentId) return false;
  return !subtreeIds(rig, boneId).includes(parentId);
}

export function ensureTrack(timeline: Timeline, boneId: string) {
  let track = timeline.tracks.find((t) => t.boneId === boneId);
  if (!track) {
    track = {
      boneId,
      channels: {
        position: { kind: 'position', keys: [] },
        rotation: { kind: 'rotation', keys: [] },
        scale: { kind: 'scale', keys: [] },
      },
    };
    timeline.tracks.push(track);
  }
  return track;
}

export function channelValue(bone: Bone, kind: ChannelKind): { x: number; y: number } | number {
  if (kind === 'position') return { x: bone.x, y: bone.y };
  if (kind === 'rotation') return bone.rotation;
  return { x: bone.scaleX, y: bone.scaleY };
}

export function setBoneValue(bone: Bone, kind: ChannelKind, value: { x: number; y: number } | number) {
  if (kind === 'position' && typeof value === 'object') {
    bone.x = value.x;
    bone.y = value.y;
  } else if (kind === 'rotation' && typeof value === 'number') {
    bone.rotation = value;
  } else if (kind === 'scale' && typeof value === 'object') {
    bone.scaleX = value.x;
    bone.scaleY = value.y;
  }
}

/**
 * Writes sampled transform values back into bone defaults (used while scrubbing or
 * dragging so the inspector always shows the frame being previewed).
 */
export function applyPoseToBones(rig: Rig, timeline: Timeline | null, frame: number) {
  for (const bone of rig.bones) {
    const local = sampleLocal(bone, timeline, frame);
    bone.x = Math.round(local.x * 100) / 100;
    bone.y = Math.round(local.y * 100) / 100;
    bone.rotation = Math.round(local.rotation * 100) / 100;
    bone.scaleX = Math.round(local.scaleX * 1000) / 1000;
    bone.scaleY = Math.round(local.scaleY * 1000) / 1000;
  }
}

/** Compare two resolved poses; returns per-bone difference magnitude and a total 0..1 score. */
export interface PoseDiff {
  total: number;
  perBone: Map<string, number>;
}

export function diffPose(a: Map<string, ResolvedPose>, b: Map<string, ResolvedPose>): PoseDiff {
  const perBone = new Map<string, number>();
  let total = 0;
  for (const [id, pa] of a) {
    const pb = b.get(id);
    if (!pb) {
      perBone.set(id, 1);
      total += 1;
      continue;
    }
    const dPos = Math.hypot(pa.tip.x - pb.tip.x, pa.tip.y - pb.tip.y) / 300;
    const dRot = Math.abs(pa.local.rotation - pb.local.rotation) / 180;
    const dScale = (Math.abs(pa.local.scaleX - pb.local.scaleX) + Math.abs(pa.local.scaleY - pb.local.scaleY)) / 2;
    const d = Math.min(1, dPos + dRot + dScale);
    perBone.set(id, d);
    total += d;
  }
  return { total: perBone.size ? total / perBone.size : 0, perBone };
}

export function diffFrames(a: { rig: Rig; timeline: Timeline }, b: { rig: Rig; timeline: Timeline }, duration: number): number[] {
  const out: number[] = [];
  for (let f = 0; f <= duration; f++) {
    const d = diffPose(resolvePose(a.rig, a.timeline, f), resolvePose(b.rig, b.timeline, f));
    if (d.total > 0.004) out.push(f);
  }
  return out;
}

export function sortKeys(timeline: Timeline) {
  for (const track of timeline.tracks) {
    for (const kind of ['position', 'rotation', 'scale'] as ChannelKind[]) {
      track.channels[kind].keys.sort((x, y) => x.frame - y.frame);
    }
  }
}
