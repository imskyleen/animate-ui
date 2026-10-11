import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/code-block', {
    waitUntil: 'networkidle',
  });

const block = (page: Page) => page.locator('[data-slot="code-block"]');
const LAST_LINE = 'export { MyComponent, type MyComponentProps };';
const textLength = (page: Page) =>
  block(page).evaluate((el) => el.textContent?.length ?? 0);

test.describe('animate-ui code-block', () => {
  test('types the code out over its duration, highlighted', async ({
    page,
  }) => {
    await open(page);
    await expect(block(page)).toHaveAttribute('data-writing', 'true');
    await expect(block(page).locator('pre.shiki')).toBeAttached();
    await expect(block(page)).toHaveAttribute('data-done', 'false');
    const early = await textLength(page);
    await page.waitForTimeout(800);
    const later = await textLength(page);
    expect(later).toBeGreaterThan(early);
    await expect(block(page)).not.toContainText(LAST_LINE);
    // Tokens are colored by Shiki.
    expect(
      await block(page).locator('.line span[style*="color"]').count(),
    ).toBeGreaterThan(0);

    // 10s duration.
    await expect(block(page)).toHaveAttribute('data-done', 'true', {
      timeout: 14000,
    });
    await expect(block(page)).toContainText(LAST_LINE);
  });

  test('the copy button copies the whole code, even while it writes', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await open(page);
    await expect(page.getByRole('button', { name: 'Replay' })).toHaveCount(0);
    const copy = page.getByRole('button', { name: 'Copy code' });
    await copy.click();
    await expect(copy).toHaveAttribute('data-copied');
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("'use client';");
    expect(text).toContain(LAST_LINE);
  });

  test('reduced motion: the whole code at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(block(page)).toContainText(LAST_LINE, { timeout: 2000 });
    await expect(block(page)).toHaveAttribute('data-done', 'true');
  });
});
