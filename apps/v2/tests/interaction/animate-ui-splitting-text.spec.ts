import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/splitting-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="splitting-text"]');
};

async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const root = (page: Page) => page.locator('[data-slot="splitting-text"]');

const pieces = (page: Page) =>
  root(page)
    .locator('[aria-hidden="true"] > span > span')
    .evaluateAll((els) =>
      els.map((el) => ({
        text: el.textContent,
        opacity: Number(getComputedStyle(el).opacity),
        transform: getComputedStyle(el).transform,
      })),
    );

const AT_REST = ['none', 'matrix(1, 0, 0, 1, 0, 0)'];

test.describe('animate-ui splitting text', () => {
  test('screen readers read the text once', async ({ page }) => {
    await open(page);
    await expect(root(page).locator('.sr-only')).toHaveText('Splitting Text');
    await expect(root(page).locator('> [aria-hidden="true"]')).toHaveCount(1);
  });

  test('the characters come in one after another, then settle', async ({
    page,
  }) => {
    await open(page);
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(150);
    const early = await pieces(page);
    expect(early).toHaveLength(13);
    expect(early[0]!.opacity).toBeGreaterThan(0);
    expect(early.at(-1)!.opacity).toBe(0);
    await expect
      .poll(
        async () =>
          (await pieces(page)).every(
            (p) => p.opacity === 1 && AT_REST.includes(p.transform),
          ),
        { timeout: 4000 },
      )
      .toBe(true);
  });

  test('reduced motion: every piece is in place at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const all = await pieces(page);
    expect(all.length).toBeGreaterThan(0);
    for (const p of all) {
      expect(p.opacity).toBe(1);
      expect(AT_REST).toContain(p.transform);
    }
  });
});
