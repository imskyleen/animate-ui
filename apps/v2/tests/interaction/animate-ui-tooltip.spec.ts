import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="tooltip-content"]';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/tooltip', { waitUntil: 'networkidle' });

const trigger = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

const contentX = (page: Page) =>
  page
    .locator(CONTENT)
    .evaluate((el) => el.getBoundingClientRect().left + (el as HTMLElement).offsetWidth / 2);

test.describe('animate-ui tooltip', () => {
  test('opens on hover after the delay, described by the trigger', async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(CONTENT)).toHaveCount(0);
    await trigger(page, 'Bold').hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Bold');
    const id = await tooltip.getAttribute('id');
    expect(id).toBeTruthy();
    await expect(trigger(page, 'Bold')).toHaveAttribute(
      'aria-describedby',
      id!,
    );
    await expect(trigger(page, 'Bold')).toHaveAttribute('data-state', 'open');
  });

  test('enters from 0.95 (never 0) and settles', async ({ page }) => {
    await open(page);
    const probe = await probeFirstFrame(page, CONTENT);
    await trigger(page, 'Bold').hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    expect(first.scale).toBeLessThan(1);

    await page.waitForTimeout(900);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBeCloseTo(1, 2);
  });

  test('moving to the next trigger glides the same popup', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.getByRole('tooltip')).toContainText('Bold');
    await page.waitForTimeout(800);
    const from = await contentX(page);

    await trigger(page, 'Insert link').hover();
    await expect(page.getByRole('tooltip')).toContainText('Insert link');
    // One popup all along: it moved instead of closing and reopening.
    await expect(page.locator(CONTENT)).toHaveCount(1);
    await expect(page.locator(CONTENT)).toHaveAttribute('data-state', 'open');
    await page.waitForTimeout(800);
    const to = await contentX(page);
    expect(to - from).toBeGreaterThan(100);
  });

  test('closes after the pointer leaves, and with Escape', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(page.locator(CONTENT)).toHaveCount(0);
    await expect(trigger(page, 'Bold')).toHaveAttribute('data-state', 'closed');

    await trigger(page, 'Italic').hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(CONTENT)).toHaveCount(0);
  });

  test('opens on keyboard focus', async ({ page }) => {
    await open(page);
    await trigger(page, 'Underline').focus();
    await expect(page.getByRole('tooltip')).toContainText('Underline');
  });

  test('reduced motion: no scaling, still fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const probe = await probeFirstFrame(page, CONTENT);
    await trigger(page, 'Bold').hover();
    const first = await probe.firstFrame();
    expect(first.scale).toBeCloseTo(1, 3);
    expect(first.opacity).toBeLessThan(1);
  });
});
