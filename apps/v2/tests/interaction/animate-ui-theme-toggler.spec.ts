import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  // Count the view transitions the toggler starts.
  await page.addInitScript(() => {
    const w = window as unknown as { __transitions: number };
    w.__transitions = 0;
    const original = document.startViewTransition?.bind(document);
    if (!original) return;
    document.startViewTransition = ((cb: () => void) => {
      w.__transitions++;
      return original(cb);
    }) as typeof document.startViewTransition;
  });
  await page.goto('/tests/demos/animate-ui/theme-toggler', {
    waitUntil: 'networkidle',
  });
};

const toggler = (page: Page) => page.getByRole('button', { name: /^Theme:/ });
const transitions = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __transitions: number }).__transitions,
  );
const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

test.describe('animate-ui theme toggler', () => {
  test('cycles light, dark and system with a wipe', async ({ page }) => {
    await open(page);
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: system. Switch to light',
    );
    await toggler(page).click();
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: light. Switch to dark',
    );
    await toggler(page).click();
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: dark. Switch to system',
    );
    await expect.poll(() => isDark(page)).toBe(true);
    expect(await transitions(page)).toBeGreaterThanOrEqual(2);
    await toggler(page).click();
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: system. Switch to light',
    );
    await expect.poll(() => isDark(page)).toBe(false);
  });

  test('reduced motion: swaps at once, no wipe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await toggler(page).click();
    await toggler(page).click();
    await expect.poll(() => isDark(page)).toBe(true);
    expect(await transitions(page)).toBe(0);
  });
});
