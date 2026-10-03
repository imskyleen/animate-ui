import { expect, test, type Page } from '@playwright/test';

const height = (page: Page, text: string) =>
  page
    .locator('[role="region"]', { hasText: text })
    .evaluate((el) => el.getBoundingClientRect().height);

test.describe('radix-ui accordion demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/accordion', {
      waitUntil: 'networkidle',
    });
  });

  test('opens by growing its height, then settles', async ({ page }) => {
    await page
      .getByRole('button', {
        name: 'How is it different from other libraries?',
      })
      .click();
    await page.waitForTimeout(120);
    const mid = await height(page, 'You keep your own components');
    await page.waitForTimeout(700);
    const full = await height(page, 'You keep your own components');
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(full);
  });

  test('closes with an exit, then unmounts', async ({ page }) => {
    const region = page.locator('[role="region"]', {
      hasText: 'Animated drop-in primitives',
    });
    await page.getByRole('button', { name: 'What is Animate UI?' }).click();
    await page.waitForTimeout(80);
    await expect(region).toHaveCount(1);
    await expect(region).toHaveCount(0, { timeout: 600 });
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

  test('reduced motion: the height jumps, nothing slides', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page
      .getByRole('button', {
        name: 'How is it different from other libraries?',
      })
      .click();
    await page.waitForTimeout(40);
    const early = await height(page, 'You keep your own components');
    await page.waitForTimeout(700);
    expect(early).toBeCloseTo(
      await height(page, 'You keep your own components'),
      0,
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
