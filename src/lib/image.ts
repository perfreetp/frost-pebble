import { makeCanvas, canvasToDataUrl } from '../seed/art';

export async function bitmapFromBlob(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

/** Downscale an incoming photo so the GPU never has to chew on a 8000px file. */
export async function normaliseUpload(file: File, maxEdge = 2400): Promise<{ bitmap: ImageBitmap; blob: Blob; thumb: string }> {
  const raw = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(raw.width, raw.height));
  if (scale >= 1 && raw.width * raw.height <= maxEdge * maxEdge) {
    const [c, ctx] = makeCanvas(raw.width, raw.height);
    ctx.drawImage(raw, 0, 0);
    const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('编码失败'))), 'image/jpeg', 0.92));
    const thumb = canvasToDataUrl(c, 200);
    raw.close();
    return { bitmap: await createImageBitmap(blob), blob, thumb };
  }
  const w = Math.round(raw.width * scale);
  const h = Math.round(raw.height * scale);
  const [c, ctx] = makeCanvas(w, h);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(raw, 0, 0, w, h);
  raw.close();
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('编码失败'))), 'image/jpeg', 0.92));
  const thumb = canvasToDataUrl(c, 200);
  return { bitmap: await createImageBitmap(blob), blob, thumb };
}

export function fitInto(containerW: number, containerH: number, imgW: number, imgH: number, maxScale = 1) {
  const scale = Math.min(containerW / imgW, containerH / imgH, maxScale);
  return { w: Math.max(1, Math.round(imgW * scale)), h: Math.max(1, Math.round(imgH * scale)), scale };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function safeFilename(s: string) {
  return s.replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 80);
}
