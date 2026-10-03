import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/motion-grid', {
    waitUntil: 'networkidle',
  });

const cells = (page: Page) => page.locator('div[data-active][data-animate]');

const pattern = (page: Page) =>
  cells(page).evaluateAll((els) =>
    els
      .map((el) => (el.getAttribute('data-active') === 'true' ? 1 : 0))
      .join(''),
  );

test.describe('animate-ui motion grid', () => {
  test('renders a 5×5 grid that steps through its frames', async ({ page }) => {
    await open(page);
    await expect(cells(page)).toHaveCount(25);
    const seen = new Set<string>();
    for (let i = 0; i < 6; i++) {
      seen.add(await pattern(page));
      await page.waitForTimeout(120);
    }
    expect(seen.size).toBeGreaterThan(2);
  });

  test('pauses while the tab is hidden', async ({ page }) => {
    await open(page);
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(100);
    const frozen = await pattern(page);
    await page.waitForTimeout(700);
    expect(await pattern(page)).toBe(frozen);
  });

  test('pauses off screen', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 400 });
    await open(page);
    await page.evaluate(() => {
      document.body.style.paddingBottom = '3000px';
      window.scrollTo(0, 2500);
    });
    await page.waitForTimeout(200);
    const frozen = await pattern(page);
    await page.waitForTimeout(700);
    expect(await pattern(page)).toBe(frozen);
  });
});
