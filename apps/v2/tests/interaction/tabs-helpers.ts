import { expect, test, type Page } from '@playwright/test';

// Shared by the Radix UI, Base UI and React Aria tabs specs.

export const INDICATOR = '[data-slot="tabs-indicator"]';
export const PANEL = '[role="tabpanel"]';

/** Left edge of the indicator relative to the tab `name`. */
export const offsetFrom = (page: Page, name: string) =>
  page.evaluate(
    ({ indicator, name }) => {
      const tab = [...document.querySelectorAll('[role="tab"]')].find(
        (el) => el.textContent?.trim() === name,
      )!;
      const ind = document.querySelector(indicator)!;
      return (
        ind.getBoundingClientRect().left - tab.getBoundingClientRect().left
      );
    },
    { indicator: INDICATOR, name },
  );

/** Records the indicator's left edge on every frame for `ms`. */
export async function sampleIndicator(page: Page, ms: number) {
  await page.evaluate(
    ({ indicator, ms }) => {
      const w = window as unknown as { __samples?: Promise<number[]> };
      w.__samples = new Promise((resolve) => {
        const samples: number[] = [];
        const start = performance.now();
        const tick = () => {
          const el = document.querySelector(indicator);
          if (el) samples.push(el.getBoundingClientRect().left);
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      });
    },
    { indicator: INDICATOR, ms },
  );
  return () =>
    page.evaluate(
      () => (window as unknown as { __samples: Promise<number[]> }).__samples,
    );
}

export const tabLeft = (page: Page, name: string) =>
  page
    .getByRole('tab', { name, exact: true })
    .evaluate((el) => el.getBoundingClientRect().left);

export const panelOpacity = (page: Page) =>
  page
    .locator(PANEL)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

/** The active tab's own surface is hidden; the indicator carries it. */
export async function expectSurfaceOnIndicator(page: Page) {
  const { tab, indicator } = await page.evaluate((selector) => {
    const active = document.querySelector(
      '[role="tab"][aria-selected="true"]',
    )!;
    const ind = document.querySelector(selector)!;
    return {
      tab: getComputedStyle(active).backgroundColor,
      indicator: getComputedStyle(ind).backgroundColor,
    };
  }, INDICATOR);
  expect(tab).toBe('rgba(0, 0, 0, 0)');
  expect(indicator).not.toBe('rgba(0, 0, 0, 0)');
}

export function describeTabsDemo(
  library: string,
  { selectKeys }: { selectKeys: string[] },
) {
  test.describe(`${library} tabs demo`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/demos/${library}/tabs`, {
        waitUntil: 'networkidle',
      });
    });

    test('page load: the indicator sits on the active tab, nothing fades', async ({
      page,
    }) => {
      await expect(page.locator(INDICATOR)).toHaveCount(1);
      expect(Math.abs(await offsetFrom(page, 'Overview'))).toBeLessThan(1);
      expect(await panelOpacity(page)).toBe(1);
      await expectSurfaceOnIndicator(page);
    });

    test('pointer: the indicator glides to the new tab, then settles', async ({
      page,
    }) => {
      const start = await tabLeft(page, 'Overview');
      const target = await tabLeft(page, 'Settings');
      const samples = await sampleIndicator(page, 300);
      await page.getByRole('tab', { name: 'Settings' }).click();
      const frames = await samples();
      // At least one frame strictly between the two tabs.
      expect(frames.some((x) => x > start + 4 && x < target - 4)).toBe(true);

      await page.waitForTimeout(650);
      expect(Math.abs(await offsetFrom(page, 'Settings'))).toBeLessThan(1);
      await expectSurfaceOnIndicator(page);
    });

    test('keyboard: the indicator and the panel change at once', async ({
      page,
    }) => {
      await page.getByRole('tab', { name: 'Overview' }).focus();
      // Radix and React Aria select on arrow keys; Base UI moves focus, then
      // Enter selects.
      for (const key of selectKeys) await page.keyboard.press(key);
      await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await page.waitForTimeout(50);
      expect(Math.abs(await offsetFrom(page, 'Activity'))).toBeLessThan(1);
      expect(await panelOpacity(page)).toBe(1);
      // Focus moved with the selection, nothing delayed it.
      await expect(page.getByRole('tab', { name: 'Activity' })).toBeFocused();
    });

    test('the new panel fades in, the old one is gone at once', async ({
      page,
    }) => {
      await page.getByRole('tab', { name: 'Activity' }).click();
      await page.waitForTimeout(30);
      await expect(page.locator(PANEL)).toHaveCount(1);
      await expect(page.locator(PANEL)).toContainText('Recent activity');
      expect(await panelOpacity(page)).toBeLessThan(1);
      await page.waitForTimeout(650);
      expect(await panelOpacity(page)).toBe(1);
    });

    test('reduced motion: the indicator jumps', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('tab', { name: 'Settings' }).click();
      await page.waitForTimeout(50);
      expect(Math.abs(await offsetFrom(page, 'Settings'))).toBeLessThan(1);
    });
  });
}
