import { expect, test } from '../test';

import { gotoVueMounted } from './disclosure-timeline';
import { describeToggleGroup } from './toggle-group-helpers';

describeToggleGroup('vue-reka-ui');

test.describe('vue reka-ui toggle group API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(
      page,
      '/tests/vue-demos/fixtures/reka-ui-toggle-group',
    );
  });

  test('v-model on a single group, changed from both sides', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Controlled b', exact: true })
      .click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(
      page.getByRole('button', { name: 'Controlled b', exact: true }),
    ).toHaveAttribute('data-state', 'on');
    await page.getByRole('button', { name: 'Select a', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Controlled a', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('multiple, uncontrolled', async ({ page }) => {
    await page.getByRole('button', { name: 'Multiple y', exact: true }).click();
    for (const name of ['Multiple x', 'Multiple y'])
      await expect(
        page.getByRole('button', { name, exact: true }),
      ).toHaveAttribute('aria-pressed', 'true');
  });
});
