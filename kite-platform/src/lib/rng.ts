// 确定性伪随机:同一 seed 产出完全一致的序列(mulberry32)
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rand(r: () => number, min: number, max: number): number {
  return min + r() * (max - min);
}

export function randInt(r: () => number, min: number, max: number): number {
  return Math.floor(rand(r, min, max + 1));
}

/** 字符串 hash → 32位整数,任务 id 等也可作种子来源 */
export function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
