import { expect, test } from '../test';

import { disclosureDemoTests, gotoHydrated } from './disclosure-timeline';

disclosureDemoTests('radix-ui accordion demo', {
  url: '/tests/demos/radix-ui/accordion',
  panel: '[data-slot="accordion-content"]',
  closed: {
    trigger: 'What is your return policy?',
    text: 'Returns accepted within 30 days',
  },
  open: {
    trigger: 'What are your shipping options?',
    text: 'We offer standard (5-7 days)',
  },
  closedState: 'unmounted',
});

test.describe('radix-ui accordion demo, Radix behavior', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/demos/radix-ui/accordion');
  });

  test('keyboard toggles it like Radix', async ({ page }) => {
    await page
      .getByRole('button', { name: 'What are your shipping options?' })
      .focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('button', { name: 'What is your return policy?' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('the chevron turns with the panel: 350ms, same soft ease-out', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', {
      name: 'What is your return policy?',
    });
    const icon = trigger.locator('svg');
    await expect(icon).toHaveCSS('transition-duration', '0.35s');
    await expect(icon).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.215, 0.61, 0.355, 1)',
    );
    const angles = await trigger.evaluate(async (button) => {
      const icon = button.querySelector('svg')!;
      const frames: string[] = [];
      (button as HTMLButtonElement).click();
      const start = performance.now();
      while (performance.now() - start < 500) {
        await new Promise((r) => requestAnimationFrame(r));
        frames.push(getComputedStyle(icon).rotate);
      }
      return frames;
    });
    expect(angles.at(-1)).toBe('180deg');
    expect(angles.some((a) => parseFloat(a) > 0 && parseFloat(a) < 180)).toBe(
      true,
    );
  });
});

test.describe('radix-ui accordion API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/fixtures/radix-ui-accordion');
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await page.getByRole('button', { name: 'Controlled b' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(page.getByText('Controlled content b')).toBeVisible();
    await expect(page.getByText('Controlled content a')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('multiple, with the import * style', async ({ page }) => {
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
    ).toBeVisible({
      timeout: 800,
    });
    await expect.poll(inert, { timeout: 800 }).toBe(false);
  });
});
