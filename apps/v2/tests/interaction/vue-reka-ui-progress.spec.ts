import { expect, test } from '../test';

import { gotoVueMounted } from './disclosure-timeline';
import { describeProgressDemo, revealed } from './progress-helpers';

const FIXTURE = '/tests/vue-demos/fixtures/reka-ui-progress';

describeProgressDemo('vue reka-ui', {
  demo: '/tests/vue-demos/reka-ui/progress',
  fixture: FIXTURE,
  byWidth: false,
});

test.describe('vue reka-ui progress API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, FIXTURE);
  });

  test('value, max and data attributes stay reka-ui', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Main' });
    await expect(bar).toHaveAttribute('aria-valuenow', '25');
    await expect(bar).toHaveAttribute('aria-valuemax', '50');
    await expect(bar).toHaveAttribute('data-state', 'loading');
    await expect(page.getByTestId('main-indicator')).toHaveAttribute(
      'data-value',
      '25',
    );
    await page.getByRole('button', { name: 'Complete' }).click();
    await expect(bar).toHaveAttribute('data-state', 'complete');
    await expect
      .poll(() => revealed(page, '[data-testid="main-indicator"]'), {
        timeout: 3000,
      })
      .toBeGreaterThan(0.995);
  });

  test('indeterminate', async ({ page }) => {
    const bar = page.getByRole('progressbar', { name: 'Loading' });
    await expect(bar).toHaveAttribute('data-state', 'indeterminate');
    await expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  test('a custom transition is used', async ({ page }) => {
    await page.getByRole('button', { name: 'Complete' }).click();
    await page.waitForTimeout(300);
    const value = await revealed(page, '[data-testid="slow-indicator"]');
    expect(value).toBeGreaterThan(0.55);
    expect(value).toBeLessThan(0.75);
  });
});
