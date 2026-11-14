import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
});
