import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/liquid-button', {
    waitUntil: 'networkidle',
  });

const button = (page: Page) =>
  page.getByRole('button', { name: 'Liquid Button' });

const fillWidth = (page: Page) =>
  button(page).evaluate((el) =>
    getComputedStyle(el).getPropertyValue('--liquid-button-fill-width').trim(),
  );

const SELECTOR = 'button';

test.describe('animate-ui liquid button', () => {
  test('fills with liquid on hover, drains on leave', async ({ page }) => {
    await open(page);
    expect(await fillWidth(page)).toBe('-1%');
    await button(page).hover();
    await expect.poll(() => fillWidth(page)).toBe('100%');
    await page.mouse.move(0, 0);
    await expect.poll(() => fillWidth(page)).toBe('-1%');
  });

  test('shrinks while pressed', async ({ page }) => {
    await open(page);
    await button(page).hover();
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.96, 3);
    await page.mouse.up();
  });

  test('reduced motion: fills, without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await button(page).hover();
    await page.mouse.down();
    await expect.poll(() => fillWidth(page)).toBe('100%');
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
  });
});
