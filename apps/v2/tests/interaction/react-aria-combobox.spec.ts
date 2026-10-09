import { expect, test, type Page } from '@playwright/test';

import { describeChipMotion } from './chip-motion';
import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, recordMotion, sample } from './motion-probe';
import {
  expectAtRestThrough,
  expectPoppedIn,
  expectPoppedOut,
  recordCheck,
  withAnimation,
} from './item-checks';
import { expectPickHold } from './pick-hold';

const POPOVER = '[data-slot="combobox-content"]';
const DEMO = '/tests/demos/react-aria/combobox';
const CHIPS_DEMO = '/tests/demos/react-aria/combobox-multiple';

/** Loads a page, once per test: a loaded machine is slow to load one. */
const load = (page: Page, path: string) =>
  page.goto(path, { waitUntil: 'networkidle' });

test.describe('react-aria combobox demo', () => {
  test.describe.configure({ timeout: 180_000 });

  test('opens with a 250ms scale and fade from the input', async ({ page }) => {
    await load(page, DEMO);
    const probe = await probeFirstFrame(page, POPOVER);
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.scale).toBeLessThan(1);

    await page.waitForTimeout(650);
    const settled = await sample(page, POPOVER);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('filtering while typing is instant', async ({ page }) => {
    await load(page, DEMO);
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expect(page.getByRole('option')).toHaveCount(5);

    await input.pressSequentially('x');
    await expect(page.getByRole('option')).toHaveCount(3, { timeout: 100 });
    expect((await sample(page, '[role="option"]')).opacity).toBe(1);
    expect((await sample(page, POPOVER)).scale).toBe(1);
  });

  test('picking an item closes it the same way', async ({ page }) => {
    await load(page, DEMO);
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Astro' }).click();

    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, POPOVER)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
    await expect(input).toHaveValue('Astro');
  });

  for (const animation of ['draw', 'pop'] as const) {
    test(`a first choice holds the list while its check ${animation === 'draw' ? 'draws itself' : 'pops in'}, then closes`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      const input = page.getByRole('combobox', { name: 'Framework' });
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
      await expectPickHold(page, {
        popup: POPOVER,
        item: 'Astro',
        from: null,
        // The SelectionIndicator.
        check: ':scope > div',
        animation,
        pick: () => page.getByRole('option', { name: 'Astro' }).click(),
      });
      await expect(input).toHaveValue('Astro');
    });

    test(`choosing another item holds the list while its check ${animation === 'draw' ? 'draws itself and the old one erases itself' : 'glides there'}`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      const input = page.getByRole('combobox', { name: 'Framework' });
      const open = async () => {
        await input.click();
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(650);
      };
      await open();
      await page.getByRole('option', { name: 'Next.js' }).click();
      await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 1000 });
      await open();
      await expectPickHold(page, {
        popup: POPOVER,
        item: 'Astro',
        from: 'Next.js',
        // The SelectionIndicator.
        check: ':scope > div',
        animation,
        pick: () => page.getByRole('option', { name: 'Astro' }).click(),
      });
      await expect(input).toHaveValue('Astro');
    });
  }

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
    await load(page, DEMO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPOVER);
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('react-aria combobox chips demo', () => {
  test.describe.configure({ timeout: 180_000 });

  const chip = (name: string) =>
    `[data-slot="combobox-chip"]:has-text("${name}")`;

  test('tags there on mount do not animate, added tags pop in', async ({
    page,
  }) => {
    await load(page, CHIPS_DEMO);
    expect((await sample(page, chip('Next.js'))).opacity).toBe(1);

    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Nuxt.js' }).click();
    await page.waitForTimeout(40);
    const entering = await sample(page, chip('Nuxt.js'));
    // The pop itself is the TagGroup primitive's (its own spec checks it).
    expect(entering.opacity).toBeLessThan(1);
    expect(entering.scale).toBeLessThan(1);
    expect((await sample(page, chip('Next.js'))).opacity).toBe(1);
    await page.waitForTimeout(650);
    expect((await sample(page, chip('Nuxt.js'))).opacity).toBe(1);
  });

  test('the chips are named: their list, and each chip by its text, without accessibility warnings', async ({
    page,
  }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (
        message.type() === 'warning' &&
        /aria-label|aria-labelledby|visible label|textValue/.test(
          message.text(),
        )
      )
        warnings.push(message.text());
    });
    await load(page, CHIPS_DEMO);
    const chips = page.getByRole('grid', { name: 'Selected frameworks' });
    const named = (name: string) =>
      chips.getByRole('row', { name, exact: true });
    await expect(named('Next.js')).toHaveCount(1);
    // Added and removed, still named and quiet.
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Nuxt.js' }).click();
    // Closed: while the list is open, React Aria hides the rest of the page
    // from assistive tech.
    await page.keyboard.press('Escape');
    await expect(named('Nuxt.js')).toHaveCount(1);
    await page
      .locator(chip('Next.js'))
      .locator('[data-slot="combobox-chip-remove"]')
      .click();
    await expect(named('Next.js')).toHaveCount(0);
    await expect(named('Nuxt.js')).toHaveCount(1);
    expect(warnings).toEqual([]);
  });

  test('the check of a selected item draws itself, of a deselected one erases itself', async ({
    page,
  }) => {
    await load(page, CHIPS_DEMO);
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const nuxt = page.getByRole('option', { name: 'Nuxt.js' });
    // The check's stroke, like a checkbox's.
    const stroke = {
      selector: '[role="option"]',
      text: 'Nuxt.js',
      child: ':scope > div path',
    };
    const frames = recordMotion(page, stroke, 900);
    await nuxt.click();
    // Multiple selection: the list stays open.
    await expect(page.locator(POPOVER)).toBeVisible();
    const recorded = await frames;
    const dashes = recorded.map((f) => f.dash ?? 1);
    // From nothing, its stroke drawn on the way, to the whole check.
    expect(Math.min(...dashes)).toBeLessThan(0.3);
    expect(dashes.some((d) => d > 0.3 && d < 0.9)).toBe(true);
    expect(recorded.at(-1)!.dash).toBe(1);
    expect(recorded.at(-1)!.opacity).toBe(1);

    const leaving = recordMotion(page, stroke, 600);
    await nuxt.click();
    const out = await leaving;
    // Partly drawn on its way out, then erased (kept mounted).
    expect(
      out.some((f) => f.dash !== null && f.dash > 0.1 && f.dash < 0.9),
    ).toBe(true);
    expect(out.at(-1)!.opacity).toBe(0);
  });

  test('pop: the check of a selected item pops in, of a deselected one shrinks out', async ({
    page,
  }) => {
    await load(page, withAnimation(CHIPS_DEMO, 'pop'));
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const nuxt = page.getByRole('option', { name: 'Nuxt.js' });
    const target = {
      items: '[role="option"]',
      label: 'Nuxt.js',
      indicator: ':scope > div',
    };
    const arriving = recordCheck(page, target);
    await nuxt.click();
    expectPoppedIn(await arriving);
    const leaving = recordCheck(page, target, 500);
    await nuxt.click();
    expectPoppedOut(await leaving);
    // Multiple selection: the list stays open.
    await expect(page.locator(POPOVER)).toBeVisible();
  });

  test('reduced motion: added tags fade without scaling', async ({ page }) => {
    await load(page, CHIPS_DEMO);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Nuxt.js' }).click();
    await page.waitForTimeout(40);
    const entering = await sample(page, chip('Nuxt.js'));
    expect(entering.scale).toBe(1);
    expect(entering.opacity).toBeLessThan(1);
  });
});

