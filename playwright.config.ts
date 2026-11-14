import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.e2e\.ts/,
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1600, height: 1000 },
    acceptDownloads: true,
    trace: 'off',
  },
  webServer: {
    command: 'npx vite --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
