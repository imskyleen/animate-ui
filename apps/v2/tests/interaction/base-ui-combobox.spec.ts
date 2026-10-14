import { expect, test, type Page } from '../test';

import {
  describeChipMotion,
  expectChipLeaves,
  expectOneGo,
  expectPlaceholderComesIn,
  recordChips,
} from './chip-motion';
import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, recordMotion, sample } from './motion-probe';
import {
  expectAtRestThrough,
  expectPoppedIn,
  expectPoppedOut,
  recordCheck,
  withAnimation,
} from './item-checks';
import {
  expectCloseWithoutHold,
  expectEscapeWithoutHold,
  expectPickHold,
} from './pick-hold';

const POPUP = '[data-slot="combobox-content"]';
const CHECK = ':scope > span:not([data-slot="item-highlight"])';
const NAME = 'Select a framework';
const chipsInput = (page: Page) =>
  page.locator('[data-slot="combobox-chip-input"]');
const DEMO = '/tests/demos/base-ui/combobox';
const CHIPS_DEMO = '/tests/demos/base-ui/combobox-multiple';

const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

test.describe('base-ui combobox demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('opens with a 220ms scale and fade from the input', async ({ page }) => {
    await load(page, DEMO);
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: NAME }).click();
    await page.keyboard.press('ArrowDown');
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
    const input = page.getByRole('combobox', { name: NAME });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expect(page.getByRole('option')).toHaveCount(5);

    await input.pressSequentially('x');
    await expect(page.getByRole('option')).toHaveCount(3, { timeout: 100 });
    expect((await sample(page, '[role="option"]:first-child')).opacity).toBe(1);
    await expect(page.locator(POPUP)).toHaveCount(1);
  });

  for (const animation of ['draw', 'pop'] as const) {
    test(`a first choice holds the list while its check ${animation === 'draw' ? 'draws itself' : 'pops in'}, then closes`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      const input = page.getByRole('combobox', { name: NAME });
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
      await expectPickHold(page, {
        popup: POPUP,
        item: 'Astro',
        from: null,
        check: CHECK,
        animation,
        pick: () => page.getByRole('option', { name: 'Astro' }).click(),
      });
      await expect(page.locator(POPUP)).toBeHidden();
      await expect(input).toHaveValue('Astro');
    });

    test(`choosing another item holds the list while its check ${animation === 'draw' ? 'draws itself and the old one erases itself' : 'glides there'}`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      const input = page.getByRole('combobox', { name: NAME });
      const open = async () => {
        await input.click();
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(650);
      };
      await open();
      await page.getByRole('option', { name: 'Next.js' }).click();
      await expect(page.locator(POPUP)).toBeHidden({ timeout: 1000 });
      await open();
      await expectPickHold(page, {
        popup: POPUP,
        item: 'Astro',
        from: 'Next.js',
        check: CHECK,
        animation,
        pick: () => page.getByRole('option', { name: 'Astro' }).click(),
      });
      await expect(input).toHaveValue('Astro');
    });
  }

  test('choosing the chosen item again closes without waiting', async ({
    page,
  }) => {
    await load(page, DEMO);
    const input = page.getByRole('combobox', { name: NAME });
    const open = async () => {
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
    };
    await open();
    await page.getByRole('option', { name: 'Astro' }).click();
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 1000 });
    await open();
    await expectCloseWithoutHold(page, POPUP, () =>
      page.getByRole('option', { name: 'Astro' }).click(),
    );
    await expect(input).toHaveValue('Astro');
  });

  test('Escape closes it without waiting', async ({ page }) => {
    await load(page, DEMO);
    await page.getByRole('combobox', { name: NAME }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expectEscapeWithoutHold(page, POPUP);
  });

  test('keyboard: arrows move the highlight, Enter picks', async ({ page }) => {
    await load(page, DEMO);
    const input = page.getByRole('combobox', { name: NAME });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.keyboard.press('ArrowDown');
    const highlighted = page.locator('[role="option"][data-highlighted]');
    await expect(highlighted).toHaveCount(1);
    const name = await highlighted.textContent();
    await page.keyboard.press('Enter');
    await expect(page.locator(POPUP)).toBeHidden({ timeout: 600 });
    await expect(input).toHaveValue(name!.trim());
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await load(page, DEMO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('combobox', { name: NAME }).click();
    await page.keyboard.press('ArrowDown');
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui combobox chips demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('chips there on mount do not animate, added chips pop in', async ({
    page,
  }) => {
    await load(page, CHIPS_DEMO);
    const chip = (name: string) =>
      `[data-slot="combobox-chip"]:has-text("${name}")`;
    expect((await sample(page, chip('Next.js'))).opacity).toBe(1);

    await chipsInput(page).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const frames = recordMotion(
      page,
      { selector: '[data-slot="combobox-chip"]', text: 'Nuxt.js' },
      900,
    );
    await page.getByRole('option', { name: 'Nuxt.js' }).click();
    await expect(page.locator(POPUP)).toBeVisible();
    const recorded = await frames;
    expect(Math.min(...recorded.map((f) => f.opacity))).toBeLessThan(0.5);
    expect(Math.min(...recorded.map((f) => f.scale))).toBeLessThan(0.9);
    expect(recorded.at(-1)!.opacity).toBe(1);
  });

  test('checks draw themselves with the selection', async ({ page }) => {
    await load(page, CHIPS_DEMO);
    await chipsInput(page).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const nuxt = page.getByRole('option', { name: 'Nuxt.js' });
    const frames = recordMotion(
      page,
      {
        selector: '[role="option"]',
        text: 'Nuxt.js',
        child: ':scope > span:not([data-slot="item-highlight"]) path',
      },
      700,
    );
    await nuxt.click();
    const dashes = (await frames).map((f) => f.dash ?? 1);
    expect(Math.min(...dashes)).toBeLessThan(0.3);
    expect(dashes.some((d) => d > 0.3 && d < 0.9)).toBe(true);
    expect(dashes.at(-1)).toBe(1);
  });

  test('pop: checks pop in with the selection and shrink back out', async ({
    page,
  }) => {
    await load(page, withAnimation(CHIPS_DEMO, 'pop'));
    await chipsInput(page).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const nuxt = page.getByRole('option', { name: 'Nuxt.js' });
    const target = {
      items: '[role="option"]',
      label: 'Nuxt.js',
      indicator: CHECK,
    };
    const arriving = recordCheck(page, target);
    await nuxt.click();
    expectPoppedIn(await arriving);
    const leaving = recordCheck(page, target, 500);
    await nuxt.click();
    expectPoppedOut(await leaving);
    await expect(page.locator(POPUP)).toBeVisible();
  });
});

test.describe('base-ui combobox API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-combobox', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and value, with their callbacks', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Controlled' });
    await expect(input).toHaveValue('Banana');

    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(page.getByTestId('controlled-popup')).toBeVisible();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(page.getByTestId('completed')).toHaveText('true', {
      timeout: 1000,
    });

    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('Cherry');
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(page.getByTestId('controlled-popup')).toBeHidden({
      timeout: 600,
    });
    await expect(page.getByTestId('completed')).toHaveText('true,false');
    await expect(input).toHaveValue('Cherry');
  });

  test('multiple (barrel import): chips, checks and removal', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Multiple' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    expect((await sample(page, '[data-testid="check-Apple"]')).opacity).toBe(1);

    const chip = recordMotion(
      page,
      { selector: '[data-testid="chip-Grape"]' },
      900,
    );
    const check = recordMotion(
      page,
      { selector: '[data-testid="check-Grape"]' },
      900,
    );
    await page.getByRole('option', { name: 'Grape' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('Apple,Grape');
    expect(Math.min(...(await chip).map((f) => f.opacity))).toBeLessThan(1);
    expect(Math.min(...(await check).map((f) => f.opacity))).toBeLessThan(1);

    const leaving = recordMotion(
      page,
      { selector: '[data-testid="check-Apple"]' },
      500,
    );
    await page.getByRole('option', { name: 'Apple' }).click();
    await expect(page.getByTestId('multiple-value')).toHaveText('Grape');
    const out = await leaving;
    expect(out.some((f) => f.opacity > 0.03 && f.opacity < 0.95)).toBe(true);
    expect(out.at(-1)!.opacity).toBe(0);
    await expect(page.getByTestId('chip-Apple')).toHaveCount(0);
  });

  test('keepMounted keeps the closed popup in the DOM, hidden', async ({
    page,
  }) => {
    const popup = page.getByTestId('kept-popup');
    await expect(popup).toHaveCount(1);
    await expect(popup).toBeHidden();
    await page.getByRole('combobox', { name: 'Kept mounted' }).click();
    await page.keyboard.press('ArrowDown');
    await expect(popup).toBeVisible();
    await page.waitForTimeout(650);
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden({ timeout: 600 });
    await expect(popup).toHaveCount(1);
  });

  test('transition props replace the defaults', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Instant' }).click();
    await page.keyboard.press('ArrowDown');
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

test('base-ui combobox docs page renders without errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/base-ui/combobox', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Combobox');
  expect(errors).toEqual([]);
});

describeMenuHighlight('base-ui combobox highlight', {
  path: DEMO,
  open: async (page) => {
    await page.getByRole('combobox', { name: NAME }).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('option').nth(0),
  second: (page) => page.getByRole('option').nth(1),
});

describeChipMotion('base-ui combobox', {
  path: CHIPS_DEMO,
  first: 'Next.js',
  last: 'Next.js',
  add: 'Nuxt.js',
  more: ['SvelteKit', 'Nuxt.js', 'Remix', 'Astro'],
});

test.describe('base-ui combobox chips placeholder', () => {
  test.describe.configure({ timeout: 180_000 });

  const removeLast = async (page: Page, ms: number) => {
    await page.getByRole('button', { name: 'Remove Next.js' }).click();
    await expect(page.getByTestId('field-chip-Next.js')).toHaveCount(0);
    await page.waitForTimeout(650);
    return recordChips(page, {
      container: '[data-testid="field"]',
      next: '[data-testid="field-input"]',
      chip: { selector: '[data-testid="field-chip-Astro"]', text: 'Astro' },
      act: () => page.getByRole('button', { name: 'Remove Astro' }).click(),
      ms,
    });
  };

  test('the last chip removed: the input glides back in one go, its placeholder fades in once it is there', async ({
    page,
  }) => {
    await load(page, '/tests/fixtures/base-ui-combobox');
    const recording = await removeLast(page, 900);
    expectChipLeaves(recording);
    expectOneGo(recording);
    expectPlaceholderComesIn(recording);
  });

  test('reduced motion: the last chip removed, its placeholder only fades in', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await load(page, '/tests/fixtures/base-ui-combobox');
    const recording = await removeLast(page, 700);
    expectChipLeaves(recording, { reduce: true });
    expectPlaceholderComesIn(recording, { reduce: true });
  });
});

test.describe('base-ui combobox checks', () => {
  test.describe.configure({ timeout: 180_000 });
  for (const animation of ['draw', 'pop'] as const) {
    test(`opening and closing the list leaves its check at rest (${animation})`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      const input = page.getByRole('combobox', { name: NAME });
      const open = async () => {
        await input.click();
        await page.keyboard.press('ArrowDown');
      };
      await open();
      await page.waitForTimeout(650);
      await page.getByRole('option', { name: 'Next.js' }).click();
      await expect(page.locator(POPUP)).toBeHidden({ timeout: 1000 });
      await page.waitForTimeout(300);
      await expectAtRestThrough(
        page,
        { items: '[role="option"]', label: 'Next.js', indicator: CHECK },
        {
          open,
          close: async () => {
            await page.keyboard.press('Escape');
            await expect(page.locator(POPUP)).toBeHidden({ timeout: 1000 });
          },
        },
      );
    });
  }
});
