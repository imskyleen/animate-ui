import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/sliding-number', {
    waitUntil: 'networkidle',
  });

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

test.describe('animate-ui sliding number', () => {
  test('rollers are hidden; screen readers get the number once', async ({
    page,
  }) => {
    await open(page);
    await expect(srText(page)).toHaveText('1,250');
    const rollers = root(page).locator('[data-slot="sliding-number-roller"]');
    await expect(rollers).toHaveCount(4);
    for (const hidden of await rollers.evaluateAll((els) =>
      els.map((el) => !!el.closest('[aria-hidden="true"]')),
    ))
      expect(hidden).toBe(true);
  });

  test('digits roll in, then settle on the number', async ({ page }) => {
    await open(page);
    await expect.poll(() => shownDigits(page), { timeout: 3000 }).toBe('1250');
  });

  test('a new number rolls the changed digits', async ({ page }) => {
    await open(page);
    await expect.poll(() => shownDigits(page), { timeout: 3000 }).toBe('1250');
    await page.getByRole('button', { name: 'Increase' }).click();
    await expect(srText(page)).toHaveText('1,275');
    // Mid-roll, the tens digit sits between two values.
    await page.waitForTimeout(50);
    expect(await shownDigits(page)).not.toBe('1275');
    await expect.poll(() => shownDigits(page), { timeout: 3000 }).toBe('1275');
    await page.getByRole('button', { name: 'Decrease' }).click();
    await page.getByRole('button', { name: 'Decrease' }).click();
    await expect(srText(page)).toHaveText('1,225');
    await expect.poll(() => shownDigits(page), { timeout: 3000 }).toBe('1225');
  });

  test('reduced motion: digits jump to the number', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    expect(await shownDigits(page)).toBe('1250');
    await page.getByRole('button', { name: 'Increase' }).click();
    await page.waitForTimeout(50);
    expect(await shownDigits(page)).toBe('1275');
  });
});
