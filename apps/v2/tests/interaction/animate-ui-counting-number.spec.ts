import { expect, test, type Page } from '../test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/counting-number', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="counting-number"]');
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

const root = (page: Page) => page.locator('[data-slot="counting-number"]');
const ticking = (page: Page) => root(page).locator('[aria-hidden="true"]');
const srText = (page: Page) => root(page).locator('.sr-only');

test.describe('animate-ui counting number', () => {
  test('counts up to the target; screen readers get the target only', async ({
    page,
  }) => {
    await open(page);
    await expect(srText(page)).toHaveText('2025');
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(300);
    const early = Number(await ticking(page).textContent());
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
    const box = await srText(page).boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1);
  });

  test('the spring slows down on the last units', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(1000);
    expect(Number(await ticking(page).textContent())).toBeGreaterThan(500);
    await page.waitForTimeout(2000);
    expect(Number(await ticking(page).textContent())).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
  });

  test('replays from the start when remounted', async ({ page }) => {
    await open(page);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
    await page.getByRole('button', { name: 'Replay' }).click();
    await page.waitForTimeout(200);
    expect(Number(await ticking(page).textContent())).toBeLessThan(2025);
    await expect(ticking(page)).toHaveText('2025', { timeout: 10_000 });
  });

  test('reduced motion: shows the target at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(ticking(page)).toHaveText('2025', { timeout: 300 });
  });
});

test.describe('animate-ui counting number, thousand separator', () => {
  test('groups thousands in the shown and the announced number, while counting too', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/counting-number-separators', {
      waitUntil: 'networkidle',
    });
    const shown = (id: string) =>
      page.getByTestId(id).locator('[aria-hidden="true"]');
    const announced = (id: string) => page.getByTestId(id).locator('.sr-only');
    await expect(shown('thousands')).toHaveText('12,480');
    await expect(announced('thousands')).toHaveText('12,480');
    await expect(shown('million')).toHaveText('-1 234 567,50');
    await expect(shown('padded')).toHaveText('1,200');
    await expect(shown('small')).toHaveText('999');
    const frames = await shown('counting').evaluate(
      (el) =>
        new Promise<string[]>((resolve) => {
          const seen: string[] = [];
          const start = performance.now();
          const tick = () => {
            seen.push(el.textContent ?? '');
            if (performance.now() - start < 600) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
    );
    const grouped = frames.filter(
      (text) => Number(text.replace(/,/g, '')) >= 1000,
    );
    expect(grouped.length).toBeGreaterThan(0);
    for (const text of grouped) expect(text).toMatch(/^\d{1,3}(,\d{3})+$/);
    await expect(shown('counting')).toHaveText('48,000', { timeout: 15_000 });
  });
});
