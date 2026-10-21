import { expect, test } from '../test';

import { describeToggleDemo } from './controls-helpers';
import { gotoVueMounted } from './disclosure-timeline';

describeToggleDemo('vue-reka-ui', { bookmark: false });

test.describe('vue reka-ui toggle API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, '/tests/vue-demos/fixtures/reka-ui-toggle');
  });

  test('v-model, changed from both sides', async ({ page }) => {
    const toggle = page.getByRole('button', {
      name: 'Controlled',
      exact: true,
    });
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(toggle).toHaveAttribute('data-state', 'on');
    await toggle.click();
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await page.getByRole('button', { name: 'Press it', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('uncontrolled', async ({ page }) => {
    const toggle = page.getByRole('button', {
      name: 'Uncontrolled',
      exact: true,
    });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('as-child renders your element', async ({ page }) => {
    const link = page.getByTestId('as-child').locator('a');
    await expect(link).toHaveAttribute('aria-pressed', 'false');
    await link.click();
    await expect(link).toHaveAttribute('aria-pressed', 'true');
  });
});
