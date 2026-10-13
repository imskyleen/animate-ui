import { expect, test, type Page } from '@playwright/test';

import { gotoHydrated } from './disclosure-timeline';

const open = (page: Page) =>
  gotoHydrated(page, '/tests/demos/animate-ui/highlight');

const HIGHLIGHT = '[data-slot="motion-highlight"]';

const highlightX = (page: Page, value = 'overview') =>
  page
    .locator(`${HIGHLIGHT}[data-value="${value}"]`)
    .evaluate((el) => el.getBoundingClientRect().x);

test.describe('animate-ui highlight', () => {
  test('starts on the default value', async ({ page }) => {
    await open(page);
    await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
    await expect(
      page.getByRole('button', { name: 'Overview' }),
    ).toHaveAttribute('data-active', 'true');
  });

  test('sets no ARIA state: it is a visual effect', async ({ page }) => {
    await open(page);
    await expect(page.locator('[aria-selected]')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Activity' }),
    ).toHaveAttribute('data-active', 'false');
  });

  test('clicking an item glides the highlight to it', async ({ page }) => {
    await open(page);
    const target = page.getByRole('button', { name: 'Settings' });
    const start = await highlightX(page);
    const end = (await target.boundingBox())!.x;
    await target.click();
    await page.waitForTimeout(60);
    const mid = await highlightX(page, 'settings');
    expect(mid).toBeGreaterThan(start + 1);
    expect(mid).toBeLessThan(end - 1);
    await expect
      .poll(async () => Math.abs((await highlightX(page, 'settings')) - end))
      .toBeLessThan(1.5);
    await expect(target).toHaveAttribute('data-active', 'true');
    await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
  });

  test('reduced motion: the highlight jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const target = page.getByRole('button', { name: 'Settings' });
    const end = (await target.boundingBox())!.x;
    await target.click();
    await page.waitForTimeout(60);
    expect(Math.abs((await highlightX(page, 'settings')) - end)).toBeLessThan(
      1.5,
    );
  });
});
