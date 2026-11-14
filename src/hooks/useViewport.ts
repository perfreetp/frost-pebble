import { useCallback, useRef, useState } from 'react';
import type { Viewport } from '../types';
import { clamp } from '../lib/geometry';

const MIN_SCALE = 0.08;
const MAX_SCALE = 40;

/** 视图平移/缩放状态管理，缩放以鼠标位置为中心 */
export function useViewport(initial: Viewport) {
  const [viewport, setViewport] = useState<Viewport>(initial);
  const ref = useRef(viewport);
  ref.current = viewport;

  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    const vp = ref.current;
    const nextScale = clamp(vp.scale * factor, MIN_SCALE, MAX_SCALE);
    const realFactor = nextScale / vp.scale;
    // 保持鼠标指向的世界点不动
    const worldX = (screenX - vp.offsetX) / vp.scale;
    const worldY = (screenY - vp.offsetY) / vp.scale;
    setViewport({
      scale: nextScale,
      offsetX: screenX - worldX * nextScale,
      offsetY: screenY - worldY * nextScale,
    });
    void realFactor;
  }, []);

  const pan = useCallback((dx: number, dy: number) => {
    const vp = ref.current;
    setViewport({ ...vp, offsetX: vp.offsetX + dx, offsetY: vp.offsetY + dy });
  }, []);

  const reset = useCallback(() => setViewport(initial), [initial]);

  return { viewport, setViewport, zoomAt, pan, reset };
}
