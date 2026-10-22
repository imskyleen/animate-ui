import { expect, test } from '../test';

import { describeCheckboxDemo, opacityOf } from './controls-helpers';
import { gotoVueMounted } from './disclosure-timeline';
import { describeCheckedOnMount } from './indicator-mount';

const FIXTURE = '/tests/vue-demos/fixtures/reka-ui-checkbox';

describeCheckboxDemo('vue-reka-ui');

test.describe('vue reka-ui checkbox API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, FIXTURE);
  });

  test('v-model, indeterminate, and the indicator going away', async ({
    page,
  }) => {
    const box = page.getByRole('checkbox', { name: 'Controlled', exact: true });
    const indicator = page.getByTestId('controlled-indicator');
    await expect(indicator).toHaveCount(0);
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(indicator).toBeVisible();
    await page
      .getByRole('button', { name: 'Set indeterminate', exact: true })
      .click();
    await expect(box).toHaveAttribute('data-state', 'indeterminate');
    await expect(indicator).toHaveAttribute('data-state', 'indeterminate');
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await box.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await expect(indicator).toHaveCount(0, { timeout: 1000 });
  });

  test('an icon swapped while shown fades in, without the delay', async ({
    page,
  }) => {
    await page
      .getByRole('checkbox', { name: 'Controlled', exact: true })
      .click();
    await page.waitForTimeout(700);
    const frames = await page.evaluate(async () => {
      (
        [...document.querySelectorAll('button')].find(
          (b) => b.textContent?.trim() === 'Set indeterminate',
        ) as HTMLButtonElement
      ).click();
      const out: number[] = [];
      const start = performance.now();
      while (performance.now() - start < 500) {
        await new Promise((r) => requestAnimationFrame(r));
        const dash = document.querySelector('[data-testid="dash"]');
        if (dash) out.push(Number(getComputedStyle(dash).opacity));
      }
      return out;
    });
    expect(frames[0]).toBeLessThan(0.5);
    expect(frames.some((o) => o > 0.1 && o < 0.9)).toBe(true);
    expect(frames.at(-1)).toBe(1);
  });

  test('uncontrolled', async ({ page }) => {
    const box = page.getByRole('checkbox', {
      name: 'Uncontrolled',
      exact: true,
    });
    await expect(box).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('uncontrolled-indicator')).toBeVisible();
    await box.click();
    await expect(box).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByTestId('uncontrolled-indicator')).toHaveCount(0, {
      timeout: 1000,
    });
  });

  test('forceMount keeps the indicator, its check hidden', async ({ page }) => {
    const check = page.getByTestId('forced-check');
    await expect(page.getByTestId('forced-indicator')).toHaveCount(1);
    expect(await opacityOf(check)).toBe(0);
    await page
      .getByRole('checkbox', { name: 'Force mounted', exact: true })
      .click();
    await expect.poll(() => opacityOf(check), { timeout: 1500 }).toBe(1);
    await page
      .getByRole('checkbox', { name: 'Force mounted', exact: true })
      .click();
    await expect.poll(() => opacityOf(check), { timeout: 1200 }).toBe(0);
    await expect(page.getByTestId('forced-indicator')).toHaveCount(1);
  });

  test('inside a form: the hidden input follows', async ({ page }) => {
    const form = page.getByTestId('form');
    await form.getByRole('checkbox').click();
    await expect(form.locator('input[name="newsletter"]')).toBeChecked();
  });
});

describeCheckedOnMount(
  'vue reka-ui checkbox checked on mount',
  FIXTURE,
  'checkbox',
);

// Bug: the blue checkbox recolored its border at once, so its box showed full size around the fill still growing.
test('vue reka-ui checkbox demo: every box keeps its border color as it checks, the fill alone grows', async ({
  page,
}) => {
  await gotoVueMounted(page, '/tests/vue-demos/reka-ui/checkbox');
  for (const id of ['terms', 'toggle-2']) {
    const box = page.locator(`#${id}`);
    const border = () =>
      box.evaluate((el) => getComputedStyle(el).borderTopColor);
    if ((await box.getAttribute('data-state')) === 'checked') {
      await box.click();
      await expect(box).toHaveAttribute('data-state', 'unchecked');
      await page.waitForTimeout(400);
    }
    const unchecked = await border();
    await box.click();
    await expect(box).toHaveAttribute('data-state', 'checked');
    await page.waitForTimeout(400);
    expect(await border(), id).toBe(unchecked);
  }
  // The blue box's inside is opaque: the card turning blue doesn't tint it whole before its fill has grown.
  for (const scheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    const alpha = await page.locator('#toggle-2').evaluate((el) => {
      const color = getComputedStyle(el).backgroundColor;
      const match =
        color.match(/\/\s*([\d.]+)\)$/) ??
        color.match(/^rgba\(.*,\s*([\d.]+)\)$/);
      return match ? Number(match[1]) : 1;
    });
    expect(alpha, scheme).toBe(1);
  }
  await page.emulateMedia({ colorScheme: 'light' });
  // The card around the blue box changes color on the box's timing, so it doesn't flash over the fill.
  const timing = (selector: string, pseudo?: string) =>
    page
      .locator(selector)
      .evaluate(
        (el, pseudo) => getComputedStyle(el, pseudo).transitionDuration,
        pseudo,
      );
  const longest = (durations: string) =>
    Math.max(...durations.split(',').map((d) => parseFloat(d)));
  expect(longest(await timing('label:has(#toggle-2)'))).toBe(
    longest(await timing('#toggle-2', '::before')),
  );
});

// Bug: the dark blue fill faded in as it grew, so it was invisible until it had nearly grown: no scale to see.
test('vue reka-ui checkbox demo: the blue fill shows while it is still growing', async ({
  page,
}) => {
  await gotoVueMounted(page, '/tests/vue-demos/reka-ui/checkbox');
  const box = page.locator('#toggle-2');
  if ((await box.getAttribute('data-state')) === 'checked') {
    await box.click();
    await page.waitForTimeout(500);
  }
  const frames = box.evaluate(async (el) => {
    const seen: [number, number][] = [];
    const start = performance.now();
    while (performance.now() - start < 400) {
      await new Promise((r) => requestAnimationFrame(r));
      const before = getComputedStyle(el, '::before');
      seen.push([Number(before.scale), Number(before.opacity)]);
    }
    return seen;
  });
  await box.click();
  const seen = await frames;
  expect(seen.some(([scale, opacity]) => opacity > 0.8 && scale < 0.9)).toBe(
    true,
  );
});
