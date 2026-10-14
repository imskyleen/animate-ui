import { expect, test, type Page } from '../test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';
import { expectAtRestThrough, withAnimation } from './item-checks';
import {
  expectCloseWithoutHold,
  expectEscapeWithoutHold,
  expectPickHold,
} from './pick-hold';

const POPOVER = '[data-slot="select-content"]';
const DEMO = '/tests/demos/react-aria/select';
const CHECK = ':scope > div';

const trigger = (page: Page) => page.locator('[data-slot="select-trigger"]');
const option = (page: Page, name: string) =>
  page.getByRole('option', { name, exact: true });

const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

async function openList(page: Page) {
  await trigger(page).click();
  await page.waitForTimeout(650);
}

test.describe('react-aria select demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('opens with a 220ms scale and fade from the trigger', async ({
    page,
  }) => {
    await load(page, DEMO);
    const probe = await probeFirstFrame(page, POPOVER);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);

    await page.waitForTimeout(650);
    const settled = await sample(page, POPOVER);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
    expect(parseFloat(settled.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);
  });

  test('closes the same way, and the trigger shows the choice', async ({
    page,
  }) => {
    await load(page, DEMO);
    await openList(page);
    await option(page, 'Grapes').click();

    await expect
      .poll(async () => (await sample(page, POPOVER)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
    await expect(trigger(page)).toContainText('Grapes');
  });

  for (const animation of ['draw', 'pop'] as const) {
    test(`a first choice holds the list while its check ${animation === 'draw' ? 'draws itself' : 'pops in'}, then closes`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await expectPickHold(page, {
        popup: POPOVER,
        item: 'Banana',
        from: null,
        check: CHECK,
        animation,
        pick: () => option(page, 'Banana').click(),
      });
      await expect(trigger(page)).toContainText('Banana');
    });

    test(`choosing another item holds the list while its check ${animation === 'draw' ? 'draws itself and the old one erases itself' : 'glides there'}`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await option(page, 'Banana').click();
      await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 1000 });
      await openList(page);
      await expectPickHold(page, {
        popup: POPOVER,
        item: 'Grapes',
        from: 'Banana',
        check: CHECK,
        animation,
        pick: () => option(page, 'Grapes').click(),
      });
      await expect(trigger(page)).toContainText('Grapes');
    });
  }

  test('choosing the chosen item again closes without waiting', async ({
    page,
  }) => {
    await load(page, DEMO);
    await openList(page);
    await option(page, 'Banana').click();
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 1000 });
    await openList(page);
    await expectCloseWithoutHold(page, POPOVER, () =>
      option(page, 'Banana').click(),
    );
    await expect(trigger(page)).toContainText('Banana');
  });

  test('Escape closes it without waiting', async ({ page }) => {
    await load(page, DEMO);
    await openList(page);
    await expectEscapeWithoutHold(page, POPOVER);
  });

  test('keyboard: arrows move the focused item instantly', async ({ page }) => {
    await load(page, DEMO);
    await trigger(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(POPOVER)).toHaveCount(1);
    await expect(option(page, 'Apple')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'Banana')).toBeFocused({
      timeout: 50,
    });
    await page.keyboard.press('Escape');
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
    await expect(trigger(page)).toContainText('Select a fruit');
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await load(page, DEMO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPOVER);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('react-aria select API', () => {
  test.describe.configure({ timeout: 180_000 });
  test('controlled value and open, with the animated Popover', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/react-aria-select', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-popover')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');

    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-popover')).toHaveCount(0, {
      timeout: 200,
    });
  });
});

test('react-aria select docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/react-aria/select', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Select');
  expect(errors).toEqual([]);
});

describeMenuHighlight('react-aria select highlight', {
  path: DEMO,
  open: async (page) => {
    await trigger(page).click();
    await page.waitForTimeout(400);
  },
  first: (page) => option(page, 'Apple'),
  second: (page) => option(page, 'Banana'),
  keyboardNext: 'ArrowDown',
});

test.describe('react-aria select checks', () => {
  test.describe.configure({ timeout: 180_000 });
  for (const animation of ['draw', 'pop'] as const) {
    test(`opening and closing the list leaves its check at rest (${animation})`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await option(page, 'Banana').click();
      await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 1000 });
      await page.waitForTimeout(300);
      await expectAtRestThrough(
        page,
        { items: '[role="option"]', label: 'Banana', indicator: CHECK },
        {
          open: () => trigger(page).click(),
          close: async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator(POPOVER)).toHaveCount(0, {
              timeout: 1000,
            });
          },
        },
      );
    });
  }
});
