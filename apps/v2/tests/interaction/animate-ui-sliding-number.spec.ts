import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/sliding-number', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="sliding-number"]');
};

/** Resolves once React has hydrated `selector`: its handlers and effects are live. */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  // Effects (Motion's gesture listeners, timers) run after the commit.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const root = (page: Page) => page.locator('[data-slot="sliding-number"]');
const srText = (page: Page) => root(page).locator('.sr-only');

/** The digit each roller shows: the display sitting at translateY(0). */
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

/** Position of each roller's wheel, in digits (2.5: halfway from 2 to 3). */
const wheels = (page: Page) =>
  root(page)
    .locator('[data-slot="sliding-number-roller"]')
    .evaluateAll((rollers) =>
      rollers.map((roller) => {
        // Digit 0's display sits `-position` digits away from the center.
        const zero = roller.querySelector<HTMLElement>(
          '[data-slot="sliding-number-display"]',
        )!;
        const y = new DOMMatrix(getComputedStyle(zero).transform).f;
        return (10 - y / zero.offsetHeight) % 10;
      }),
    );

test.describe('animate-ui sliding number', () => {
  test('rollers are hidden; screen readers get the number once', async ({
    page,
  }) => {
    await open(page);
    // padStart: four rollers from the start, "." between thousands.
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
    // Mid-count (a spring of about 4.5s), the number isn't there yet.
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
    // While the count passes 2000, the hundreds wheel goes from 9 back to 0
    // (through 8, 7… on its spring), never forward past 9.
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
