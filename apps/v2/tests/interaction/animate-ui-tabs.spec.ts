import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/tabs', { waitUntil: 'networkidle' });

const HIGHLIGHT = '[data-slot="motion-highlight"]';

const highlightX = (page: Page, value: string) =>
  page
    .locator(`${HIGHLIGHT}[data-value="${value}"]`)
    .evaluate((el) => el.getBoundingClientRect().x);

/** translateX of the panels strip, in % of its width. */
const stripX = (page: Page) =>
  page.locator('[data-slot="tabs-contents"] > div').evaluate((el) => {
    const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
    const tx = m ? Number(m[1]!.split(',')[4]) : 0;
    return (tx / el.getBoundingClientRect().width) * 100;
  });

test.describe('animate-ui tabs', () => {
  test('the first tab is selected; tabs are exposed as tabs', async ({
    page,
  }) => {
    await open(page);
    await expect(page.getByRole('tablist')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Account' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tab', { name: 'Password' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    // The inactive panel can't be focused.
    await expect(
      page.getByRole('tabpanel').filter({ hasText: 'Change your password' }),
    ).toHaveAttribute('inert', '');
  });

  test('switching glides the highlight and slides the panel', async ({
    page,
  }) => {
    await open(page);
    const tab = page.getByRole('tab', { name: 'Password' });
    const end = (await tab.boundingBox())!.x;
    await tab.click();
    await page.waitForTimeout(60);
    const mid = await highlightX(page, 'password');
    expect(mid).toBeLessThan(end - 1);
    expect(await stripX(page)).toBeGreaterThan(-99);
    await expect
      .poll(async () => Math.abs((await highlightX(page, 'password')) - end))
      .toBeLessThan(1.5);
    await expect.poll(async () => Math.round(await stripX(page))).toBe(-100);
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByLabel('Current password')).toBeVisible();
  });

  test('the height follows the active panel', async ({ page }) => {
    await open(page);
    const contents = page.locator('[data-slot="tabs-contents"]');
    const before = (await contents.boundingBox())!.height;
    await page.getByRole('tab', { name: 'Password' }).click();
    await expect
      .poll(async () => (await contents.boundingBox())!.height)
      .not.toBe(before);
  });

  test('reduced motion: everything changes at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const tab = page.getByRole('tab', { name: 'Password' });
    const end = (await tab.boundingBox())!.x;
    await tab.click();
    await page.waitForTimeout(60);
    expect(Math.abs((await highlightX(page, 'password')) - end)).toBeLessThan(
      1.5,
    );
    expect(Math.round(await stripX(page))).toBe(-100);
  });
});
