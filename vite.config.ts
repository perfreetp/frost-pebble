import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  server: { port: 5173 },
  build: {
    target: 'es2022',
    // Phaser 体积较大，单独拆包便于浏览器缓存
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          solid: ['solid-js', 'solid-js/web', 'solid-js/store'],
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
});
