import type { CutoutEngine, CompositeOptions } from '../gpu/engine';
import { balanceGains, edgeMetricsFromCounts } from './color';
import type { CompositeParams, ReviewMetrics } from './types';

/**
 * Turn a live engine into the data the supervisor reviews: a JPEG snapshot of
 * the composite plus the two checklist numbers (edge halo, colour temperature
 * deviation). Shared by the studio's submit path and the demo seeder so both
 * describe an item the same way.
 */
export async function buildProof(
  engine: CutoutEngine,
  comp: CompositeParams,
  bgCct: number | null,
  canvas: HTMLCanvasElement,
  itemWidth: number,
  itemHeight: number,
  previewWidth: number,
): Promise<{ dataUrl: string; metrics: ReviewMetrics }> {
  const counts = await engine.measure();
  const edge = edgeMetricsFromCounts(counts.boundary, counts.fringe, counts.soft);
  const sCct = counts.subjectStats.cct;
  const deviation = bgCct ? Math.abs(sCct - bgCct) : 0;
  const metrics: ReviewMetrics = {
    edgeScore: edge.score,
    edgeLabel: edge.label,
    fringeRatio: edge.fringeRatio,
    softRatio: edge.softRatio,
    tempDeviation: deviation,
    tempLabel: !bgCct
      ? '无背景，跳过色温比对'
      : deviation < 600
        ? '色温一致'
        : deviation < 1400
          ? '色温轻微偏差'
          : '色温偏差明显',
    subjectCct: sCct,
    bgCct: bgCct ?? 0,
    measuredAt: Date.now(),
  };
  // Render at review size so the snapshot is crisp enough to judge an edge on,
  // but small enough that a dozen items do not bloat IndexedDB.
  const w = Math.min(itemWidth, previewWidth);
  const h = Math.round((w / itemWidth) * itemHeight);
  engine.renderComposite(canvas, w, h, optionsFor(comp, bgCct, sCct, true, 'scene'));
  const blob = await engine.exportComposite(optionsFor(comp, bgCct, sCct, true, 'scene'));
  const dataUrl = await blobToDataUrl(blob);
  return { dataUrl, metrics };
}

export function optionsFor(
  comp: CompositeParams,
  bgCct: number | null,
  subjectCct: number | null,
  hasBackground: boolean,
  mode: CompositeOptions['mode'],
  gains?: [number, number, number],
): CompositeOptions {
  const g: [number, number, number] =
    gains ??
    (subjectCct !== null && bgCct !== null ? balanceGains(subjectCct, bgCct, comp.tempStrength) : [1, 1, 1]);
  return {
    gains: g,
    bgScale: comp.bgScale,
    bgOffsetX: comp.bgOffsetX,
    bgOffsetY: comp.bgOffsetY,
    shadowAngle: comp.shadowAngle,
    shadowSoftness: comp.shadowSoftness,
    shadowOpacity: comp.shadowOpacity,
    opacity: 1,
    contrast: 0.16,
    hasBackground,
    mode,
  };
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
