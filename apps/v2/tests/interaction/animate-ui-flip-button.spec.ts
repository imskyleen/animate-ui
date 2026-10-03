import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/flip-button', {
    waitUntil: 'networkidle',
  });

const FRONT = '[data-slot="flip-button-front"]';
const BACK = '[data-slot="flip-button-back"]';

const transformOf = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => getComputedStyle(el).transform);

test.describe('animate-ui flip button', () => {
  test('shows the front face at rest', async ({ page }) => {
    await open(page);
    await expect(page.locator('[data-slot="flip-button"]')).toHaveRole(
      'button',
    );
    expect((await sample(page, FRONT)).opacity).toBe(1);
    expect((await sample(page, BACK)).opacity).toBe(0);
  });

  test('flips to the back face on hover, and back on leave', async ({
    page,
  }) => {
    await open(page);
    await page.locator('[data-slot="flip-button"]').hover();
    // Mid-flip, the back face is rotating in.
    await page.waitForTimeout(60);
    expect(await transformOf(page, BACK)).toMatch(/^matrix3d/);
    await expect.poll(async () => (await sample(page, BACK)).opacity).toBe(1);
    expect((await sample(page, FRONT)).opacity).toBe(0);
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await sample(page, FRONT)).opacity).toBe(1);
    expect((await sample(page, BACK)).opacity).toBe(0);
  });

  test('reduced motion: the faces crossfade without rotating', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.locator('[data-slot="flip-button"]').hover();
    for (let i = 0; i < 4; i++) {
      for (const face of [FRONT, BACK])
        expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(
          await transformOf(page, face),
        );
      await page.waitForTimeout(80);
    }
    await expect.poll(async () => (await sample(page, BACK)).opacity).toBe(1);
  });
});
