import { expect, test } from '../test';

import { describeRadioGroupDemo, opacityOf } from './controls-helpers';
import { gotoVueMounted } from './disclosure-timeline';
import { describeCheckedOnMount } from './indicator-mount';

const FIXTURE = '/tests/vue-demos/fixtures/reka-ui-radio-group';

describeRadioGroupDemo('vue-reka-ui');

test.describe('vue reka-ui radio group API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, FIXTURE);
  });

  test('v-model, changed from both sides', async ({ page }) => {
    await page
      .getByRole('radio', { name: 'Controlled b', exact: true })
      .click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(page.getByTestId('controlled-indicator-b')).toBeVisible();
    await expect(page.getByTestId('controlled-indicator-a')).toHaveCount(0, {
      timeout: 1000,
    });
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(
      page.getByRole('radio', { name: 'Controlled a', exact: true }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('controlled-indicator-a')).toBeVisible();
  });

  test('force-mount keeps every indicator, unchecked dots hidden', async ({
    page,
  }) => {
    await expect(page.getByTestId('forced-indicator-2')).toHaveCount(1);
    expect(await opacityOf(page.getByTestId('forced-dot-2'))).toBe(0);
    await expect
      .poll(() => opacityOf(page.getByTestId('forced-dot-1')), {
        timeout: 1500,
      })
      .toBe(1);
    await page.getByRole('radio', { name: 'Forced 2', exact: true }).click();
    await expect
      .poll(() => opacityOf(page.getByTestId('forced-dot-2')), {
        timeout: 1500,
      })
      .toBe(1);
    await expect
      .poll(() => opacityOf(page.getByTestId('forced-dot-1')), {
        timeout: 1200,
      })
      .toBe(0);
    await expect(page.getByTestId('forced-indicator-1')).toHaveCount(1);
  });

  test('as-child renders your element', async ({ page }) => {
    const child = page.getByTestId('as-child').locator('span[role="radio"]');
    await expect(child).toHaveAttribute('data-state', 'checked');
  });
});

describeCheckedOnMount(
  'vue reka-ui radio group checked on mount',
  FIXTURE,
  'radio',
);
