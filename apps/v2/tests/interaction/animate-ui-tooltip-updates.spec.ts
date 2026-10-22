import { expect, test } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  test.beforeEach(async ({ page }) => {
    await page.goto(framework.fixture('tooltip-updates'), {
      waitUntil: 'networkidle',
    });
  });

  const tooltip = (page: import('@playwright/test').Page) =>
    page.locator('[data-slot=tooltip-content]');

  test(`${framework.name} an open tooltip shows its new content`, async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Copy link' }).hover();
    await expect(tooltip(page)).toHaveText('Copy');
    await page
      .getByRole('button', { name: 'Copy link' })
      .dispatchEvent('click');
    await expect(tooltip(page)).toHaveText('Copied!');
  });

  test(`${framework.name} a tooltip opened again shows its latest content`, async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Copy link' })
      .dispatchEvent('click');
    await page.getByRole('button', { name: 'Copy link' }).hover();
    await expect(tooltip(page)).toHaveText('Copied!');
  });

  test(`${framework.name} a tooltip closes when its trigger is removed`, async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Removable' }).focus();
    await expect(tooltip(page)).toHaveText('Removable tip');
    await page.keyboard.press('Delete');
    await expect(page.getByRole('button', { name: 'Removable' })).toHaveCount(
      0,
    );
    await expect(page.locator('[data-slot=tooltip-overlay]')).toHaveCount(0);
  });

  test(`${framework.name} with an onAnimationComplete of its own, the tooltip still unmounts`, async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Tracked' }).hover();
    await expect(tooltip(page)).toHaveText('Tracked tip');
    await page.mouse.move(0, 0);
    await expect(page.locator('[data-slot=tooltip-overlay]')).toHaveCount(0);
    await expect(page.getByTestId('completions')).not.toHaveText('0');
  });
}
