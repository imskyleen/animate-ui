import { expect, test, type Page } from '@playwright/test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/rolling-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="rolling-text"]');
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

const root = (page: Page) => page.locator('[data-slot="rolling-text"]');

/** Transforms of the front copy of every letter. */
const fronts = (page: Page) =>
  root(page)
    .locator('[aria-hidden="true"] > span > span > span:first-child')
    .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));

// rotateX(90deg): the front copy of the letter has rolled away.
function isRolled(transform: string) {
  const match = transform.match(/matrix3d\(([^)]+)\)/);
  if (!match) return false;
  const m = match[1]!.split(',').map(Number);
  return Math.abs(m[5]!) < 0.01 && Math.abs(m[6]! - 1) < 0.01;
}

test.describe('animate-ui rolling text', () => {
  test('screen readers read the text once', async ({ page }) => {
    await open(page);
    await expect(root(page).locator('.sr-only')).toHaveText('Rolling Text');
    await expect(root(page).locator('> [aria-hidden="true"]')).toHaveCount(1);
  });

  test('the letters roll over one after another, then settle', async ({
    page,
  }) => {
    await open(page);
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(250);
    const early = await fronts(page);
    expect(early).toHaveLength(11);
    // The first letters are rolling, the last ones (0.1s apart) haven't
    // started.
    expect(early.some((t) => !isRolled(t))).toBe(true);
    await expect
      .poll(async () => (await fronts(page)).every(isRolled), {
        timeout: 4000,
      })
      .toBe(true);
  });

  test('reduced motion: the letters sit in their final state', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    expect((await fronts(page)).every(isRolled)).toBe(true);
  });
});
