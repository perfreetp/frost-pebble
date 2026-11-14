import type { AssetPart, Rig, Timeline } from './types';
import { resolvePose } from './rig';
import type { Mat } from './rig';

export const EXPORT_W = 960;
export const EXPORT_H = 640;

const imageCache = new Map<string, HTMLImageElement>();

export function loadAssetImage(asset: AssetPart): Promise<HTMLImageElement | null> {
  if (!asset.dataUrl) return Promise.resolve(null);
  const cached = imageCache.get(asset.dataUrl);
  if (cached?.complete && cached.naturalWidth > 0) return Promise.resolve(cached);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(asset.dataUrl!, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = asset.dataUrl!;
  });
}

export async function preloadAssets(assets: AssetPart[]): Promise<Map<string, HTMLImageElement>> {
  const map = new Map<string, HTMLImageElement>();
  await Promise.all(
    assets.map(async (a) => {
      const img = await loadAssetImage(a);
      if (img) map.set(a.id, img);
    }),
  );
  return map;
}

/**
 * Renders one frame of a rig into a 2D canvas. This is the delivery renderer:
 * transparent background, no GPU readback, and it honours the export scale directly.
 */
export function renderRigFrame(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  timeline: Timeline | null,
  assets: AssetPart[],
  images: Map<string, HTMLImageElement>,
  frame: number,
  scale = 1,
  offsetX = 0,
  offsetY = 0,
): void {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.setTransform(scale, 0, 0, scale, offsetX * scale, offsetY * scale);
  const pose = resolvePose(rig, timeline, frame);
  const ordered = [...rig.bones].sort((a, b) => a.z - b.z);
  for (const bone of ordered) {
    const asset = assets.find((a) => a.id === bone.partId);
    const img = asset ? images.get(asset.id) : null;
    const p = pose.get(bone.id);
    if (!asset || !img || !p) continue;
    applyMatrix(ctx, p.world);
    ctx.drawImage(img, -asset.anchorX, -asset.anchorY, asset.width, asset.height);
  }
  ctx.restore();
}

function applyMatrix(ctx: CanvasRenderingContext2D, m: Mat) {
  ctx.setTransform(m.a, m.b, m.c, m.d, m.tx, m.ty);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG 编码失败'))), 'image/png');
  });
}

/** Renders a whole range of frames to PNG blobs. */
export async function renderSequence(
  rig: Rig,
  timeline: Timeline,
  assets: AssetPart[],
  opts: { scale?: number; onProgress?: (frame: number, total: number, blob: Blob) => void } = {},
): Promise<Array<{ frame: number; png: Blob }>> {
  const scale = opts.scale ?? 1;
  const images = await preloadAssets(assets);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(EXPORT_W * scale);
  canvas.height = Math.round(EXPORT_H * scale);
  const ctx = canvas.getContext('2d')!;
  const frames: Array<{ frame: number; png: Blob }> = [];
  const total = timeline.duration + 1;
  for (let f = 0; f <= timeline.duration; f++) {
    renderRigFrame(ctx, rig, timeline, assets, images, f, scale);
    const png = await canvasToBlob(canvas);
    frames.push({ frame: f, png });
    opts.onProgress?.(f + 1, total, png);
    // yield so the progress UI can paint
    if (f % 3 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  return frames;
}
