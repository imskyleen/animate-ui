import { defineConfig, devices } from '@playwright/test';

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
    command: `pnpm next dev --turbo -p ${PORT}`,
    url: `http://localhost:${PORT}/examples/smoke/index`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
