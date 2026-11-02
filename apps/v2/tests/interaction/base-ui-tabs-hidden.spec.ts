import { expect, test } from '../test';

import { INDICATOR } from './tabs-helpers';

// #190: a w-full list measured while hidden gave the indicator a NaN box
for (const id of ['unmounted', 'kept'])
  test(`base-ui tabs: closing the ${id} dialog they sit in keeps the highlight in place`, async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/base-ui-tabs-in-dialog', {
      waitUntil: 'networkidle',
    });
    for (let round = 0; round < 2; round++) {
      await page.getByRole('button', { name: `Open ${id}` }).click();
      await expect(page.getByRole('tab', { name: 'A' })).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
      await expect(page.getByRole('tab', { name: 'A' })).toBeHidden();
    }
  });

test('base-ui tabs: selected while the list is hidden, the indicator lands on the tab once shown', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/base-ui-tabs-hidden-list', {
    waitUntil: 'networkidle',
  });
  const indicator = page.locator(INDICATOR);
  await expect(indicator).toBeAttached();
  await page.getByRole('button', { name: 'Toggle' }).click();
  await page.getByRole('button', { name: 'Select b' }).click();
  await page.getByRole('button', { name: 'Toggle' }).click();
  await expect
    .poll(async () => {
      const [box, tab] = await Promise.all([
        indicator.boundingBox(),
        page.getByRole('tab', { name: 'B' }).boundingBox(),
      ]);
      return box && tab
        ? Math.abs(box.x - tab.x) + Math.abs(box.width - tab.width)
        : null;
    })
    .toBeLessThan(1);
});
