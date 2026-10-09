import { expect, test } from '@playwright/test';

import { describeMenuChecks } from './menu-checks';
import { describeMenuHighlight } from './menu-highlight';
import {
  describeKeptMountedHandoff,
  describeMenubarHandoff,
  recordPopovers,
} from './menubar-handoff';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="menubar-content"]';

test.describe('radix-ui menubar demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/menubar', {
      waitUntil: 'networkidle',
    });
  });

  test('opening the bar scales and fades the menu in', async ({ page }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.origin.startsWith('0px 0px')).toBe(true);
    await page.waitForTimeout(400);
    expect((await sample(page, CONTENT)).opacity).toBe(1);
  });

  test('closing the bar plays the exit, then unmounts', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, CONTENT)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 600 });
    // Focus is back on the trigger right away.
    await expect(
      page.locator('[data-slot="menubar-trigger"]').first(),
    ).toBeFocused();
  });

  test('reduced motion: it fades without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui menubar API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-menubar', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await expect(page.getByTestId('value')).toHaveText('none');
    await page.getByRole('menuitem', { name: 'Alpha' }).click();
    await expect(page.getByTestId('value')).toHaveText('alpha');
    await page.getByRole('menuitem', { name: 'Beta' }).hover();
    await expect(page.getByTestId('value')).toHaveText('beta');
    await expect(
      page.getByRole('menuitem', { name: 'Beta item' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('value')).toHaveText('none');
  });

  test('a submenu in its own portal goes with its menu to the next one', async ({
    page,
  }) => {
    await page.getByRole('menuitem', { name: 'Alpha', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Alpha more' }).hover();
    await expect(
      page.getByRole('menuitem', { name: 'Alpha sub item' }),
    ).toBeVisible();
    await page.waitForTimeout(400);
    const recording = recordPopovers(page, 500);
    const beta = (await page
      .getByRole('menuitem', { name: 'Beta', exact: true })
      .boundingBox())!;
    await page.mouse.move(beta.x + beta.width / 2, beta.y + beta.height / 2);
    const frames = await recording;
    expect(frames[0]!.subs).toBe(1);
    // Gone in the frame Beta's menu shows.
    expect(
      frames.filter(
        (frame) =>
          frame.subs > 0 &&
          frame.shown.some((popover) => popover.label.startsWith('Beta')),
      ),
    ).toEqual([]);
  });

  test('a kept-mounted menu opens on a click, and closes on one', async ({
    page,
  }) => {
    const gamma = page.getByRole('menuitem', { name: 'Gamma', exact: true });
    const item = page.getByRole('menuitem', { name: 'Gamma item' });
    // A closed kept-mounted menu is still a dismissable layer: the pointer
    // down that opens it must not count as one outside it.
    await gamma.click();
    await expect(item).toBeVisible();
    await page.waitForTimeout(400);
    await expect(item).toBeVisible();
    // A click outside still closes it, and so does its trigger.
    await page.mouse.click(5, 5);
    await expect(item).toBeHidden({ timeout: 600 });
    await gamma.click();
    await expect(item).toBeVisible();
    await page.waitForTimeout(400);
    await gamma.click();
    await expect(item).toBeHidden({ timeout: 600 });
  });

  test('menus without a value, with the import * style', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Star menu' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Star item' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Star item' })).toHaveCount(
      0,
      {
        timeout: 600,
      },
    );
  });
});

describeMenuHighlight('radix-ui menubar highlight', {
  path: '/tests/demos/radix-ui/menubar',
  // The Edit menu: its submenu trigger sits two rows below its first item,
  // like the old demo's (see the dropdown menu's spec).
  open: async (page) => {
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('menuitem', { name: /Undo/ }),
  second: (page) => page.getByRole('menuitem', { name: /Redo/ }),
  submenuTrigger: (page) =>
    page.getByRole('menuitem', { name: 'Find', exact: true }),
  submenuItem: (page) => page.getByRole('menuitem', { name: 'Search the web' }),
  keyboardNext: 'ArrowDown',
});

describeMenuChecks('radix-ui menubar checks', {
  path: '/tests/demos/radix-ui/menubar',
  open: async (page) => {
    await page.getByRole('menuitem', { name: 'View', exact: true }).click();
  },
  openRadios: async (page) => {
    await page.getByRole('menuitem', { name: 'Profiles' }).click();
  },
  popup: '[data-slot="menubar-content"]',
  indicator: 'span[data-state]',
  checkbox: { checked: 'Full URLs', unchecked: 'Bookmarks Bar' },
  radio: { from: 'Benoit', to: 'Luis' },
  radioCloses: true,
});

describeMenubarHandoff(
  'radix-ui menubar handoff',
  '/tests/demos/radix-ui/menubar',
);

describeKeptMountedHandoff(
  'radix-ui menubar handoff, kept-mounted menus',
  '/tests/fixtures/radix-ui-menubar',
);
