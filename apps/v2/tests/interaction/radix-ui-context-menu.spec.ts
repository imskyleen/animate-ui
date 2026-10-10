import { expect, test } from '@playwright/test';

import { describeMenuChecks } from './menu-checks';
import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="context-menu-content"]';
const SUB_CONTENT = '[data-slot="context-menu-sub-content"]';

test.describe('radix-ui context-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/context-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('grows from the pointer in 220ms', async ({ page }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByText('Right click here').click({ button: 'right' });
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    // Opens to the bottom right of the pointer: anchored on its top-left.
    expect(first.origin.startsWith('0px 0px')).toBe(true);

    await page.waitForTimeout(400);
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

  test('a submenu grows from its side', async ({ page }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(page, SUB_CONTENT);
    await page.getByRole('menuitem', { name: 'More Tools' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.origin.startsWith('0px')).toBe(true);
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

test.describe('radix-ui context-menu API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-context-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('onOpenChange and a controlled open', async ({ page }) => {
    await page.getByText('Controlled area').click({ button: 'right' });
    await expect(page.getByTestId('open')).toHaveText('open');
    await page.getByRole('menuitem', { name: 'Controlled item' }).click();
    await expect(page.getByTestId('open')).toHaveText('closed');
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toHaveCount(0, { timeout: 600 });
  });

  test('the import * style, with checkbox items', async ({ page }) => {
    await page.getByText('Star area').click({ button: 'right' });
    await page.getByRole('menuitemcheckbox', { name: 'Pinned' }).click();
    await expect(page.getByTestId('pinned')).toHaveText('true');
  });
});

describeMenuHighlight('radix-ui context-menu highlight', {
  path: '/tests/demos/radix-ui/context-menu',
  open: async (page) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(400);
  },
  // Adjacent enabled items (Base UI's arrow keys visit disabled ones too).
  first: (page) => page.getByRole('menuitem', { name: /Reload/ }),
  second: (page) => page.getByRole('menuitem', { name: 'More Tools' }),
  submenuTrigger: (page) => page.getByRole('menuitem', { name: 'More Tools' }),
  submenuItem: (page) => page.getByRole('menuitem', { name: 'Save Page...' }),
  keyboardNext: 'ArrowDown',
});

describeMenuChecks('radix-ui context-menu checks', {
  path: '/tests/demos/radix-ui/context-menu',
  open: async (page) => {
    await page.getByText('Right click here').click({ button: 'right' });
  },
  popup: '[data-slot="context-menu-content"]',
  indicator: 'span[data-state]',
  checkbox: { checked: 'Show Bookmarks', unchecked: 'Show Full URLs' },
  radio: { from: 'Pedro Duarte', to: 'Colm Tuite' },
  radioCloses: true,
});
