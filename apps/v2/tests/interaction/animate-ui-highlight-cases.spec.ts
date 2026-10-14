import { expect, test } from '../test';

import { gotoHydrated } from './disclosure-timeline';

const HIGHLIGHT = '[data-slot="motion-highlight"]';

test.beforeEach(async ({ page }) => {
  await gotoHydrated(page, '/tests/fixtures/animate-ui-highlight-cases');
});

test('disabled hides the highlight in children mode', async ({ page }) => {
  await page.getByRole('button', { name: 'Disabled B', exact: true }).click();
  await page.waitForTimeout(300);
  await expect(
    page.getByTestId('disabled-children').locator(HIGHLIGHT),
  ).toHaveCount(0);
});

test('disabled hides the highlight in parent mode', async ({ page }) => {
  await page.getByRole('button', { name: 'Parent disabled B' }).click();
  await page.waitForTimeout(300);
  await expect(
    page.getByTestId('disabled-parent').locator(HIGHLIGHT),
  ).toHaveCount(0);
});

test('item and child handlers each run once', async ({ page }) => {
  await page.getByRole('button', { name: 'Handlers' }).click();
  await expect(page.getByTestId('log')).toHaveText('child click,item click');
});

test('the child keeps its own style', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Handlers' })).toHaveCSS(
    'color',
    'rgb(255, 0, 0)',
  );
});

test('asChild keeps the child ref', async ({ page }) => {
  await expect(page.getByTestId('ref')).toHaveText('BUTTON');
});

test('parent mode follows the item when it resizes', async ({ page }) => {
  const highlight = page.getByTestId('resize').locator(HIGHLIGHT);
  await expect
    .poll(() => highlight.evaluate((el) => el.getBoundingClientRect().width))
    .toBeCloseTo(120, 0);
  await page.getByRole('button', { name: 'Widen' }).click();
  await expect
    .poll(() => highlight.evaluate((el) => el.getBoundingClientRect().width))
    .toBeCloseTo(240, 0);
});
