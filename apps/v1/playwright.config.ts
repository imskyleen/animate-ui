import { defineConfig, devices } from '@playwright/test';

// Next 16 refuses a second `next dev` in the same app: if one is already
// running, point the suite at it with SMOKE_PORT=<its port>.
const PORT = Number(process.env.SMOKE_PORT ?? 3100);

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/.results',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  reporter: [['list'], ['json', { outputFile: 'tests/.results/report.json' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: `pnpm next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/examples/smoke/index`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
