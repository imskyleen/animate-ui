import { expect, test, type Page } from '../test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';
import { expectAtRestThrough, withAnimation } from './item-checks';
import {
  expectCloseWithoutHold,
  expectEscapeWithoutHold,
  expectPickHold,
} from './pick-hold';

const POPUP = '[data-slot="combobox-list"]';
const CHECK = ':scope > [data-slot="combobox-item-indicator"]';
const DEMO = '/tests/vue-demos/reka-ui/combobox';

const trigger = (page: Page) =>
  page.locator('[data-slot="combobox"] button').first();
const option = (page: Page, name: string) =>
  page.getByRole('option', { name, exact: true });

const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

async function open(page: Page) {
  await trigger(page).click();
  await page.waitForTimeout(650);
}

test.describe('vue-reka-ui combobox demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('opens with a 220ms scale and fade from the trigger', async ({
    page,
  }) => {
    await load(page, DEMO);
    const probe = await probeFirstFrame(page, POPUP);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);
    expect(parseFloat(first.origin.split(' ')[1]!)).toBeLessThanOrEqual(0);

    await page.waitForTimeout(650);
    const settled = await sample(page, POPUP);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('filtering while typing is instant', async ({ page }) => {
    await load(page, DEMO);
    await open(page);
    await expect(page.getByRole('option')).toHaveCount(5);
    await page.keyboard.type('x');
    await expect(page.getByRole('option')).toHaveCount(3, { timeout: 100 });
    expect((await sample(page, '[role="option"]')).opacity).toBe(1);
    await expect(page.locator(POPUP)).toHaveCount(1);
  });

  for (const animation of ['draw', 'pop'] as const) {
    test(`a first choice holds the list while its check ${animation === 'draw' ? 'draws itself' : 'pops in'}, then closes`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await open(page);
      await expectPickHold(page, {
        popup: POPUP,
        item: 'Astro',
        from: null,
        check: CHECK,
        animation,
        pick: () => option(page, 'Astro').click(),
      });
      await expect(page.locator(POPUP)).toHaveCount(0);
      await expect(trigger(page)).toHaveText('Astro');
    });

    test(`choosing another item holds the list while its check ${animation === 'draw' ? 'draws itself and the old one erases itself' : 'glides there'}`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await open(page);
      await option(page, 'Next.js').click();
      await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 1000 });
      await open(page);
      await expectPickHold(page, {
        popup: POPUP,
        item: 'Astro',
        from: 'Next.js',
        check: CHECK,
        animation,
        pick: () => option(page, 'Astro').click(),
      });
      await expect(trigger(page)).toHaveText('Astro');
    });
  }

  test('choosing the chosen item again closes without waiting', async ({
    page,
  }) => {
    await load(page, DEMO);
    await open(page);
    await option(page, 'Astro').click();
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 1000 });
    await open(page);
    await expectCloseWithoutHold(page, POPUP, () =>
      option(page, 'Astro').click(),
    );
    await expect(trigger(page)).toHaveText('Astro');
  });

  test('Escape closes it without waiting', async ({ page }) => {
    await load(page, DEMO);
    await open(page);
    await expectEscapeWithoutHold(page, POPUP);
  });

  test('keyboard: arrows move the highlight, Enter picks', async ({ page }) => {
    await load(page, DEMO);
    await open(page);
    await page.keyboard.press('ArrowDown');
    const highlighted = page.locator('[role="option"][data-highlighted]');
    await expect(highlighted).toHaveCount(1);
    const name = (await highlighted.textContent())!.trim();
    await page.keyboard.press('Enter');
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 1000 });
    await expect(trigger(page)).toHaveText(name);
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await load(page, DEMO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPUP);
    await trigger(page).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('vue-reka-ui combobox API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await load(page, '/tests/vue-demos/fixtures/reka-ui-combobox');
  });

  test('v-model:open, v-model and their events', async ({ page }) => {
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-content')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await option(page, 'Controlled Cherry').click();
    await expect(page.getByTestId('controlled-value')).toHaveText('cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-content')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('multiple: picks stay open, each check draws itself', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Multiple' }).click();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByTestId('multiple-content')).toBeVisible();
    await page.waitForTimeout(400);
    await option(page, 'Many Cherry').click();
    await expect(page.getByTestId('multiple-value')).toHaveText('apple,cherry');
    await page.waitForTimeout(600);
    await expect(page.getByTestId('multiple-content')).toBeVisible();
    const check = option(page, 'Many Cherry').locator('svg path');
    await expect
      .poll(() =>
        check.evaluate((el) => Number(getComputedStyle(el).opacity)),
      )
      .toBe(1);
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(50);
    expect((await sample(page, '[data-testid="instant-content"]')).opacity).toBe(
      1,
    );
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('instant-content')).toHaveCount(0, {
      timeout: 150,
    });
  });
});

describeMenuHighlight('vue-reka-ui combobox highlight', {
  path: DEMO,
  open: async (page) => {
    await trigger(page).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('option').nth(0),
  second: (page) => page.getByRole('option').nth(1),
  highlightedOnOpen: true,
});

test.describe('vue-reka-ui combobox checks', () => {
  test.describe.configure({ timeout: 180_000 });
  for (const animation of ['draw', 'pop'] as const) {
    test(`opening and closing the list leaves its check at rest (${animation})`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      await open(page);
      await option(page, 'Next.js').click();
      await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 1000 });
      await page.waitForTimeout(300);
      await expectAtRestThrough(
        page,
        { items: '[role="option"]', label: 'Next.js', indicator: CHECK },
        {
          open: () => trigger(page).click(),
          close: async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 1000 });
          },
        },
      );
    });
  }
});
