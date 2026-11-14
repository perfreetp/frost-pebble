import type { EasingType, Keyframe, Vec2 } from './types';

export function cubicBezierEase(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  // Newton-Raphson sampler for CSS-style cubic-bezier easing.
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let guess = t;
    for (let i = 0; i < 6; i++) {
      const x = sampleX(guess) - t;
      if (Math.abs(x) < 1e-5) return sampleY(guess);
      const dx = sampleDX(guess);
      if (Math.abs(dx) < 1e-6) break;
      guess -= x / dx;
    }
    // bisection fallback
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      guess = (lo + hi) / 2;
      const x = sampleX(guess);
      if (Math.abs(x - t) < 1e-5) break;
      if (x < t) lo = guess;
      else hi = guess;
    }
    return sampleY(guess);
  };
}

export function easeFactor(easing: EasingType, bezier: [number, number, number, number], t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (easing === 'step') return 0;
  if (easing === 'bezier') return cubicBezierEase(...bezier)(t);
  // easeInOut (smoothstep)
  return t * t * (3 - 2 * t);
}

const isVec = (v: Vec2 | number): v is Vec2 => typeof v === 'object';

export function lerpValue(a: Vec2 | number, b: Vec2 | number, t: number): Vec2 | number {
  if (isVec(a) && isVec(b)) return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  return (a as number) + ((b as number) - (a as number)) * t;
}

/** Samples a sorted keyframe list; null when the channel has no keys. */
export function sampleKeys(keys: Keyframe[], frame: number): Vec2 | number | null {
  if (!keys.length) return null;
  const sorted = keys;
  if (frame <= sorted[0].frame) return sorted[0].value;
  const last = sorted[sorted.length - 1];
  if (frame >= last.frame) return last.value;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const span = b.frame - a.frame || 1;
      const t = (frame - a.frame) / span;
      return lerpValue(a.value, b.value, easeFactor(a.easing, a.bezier, t));
    }
  }
  return last.value;
}

export function curvePoints(easing: EasingType, bezier: [number, number, number, number], steps = 28): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = easing === 'bezier' ? 1 - cubicBezierEase(...bezier)(t) : 1 - easeFactor(easing, bezier, t);
    pts.push(`${(t * 100).toFixed(2)},${(y * 100).toFixed(2)}`);
  }
  return pts.join(' ');
}

export function sampleTrackValue(trackValue: Keyframe[] | undefined, frame: number, fallback: number | Vec2): Vec2 | number {
  if (!trackValue) return fallback;
  const v = sampleKeys(trackValue, frame);
  return v === null ? fallback : v;
}
