import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.TEST_PORT ?? 3300);

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/.results',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  retries: 1,
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
