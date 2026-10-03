import { expect, test, type Page } from '@playwright/test';

// Collects the transforms of every animated part of an icon over ~400ms.
async function transformsOver(page: Page, testId: string, ms = 400) {
  const seen = new Set<string>();
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const t = await page
      .getByTestId(testId)
      .evaluate((root) =>
        [...root.querySelectorAll('svg, svg *')]
          .map((el) => getComputedStyle(el).transform)
          .join('|'),
      );
    seen.add(t);
    await page.waitForTimeout(30);
  }
  return seen;
}

test.describe('animated icons', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/fixtures/icons', { waitUntil: 'networkidle' });
  });

  test('hover animates with a mouse', async ({ page }) => {
    await page.getByTestId('hover-icon').hover();
    expect((await transformsOver(page, 'hover-icon')).size).toBeGreaterThan(1);
  });

  test('a quick tap plays the animation past the release', async ({ page }) => {
    const box = (await page.getByTestId('tap-icon').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(60);
    await page.mouse.up();
    // Still animating after release (the old press-and-hold cut it off).
    await page.waitForTimeout(60);
    expect((await transformsOver(page, 'tap-icon', 250)).size).toBeGreaterThan(
      1,
    );
  });

  test('reduced motion: nothing animates', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByTestId('hover-icon').hover();
    expect((await transformsOver(page, 'hover-icon')).size).toBe(1);
  });
});

test.describe('animated icons on touch', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('no hover animation without a hover-capable pointer', async ({
    page,
  }) => {
    await page.goto('/examples/fixtures/icons', { waitUntil: 'networkidle' });
    await page.getByTestId('hover-icon').tap();
    expect((await transformsOver(page, 'hover-icon')).size).toBe(1);
  });
});
