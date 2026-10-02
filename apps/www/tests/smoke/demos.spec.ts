import { expect, test } from '@playwright/test';
import { getRegistryItems } from './registry-items';

// Renders every demo in isolation and fails on runtime errors:
// uncaught exceptions, React/hydration errors logged to the console,
// and demos that never leave the Suspense fallback.

const IGNORED_CONSOLE = [
  /Download the React DevTools/,
  /\[HMR\]/,
  /\[Fast Refresh\]/,
  // Reported with its URL by the response listener below.
  /Failed to load resource/,
];

for (const name of getRegistryItems('demo-')) {
  test(name, async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('response', (response) => {
      if (response.status() >= 400) {
        errors.push(`http ${response.status()}: ${response.url()}`);
      }
    });
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const text = message.text();
      if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
      errors.push(`console: ${text}`);
    });

    await page.goto(`/examples/smoke/${name}`, { waitUntil: 'networkidle' });
    await expect(page.locator('[data-smoke-status="rendered"]')).toBeAttached({
      timeout: 30_000,
    });
    // Let entrance animations and effects settle.
    await page.waitForTimeout(1_000);

    await page.screenshot({
      path: `tests/.results/screenshots/${name}.png`,
      animations: 'disabled',
      // The Next.js dev indicator renders differently between runs.
      style: 'nextjs-portal { display: none !important; }',
    });

    expect(errors, errors.join('\n')).toEqual([]);
  });
}
