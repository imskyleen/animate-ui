import { expect, test } from '../test';
import {
  describeAnchoredOverlay,
  describeToolbarTooltips,
  expectEntranceOnLoad,
  gotoReady,
} from './anchored-overlay';

const PATH = '/tests/vue-demos/reka-ui/tooltip';
const CONTENT = '[data-slot="tooltip-content"]';
const FIXTURE = '/tests/vue-demos/fixtures/reka-ui-tooltip';

describeAnchoredOverlay('vue-reka-ui tooltip demo', {
  path: PATH,
  selector: CONTENT,
  kind: 'tooltip',
  open: (page) => page.getByRole('button', { name: 'Hover' }).hover(),
  close: (page) => page.mouse.move(5, 5, { steps: 4 }),
});

describeToolbarTooltips(
  'vue-reka-ui toolbar tooltips',
  FIXTURE,
  '[data-testid="toolbar-content"]',
);

test.describe('vue-reka-ui tooltip API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, FIXTURE);
  });

  test('open and update:open', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).hover();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await page.mouse.move(5, 5, { steps: 4 });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 1500 });
    await page.getByRole('button', { name: 'Toggle from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('default-open plays its entrance on page load', async ({ page }) => {
    await expectEntranceOnLoad(
      page,
      FIXTURE,
      '[data-testid="default-open-content"]',
      'tooltip',
    );
  });

  test('force-mount keeps closed content mounted, hidden and inert', async ({
    page,
  }) => {
    const content = page.getByTestId('force-mount-content');
    const state = () =>
      content.evaluate((el) => ({
        inert: el.closest('[inert]') !== null,
        visibility: getComputedStyle(el).visibility,
      }));
    expect(await state()).toEqual({ inert: true, visibility: 'hidden' });
    await page.getByRole('button', { name: 'Force mounted trigger' }).hover();
    await expect(content).toBeVisible();
    expect(await state()).toEqual({ inert: false, visibility: 'visible' });
  });

  test('keyboard focus opens it, Escape closes it', async ({ page }) => {
    await page.getByRole('button', { name: 'Star trigger' }).focus();
    await expect(page.getByTestId('star-content')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('star-content')).toHaveCount(0, {
      timeout: 1500,
    });
  });
});

test('vue-reka-ui tooltip: hovered again while it leaves, it stays open', async ({
  page,
}) => {
  await gotoReady(page, FIXTURE);
  const trigger = page.getByRole('button', { name: 'Star trigger' });
  const content = page.getByTestId('star-content');
  await trigger.hover();
  await expect(content).toBeVisible();
  await page.waitForTimeout(600);
  await page.mouse.move(5, 5, { steps: 2 });
  await page.waitForTimeout(40);
  await trigger.hover();
  await page.waitForTimeout(700);
  await expect(trigger).toHaveAttribute('data-state', /open/);
  await expect(content).toHaveCSS('opacity', '1');
});
