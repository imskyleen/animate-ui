import { expect, test, type Page } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, recordMotion, sample } from './motion-probe';
import { expectAtRestThrough, withAnimation } from './item-checks';
import { expectCloseWithoutHold, expectPickHold } from './pick-hold';

const POPUP = '[data-slot="select-content"]';
const DEMO = '/tests/demos/base-ui/select';
const POPPER = `${DEMO}?position=popper`;
const CHECK = ':scope > span:not([data-slot="item-highlight"])';
const PLACEHOLDER = 'Select a fruit';

const trigger = (page: Page) => page.locator('[data-slot="select-trigger"]');
const option = (page: Page, name: string) =>
  page.getByRole('option', { name, exact: true });

const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

async function openList(page: Page) {
  await trigger(page).click();
  await page.waitForTimeout(650);
}

test.describe('base-ui select demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('aligned with the trigger (the default): the popup fades in over it, without scaling', async ({
    page,
  }) => {
    await load(page, DEMO);
    const probe = await probeFirstFrame(page, POPUP);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(650);
    expect((await sample(page, POPUP)).opacity).toBe(1);
    const middle = (box: { y: number; height: number }) =>
      box.y + box.height / 2;
    const item = (await option(page, PLACEHOLDER).boundingBox())!;
    const field = (await trigger(page).boundingBox())!;
    expect(Math.abs(middle(item) - middle(field))).toBeLessThan(2);
    await expect(option(page, PLACEHOLDER)).toHaveAttribute(
      'data-highlighted',
      '',
    );
  });

  for (const animation of ['draw', 'pop'] as const) {
    test(`choosing an item holds the list while its check ${animation === 'draw' ? 'draws itself and the old one erases itself' : 'glides there'}`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await openList(page);
      await expectPickHold(page, {
        popup: POPUP,
        item: 'Banana',
        from: PLACEHOLDER,
        check: CHECK,
        animation,
        pick: () => option(page, 'Banana').click(),
      });
      await expect(trigger(page)).toHaveText('Banana');
    });
  }

  test('choosing the chosen item again closes without waiting', async ({
    page,
  }) => {
    await load(page, DEMO);
    await openList(page);
    await expectCloseWithoutHold(page, POPUP, () =>
      option(page, PLACEHOLDER).click(),
    );
    await expect(trigger(page)).toHaveText(PLACEHOLDER);
  });
});

