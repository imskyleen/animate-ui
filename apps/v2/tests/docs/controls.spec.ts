import fs from 'node:fs';
import path from 'node:path';

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
    // v1's counting spring lands about 4.5s after mount.
    await expect(number).toHaveText('2025', { timeout: 10_000 });
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
    await open(page, '/docs/primitives/radix-ui/checkbox');
    // shadcn/ui's second box: the one checked by default.
    const box = stage(page).getByRole('checkbox').nth(1);
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await toggle(page).click();
    const control = panel(page).getByRole('combobox', { name: 'checked' });
    await control.click();
    await page.getByRole('option', { name: 'indeterminate' }).click();
    await expect(box).toHaveAttribute('aria-checked', 'mixed');
    // `false` arrives as a boolean (the string "false" would be truthy).
    await control.click();
    await page.getByRole('option', { name: 'false' }).click();
    await expect(box).toHaveAttribute('aria-checked', 'false');
  });

  test('the checkAnimation control makes the checks pop', async ({ page }) => {
    await open(page, '/docs/primitives/radix-ui/checkbox');
    await toggle(page).click();
    await panel(page).getByRole('combobox', { name: 'checkAnimation' }).click();
    await page.getByRole('option', { name: 'pop' }).click();
    // Checking the first box, its icon's scale while it shows (sampled in
    // the page: the first frames go by too fast for a round trip).
    const scales = await stage(page)
      .getByRole('checkbox')
      .nth(0)
      .evaluate(async (box) => {
        (box as HTMLElement).click();
        const seen: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 700) {
          await new Promise(requestAnimationFrame);
          const icon = box.querySelector('svg');
          if (!icon || Number(getComputedStyle(icon).opacity) < 0.05) continue;
          const matrix =
            getComputedStyle(icon).transform.match(/matrix\(([^,]+)/);
          seen.push(matrix ? Number(matrix[1]) : 1);
        }
        return seen;
      });
    // From half its size, a little past it (a drawn check doesn't scale).
    expect(Math.min(...scales)).toBeLessThan(0.9);
    expect(Math.max(...scales)).toBeGreaterThan(1.02);
  });

  test('a preview can start the demo with other values, without its code', async ({
    page,
  }) => {
    await open(page, '/docs/primitives/radix-ui/checkbox');
    // The page's demo, then the same demo again under "Check animation".
    const frames = await page
      .locator('[data-slot="preview"]')
      .evaluateAll((previews) =>
        previews.map((preview) => ({
          code: Boolean(
            preview.parentElement?.querySelector('[data-slot="preview-code"]'),
          ),
          animation: preview
            .querySelector('button[role="combobox"][id$="checkAnimation"]')
            ?.textContent?.trim(),
        })),
      );
    expect(frames).toEqual([
      { code: true, animation: 'draw' },
      { code: false, animation: 'pop' },
    ]);
    // It pops: from half its size, a little past it.
    const scales = await page
      .locator('[data-slot="preview"]')
      .nth(1)
      .getByRole('checkbox')
      .nth(0)
      .evaluate(async (box) => {
        (box as HTMLElement).click();
        const seen: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 700) {
          await new Promise(requestAnimationFrame);
          const icon = box.querySelector('svg');
          if (!icon || Number(getComputedStyle(icon).opacity) < 0.05) continue;
          const matrix =
            getComputedStyle(icon).transform.match(/matrix\(([^,]+)/);
          seen.push(matrix ? Number(matrix[1]) : 1);
        }
        return seen;
      });
    expect(Math.min(...scales)).toBeLessThan(0.9);
    expect(Math.max(...scales)).toBeGreaterThan(1.02);
  });

  test('the same demo twice on a page: each label checks its own box', async ({
    page,
  }) => {
    await open(page, '/docs/primitives/react-aria/checkbox');
    const states = () =>
      page
        .locator('[data-slot="preview"]')
        .evaluateAll((previews) =>
          previews.map((preview) =>
            [...preview.querySelectorAll('input')].map(
              (input) => input.checked,
            ),
          ),
        );
    // shadcn/ui's demo: its second box checked, the third one disabled.
    expect(await states()).toEqual([
      [false, true, false, false],
      [false, true, false, false],
    ]);
    const second = page.locator('[data-slot="preview"]').nth(1);
    // A label wrapping its box.
    await second
      .getByText('You can enable or disable notifications at any time.')
      .click();
    expect(await states()).toEqual([
      [false, true, false, false],
      [false, true, false, true],
    ]);
    // A label pointing at its box by id (`htmlFor="terms-checkbox"`): the
    // demo's static ids are twice in the page, each preview keeps its own.
    await second.getByText('Accept terms and conditions').first().click();
    expect(await states()).toEqual([
      [false, true, false, false],
      [true, true, false, true],
    ]);
  });

  test('a switch changes the mode of a group', async ({ page }) => {
    await open(page, '/docs/primitives/radix-ui/toggle-group');
    const radios = stage(page).getByRole('radio', { name: /^Toggle/ });
    const buttons = stage(page).getByRole('button', { name: /^Toggle/ });
    // shadcn/ui's demo is type="multiple": toggle buttons.
    await expect(buttons).toHaveCount(3);
    await toggle(page).click();
    await panel(page).getByRole('switch', { name: 'multiple' }).click();
    // type="single": the toggle buttons become radios.
    await expect(buttons).toHaveCount(0);
    await expect(radios).toHaveCount(3);
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

// The same component gets the same controls in Radix UI, Base UI and React
// Aria, but for the features a library doesn't have.
const LIBS = ['radix-ui', 'base-ui', 'react-aria'] as const;
type Lib = (typeof LIBS)[number];

/** Controls of features only some libraries have. */
const ONLY: Record<string, Partial<Record<Lib, string[]>>> = {
  // Radix's single-mode `collapsible` (Base UI's and React Aria's always are).
  accordion: { 'radix-ui': ['collapsible'] },
  // Animate UI's `followCursor`, on the Radix UI and Base UI primitives.
  tooltip: { 'radix-ui': ['followCursor'], 'base-ui': ['followCursor'] },
  'hover-card': { 'radix-ui': ['followCursor'], 'base-ui': ['followCursor'] },
  // An item-aligned select: React Aria has none.
  select: { 'radix-ui': ['position'], 'base-ui': ['position'] },
};

const DEMOS = path.join(process.cwd(), 'demos');

/** A demo's control names, or null when the library has no such demo. */
function controlsOf(lib: Lib, name: string) {
  const file = path.join(DEMOS, lib, `${name}.tsx`);
  if (!fs.existsSync(file)) return null;
  const source = fs.readFileSync(file, 'utf8');
  const block = /export const controls\s*=\s*\{([\s\S]*?)\n\}/.exec(source);
  const names = block ? [...block[1]!.matchAll(/^ {4}(\w+):/gm)] : [];
  return names
    .map((match) => match[1]!)
    .filter((control) => !ONLY[name]?.[lib]?.includes(control))
    .sort();
}

test.describe('demo controls across libraries', () => {
  test('a component has the same controls in every library', () => {
    const names = new Set(
      LIBS.flatMap((lib) =>
        fs
          .readdirSync(path.join(DEMOS, lib))
          .filter((file) => file.endsWith('.tsx'))
          .map((file) => file.slice(0, -'.tsx'.length)),
      ),
    );
    for (const name of names) {
      const found = LIBS.map((lib) => ({
        lib,
        controls: controlsOf(lib, name),
      }));
      const present = found.filter((entry) => entry.controls !== null);
      for (const { lib, controls } of present.slice(1))
        expect(controls, `${name}: ${lib} vs ${present[0]!.lib}`).toEqual(
          present[0]!.controls,
        );
    }
  });

  test('React Aria: side and align place the popover', async ({ page }) => {
    await open(page, '/docs/primitives/react-aria/popover');
    await toggle(page).click();
    await panel(page).getByRole('combobox', { name: 'side' }).click();
    await page.getByRole('option', { name: 'top' }).click();
    await stage(page).getByRole('button', { name: 'Open popover' }).click();
    await expect(page.locator('[data-slot="popover-content"]')).toHaveAttribute(
      'data-placement',
      'top',
    );
  });

  test('React Aria: multiple keeps several items open', async ({ page }) => {
    await open(page, '/docs/primitives/react-aria/accordion');
    const trigger = (name: string) =>
      stage(page).getByRole('button', { name, exact: true });
    await toggle(page).click();
    await panel(page).getByRole('switch', { name: 'multiple' }).click();
    await trigger('What is your return policy?').click();
    await expect(trigger('What are your shipping options?')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(trigger('What is your return policy?')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
