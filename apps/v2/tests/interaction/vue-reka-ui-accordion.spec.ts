import { expect, test } from '../test';

import { disclosureDemoTests, gotoVueMounted } from './disclosure-timeline';

const DEMO = '/tests/vue-demos/reka-ui/accordion';

disclosureDemoTests('vue reka-ui accordion demo', {
  url: DEMO,
  panel: '[data-slot="accordion-content"]',
  closed: {
    trigger: 'Shipping Details',
    text: 'We offer worldwide shipping',
  },
  open: {
    trigger: 'Product Information',
    text: 'Our flagship product combines',
  },
  closedState: 'unmounted',
  goto: gotoVueMounted,
});

test.describe('vue reka-ui accordion demo, reka-ui behavior', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, DEMO);
  });

  test('keyboard toggles it like reka-ui', async ({ page }) => {
    await page.getByRole('button', { name: 'Product Information' }).focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('button', { name: 'Shipping Details' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('the chevron turns with the panel: 350ms, same soft ease-out', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Shipping Details' });
    const icon = trigger.locator('svg');
    await expect(icon).toHaveCSS('transition-duration', '0.35s');
    await expect(icon).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.215, 0.61, 0.355, 1)',
    );
    await trigger.click();
    await expect(icon).toHaveCSS('rotate', '180deg');
  });
});

test.describe('vue reka-ui accordion API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, '/tests/vue-demos/fixtures/reka-ui-accordion');
  });

  test('v-model and the controlled value', async ({ page }) => {
    await page.getByRole('button', { name: 'Controlled b' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(page.getByText('Controlled content b')).toBeVisible();
    await expect(page.getByText('Controlled content a')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('multiple', async ({ page }) => {
    await page.getByRole('button', { name: 'Multiple y' }).click();
    await page.waitForTimeout(700);
    await expect(page.getByText('Multiple content x')).toBeVisible();
    await expect(page.getByText('Multiple content y')).toBeVisible();
  });

  test('forceMount keeps closed content out of reach', async ({ page }) => {
    const inert = () =>
      page
        .getByText('Hidden button')
        .evaluate((el) => el.closest('[inert]') !== null);
    expect(await inert()).toBe(true);
    await page.getByRole('button', { name: 'Force mounted' }).click();
    await expect(
      page.getByRole('button', { name: 'Hidden button' }),
    ).toBeVisible({ timeout: 800 });
    await expect.poll(inert, { timeout: 800 }).toBe(false);
  });
});
