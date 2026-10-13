import { expect, test } from '@playwright/test';

import { describeMenuChecks } from './menu-checks';
import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="context-menu-content"]';
const SUB_CONTENT = '[data-slot="context-menu-sub-content"]';

test.describe('react-aria context-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/context-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 220ms scale and fade, like the other menus', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByText('Right click here').click({ button: 'right' });
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    await page.waitForTimeout(650);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await sample(page, CONTENT)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 600 });
  });

  test('the keyboard moves the focus at once, the items have no transition', async ({
    page,
  }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowDown');
    const focused = page.locator('[role="menuitem"]:focus');
    await expect(focused).toHaveCount(1);
    expect(
      await focused.evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s');
  });

  test('a submenu opens in an animated popover too', async ({ page }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(page, SUB_CONTENT);
    await page.getByRole('menuitem', { name: 'More Tools' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    await expect(page.locator(SUB_CONTENT)).toBeVisible();
  });

  test('the highlight goes into the submenu: one highlight, the trigger cleared', async ({
    page,
  }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    const trigger = page.getByRole('menuitem', { name: 'More Tools' });
    await trigger.hover();
    await expect(page.locator(SUB_CONTENT)).toBeVisible();
    await page.waitForTimeout(400);
    await page.getByRole('menuitem', { name: 'Save Page...' }).hover();
    await page.waitForTimeout(600);
    const copies = page.locator('[data-slot="item-highlight"]');
    await expect(copies).toHaveCount(1);
    expect(
      await copies.first().evaluate((el) => el.parentElement?.textContent),
    ).toContain('Save Page...');
    expect(
      await trigger.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgba(0, 0, 0, 0)');
  });

  test('reduced motion: it fades without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByText('Right click here').click({ button: 'right' });
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

describeMenuHighlight('react-aria context-menu highlight', {
  path: '/tests/demos/react-aria/context-menu',
  open: async (page) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(500);
  },
  first: (page) =>
    page.getByRole('menuitemcheckbox', { name: 'Show Bookmarks' }),
  second: (page) =>
    page.getByRole('menuitemcheckbox', { name: 'Show Full URLs' }),
  submenuTrigger: (page) => page.getByRole('menuitem', { name: 'More Tools' }),
  submenuItem: (page) => page.getByRole('menuitem', { name: 'Save Page...' }),
  keyboardNext: 'ArrowDown',
});

describeMenuChecks('react-aria context-menu checks', {
  path: '/tests/demos/react-aria/context-menu',
  open: async (page) => {
    await page.getByText('Right click here').click({ button: 'right' });
  },
  popup: '[data-slot="context-menu-content"]',
  indicator: '[data-slot$="-item-indicator"]',
  checkbox: { checked: 'Show Bookmarks', unchecked: 'Show Full URLs' },
  radio: { from: 'Pedro Duarte', to: 'Colm Tuite' },
  radioCloses: true,
});
