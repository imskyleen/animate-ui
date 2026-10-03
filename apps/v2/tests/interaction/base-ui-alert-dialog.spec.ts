import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="alert-dialog-content"]';
const OVERLAY = '[data-slot="alert-dialog-overlay"]';

test.describe('base-ui alert dialog demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/alert-dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('enters from 0.95, then settles with its overlay', async ({ page }) => {
    const content = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Delete project' }).click();
    const first = await content.firstFrame();
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    expect(first.scale).toBeLessThan(1);
    expect(first.opacity).toBeLessThan(1);

    await page.waitForTimeout(650);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBeCloseTo(1, 3);
    expect((await sample(page, OVERLAY)).opacity).toBe(1);
  });

  test('Cancel is focused at once; Escape closes faster than it opened', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Delete project' }).click();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    const mid = await sample(page, CONTENT);
    expect(mid.opacity).toBeLessThan(1);
    expect(mid.scale).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 400 });
    await expect(
      page.getByRole('button', { name: 'Delete project' }),
    ).toBeFocused();
  });

  test('an outside click does not dismiss it', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete project' }).click();
    await page.waitForTimeout(650);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(450);
    await expect(page.getByRole('alertdialog')).toBeVisible();
    // shadcn/ui's Base UI action is a plain button: close with Cancel.
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('alertdialog')).toHaveCount(0, {
      timeout: 500,
    });
  });

  test('reduced motion: no scaling, still fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Delete project' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeCloseTo(1, 3);
    expect(first.opacity).toBeLessThan(1);
  });
});