test.describe('base-ui select demo, its popup below the trigger', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await load(page, POPPER);
  });

  test('opens with a 220ms scale and fade from the trigger', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, POPUP);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);
    expect(parseFloat(first.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);

    await page.waitForTimeout(400);
    const settled = await sample(page, POPUP);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    await openList(page);
    await option(page, 'Grapes').click();

    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(trigger(page)).toHaveText('Grapes');
  });

  test('reopening mid-exit retargets instead of restarting', async ({
    page,
  }) => {
    const box = (await trigger(page).boundingBox())!;
    await openList(page);
    const element = await page.locator(POPUP).elementHandle();
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(0.95);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(650);
    expect(await element!.evaluate((el) => el.isConnected)).toBe(true);
    expect((await sample(page, POPUP)).opacity).toBe(1);
  });

  test('keyboard: arrows move the highlight', async ({ page }) => {
    await trigger(page).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(POPUP)).toHaveCount(1);
    await page.waitForTimeout(650);
    await expect(option(page, PLACEHOLDER)).toHaveAttribute(
      'data-highlighted',
      '',
    );
    await page.keyboard.press('ArrowDown');
    await expect(option(page, 'Apple')).toHaveAttribute('data-highlighted', '');
    await page.keyboard.press('Escape');
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(trigger(page)).toHaveText(PLACEHOLDER);
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPUP);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui select API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-select', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and value, callbacks and actionsRef', async ({
    page,
  }) => {
    await expect(page.getByTestId('actions')).toHaveText('actions');
    const trigger = page.getByRole('combobox', { name: 'Controlled' });
    await expect(trigger).toHaveText('Controlled Banana');

    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-popup')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(page.getByTestId('completed')).toHaveText('true', {
      timeout: 1000,
    });

    await page.getByRole('option', { name: 'Controlled Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-popup')).toBeHidden({
      timeout: 600,
    });
    await expect(page.getByTestId('completed')).toHaveText('true,false');
    await expect(trigger).toHaveText('Controlled Cherry');
  });

  test('align-with-trigger (the default) fades without scaling', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, '[data-testid="aligned-popup"]');
    await page.getByRole('combobox', { name: 'Aligned' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('aligned-popup')).toBeHidden({
      timeout: 600,
    });
  });

  test('multiple: the list stays open, checks draw in and erase themselves', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Multiple' }).click();
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="check-apple"]')).opacity).toBe(1);

    await page.getByRole('option', { name: 'Multiple Cherry' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('apple,cherry');
    await page.waitForTimeout(40);
    const appearing = await sample(page, '[data-testid="check-cherry"]');
    expect(appearing.opacity).toBeLessThan(1);
    expect(appearing.scale).toBe(1);
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="check-cherry"]')).opacity).toBe(
      1,
    );

    const leaving = recordMotion(
      page,
      { selector: '[data-testid="check-apple"]' },
      500,
    );
    await page.getByRole('option', { name: 'Multiple Apple' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('cherry');
    const recorded = await leaving;
    expect(recorded.some((f) => f.opacity > 0.03 && f.opacity < 0.95)).toBe(
      true,
    );
    expect(recorded.at(-1)!.opacity).toBe(0);
    await expect(page.getByTestId('multiple-popup')).toBeVisible();
  });

  test('animation="pop": a text check pops in and shrinks back out', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Popped' }).click();
    await page.waitForTimeout(650);
    const arriving = recordMotion(
      page,
      { selector: '[data-testid="pop-cherry"]' },
      600,
    );
    await page.getByRole('option', { name: 'Popped Cherry' }).click();
    await expect(page.getByTestId('popped-value')).toHaveText('apple,cherry');
    const shown = (await arriving).filter((f) => f.opacity > 0.02);
    expect(shown[0]!.scale).toBeLessThan(0.85);
    expect(Math.max(...shown.map((f) => f.scale))).toBeGreaterThan(1.02);
    expect(shown.at(-1)!.scale).toBe(1);
    expect(shown.at(-1)!.opacity).toBe(1);

    const leaving = recordMotion(
      page,
      { selector: '[data-testid="pop-apple"]' },
      400,
    );
    await page.getByRole('option', { name: 'Popped Apple' }).click();
    await expect(page.getByTestId('popped-value')).toHaveText('cherry');
    const out = await leaving;
    expect(out.some((f) => f.scale < 0.95 && f.opacity > 0.05)).toBe(true);
    expect(out.at(-1)!.opacity).toBe(0);
    await expect(page.getByTestId('popped-popup')).toBeVisible();
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.waitForTimeout(50);
    expect((await sample(page, '[data-testid="instant-popup"]')).opacity).toBe(
      1,
    );
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('instant-popup')).toBeHidden({
      timeout: 150,
    });
  });
});

test('base-ui select docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/base-ui/select', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Select');
  expect(errors).toEqual([]);
});

describeMenuHighlight('base-ui select highlight', {
  path: POPPER,
  open: async (page) => {
    await trigger(page).click();
    await page.waitForTimeout(400);
  },
  first: (page) => option(page, PLACEHOLDER),
  second: (page) => option(page, 'Apple'),
  keyboardNext: 'ArrowDown',
  highlightedOnOpen: true,
});

test.describe('base-ui select checks', () => {
  test.describe.configure({ timeout: 180_000 });
  for (const animation of ['draw', 'pop'] as const) {
    test(`opening and closing the list leaves its check at rest (${animation})`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await expectAtRestThrough(
        page,
        { items: '[role="option"]', label: PLACEHOLDER, indicator: CHECK },
        {
          open: () => trigger(page).click(),
          close: async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator(POPUP)).toBeHidden({ timeout: 1000 });
          },
        },
      );
    });
  }
});
