import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/typing-text', {
    waitUntil: 'networkidle',
  });

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

test.describe('animate-ui typing text', () => {
  test('screen readers get every text once, never the partial ones', async ({
    page,
  }) => {
    await open(page);
    await expect(root(page).locator('.sr-only')).toHaveText(
      'Typing Text, Made with Motion, Easy to customize',
    );
    await expect(
      page.locator('[data-slot="typing-text-cursor"]'),
    ).toHaveAttribute('aria-hidden', 'true');
  });

  test('types progressively, erases, then types the next text', async ({
    page,
  }) => {
    await open(page);
    // A partial text shows up while typing (or erasing, if the page loaded
    // slowly): one character every 100ms.
    await expect
      .poll(
        async () => {
          const text = (await visual(page).textContent()) ?? '';
          return text.length > 0 && text.length < 'Typing Text'.length;
        },
        { timeout: 3000, intervals: [50] },
      )
      .toBe(true);
    await expect(visual(page)).toHaveText(/^T/);
    await expect(visual(page)).toHaveText(/^Made/, { timeout: 5000 });
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(400);
    await hideTab(page);
    await page.waitForTimeout(100);
    const paused = await visual(page).textContent();
    await page.waitForTimeout(800);
    expect(await visual(page).textContent()).toBe(paused);
  });

  test('the cursor blinks once typing holds', async ({ page }) => {
    await open(page);
    // Solid while typing; once a text is fully typed, it blinks (0 and 1).
    const seen = new Set<number>();
    await expect
      .poll(
        async () => {
          seen.add(await cursorOpacity(page));
          return seen.has(0) && seen.has(1);
        },
        { timeout: 8000, intervals: [100] },
      )
      .toBe(true);
  });

  test('reduced motion: the text shows at once, the cursor holds still', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(visual(page)).toHaveText('Typing Text', { timeout: 300 });
    await page.waitForTimeout(1500);
    await expect(visual(page)).toHaveText('Typing Text');
    expect(await cursorOpacity(page)).toBe(1);
  });
});
