import { expect, test } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

// React Aria's menus open in Animate UI's animated Popover, and their items
// take part in the menus' highlight (menu-highlight.ts), into submenus too.
const CONTENT = '[data-slot="context-menu-content"]';
const SUB_CONTENT = '[data-slot="context-menu-sub-content"]';

test.describe('react-aria context-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/context-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 250ms scale and fade, like the other menus', async ({
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
    // It plays an exit (polled: a loaded machine can skip the first frames).
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
    await page.getByRole('menuitem', { name: 'Arrange' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    await expect(page.locator(SUB_CONTENT)).toBeVisible();
  });

  test('the highlight goes into the submenu: one highlight, the trigger cleared', async ({
    page,
  }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    const trigger = page.getByRole('menuitem', { name: 'Arrange' });
    await trigger.hover();
    await expect(page.locator(SUB_CONTENT)).toBeVisible();
    await page.waitForTimeout(400);
    await page.getByRole('menuitem', { name: 'Bring to front' }).hover();
    await page.waitForTimeout(600);
    // The submenu shares its menu's highlight: it moved into the submenu.
    const copies = page.locator('[data-slot="item-highlight"]');
    await expect(copies).toHaveCount(1);
    expect(
      await copies.first().evaluate((el) => el.parentElement?.textContent),
    ).toContain('Bring to front');
    // The open trigger shows no background of its own.
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
  first: (page) => page.getByRole('menuitemcheckbox', { name: 'Show grid' }),
  second: (page) => page.getByRole('menuitemcheckbox', { name: 'Show rulers' }),
  keyboardNext: 'ArrowDown',
});
