import { expect, test, type Page } from '@playwright/test';

const INDICATOR = '[data-slot="motion-highlight"]';
const PANEL_SLOT = {
  radix: 'tabs-content',
  base: 'tabs-panel',
  headless: 'tab-panel',
};

const indicatorLeft = (page: Page) =>
  page
    .locator(INDICATOR)
    .first()
    .evaluate((el) => el.getBoundingClientRect().left);

const tabLeft = (page: Page, name: string) =>
  page
    .getByRole('tab', { name })
    .evaluate((el) => el.getBoundingClientRect().left);

for (const lib of ['radix', 'base', 'headless'] as const) {
  const PANEL = `[data-slot="${PANEL_SLOT[lib]}"]`;

  test.describe(`${lib} tabs`, () => {
    test.beforeEach(async ({ page }) => {
      // networkidle: the smoke marker is server-rendered, wait for hydration.
      await page.goto(`/examples/smoke/demo-components-${lib}-tabs`, {
        waitUntil: 'networkidle',
      });
    });

    test('pointer: the indicator glides to the new tab', async ({ page }) => {
      const target = await tabLeft(page, 'Password');
      await page.getByRole('tab', { name: 'Password' }).click();
      await page.waitForTimeout(40);
      const mid = await indicatorLeft(page);
      expect(Math.abs(mid - target)).toBeGreaterThan(2);

      await page.waitForTimeout(500);
      expect(Math.abs((await indicatorLeft(page)) - target)).toBeLessThan(4);
    });

    test('keyboard: the indicator moves instantly', async ({ page }) => {
      const target = await tabLeft(page, 'Password');
      await page.getByRole('tab', { name: 'Account' }).focus();
      await page.keyboard.press('ArrowRight');
      // Base UI moves focus only; Enter selects (activateOnFocus is false).
      if (lib === 'base') await page.keyboard.press('Enter');
      await page.waitForTimeout(40);
      expect(Math.abs((await indicatorLeft(page)) - target)).toBeLessThan(4);
    });

    test('the new panel fades in, the old one is gone at once', async ({
      page,
    }) => {
      await page.getByRole('tab', { name: 'Password' }).click();
      await page.waitForTimeout(20);
      expect(await page.locator(PANEL).count()).toBe(1);
      const early = await page
        .locator(PANEL)
        .evaluate((el) => Number(getComputedStyle(el).opacity));
      expect(early).toBeLessThan(1);

      await page.waitForTimeout(250);
      const settled = await page
        .locator(PANEL)
        .evaluate((el) => Number(getComputedStyle(el).opacity));
      expect(settled).toBe(1);
    });

    test('reduced motion: the indicator jumps', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const target = await tabLeft(page, 'Password');
      await page.getByRole('tab', { name: 'Password' }).click();
      await page.waitForTimeout(40);
      expect(Math.abs((await indicatorLeft(page)) - target)).toBeLessThan(4);
    });
  });
}
