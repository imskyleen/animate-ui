import { expect, test } from '@playwright/test';

import { describeProgressDemo, revealed } from './progress-helpers';
import { expectSpringPace, type Sample } from './spring-curves';

/** The Value's count: the bar's spring, so the number moves with the bar. */
const COUNT_SPRING = { stiffness: 100, damping: 30 };

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

  test("the Value counts to a new value on Counting Number's spring", async ({
    page,
  }) => {
    const value = page.getByTestId('value');
    await expect(value).toHaveText('50%');
    // The number shown, on every frame for 3.5s.
    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="value"]')!;
      const w = window as unknown as { __shown: Promise<Sample[]> };
      w.__shown = new Promise((resolve) => {
        const samples: Sample[] = [];
        const start = performance.now();
        const tick = () => {
          const now = performance.now();
          samples.push([now, parseFloat(el.textContent ?? '')]);
          if (now - start < 3500) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      });
    });
    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(value).toHaveText('100%');
    const shown = await page.evaluate(
      () => (window as unknown as { __shown: Promise<Sample[]> }).__shown,
    );
    // Through the numbers in between, not straight to 100%.
    const between = new Set(
      shown.map(([, n]) => n).filter((n) => n > 52 && n < 98),
    );
    expect(between.size).toBeGreaterThan(5);
    // On the spring: from 60% to 90% shown (59.5 and 89.5, rounded) in the
    // time it takes from 50 to 100.
    expectSpringPace(shown, COUNT_SPRING, {
      from: 50,
      to: 100,
      a: 59.5,
      b: 89.5,
    });
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
