import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/button', { waitUntil: 'networkidle' });

const SELECTOR = '[data-slot="button"]';

test.describe('animate-ui button', () => {
  test('is a native button', async ({ page }) => {
    await open(page);
    const button = page.getByRole('button', { name: 'Button', exact: true });
    await expect(button).toHaveAttribute('data-slot', 'button');
    await button.focus();
    await expect(button).toBeFocused();
  });

  test('grows a touch on hover, shrinks while pressed', async ({ page }) => {
    await open(page);
    const button = page.getByRole('button', { name: 'Button', exact: true });
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await button.hover();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1.02, 3);
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.96, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1.02, 3);
    await page.mouse.move(0, 0);
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1, 3);
  });

  test('reduced motion: no scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Button', exact: true }).hover();
    await page.mouse.down();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
  });
});