test.describe('react-aria combobox API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-combobox', {
      waitUntil: 'networkidle',
    });
    // Hydrated: the Tag's ref has reached the user's.
    await expect(page.getByTestId('ref-tag')).toHaveText('div', {
      timeout: 15000,
    });
  });

  test('Tag keeps refs, className functions and removal', async ({ page }) => {
    await expect(page.getByTestId('ref-tag')).toHaveText('div');
    await expect(page.getByTestId('tag-apple')).toHaveClass('tag');
    expect((await sample(page, '[data-testid="tag-apple"]')).opacity).toBe(1);

    await page.getByRole('button', { name: 'Add cherry' }).click();
    await page.waitForTimeout(40);
    expect(
      (await sample(page, '[data-testid="tag-cherry"]')).opacity,
    ).toBeLessThan(1);
    // transition reaches the entrance.
    expect((await sample(page, '[data-testid="instant-cherry"]')).opacity).toBe(
      1,
    );

    await page.getByRole('button', { name: 'Remove Apple' }).click();
    await expect(page.getByTestId('tag-apple')).toHaveCount(0, {
      timeout: 50,
    });
  });

  test('ComboBox: controlled value, open callback, animated Popover', async ({
    page,
  }) => {
    const input = page.getByRole('combobox', { name: 'Fruit' });
    await expect(input).toHaveValue('Banana');
    await page.getByRole('button', { name: 'Show fruits' }).click();
    await expect(page.getByTestId('combobox-popover')).toBeVisible();
    await expect(page.getByTestId('combobox-open')).toHaveText('open');
    await page.getByRole('option', { name: 'Cherry' }).click();
    await expect(page.getByTestId('combobox-value')).toHaveText('cherry');
    await expect(page.getByTestId('combobox-open')).toHaveText('closed');
    await expect(page.getByTestId('combobox-popover')).toHaveCount(0, {
      timeout: 600,
    });
    await expect(input).toHaveValue('Cherry');
  });
});

test('react-aria combobox docs page renders without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  const response = await page.goto('/docs/primitives/react-aria/combobox', {
    waitUntil: 'networkidle',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Combobox');
  expect(errors).toEqual([]);
});

describeMenuHighlight('react-aria combobox highlight', {
  path: DEMO,
  open: async (page) => {
    // The button opens the list without focusing an item.
    await page.locator('[data-slot="input-group"] button').first().click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('option').nth(0),
  second: (page) => page.getByRole('option').nth(1),
  keyboardNext: 'ArrowDown',
});

describeChipMotion('react-aria combobox', {
  path: CHIPS_DEMO,
  label: 'Frameworks',
  // One chip on load, and no placeholder on the input.
  first: 'Next.js',
  last: 'Next.js',
  add: 'Nuxt.js',
  more: ['SvelteKit', 'Nuxt.js', 'Remix', 'Astro'],
});

// Only choosing animates a check: the list opening shows the chosen item's
// at rest, and closing leaves it as it is.
test.describe('react-aria combobox checks', () => {
  test.describe.configure({ timeout: 180_000 });
  for (const animation of ['draw', 'pop'] as const) {
    test(`opening and closing the list leaves its check at rest (${animation})`, async ({
      page,
    }) => {
      await load(page, withAnimation(DEMO, animation));
      const input = page.getByRole('combobox', { name: 'Framework' });
      const open = async () => {
        await input.click();
        await page.keyboard.press('ArrowDown');
      };
      await open();
      await page.waitForTimeout(650);
      await page.getByRole('option', { name: 'Next.js' }).click();
      await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 1000 });
      await page.waitForTimeout(300);
      await expectAtRestThrough(
        page,
        {
          items: '[role="option"]',
          label: 'Next.js',
          indicator: ':scope > div',
        },
        {
          open,
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
