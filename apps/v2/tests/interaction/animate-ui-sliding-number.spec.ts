import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page) => {
    await page.goto(framework.demo('sliding-number'), {
      waitUntil: 'networkidle',
    });
    await ready(page, '[data-slot="sliding-number"]');
  };

  const root = (page: Page) => page.locator('[data-slot="sliding-number"]');
  const srText = (page: Page) => root(page).locator('.sr-only');

  const shownDigits = (page: Page) =>
    root(page)
      .locator('[data-slot="sliding-number-roller"]')
      .evaluateAll((rollers) =>
        rollers
          .map((roller) => {
            const displays = roller.querySelectorAll(
              '[data-slot="sliding-number-display"]',
            );
            for (const display of displays) {
              const t = getComputedStyle(display).transform;
              if (t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)')
                return display.textContent;
            }
            return '?';
          })
          .join(''),
      );

  const wheels = (page: Page) =>
    root(page)
      .locator('[data-slot="sliding-number-roller"]')
      .evaluateAll((rollers) =>
        rollers.map((roller) => {
          const zero = roller.querySelector<HTMLElement>(
            '[data-slot="sliding-number-display"]',
          )!;
          const y = new DOMMatrix(getComputedStyle(zero).transform).f;
          return (10 - y / zero.offsetHeight) % 10;
        }),
      );

  test.describe(`${framework.name} sliding number`, () => {
    test('rollers are hidden; screen readers get the number once', async ({
      page,
    }) => {
      await open(page);
      await expect(srText(page)).toHaveText('2.025');
      const rollers = root(page).locator('[data-slot="sliding-number-roller"]');
      await expect(rollers).toHaveCount(4);
      for (const hidden of await rollers.evaluateAll((els) =>
        els.map((el) => !!el.closest('[aria-hidden="true"]')),
      ))
        expect(hidden).toBe(true);
    });

    test('counts up from 0, every digit rolling, then settles', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Replay' }).click();
      await page.waitForTimeout(800);
      expect(await shownDigits(page)).not.toBe('2025');
      await expect
        .poll(() => shownDigits(page), { timeout: 10_000 })
        .toBe('2025');
    });

    test('a digit wrapping from 9 to 0 rolls back through every digit', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Replay' }).click();
      const seen: number[] = [];
      await expect
        .poll(
          async () => {
            const [, hundreds] = await wheels(page);
            seen.push(hundreds!);
            return seen.some((v) => v > 8.5) && hundreds! < 0.05;
          },
          { timeout: 10_000, intervals: [16] },
        )
        .toBe(true);
      const after9 = seen.slice(seen.findIndex((v) => v > 8.5));
      expect(after9.some((v) => v > 2 && v < 7)).toBe(true);
    });

    test('reduced motion: digits jump to the number', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      expect(await shownDigits(page)).toBe('2025');
    });
  });
}
