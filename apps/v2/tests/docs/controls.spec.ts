import { expect, test, type Page } from '@playwright/test';

// The live controls of a demo (v1's tweakpane): a demo exporting `controls`
// gets a sliders button next to Replay, which opens a panel whose values are
// passed to the demo as props.

const open = (page: Page, url: string) =>
  page.goto(url, { waitUntil: 'networkidle' });

// The first demo of the page.
const preview = (page: Page) => page.locator('[data-slot="preview"]').first();
const stage = (page: Page) =>
  preview(page).locator('[data-slot="preview-stage"]');
const toggle = (page: Page) =>
  preview(page).getByRole('button', { name: 'Controls' });
const panel = (page: Page) =>
  preview(page).locator('[data-slot="preview-controls"]');
const width = async (page: Page) => (await panel(page).boundingBox())!.width;
const height = async (page: Page) => (await panel(page).boundingBox())!.height;

test.describe('demo controls', () => {
  test('the sliders button opens and closes the panel', async ({ page }) => {
    await open(page, '/docs/primitives/radix-ui/accordion');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    // Closed: no width, out of the tab order.
    expect(await width(page)).toBeLessThan(1);
    await expect(panel(page)).toHaveAttribute('inert', '');

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => width(page)).toBeCloseTo(250, 0);
    await expect(
      panel(page).getByRole('switch', { name: 'multiple' }),
    ).toBeVisible();
    await expect(
      panel(page).getByText('Accordion', { exact: true }),
    ).toBeVisible();

    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => width(page)).toBeLessThan(1);
  });

  test('on mobile it opens under the demo', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, '/docs/backgrounds/fireworks');
    expect(await height(page)).toBeLessThan(1);
    await toggle(page).click();
    await expect.poll(() => height(page)).toBeCloseTo(250, 0);
    const demo = (await stage(page).boundingBox())!;
    const box = (await panel(page).boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(demo.y + demo.height - 1);
    expect(box.width).toBeCloseTo(demo.width, 0);
  });

  test('a text field updates a text primitive live', async ({ page }) => {
    await open(page, '/docs/primitives/animate-ui/counting-number');
    // The visible digits (the screen reader copy holds the target at once).
    const number = stage(page).locator(
      '[data-slot="counting-number"] > [aria-hidden="true"]',
    );
    await expect(number).toHaveText('2025');
    await toggle(page).click();
    const field = panel(page).getByLabel('number', { exact: true });
    await field.fill('42');
    await expect(number).toHaveText('42');
  });

  test('a switch updates a background live', async ({ page }) => {
    await open(page, '/docs/backgrounds/bubble');
    const bubbles = stage(page).locator(
      '[data-slot="bubble-background"] .mix-blend-hard-light',
    );
    const interactive = await bubbles.count();
    await toggle(page).click();
    const control = panel(page).getByRole('switch', { name: 'interactive' });
    await expect(control).toBeChecked();
    await control.click();
    await expect(control).not.toBeChecked();
    // The pointer-following bubble is gone.
    await expect(bubbles).toHaveCount(interactive - 1);
  });

  test('a slider and its number field stay in sync', async ({ page }) => {
    await open(page, '/docs/backgrounds/fireworks');
    await toggle(page).click();
    const field = panel(page).getByLabel('population', { exact: true }).last();
    await expect(field).toHaveValue('1');
    await panel(page).getByRole('slider').focus();
    await page.keyboard.press('End');
    await expect(field).toHaveValue('10');
    await field.fill('2.5');
    await expect(panel(page).getByRole('slider')).toHaveAttribute(
      'aria-valuenow',
      '2.5',
    );
  });

  test('a select keeps the option type and updates the demo', async ({
    page,
  }) => {
    await open(page, '/docs/primitives/radix-ui/toggle-group');
    const radios = stage(page).getByRole('radio', { name: /^Align/ });
    const buttons = stage(page).getByRole('button', { name: /^Align/ });
    await expect(radios).toHaveCount(3);
    await toggle(page).click();
    await panel(page).getByRole('combobox', { name: 'type' }).click();
    await page.getByRole('option', { name: 'multiple' }).click();
    // type="multiple": the radios become toggle buttons.
    await expect(radios).toHaveCount(0);
    await expect(buttons).toHaveCount(3);
  });

  test('the code shown is the demo, without its controls', async ({ page }) => {
    await open(page, '/docs/backgrounds/fireworks');
    const code = page.locator('[data-slot="preview-code"]').first();
    await expect(code).toContainText('FireworksBackgroundDemo');
    await expect(code).not.toContainText('export const controls');
  });

  test('a demo without controls has no button and no panel', async ({
    page,
  }) => {
    await open(page, '/docs/primitives/radix-ui/progress');
    await expect(
      preview(page).getByRole('button', { name: 'Replay' }),
    ).toBeVisible();
    await expect(toggle(page)).toHaveCount(0);
    await expect(panel(page)).toHaveCount(0);
  });
});
