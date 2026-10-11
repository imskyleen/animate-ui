import { expect, test, type Page } from '@playwright/test';

import { gotoTabs } from './tabs-helpers';

const open = (page: Page) => gotoTabs(page, '/tests/demos/animate-ui/tabs');

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
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tab', { name: 'Analytics' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    // The inactive panel can't be focused.
    await expect(
      page.getByRole('tabpanel').filter({ hasText: 'Track performance' }),
    ).toHaveAttribute('inert', '');
  });

  test('switching glides the highlight and slides the panel', async ({
    page,
  }) => {
    await open(page);
    const tab = page.getByRole('tab', { name: 'Analytics' });
    const end = (await tab.boundingBox())!.x;
    await tab.click();
    await page.waitForTimeout(60);
    const mid = await highlightX(page, 'analytics');
    expect(mid).toBeLessThan(end - 1);
    expect(await stripX(page)).toBeGreaterThan(-99);
    await expect
      .poll(async () => Math.abs((await highlightX(page, 'analytics')) - end))
      .toBeLessThan(1.5);
    await expect.poll(async () => Math.round(await stripX(page))).toBe(-100);
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Page views')).toBeVisible();
  });

  test('the panels glide into place without bouncing past it', async ({
    page,
  }) => {
    await open(page);
    // The strip's offset (px) on every frame of the slide to the last tab.
    const frames = page.locator('[data-slot="tabs-contents"] > div').evaluate(
      (el) =>
        new Promise<{ x: number; width: number }[]>((resolve) => {
          const out: { x: number; width: number }[] = [];
          const start = performance.now();
          const tick = (now: number) => {
            const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
            out.push({
              x: m ? Number(m[1]!.split(',')[4]) : 0,
              width: el.getBoundingClientRect().width,
            });
            if (now - start < 900) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    await page.getByRole('tab', { name: 'Settings' }).click();
    const xs = await frames;
    const target = -3 * xs[0]!.width;
    // It gets there...
    expect(xs.at(-1)!.x).toBeCloseTo(target, 0);
    // ...without ever going past it (a bounce would, by a pixel or two).
    expect(Math.min(...xs.map((f) => f.x))).toBeGreaterThan(target - 0.25);
    // And still glides: several frames on the way.
    expect(
      xs.filter((f) => f.x < -1 && f.x > target + 1).length,
    ).toBeGreaterThan(6);
  });

  test('the height follows the active panel', async ({ page }) => {
    await open(page);
    const contents = page.locator('[data-slot="tabs-contents"]');
    const before = (await contents.boundingBox())!.height;
    await page.getByRole('tab', { name: 'Analytics' }).click();
    await expect
      .poll(async () => (await contents.boundingBox())!.height)
      .not.toBe(before);
  });

  test('reduced motion: everything changes at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const tab = page.getByRole('tab', { name: 'Analytics' });
    const end = (await tab.boundingBox())!.x;
    await tab.click();
    await page.waitForTimeout(60);
    expect(Math.abs((await highlightX(page, 'analytics')) - end)).toBeLessThan(
      1.5,
    );
    expect(Math.round(await stripX(page))).toBe(-100);
  });

  test('triggers and panels reference each other', async ({ page }) => {
    await open(page);
    for (const name of ['Overview', 'Analytics']) {
      const tab = page.getByRole('tab', { name });
      const panelId = await tab.getAttribute('aria-controls');
      const tabId = await tab.getAttribute('id');
      expect(panelId).toBeTruthy();
      const panel = page.locator(`[id="${panelId}"]`);
      await expect(panel).toHaveAttribute('role', 'tabpanel');
      await expect(panel).toHaveAttribute('aria-labelledby', tabId!);
    }
    await expect(page.getByRole('tablist')).toHaveAttribute(
      'aria-orientation',
      'horizontal',
    );
  });

  test('keyboard: the selection animates like a click', async ({ page }) => {
    await open(page);
    const overview = page.getByRole('tab', { name: 'Overview' });
    const analytics = page.getByRole('tab', { name: 'Analytics' });
    const overviewX = (await overview.boundingBox())!.x;
    const analyticsX = (await analytics.boundingBox())!.x;
    await overview.focus();
    // Sampled in the page from the key press: the highlight slides and the
    // panels strip moves, as on click (no fixed timing, so no flakiness).
    const frames = page.evaluate(
      (selector) =>
        new Promise<{ x: number; strip: number }[]>((resolve) => {
          const out: { x: number; strip: number }[] = [];
          const start = performance.now();
          const tick = () => {
            const el = document.querySelector(
              `${selector}[data-value="analytics"]`,
            );
            const strip = document.querySelector<HTMLElement>(
              '[data-slot="tabs-contents"] > div',
            )!;
            const m =
              getComputedStyle(strip).transform.match(/matrix\(([^)]+)\)/);
            const tx = m ? Number(m[1]!.split(',')[4]) : 0;
            if (el)
              out.push({
                x: el.getBoundingClientRect().x,
                strip: (tx / strip.getBoundingClientRect().width) * 100,
              });
            if (performance.now() - start < 900) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
      HIGHLIGHT,
    );
    await page.keyboard.press('ArrowRight');
    await expect(analytics).toBeFocused();
    await expect(analytics).toHaveAttribute('aria-selected', 'true');
    const xs = await frames;
    expect(xs.some((f) => f.x > overviewX + 1 && f.x < analyticsX - 1)).toBe(
      true,
    );
    expect(xs.some((f) => f.strip < -1 && f.strip > -99)).toBe(true);
    await expect
      .poll(async () =>
        Math.abs((await highlightX(page, 'analytics')) - analyticsX),
      )
      .toBeLessThan(1.5);
    await expect.poll(async () => Math.round(await stripX(page))).toBe(-100);
  });
});

test.describe('animate-ui tabs keyboard', () => {
  const openFixture = (page: Page) =>
    gotoTabs(page, '/tests/fixtures/animate-ui-tabs');

  const list = (page: Page, name: string) =>
    page.getByRole('tablist', { name });
  const tab = (page: Page, listName: string, name: string) =>
    list(page, listName).getByRole('tab', { name, exact: true });

  async function expectSelected(page: Page, listName: string, name: string) {
    const t = tab(page, listName, name);
    await expect(t).toBeFocused();
    await expect(t).toHaveAttribute('aria-selected', 'true');
    await expect(t).toHaveAttribute('tabindex', '0');
    await expect(
      list(page, listName).locator('[role="tab"][tabindex="0"]'),
    ).toHaveCount(1);
  }

  test('roving tabindex: Tab enters on the selected tab, then leaves the list', async ({
    page,
  }) => {
    await openFixture(page);
    await expect(tab(page, 'Horizontal', 'One')).toHaveAttribute(
      'tabindex',
      '0',
    );
    await expect(tab(page, 'Horizontal', 'Three')).toHaveAttribute(
      'tabindex',
      '-1',
    );
    await page.getByRole('button', { name: 'Before' }).focus();
    await page.keyboard.press('Tab');
    await expect(tab(page, 'Horizontal', 'One')).toBeFocused();
    // Next stop is the active panel, not the other tabs.
    await page.keyboard.press('Tab');
    await expect(page.getByText('Horizontal One panel')).toBeFocused();
  });

  test('arrows select the next enabled tab, skip disabled ones and wrap', async ({
    page,
  }) => {
    await openFixture(page);
    await tab(page, 'Horizontal', 'One').focus();
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Horizontal', 'Three'); // Two is disabled
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Horizontal', 'Four');
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Horizontal', 'One'); // wraps
    await page.keyboard.press('ArrowLeft');
    await expectSelected(page, 'Horizontal', 'Four'); // wraps back
    await page.keyboard.press('ArrowLeft');
    await expectSelected(page, 'Horizontal', 'Three');
    // Up/Down do nothing in a horizontal list.
    await page.keyboard.press('ArrowDown');
    await expectSelected(page, 'Horizontal', 'Three');
    await expect(tab(page, 'Horizontal', 'Two')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  test('Home and End jump to the first and last tabs', async ({ page }) => {
    await openFixture(page);
    await tab(page, 'Horizontal', 'One').focus();
    await page.keyboard.press('End');
    await expectSelected(page, 'Horizontal', 'Four');
    await page.keyboard.press('Home');
    await expectSelected(page, 'Horizontal', 'One');
  });

  test('the panel follows the keyboard selection', async ({ page }) => {
    await openFixture(page);
    await tab(page, 'Horizontal', 'One').focus();
    await page.keyboard.press('End');
    const panel = page.locator(
      `[id="${await tab(page, 'Horizontal', 'Four').getAttribute('aria-controls')}"]`,
    );
    await expect(panel).not.toHaveAttribute('inert', '');
    await expect(panel).toContainText('Horizontal Four panel');
  });

  test('vertical: Up and Down move, Left and Right do not', async ({
    page,
  }) => {
    await openFixture(page);
    await expect(list(page, 'Vertical')).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
    await tab(page, 'Vertical', 'One').focus();
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Vertical', 'One');
    await page.keyboard.press('ArrowDown');
    await expectSelected(page, 'Vertical', 'Three');
    await page.keyboard.press('ArrowUp');
    await expectSelected(page, 'Vertical', 'One');
    await page.keyboard.press('ArrowUp');
    await expectSelected(page, 'Vertical', 'Four');
  });

  test('RTL: Left moves forward', async ({ page }) => {
    await openFixture(page);
    await tab(page, 'RTL', 'One').focus();
    await page.keyboard.press('ArrowLeft');
    await expectSelected(page, 'RTL', 'Three');
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'RTL', 'One');
  });

  test('own ids on a trigger and a panel stay paired', async ({ page }) => {
    await openFixture(page);
    const t = tab(page, 'Custom ids', 'Alpha');
    await expect(t).toHaveAttribute('id', 'my-trigger');
    await expect(t).toHaveAttribute('aria-controls', 'my-panel');
    const panel = page.locator('#my-panel');
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', 'my-trigger');
    // The other pair keeps its generated ids.
    const beta = tab(page, 'Custom ids', 'Beta');
    const betaPanel = page.locator(
      `[id="${await beta.getAttribute('aria-controls')}"]`,
    );
    await expect(betaPanel).toHaveAttribute(
      'aria-labelledby',
      (await beta.getAttribute('id'))!,
    );
  });
});
