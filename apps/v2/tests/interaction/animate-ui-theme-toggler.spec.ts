import { expect, test, type Page } from '@playwright/test';

type Wipe = { duration: number; easing: string; pseudoElement: string };

const open = async (page: Page) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __transitions: number; __wipes: Wipe[] };
    w.__transitions = 0;
    w.__wipes = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (
        typeof options === 'object' &&
        options.pseudoElement === '::view-transition-new(root)'
      ) {
        w.__wipes.push({
          duration: Number(options.duration),
          easing: String(options.easing),
          pseudoElement: options.pseudoElement,
        });
      }
      return animate.call(this, keyframes, options);
    };
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
const wipes = (page: Page) =>
  page.evaluate(() => (window as unknown as { __wipes: Wipe[] }).__wipes);
const isDark = (page: Page) =>
  page.evaluate(() => document.documentElement.classList.contains('dark'));

test.describe('animate-ui theme toggler', () => {
  test('cycles system, dark and light with a wipe', async ({ page }) => {
    await open(page);
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: system. Switch to dark',
    );
    await toggler(page).click();
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: dark. Switch to light',
    );
    await expect.poll(() => isDark(page)).toBe(true);
    await toggler(page).click();
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: light. Switch to system',
    );
    await expect.poll(() => isDark(page)).toBe(false);
    expect(await transitions(page)).toBeGreaterThanOrEqual(2);
    await toggler(page).click();
    await expect(toggler(page)).toHaveAccessibleName(
      'Theme: system. Switch to dark',
    );
    await expect.poll(() => isDark(page)).toBe(false);
  });

  test('the wipe takes 700ms with an ease-in-out', async ({ page }) => {
    await open(page);
    await toggler(page).click();
    await expect.poll(async () => (await wipes(page)).length).toBe(1);
    expect((await wipes(page))[0]).toEqual({
      duration: 700,
      easing: 'ease-in-out',
      pseudoElement: '::view-transition-new(root)',
    });
  });

  test('reduced motion: swaps at once, no wipe', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await toggler(page).click();
    await expect.poll(() => isDark(page)).toBe(true);
    await toggler(page).click();
    await expect.poll(() => isDark(page)).toBe(false);
    expect(await transitions(page)).toBe(0);
  });
});
