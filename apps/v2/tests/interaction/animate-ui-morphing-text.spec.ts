import { expect, test, type Page } from '../test';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/morphing-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="morphing-text"]');
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

const root = (page: Page) => page.locator('[data-slot="morphing-text"]');
const srText = (page: Page) => root(page).locator('.sr-only');

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

const letters = (page: Page) =>
  root(page)
    .locator('[aria-hidden="true"] > span')
    .evaluateAll((els) =>
      els.map((el) => {
        const cs = getComputedStyle(el);
        const m = cs.transform.match(/matrix\(([^,]+)/);
        const blur = cs.filter.match(/blur\(([\d.]+)px\)/);
        return {
          scale: m ? Number(m[1]) : 1,
          blur: blur ? Number(blur[1]) : 0,
          opacity: Number(cs.opacity),
        };
      }),
    );

const TEXTS = [
  'MorphingText Primitive',
  'Animate your text 🚀',
  'Handles emojis 🚀✨',
  'Built with Motion ✨',
];

const recordTexts = (page: Page) =>
  page.addInitScript(() => {
    const log: [number, string][] = [];
    (window as unknown as { __texts: typeof log }).__texts = log;
    const tick = () => {
      const text =
        document.querySelector('[data-slot="morphing-text"] .sr-only')
          ?.textContent ?? '';
      if (text && log.at(-1)?.[1] !== text) log.push([performance.now(), text]);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const textsOf = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { __texts: [number, string][] }).__texts,
  );

async function nextText(page: Page, timeout = 4000) {
  const current = await srText(page).textContent();
  await expect(srText(page)).not.toHaveText(current!, { timeout });
}

test.describe('animate-ui morphing text', () => {
  test('screen readers read the current text whole', async ({ page }) => {
    await open(page);
    expect(TEXTS).toContain(await srText(page).textContent());
    await expect(root(page).locator('> [aria-hidden="true"]')).toHaveCount(1);
  });

  test('emoji stay whole', async ({ page }) => {
    await open(page);
    await expect(srText(page)).toHaveText('Animate your text 🚀', {
      timeout: 12_000,
    });
    const pieces = await root(page)
      .locator('[aria-hidden="true"] > span')
      .allTextContents();
    expect(pieces).toContain('🚀');
  });

  test('holds each text for 2.5s, then morphs to the next', async ({
    page,
  }) => {
    await recordTexts(page);
    await open(page);
    await expect
      .poll(async () => (await textsOf(page)).length, { timeout: 10_000 })
      .toBeGreaterThanOrEqual(3);
    const [first, second, third] = await textsOf(page);
    expect([first![1], second![1], third![1]]).toEqual(TEXTS.slice(0, 3));
    expect(second![0] - first![0]).toBeGreaterThan(2200);
    expect(third![0] - second![0]).toBeGreaterThan(2200);
    expect(third![0] - second![0]).toBeLessThan(3500);
  });

  test('letters blur and shrink in and out', async ({ page }) => {
    await open(page);
    await nextText(page);
    await expect
      .poll(
        async () =>
          (await letters(page)).some(
            (l) => l.blur > 0.5 && l.scale > 0.8 && l.scale < 0.99,
          ),
        { timeout: 1000, intervals: [30] },
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await letters(page)).every(
            (l) => l.blur === 0 && l.scale === 1 && l.opacity === 1,
          ),
        { timeout: 2400 },
      )
      .toBe(true);
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(800);
    const shown = await srText(page).textContent();
    await page.waitForTimeout(3500);
    await expect(srText(page)).toHaveText(shown!);
  });

  test('reduced motion: keeps cycling as a crossfade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await nextText(page);
    await page.waitForTimeout(800);
    const styles = await root(page)
      .locator('[aria-hidden="true"] > span')
      .evaluateAll((els) =>
        els.map((el) => {
          const cs = getComputedStyle(el);
          return { transform: cs.transform, filter: cs.filter };
        }),
      );
    for (const s of styles) {
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(s.transform);
      expect(['none', 'blur(0px)']).toContain(s.filter);
    }
  });
});
