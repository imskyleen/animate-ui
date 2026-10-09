import { expect, test } from '@playwright/test';

import { describeMenuChecks } from './menu-checks';
import { describeMenuHighlight } from './menu-highlight';
import {
  describeKeptMountedHandoff,
  describeMenubarHandoff,
} from './menubar-handoff';
import { describeMenubarTriggers } from './menubar-triggers';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="menubar-content"]';

test.describe('base-ui menubar demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/menubar', {
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
    await page.waitForTimeout(400);
    expect((await sample(page, CONTENT)).opacity).toBe(1);
  });

  test('closing the bar plays the exit, then unmounts', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'File', exact: true }).click();
    await page.waitForTimeout(500);
    await page.mouse.click(5, 5);
    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, CONTENT)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 600 });
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

test.describe('base-ui menubar API', () => {
  test.describe.configure({ timeout: 180_000 });
  test('Menubar and Menu from Animate UI work together', async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-menubar', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('menuitem', { name: 'Alpha' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Alpha item' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('menuitem', { name: 'Beta item' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Alpha item' }),
    ).toHaveCount(0, {
      timeout: 600,
    });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Beta item' })).toHaveCount(
      0,
      {
        timeout: 600,
      },
    );
  });
});

describeMenuHighlight('base-ui menubar highlight', {
  path: '/tests/demos/base-ui/menubar',
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

describeMenuChecks('base-ui menubar checks', {
  path: '/tests/demos/base-ui/menubar',
  open: async (page) => {
    await page.getByRole('menuitem', { name: 'View', exact: true }).click();
  },
  openRadios: async (page) => {
    await page.getByRole('menuitem', { name: 'Profiles' }).click();
  },
  popup: '[data-slot="menubar-content"]',
  indicator: 'span[aria-hidden="true"]',
  checkbox: { checked: 'Full URLs', unchecked: 'Bookmarks Bar' },
  radio: { from: 'Benoit', to: 'Luis' },
  radioCloses: false,
});

describeMenubarHandoff(
  'base-ui menubar handoff',
  '/tests/demos/base-ui/menubar',
);

describeKeptMountedHandoff(
  'base-ui menubar handoff, kept-mounted menus',
  '/tests/fixtures/base-ui-menubar',
);

describeMenubarTriggers(
  'base-ui menubar triggers',
  '/tests/demos/base-ui/menubar',
);
