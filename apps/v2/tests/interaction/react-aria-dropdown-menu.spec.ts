import { expect, test } from '../test';

import { describeMenuChecks } from './menu-checks';
import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="dropdown-menu-content"]';
const SUB_CONTENT = '[data-slot="dropdown-menu-sub-content"]';

test.use({ viewport: { width: 1280, height: 1280 } });

test.describe('react-aria dropdown-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/dropdown-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 220ms scale, the box there at once for its rows to stagger in, like the other menus', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const first = await probe.firstFrame();
    // The rows fade in one after another; the box itself arrives at once.
    expect(first.opacity).toBeGreaterThan(0.8);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    await page.waitForTimeout(650);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
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
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowDown');
    const focused = page.locator('[role="menuitem"]:focus');
    await expect(focused).toHaveCount(1);
    expect(
      await focused.evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s');
  });

  test('a submenu opens in an animated popover too', async ({ page }) => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(page, SUB_CONTENT);
    await page.getByRole('menuitem', { name: 'Invite users' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    await expect(page.locator(SUB_CONTENT)).toBeVisible();
  });

  test('the highlight goes into the submenu: one highlight, the trigger cleared', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.waitForTimeout(700);
    const trigger = page.getByRole('menuitem', { name: 'Invite users' });
    await trigger.hover();
    await expect(page.locator(SUB_CONTENT)).toBeVisible();
    await page.waitForTimeout(400);
    await page.getByRole('menuitem', { name: 'Email' }).hover();
    await page.waitForTimeout(600);
    const copies = page.locator('[data-slot="item-highlight"]');
    await expect(copies).toHaveCount(1);
    expect(
      await copies.first().evaluate((el) => el.parentElement?.textContent),
    ).toContain('Email');
    expect(
      await trigger.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgba(0, 0, 0, 0)');
  });

  test('reduced motion: it fades without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

describeMenuHighlight('react-aria dropdown-menu highlight', {
  path: '/tests/demos/react-aria/dropdown-menu',
  open: async (page) => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
    await page.waitForTimeout(500);
  },
  first: (page) => page.getByRole('menuitem', { name: /Settings/ }),
  second: (page) => page.getByRole('menuitem', { name: 'Team', exact: true }),
  submenuTrigger: (page) =>
    page.getByRole('menuitem', { name: 'Invite users' }),
  submenuItem: (page) => page.getByRole('menuitem', { name: 'Email' }),
  keyboardNext: 'ArrowDown',
});

describeMenuChecks('react-aria dropdown-menu checks', {
  path: '/tests/demos/react-aria/dropdown-menu',
  open: async (page) => {
    await page.getByRole('button', { name: 'Open', exact: true }).click();
  },
  popup: '[data-slot="dropdown-menu-content"]',
  indicator: '[data-slot$="-item-indicator"]',
  checkbox: { checked: 'Status Bar', unchecked: 'Panel' },
  radio: { from: 'Bottom', to: 'Right' },
  radioCloses: true,
});
