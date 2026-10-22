import { expect, test, type Page } from '../test';

import { gotoHydrated } from './disclosure-timeline';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = (page: Page) => gotoHydrated(page, framework.demo('highlight'));

  const HIGHLIGHT = '[data-slot="motion-highlight"]';

  const highlightX = (page: Page, value = 'overview') =>
    page
      .locator(`${HIGHLIGHT}[data-value="${value}"]`)
      .evaluate((el) => el.getBoundingClientRect().x);

  test.describe(`${framework.name} highlight`, () => {
    test('starts on the default value', async ({ page }) => {
      await open(page);
      await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
      await expect(
        page.getByRole('button', { name: 'Overview' }),
      ).toHaveAttribute('data-active', 'true');
    });

    test('sets no ARIA state: it is a visual effect', async ({ page }) => {
      await open(page);
      await expect(page.locator('[aria-selected]')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Activity' }),
      ).toHaveAttribute('data-active', 'false');
    });

    test('clicking an item glides the highlight to it', async ({ page }) => {
      await open(page);
      const target = page.getByRole('button', { name: 'Settings' });
      const start = await highlightX(page);
      const end = (await target.boundingBox())!.x;
      await target.click();
      await page.waitForTimeout(60);
      const mid = await highlightX(page, 'settings');
      expect(mid).toBeGreaterThan(start + 1);
      expect(mid).toBeLessThan(end - 1);
      await expect
        .poll(async () => Math.abs((await highlightX(page, 'settings')) - end))
        .toBeLessThan(1.5);
      await expect(target).toHaveAttribute('data-active', 'true');
      await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
    });

    test('reduced motion: the highlight jumps', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const target = page.getByRole('button', { name: 'Settings' });
      const end = (await target.boundingBox())!.x;
      await target.click();
      await page.waitForTimeout(60);
      expect(Math.abs((await highlightX(page, 'settings')) - end)).toBeLessThan(
        1.5,
      );
    });
  });

  test(`${framework.name} hovering back onto an item whose highlight is fading out brings it back, and once shown it stays shown`, async ({
    page,
  }) => {
    await page.goto(`${framework.demo('highlight')}?hover=true`, {
      waitUntil: 'networkidle',
    });
    const overview = page.getByRole('button', { name: 'Overview' });
    const activity = page.getByRole('button', { name: 'Activity' });
    await overview.hover();
    await page.waitForTimeout(400);
    await activity.hover();
    await page.waitForTimeout(500);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(280);
    await page.evaluate(() => {
      const samples: number[] = [];
      (window as unknown as { samples: number[] }).samples = samples;
      const start = performance.now();
      const tick = () => {
        samples.push(
          Math.max(
            0,
            ...[
              ...document.querySelectorAll('[data-slot="motion-highlight"]'),
            ].map((element) => Number(getComputedStyle(element).opacity)),
          ),
        );
        if (performance.now() - start < 900) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await activity.hover();
    await page.waitForTimeout(1000);
    const samples = await page.evaluate(
      () => (window as unknown as { samples: number[] }).samples,
    );
    const shown = samples.findIndex((opacity) => opacity > 0.95);
    expect(shown).toBeGreaterThan(-1);
    expect(Math.min(...samples.slice(shown))).toBeGreaterThan(0.95);
  });
}
