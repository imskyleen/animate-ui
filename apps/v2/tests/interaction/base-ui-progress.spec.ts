import { expect, test } from '../test';

import { describeProgressDemo, revealed } from './progress-helpers';
import { expectSpringPace, type Sample } from './spring-curves';
import {
  describeInFrench,
  hydratesCleanly,
  inBrowserLocale,
} from './hydration-locale';

const COUNT_SPRING = { stiffness: 300, damping: 35 };

describeProgressDemo('base-ui');

describeInFrench('base-ui progress', () => {
  test('the docs demo hydrates without a mismatch', async ({ page }) => {
    expect(
      await hydratesCleanly(
        page,
        '/tests/demos/base-ui/progress',
        '[role="progressbar"]',
      ),
    ).toEqual({ errors: [], kept: true });
  });

  test('its numbers hydrate in en-US, then show in French', async ({
    page,
  }) => {
    expect(
      await hydratesCleanly(
        page,
        '/tests/fixtures/base-ui-progress',
        '[role="progressbar"], [data-testid="value"]',
      ),
    ).toEqual({ errors: [], kept: true });
    const half = await inBrowserLocale(page, 0.5, { style: 'percent' });
    expect(half).not.toBe('50%');
    await expect(
      page.getByRole('progressbar', { name: 'Export' }),
    ).toHaveAttribute('aria-valuetext', half);
    await expect(page.getByTestId('value')).toHaveText(half);
  });
});

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
    await expect(page.getByTestId('value')).toHaveText('100%');
  });

  test("the Value counts to a new value on Counting Number's spring", async ({
    page,
  }) => {
    const value = page.getByTestId('value');
    await expect(value).toHaveText('50%');
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
    const between = new Set(
      shown.map(([, n]) => n).filter((n) => n > 52 && n < 98),
    );
    expect(between.size).toBeGreaterThan(5);
    expectSpringPace(shown, COUNT_SPRING, {
      from: 50,
      to: 100,
      a: 59.5,
      b: 89.5,
    });
  });

  test('with a format, a value past its max shows the max, as Base UI does', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Overflow' });
    await expect(bar).toHaveAttribute('aria-valuetext', '100');
    await page.waitForTimeout(1000);
    await expect(page.getByTestId('overflow-value')).toHaveText('100');
  });

  test('a value that was not a number counts to the next one', async ({
    page,
  }) => {
    const bar = page.getByRole('progressbar', { name: 'Ratio' });
    await expect(bar).not.toHaveAttribute('aria-valuenow');
    await page.getByRole('button', { name: 'Set 40' }).click();
    await expect(bar).toHaveAttribute('aria-valuenow', '40');
    await expect(page.getByTestId('ratio-value')).toHaveText('40%');
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

test('reduced motion: the value shows its new number at once, without counting', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/tests/fixtures/base-ui-progress', {
    waitUntil: 'networkidle',
  });
  const value = page.getByTestId('value');
  await expect(value).toHaveText('50%');
  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="value"]')!;
    const seen = new Set<string>();
    (window as unknown as { seen: Set<string> }).seen = seen;
    new MutationObserver(() => seen.add(el.textContent ?? '')).observe(el, {
      subtree: true,
      characterData: true,
      childList: true,
    });
  });
  await page.getByRole('button', { name: 'Complete' }).click();
  await expect(value).toHaveText('100%');
  await page.waitForTimeout(300);
  const seen = await page.evaluate(() => [
    ...(window as unknown as { seen: Set<string> }).seen,
  ]);
  expect(seen).toEqual(['100%']);
});
