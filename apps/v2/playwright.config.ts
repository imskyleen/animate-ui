import { defineConfig, devices } from '@playwright/test';

// Next 16 refuses a second `next dev` in the same app: if one is already
// running, point the suite at it with TEST_PORT=<its port>.
const PORT = Number(process.env.TEST_PORT ?? 3300);

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/.results',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `pnpm next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
