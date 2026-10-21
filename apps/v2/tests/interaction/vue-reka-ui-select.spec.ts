import { expect, test, type Page } from '../test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';
import { expectAtRestThrough, withAnimation } from './item-checks';
import { expectCloseWithoutHold, expectPickHold } from './pick-hold';

const LIST = '[role="listbox"]';
const DEMO = '/tests/vue-demos/reka-ui/select';
const POPPER = `${DEMO}?position=popper`;
const CHECK = ':scope > span > span';

const trigger = (page: Page) => page.locator('[data-slot="select-trigger"]');
const option = (page: Page, name: string) =>
  page.getByRole('option', { name, exact: true });

const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

async function openList(page: Page) {
  await trigger(page).click();
  await page.waitForTimeout(650);
}

const pageFree = (page: Page) =>
  page.evaluate(() => ({
    scrollLocked: document.body.hasAttribute('data-scroll-locked'),
    pointerEvents: getComputedStyle(document.body).pointerEvents,
    hidden: document.querySelector('main')?.getAttribute('aria-hidden') ?? null,
  }));
const FREE = { scrollLocked: false, pointerEvents: 'auto', hidden: null };

test.describe('vue-reka-ui select demo', () => {
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
    await expectCloseWithoutHold(page, LIST, () =>
      option(page, 'Banana').click(),
    );
    await expect(trigger(page)).toHaveText('Banana');
  });
});

test.describe('vue-reka-ui select demo, its list below the trigger', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await load(page, POPPER);
  });

  test('opens with a 220ms scale and fade from the trigger', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, LIST);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);
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
    await trigger(page).dispatchEvent('pointerdown', {
      button: 0,
      pointerType: 'mouse',
      isPrimary: true,
    });
    await page.waitForTimeout(650);
    expect(await element!.evaluate((el) => el.isConnected)).toBe(true);
    expect((await sample(page, LIST)).opacity).toBe(1);
  });

  test('keyboard: arrows move the highlight, Escape closes', async ({
    page,
  }) => {
    await trigger(page).focus();
    await page.keyboard.press('Enter');
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

test.describe('vue-reka-ui select API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/vue-demos/fixtures/reka-ui-select', {
      waitUntil: 'networkidle',
    });
  });

  test("an indicator's own animation sets the hold: it draws, under checks that pop", async ({
    page,
  }) => {
    const trigger = page.getByRole('combobox', { name: 'Own animation' });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.waitForTimeout(650);
    await expectPickHold(page, {
      popup: LIST,
      item: 'Own Banana',
      from: 'Own Apple',
      check: CHECK,
      animation: 'draw',
      pick: () => option(page, 'Own Banana').click(),
    });
  });

  test('v-model:open, v-model and their events', async ({ page }) => {
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

  test('item-aligned (the default) fades without scaling', async ({
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

  test('force-mount on the Portal: the closed list leaves, the page stays usable', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Mount forceMount' }).click();
    const content = page.getByTestId('forced-content');
    await expect(content).toHaveCount(0);
    expect(await pageFree(page)).toEqual(FREE);
    await page.getByRole('combobox', { name: 'Force mounted' }).click();
    await expect(content).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect.poll(() => pageFree(page)).toEqual(FREE);
  });
});

describeMenuHighlight('vue-reka-ui select highlight', {
  path: POPPER,
  open: async (page) => {
    await trigger(page).click();
    await page.waitForTimeout(400);
  },
  first: (page) => option(page, 'Apple'),
  second: (page) => option(page, 'Banana'),
  keyboardNext: 'ArrowDown',
  highlightedOnOpen: true,
});

test.describe('vue-reka-ui select checks', () => {
  test.describe.configure({ timeout: 180_000 });
  for (const animation of ['draw', 'pop'] as const) {
    test(`opening and closing the list leaves its check at rest (${animation})`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await option(page, 'Banana').click();
      await expect(page.locator(LIST)).toHaveCount(0, { timeout: 1000 });
      await page.waitForTimeout(300);
      await expectAtRestThrough(
        page,
        { items: '[role="option"]', label: 'Banana', indicator: CHECK },
        {
          open: () => trigger(page).click(),
          close: async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator(LIST)).toHaveCount(0, { timeout: 1000 });
          },
        },
      );
    });
  }
});
