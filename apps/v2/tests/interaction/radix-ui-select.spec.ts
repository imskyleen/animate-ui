import { expect, test, type Page } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';
import { withAnimation } from './item-checks';
import { expectCloseWithoutHold, expectPickHold } from './pick-hold';

const LIST = '[role="listbox"]';
// shadcn/ui's demo: its list opens over the trigger (item-aligned, Radix's
// default), where it only fades. Its scale, where it grows from, retargeting
// and the keyboard are checked with the list below the trigger (popper).
const DEMO = '/tests/demos/radix-ui/select';
const POPPER = `${DEMO}?position=popper`;
/** Radix's ItemIndicator, inside the demo's span. */
const CHECK = ':scope > span > span';

const trigger = (page: Page) => page.locator('[data-slot="select-trigger"]');
const option = (page: Page, name: string) =>
  page.getByRole('option', { name, exact: true });

/** Loads a demo page. */
const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

/** Opens the list with a click and lets its entrance finish. */
async function openList(page: Page) {
  await trigger(page).click();
  await page.waitForTimeout(650);
}

test.describe('radix-ui select demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('item-aligned (the default): the list fades in over the trigger, without scaling', async ({
    page,
  }) => {
    await load(page, DEMO);
    const probe = await probeFirstFrame(page, LIST);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(650);
    expect((await sample(page, LIST)).opacity).toBe(1);
    // Laid over the trigger, as in Radix: its first item (no value yet)
    // lined up on it, and focused.
    const middle = (box: { y: number; height: number }) =>
      box.y + box.height / 2;
    const item = (await option(page, 'Apple').boundingBox())!;
    const field = (await trigger(page).boundingBox())!;
    expect(Math.abs(middle(item) - middle(field))).toBeLessThan(2);
    await expect(option(page, 'Apple')).toBeFocused();
  });

  for (const animation of ['draw', 'pop'] as const) {
    test(`a first choice holds the list while its check ${animation === 'draw' ? 'draws itself' : 'pops in'}, then closes`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await expectPickHold(page, {
        popup: LIST,
        item: 'Banana',
        from: null,
        check: CHECK,
        animation,
        pick: () => option(page, 'Banana').click(),
      });
      await expect(trigger(page)).toHaveText('Banana');
    });

    test(`choosing another item holds the list while its check ${animation === 'draw' ? 'draws itself and the old one erases itself' : 'glides there'}`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await option(page, 'Banana').click();
      await expect(page.locator(LIST)).toHaveCount(0, { timeout: 1000 });
      await openList(page);
      await expectPickHold(page, {
        popup: LIST,
        item: 'Grapes',
        from: 'Banana',
        check: CHECK,
        animation,
        pick: () => option(page, 'Grapes').click(),
      });
      await expect(trigger(page)).toHaveText('Grapes');
    });
  }

  test('choosing the chosen item again closes without waiting', async ({
    page,
  }) => {
    await load(page, DEMO);
    await openList(page);
    await option(page, 'Banana').click();
    await expect(page.locator(LIST)).toHaveCount(0, { timeout: 1000 });
    await openList(page);
    // Nothing changes: no check to wait for.
    await expectCloseWithoutHold(page, LIST, () =>
      option(page, 'Banana').click(),
    );
    await expect(trigger(page)).toHaveText('Banana');
  });
});

test.describe('radix-ui select demo, its list below the trigger', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await load(page, POPPER);
  });

  test('opens with a 250ms scale and fade from the trigger', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, LIST);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);
    // Popper below the trigger: it grows from its top edge.
    expect(first.origin.split(' ')[1]).toBe('0px');

    await page.waitForTimeout(400);
    const settled = await sample(page, LIST);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes the same way, and the trigger keeps the label', async ({
    page,
  }) => {
    await openList(page);
    await option(page, 'Grapes').click();

    // Still on screen for the 250ms exit, then gone.
    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, LIST)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(LIST)).toHaveCount(0, { timeout: 600 });
    await expect(trigger(page)).toHaveText('Grapes');
  });

  test('reopening mid-exit retargets instead of restarting', async ({
    page,
  }) => {
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(650);
    const element = await page.locator(LIST).elementHandle();
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await sample(page, LIST)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(0.95);
    // Dispatched: while the list leaves, Radix's modal layer still blocks
    // the pointer outside it (and focus comes back once it has left).
    await trigger(page).dispatchEvent('pointerdown', {
      button: 0,
      pointerType: 'mouse',
      isPrimary: true,
    });
    await page.waitForTimeout(650);
    // The same element: it retargeted instead of remounting.
    expect(await element!.evaluate((el) => el.isConnected)).toBe(true);
    expect((await sample(page, LIST)).opacity).toBe(1);
  });

  test('keyboard: arrows move the highlight, Escape closes', async ({
    page,
  }) => {
    await trigger(page).focus();
    await page.keyboard.press('Enter');
    // No value yet: Radix focuses the first item.
    await expect(option(page, 'Apple')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'Banana')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator(LIST)).toHaveCount(0, { timeout: 600 });
    await expect(trigger(page)).toBeFocused();
    await expect(trigger(page)).toHaveText('Select a fruit');
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, LIST);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui select API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-select', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open, value and their callbacks', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Controlled' });
    await expect(trigger).toHaveText('Controlled Banana');

    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-content')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');

    await page.getByRole('option', { name: 'Controlled Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-content')).toHaveCount(0, {
      timeout: 600,
    });
    await expect(trigger).toHaveText('Controlled Cherry');
  });

  test('item-aligned (the default, import * style) fades without scaling', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(
      page,
      '[data-testid="aligned-content"]',
    );
    await page.getByRole('combobox', { name: 'Aligned' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    // The selected item is lined up with the trigger, as in Radix.
    await expect(
      page.getByRole('option', { name: 'Aligned Cherry' }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('aligned-content')).toHaveCount(0, {
      timeout: 600,
    });
    await expect(page.getByRole('combobox', { name: 'Aligned' })).toHaveText(
      'Aligned Cherry',
    );
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.waitForTimeout(50);
    const open = await sample(page, '[data-testid="instant-content"]');
    expect(open.opacity).toBe(1);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('instant-content')).toHaveCount(0, {
      timeout: 150,
    });
  });

  test('forceMount on the Portal keeps the closed list mounted, hidden and inert', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Mount forceMount' }).click();
    const content = page.getByTestId('forced-content');
    await expect(content).toHaveCount(1);
    await expect(content).toHaveAttribute('data-state', 'closed');
    await expect(content).toHaveAttribute('inert', '');
    expect((await sample(page, '[data-testid="forced-content"]')).opacity).toBe(
      0,
    );
  });
});

test('radix-ui select docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/radix-ui/select', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Select');
  expect(errors).toEqual([]);
});

describeMenuHighlight('radix-ui select highlight', {
  path: POPPER,
  open: async (page) => {
    await trigger(page).click();
    await page.waitForTimeout(400);
  },
  // No value yet: Radix highlights the first item as the list opens.
  first: (page) => option(page, 'Apple'),
  second: (page) => option(page, 'Banana'),
  keyboardNext: 'ArrowDown',
  highlightedOnOpen: true,
});
