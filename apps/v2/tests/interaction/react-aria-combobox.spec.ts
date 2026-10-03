import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const POPOVER = '[data-slot="combobox-content"]';

test.describe('react-aria combobox demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/react-aria/combobox', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a scale and a fade from the input, then settles', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, POPOVER);
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await page.keyboard.press('ArrowDown');
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
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

  test('picking an item closes it faster than it opened', async ({ page }) => {
    const input = page.getByRole('combobox', { name: 'Framework' });
    await input.click();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(650);
    await page.getByRole('option', { name: 'Astro' }).click();

    await page.waitForTimeout(60);
    expect((await sample(page, POPOVER)).opacity).toBeLessThan(1);
    await expect(page.locator(POPOVER)).toHaveCount(0, { timeout: 600 });
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
    expect(entering.opacity).toBeLessThan(1);
    expect(entering.scale).toBeLessThan(1);
    expect(entering.scale).toBeGreaterThanOrEqual(0.95);
    expect((await sample(page, chip('Astro'))).opacity).toBe(1);
    await page.waitForTimeout(650);
    expect((await sample(page, chip('Nuxt'))).opacity).toBe(1);
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
