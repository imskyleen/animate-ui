import { expect, test } from '@playwright/test';

import { describeProgressDemo, revealed } from './progress-helpers';

describeProgressDemo('base-ui');

test.describe('base-ui progress API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-progress', {
      waitUntil: 'networkidle',
    });
  });

  test('value, min/max, Value and data attributes stay Base UI', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Export' });
    await expect(bar).toHaveAttribute('aria-valuenow', '30');
    await expect(bar).toHaveAttribute('data-progressing', '');
    await expect(page.getByTestId('value')).toHaveText('50%');
    expect(await revealed(page, '[data-testid="main-indicator"]')).toBeCloseTo(
      0.5,
      2,
    );
    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(bar).toHaveAttribute('data-complete', '');
    await expect
      .poll(() => revealed(page, '[data-testid="main-indicator"]'), {
        timeout: 3000,
      })
      .toBeGreaterThan(0.995);
    // The Value counted there (v1's counting value).
    await expect(page.getByTestId('value')).toHaveText('100%');
  });

  test('the Value counts to a new value', async ({ page }) => {
    const value = page.getByTestId('value');
    await expect(value).toHaveText('50%');
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="value"]')!;
      const w = window as unknown as { __texts: string[] };
      w.__texts = [];
      new MutationObserver(() => w.__texts.push(el.textContent ?? '')).observe(
        el,
        { childList: true, characterData: true, subtree: true },
      );
    });
    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(value).toHaveText('100%');
    const texts = await page.evaluate(
      () => (window as unknown as { __texts: string[] }).__texts,
    );
    // Through the numbers in between, not straight to 100%.
    const between = texts.filter((t) => {
      const n = parseFloat(t);
      return n > 52 && n < 98;
    });
    expect(between.length).toBeGreaterThan(5);
  });

  test('indeterminate: the indicator is left to the styles', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Loading' });
    await expect(bar).toHaveAttribute('data-indeterminate', '');
    const style = await page
      .getByTestId('indeterminate-indicator')
      .evaluate((el) => (el as HTMLElement).style.transform);
    expect(style).toBe('');
  });

  test('className and style functions still work', async ({ page }) => {
    const indicator = page.getByTestId('main-indicator');
    await expect(indicator).toHaveClass(/status-progressing/);
    await expect(indicator).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });
});
