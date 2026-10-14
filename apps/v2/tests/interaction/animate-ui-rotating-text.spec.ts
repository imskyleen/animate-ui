import { expect, test, type Page } from '../test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/rotating-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="rotating-text-container"]');
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

const word = (page: Page) => page.locator('[data-slot="rotating-text"]');

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

type Run = { text: string; start: number; maxOpacity: number };

const recordWords = (page: Page) =>
  page.addInitScript(() => {
    const runs: Run[] = [];
    (window as unknown as { __runs: Run[] }).__runs = runs;
    const tick = () => {
      const el = document.querySelector('[data-slot="rotating-text"]');
      if (el) {
        const text = el.textContent ?? '';
        const opacity = Number(getComputedStyle(el).opacity);
        const last = runs.at(-1);
        if (last?.text === text)
          last.maxOpacity = Math.max(last.maxOpacity, opacity);
        else runs.push({ text, start: performance.now(), maxOpacity: opacity });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const runsOf = (page: Page) =>
  page.evaluate(() => (window as unknown as { __runs: Run[] }).__runs);

test.describe('animate-ui rotating text', () => {
  test('screen readers read every word once', async ({ page }) => {
    await open(page);
    await expect(
      page.locator('[data-slot="rotating-text-container"] .sr-only'),
    ).toHaveText('Rotating, Text, Demo');
    await expect(word(page)).toHaveAttribute('aria-hidden', 'true');
  });

  test('swaps right away, then every 2 seconds', async ({ page }) => {
    await recordWords(page);
    await open(page);
    await expect
      .poll(async () => (await runsOf(page)).length, { timeout: 8000 })
      .toBeGreaterThanOrEqual(3);
    const [first, second, third] = await runsOf(page);
    expect(first!.text).toBe('Rotating');
    expect(first!.maxOpacity).toBeLessThan(0.3);
    expect(second!.text).toBe('Text');
    expect(second!.maxOpacity).toBe(1);
    expect(third!.text).toBe('Demo');
    expect(third!.start - second!.start).toBeGreaterThan(1700);
    expect(third!.start - second!.start).toBeLessThan(3000);
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(800);
    const shown = await word(page).textContent();
    await page.waitForTimeout(3000);
    await expect(word(page)).toHaveText(shown!);
  });

  test('reduced motion: the words crossfade in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const current = await word(page).first().textContent();
    await expect(word(page)).not.toHaveText(current!, { timeout: 4000 });
    const transforms = await word(page).evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).transform),
    );
    for (const t of transforms)
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(t);
  });
});
