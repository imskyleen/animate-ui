import { expect, test } from '@playwright/test';

import { disclosureDemoTests, gotoHydrated } from './disclosure-timeline';

disclosureDemoTests('radix-ui accordion demo', {
  url: '/tests/demos/radix-ui/accordion',
  panel: '[data-slot="accordion-content"]',
  closed: {
    trigger: 'How is it different from other libraries?',
    text: 'You keep your own components',
  },
  open: {
    trigger: 'What is Animate UI?',
    text: 'Animated drop-in primitives',
  },
  closedState: 'unmounted',
});

test.describe('radix-ui accordion demo, Radix behavior', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/demos/radix-ui/accordion');
  });

  test('keyboard toggles it like Radix', async ({ page }) => {
    await page.getByRole('button', { name: 'What is Animate UI?' }).focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('button', {
        name: 'How is it different from other libraries?',
      }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('the chevron turns with the panel: 400ms, same soft ease-out', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', {
      name: 'How is it different from other libraries?',
    });
    const icon = trigger.locator('svg');
    await expect(icon).toHaveCSS('transition-duration', '0.4s');
    await expect(icon).toHaveCSS(
      'transition-timing-function',
      'cubic-bezier(0.215, 0.61, 0.355, 1)',
    );
    // Sampled in the page from the click: intermediate angles, then 180°.
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
    await page.goto('/tests/fixtures/radix-ui-accordion', {
      waitUntil: 'networkidle',
    });
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
    // Still in the DOM, but collapsed and inert (no focus, no a11y tree).
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
    expect(await inert()).toBe(false);
  });
});
