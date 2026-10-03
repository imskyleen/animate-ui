import { expect, test, type Page } from '@playwright/test';

const open = (page: Page, name: string) =>
  page.goto(`/examples/smoke/demo-primitives-texts-${name}`, {
    waitUntil: 'networkidle',
  });

const srText = (page: Page, slot: string) =>
  page.locator(`[data-slot="${slot}"] .sr-only`).first().textContent();

// Screen readers get the real text once; the animated copy is hidden.
const A11Y = [
  { name: 'typing', slot: 'typing-text', text: /^Typing Text component/ },
  { name: 'rolling', slot: 'rolling-text', text: /^Rolling Text$/ },
  { name: 'splitting', slot: 'splitting-text', text: /^Splitting Text$/ },
  { name: 'shimmering', slot: 'shimmering-text', text: /^Shimmering Text$/ },
  {
    name: 'rotating',
    slot: 'rotating-text-container',
    text: /^Rotating, Text, Demo$/,
  },
] as const;

for (const c of A11Y) {
  test(`${c.name}: screen readers read the full text once`, async ({
    page,
  }) => {
    await open(page, c.name);
    expect(await srText(page, c.slot)).toMatch(c.text);
    const visual = page.locator(`[data-slot="${c.slot}"] [aria-hidden="true"]`);
    expect(await visual.count()).toBeGreaterThan(0);
  });
}

test.describe('typing', () => {
  test('types progressively, then shows the full text', async ({ page }) => {
    await open(page, 'typing');
    const visual = page
      .locator('[data-slot="typing-text"] > [aria-hidden="true"]')
      .first();
    await page.waitForTimeout(400);
    const early = (await visual.textContent()) ?? '';
    expect(early.length).toBeGreaterThan(0);
    expect(early.length).toBeLessThan(20);
  });

  test('reduced motion: the full text shows at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'typing');
    const visual = page
      .locator('[data-slot="typing-text"] > [aria-hidden="true"]')
      .first();
    await expect(visual).toHaveText(/easy to use\.$/, { timeout: 300 });
  });
});

test.describe('rotating', () => {
  test('holds the first word before rotating', async ({ page }) => {
    await open(page, 'rotating');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-slot="rotating-text"]')).toHaveText(
      'Rotating',
    );
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page, 'rotating');
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(4000);
    await expect(page.locator('[data-slot="rotating-text"]')).toHaveText(
      'Rotating',
    );
  });
});

test.describe('highlight', () => {
  const size = (page: Page) =>
    page
      .locator('[data-slot="highlight-text"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundSize);

  test('sweeps in', async ({ page }) => {
    await open(page, 'highlight');
    await page.waitForTimeout(150);
    expect(await size(page)).not.toBe('100% 100%');
    await page.waitForTimeout(2600);
    expect(await size(page)).toBe('100% 100%');
  });

  test('reduced motion: fully highlighted at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'highlight');
    expect(await size(page)).toBe('100% 100%');
  });
});

test.describe('splitting', () => {
  test('reduced motion: every piece is in place at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'splitting');
    const pieces = await page
      .locator('[data-slot="splitting-text"] [aria-hidden="true"] *')
      .evaluateAll((els) =>
        els.map((el) => ({
          opacity: Number(getComputedStyle(el).opacity),
          transform: getComputedStyle(el).transform,
        })),
      );
    expect(pieces.length).toBeGreaterThan(0);
    for (const p of pieces) {
      expect(p.opacity).toBe(1);
      expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(p.transform);
    }
  });
});

test.describe('gradient', () => {
  const position = (page: Page) =>
    page
      .locator('[data-slot="gradient-text"] span')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundPosition);

  test('the sweep moves while visible', async ({ page }) => {
    await open(page, 'gradient');
    const a = await position(page);
    await page.waitForTimeout(600);
    expect(await position(page)).not.toBe(a);
  });

  test('reduced motion: the sweep stays still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'gradient');
    const a = await position(page);
    await page.waitForTimeout(600);
    expect(await position(page)).toBe(a);
  });
});

test.describe('counting-number', () => {
  const ticking = (page: Page) =>
    page.locator('[data-slot="counting-number"] [aria-hidden="true"]').first();

  test('counts up to the target; readers get the target only', async ({
    page,
  }) => {
    await open(page, 'counting-number');
    const target = (await srText(page, 'counting-number'))?.trim();
    expect(target).toMatch(/\d/);
    await expect(ticking(page)).toHaveText(target!, { timeout: 5000 });
  });

  test('reduced motion: shows the target at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'counting-number');
    const target = (await srText(page, 'counting-number'))?.trim();
    await expect(ticking(page)).toHaveText(target!, { timeout: 300 });
  });
});

test.describe('sliding-number', () => {
  test('rollers are hidden from screen readers', async ({ page }) => {
    await open(page, 'sliding-number');
    expect(await srText(page, 'sliding-number')).toMatch(/\d/);
    const rollers = page.locator('[data-slot="sliding-number-roller"]');
    expect(await rollers.count()).toBeGreaterThan(0);
    for (const hidden of await rollers.evaluateAll((els) =>
      els.map((el) => !!el.closest('[aria-hidden="true"]')),
    ))
      expect(hidden).toBe(true);
  });
});

test.describe('scrolling-number', () => {
  const transform = (page: Page) =>
    page
      .locator('[data-slot="scrolling-number"]')
      .first()
      .evaluate((el) => getComputedStyle(el).transform);

  test('the strip is hidden and spins to its target', async ({ page }) => {
    await open(page, 'scrolling-number');
    await expect(
      page.locator('[data-slot="scrolling-number"]'),
    ).toHaveAttribute('aria-hidden', 'true');
    const start = await transform(page);
    await page.waitForTimeout(4000);
    const end = await transform(page);
    expect(end).not.toBe(start);
    await page.waitForTimeout(300);
    expect(await transform(page)).toBe(end);
  });

  test('reduced motion: lands on the target at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page, 'scrolling-number');
    const a = await transform(page);
    await page.waitForTimeout(500);
    expect(await transform(page)).toBe(a);
  });
});
