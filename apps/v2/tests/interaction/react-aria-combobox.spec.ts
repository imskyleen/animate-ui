import { expect, test } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, recordMotion, sample } from './motion-probe';

const POPOVER = '[data-slot="combobox-content"]';

test.describe('react-aria combobox demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/combobox', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 250ms scale and fade from the input', async ({ page }) => {
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
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await expect(page.getByRole('option')).toHaveCount(7);

    await input.pressSequentially('st');
    await expect(page.getByRole('option')).toHaveCount(3, { timeout: 100 });
    expect((await sample(page, '[role="option"]')).opacity).toBe(1);
    expect((await sample(page, POPOVER)).scale).toBe(1);
  });

  test('picking an item closes it the same way', async ({ page }) => {
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

  test('the check glides to the chosen item while the list closes', async ({
    page,
  }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    const open = async () => {
      await input.click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
    };
    await open();
    await page.getByRole('option', { name: 'Next.js' }).click();
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
    await open();
    // The SelectionIndicator: the item's only element child but the
    // highlight.
    const check = '[role="option"] > div';
    await expect(page.locator(check)).toHaveCount(1);
    const from = (await page.locator(check).boundingBox())!.y;
    const to =
      from +
      (await page.getByRole('option', { name: 'Astro' }).boundingBox())!.y -
      (await page.getByRole('option', { name: 'Next.js' }).boundingBox())!.y;

    const frames = page.evaluate(
      (selector) =>
        new Promise<number[]>((resolve) => {
          const tops: number[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = document.querySelector(selector);
            if (el) tops.push(el.getBoundingClientRect().top);
            if (performance.now() - t0 < 400) requestAnimationFrame(tick);
            else resolve(tops);
          };
          tick();
        }),
      check,
    );
    await page.getByRole('option', { name: 'Astro' }).click();
    // On its way from Next.js to Astro (the list shrinks a little as it
    // closes): one check moving, not one appearing.
    const between = (await frames).filter(
      (top) => top > from + 2 && top < to - 2,
    );
    expect(between.length).toBeGreaterThan(2);
    await expect(input).toHaveValue('Astro');
  });

  test('reduced motion: it fades, nothing scales', async ({ page }) => {
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
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/combobox-multiple', {
      waitUntil: 'networkidle',
    });
  });

  const chip = (name: string) =>
    `[data-slot="combobox-chip"]:has-text("${name}")`;

  test('tags there on mount do not animate, added tags pop in', async ({
    page,
  }) => {
    expect((await sample(page, chip('Astro'))).opacity).toBe(1);

    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Nuxt' }).click();
    await page.waitForTimeout(40);
    const entering = await sample(page, chip('Nuxt'));
    // The pop itself is the TagGroup primitive's (its own spec checks it).
    expect(entering.opacity).toBeLessThan(1);
    expect(entering.scale).toBeLessThan(1);
    expect((await sample(page, chip('Astro'))).opacity).toBe(1);
    await page.waitForTimeout(650);
    expect((await sample(page, chip('Nuxt'))).opacity).toBe(1);
  });

  test('the check of a selected item pops in, of a deselected one goes at once', async ({
    page,
  }) => {
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    const nuxt = page.getByRole('option', { name: 'Nuxt' });
    const check = nuxt.locator('> div');
    await expect(check).toHaveCount(0);
    const frames = recordMotion(
      page,
      { selector: '[role="option"]', text: 'Nuxt', child: ':scope > div' },
      900,
    );
    await nuxt.click();
    // Multiple selection: the list stays open.
    await expect(page.locator(POPOVER)).toBeVisible();
    const recorded = await frames;
    expect(recorded[0]!.opacity).toBeLessThan(1);
    // From half its size, like v1's checkbox check.
    expect(Math.min(...recorded.map((f) => f.scale))).toBeLessThan(0.9);
    expect(recorded.at(-1)!.opacity).toBe(1);

    await nuxt.click();
    await expect(check).toHaveCount(0, { timeout: 100 });
  });

  test('Backspace removes the last tag instantly', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Frameworks' }).press('Backspace');
    await expect(page.locator(chip('Astro'))).toHaveCount(0, { timeout: 50 });
    await expect(page.locator(chip('Next.js'))).toHaveCount(1);
  });

  test('reduced motion: added tags fade without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('combobox', { name: 'Frameworks' }).click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Nuxt' }).click();
    await page.waitForTimeout(40);
    const entering = await sample(page, chip('Nuxt'));
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
  path: '/tests/demos/react-aria/combobox',
  open: async (page) => {
    // The button opens the list without focusing an item.
    await page.locator('[data-slot="input-group"] button').first().click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('option').nth(0),
  second: (page) => page.getByRole('option').nth(1),
  keyboardNext: 'ArrowDown',
});
