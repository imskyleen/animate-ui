import { expect, test, type Page } from '@playwright/test';

const CONTENT = '[data-slot="sheet-content"]';

// Probe the content's horizontal offset (as a share of its width) and
// opacity on the first animation frame after it mounts.
async function probe(page: Page) {
  await page.evaluate((sel) => {
    const w = window as unknown as { __sheet?: Promise<unknown> };
    w.__sheet = new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return;
        observer.disconnect();
        requestAnimationFrame(() => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          resolve({
            offset: m.m41 / el.offsetWidth,
            opacity: Number(getComputedStyle(el).opacity),
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }, CONTENT);
  return () =>
    page.evaluate(
      () => (window as unknown as { __sheet: Promise<unknown> }).__sheet,
    ) as Promise<{ offset: number; opacity: number }>;
}

const offset = (page: Page) =>
  page.locator(CONTENT).evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return m.m41 / (el as HTMLElement).offsetWidth;
  });

test.describe('radix sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/smoke/demo-components-radix-sheet', {
      waitUntil: 'networkidle',
    });
  });

  test('slides in from its edge and settles', async ({ page }) => {
    const first = await probe(page);
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const frame = await first();
    expect(frame.offset).toBeGreaterThan(0.6);
    expect(frame.opacity).toBe(1);

    await page.waitForTimeout(700);
    expect(Math.abs(await offset(page))).toBeLessThan(0.01);
  });

  test('closes faster than it opens', async ({ page }) => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    // drawerExit is 400ms, the entrance 600ms.
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 580 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const first = await probe(page);
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const frame = await first();
    expect(Math.abs(frame.offset)).toBeLessThan(0.01);
    expect(frame.opacity).toBeLessThan(1);
  });
});
