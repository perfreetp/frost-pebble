import { createSignal, onCleanup, onMount } from 'solid-js';
import Phaser from 'phaser';
import { BenchScene, BENCH_W, BENCH_H, type BenchCallbacks } from '../phaser/bench';

/**
 * Phaser 加工台的挂载容器：保持 Phaser 实例与 SolidJS 页面的生命周期一致。
 */
export function BenchCanvas(props: { callbacks: BenchCallbacks; onReady: (scene: BenchScene) => void }) {
  const [scale, setScale] = createSignal(1);
  let host: HTMLDivElement | undefined;
  let game: Phaser.Game | null = null;

  onMount(() => {
    if (!host) return;
    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      width: BENCH_W,
      height: BENCH_H,
      transparent: true,
      scene: new BenchScene({ ...props.callbacks, onReady: () => {
        const scene = game?.scene.getScene<BenchScene>('bench');
        if (scene) props.onReady(scene);
      } }),
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: { antialias: true, roundPixels: false },
    });
    const resize = () => {
      if (host) setScale(host.clientWidth / BENCH_W);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    onCleanup(() => ro.disconnect());
  });

  onCleanup(() => {
    game?.destroy(true);
    game = null;
  });

  return (
    <div class="bench-wrap" ref={host} style={{ 'min-height': `${BENCH_H * scale() * 0.4}px` }} />
  );
}
