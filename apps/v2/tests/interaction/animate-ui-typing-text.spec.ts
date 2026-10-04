import { expect, test, type Page } from '@playwright/test';

const TEXT =
  'Typing Text component made with Motion. Highly customizable and easy to use.';

const open = async (page: Page) => {
  await page.goto('/tests/demos/animate-ui/typing-text', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, '[data-slot="typing-text"]');
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

const root = (page: Page) => page.locator('[data-slot="typing-text"]');
const visual = (page: Page) =>
  root(page).locator('> [aria-hidden="true"]').first();
const cursorOpacity = (page: Page) =>
  page
    .locator('[data-slot="typing-text-cursor"]')
    .evaluate((el) => Number(getComputedStyle(el).opacity));

const hideTab = (page: Page) =>
  page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });

type Frame = { t: number; length: number; cursor: number };

/** Records, from the first paint, the typed length and the cursor opacity. */
const recordFrames = (page: Page) =>
  page.addInitScript(() => {
    const frames: Frame[] = [];
    (window as unknown as { __frames: Frame[] }).__frames = frames;
    const tick = () => {
      const text = document.querySelector(
        '[data-slot="typing-text"] > [aria-hidden="true"]',
      );
      const cursor = document.querySelector('[data-slot="typing-text-cursor"]');
      if (text && cursor)
        frames.push({
          t: performance.now(),
          length: (text.textContent ?? '').length,
          cursor: Number(getComputedStyle(cursor).opacity),
        });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const framesOf = (page: Page) =>
  page.evaluate(() => (window as unknown as { __frames: Frame[] }).__frames);

test.describe('animate-ui typing text', () => {
  test('screen readers get the text once, never the partial ones', async ({
    page,
  }) => {
    await open(page);
    await expect(root(page).locator('.sr-only')).toHaveText(TEXT);
    await expect(
      page.locator('[data-slot="typing-text-cursor"]'),
    ).toHaveAttribute('aria-hidden', 'true');
  });

  test('types one character every 100ms, with a solid cursor, then blinks', async ({
    page,
  }) => {
    await recordFrames(page);
    await open(page);
    await expect(visual(page)).toHaveText(TEXT, { timeout: 15_000 });
    // A single text without `loop` is never erased; the cursor then blinks.
    await page.waitForTimeout(2000);
    await expect(visual(page)).toHaveText(TEXT);

    const frames = await framesOf(page);
    const first = frames.find((f) => f.length >= 1)!;
    const done = frames.find((f) => f.length === TEXT.length)!;
    // 100ms per character (timers can run late, never early).
    const perChar = (done.t - first.t) / (TEXT.length - 1);
    expect(perChar).toBeGreaterThanOrEqual(95);
    expect(perChar).toBeLessThan(200);
    // Solid while typing, once it has faded in (0.3s) as typing started.
    const typing = frames.filter((f) => f.t > first.t + 400 && f.t <= done.t);
    expect(typing.length).toBeGreaterThan(0);
    for (const f of typing) expect(f.cursor).toBe(1);
    // Then a 1s on/off blink.
    const idle = frames.filter((f) => f.t > done.t + 200);
    expect(idle.some((f) => f.cursor === 0)).toBe(true);
    expect(idle.some((f) => f.cursor === 1)).toBe(true);
    expect(idle.every((f) => f.length === TEXT.length)).toBe(true);
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await hideTab(page);
    await page.waitForTimeout(100);
    const paused = await visual(page).textContent();
    await page.waitForTimeout(800);
    expect(await visual(page).textContent()).toBe(paused);
  });

  test('reduced motion: the text shows at once, the cursor holds still', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(visual(page)).toHaveText(TEXT, { timeout: 300 });
    await page.waitForTimeout(1500);
    await expect(visual(page)).toHaveText(TEXT);
    expect(await cursorOpacity(page)).toBe(1);
  });
});
