import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const VIEWPORT = '[data-slot="navigation-menu-viewport"]';

const size = (page: Page) =>
  page.locator(VIEWPORT).evaluate((el) => ({
    width: (el as HTMLElement).offsetWidth,
    height: (el as HTMLElement).offsetHeight,
  }));

test.describe('radix-ui navigation-menu demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/navigation-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('the viewport drops in with a scale and fade', async ({ page }) => {
    const probe = await probeFirstFrame(page, VIEWPORT);
    await page.getByRole('button', { name: 'Getting started' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    // From its top edge.
    expect(first.origin.endsWith(' 0px')).toBe(true);
    await page.waitForTimeout(650);
    const settled = await sample(page, VIEWPORT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('moving to another item resizes the viewport smoothly', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    const before = await size(page);
    await page.getByRole('button', { name: 'Primitives' }).hover();
    await page.waitForTimeout(80);
    const during = await size(page);
    await page.waitForTimeout(700);
    const after = await size(page);
    expect(after.width).toBeGreaterThan(before.width);
    // Part of the way there.
    expect(during.width).toBeGreaterThan(before.width);
    expect(during.width).toBeLessThan(after.width);
  });

  test('the new content comes in from its side', async ({ page }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(
      page,
      `${VIEWPORT} [data-motion="from-end"]`,
    );
    await page.getByRole('button', { name: 'Primitives' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
  });

  test('closes faster than it opens, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60);
    expect((await sample(page, VIEWPORT)).opacity).toBeLessThan(1);
    await expect(page.locator(VIEWPORT)).toHaveCount(0, { timeout: 450 });
  });

  test('reduced motion: no scale, the size jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, VIEWPORT);
    await page.getByRole('button', { name: 'Getting started' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Primitives' }).hover();
    await page.waitForTimeout(80);
    const during = await size(page);
    await page.waitForTimeout(400);
    expect(during.width).toBe((await size(page)).width);
  });
});

test.describe('radix-ui navigation-menu API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-navigation-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await expect(page.getByTestId('value')).toHaveText('none');
    await page.getByRole('button', { name: 'Controlled one' }).click();
    await expect(page.getByTestId('value')).toHaveText('one');
    await expect(page.getByRole('link', { name: 'Link one' })).toBeVisible();
    await page.getByRole('button', { name: 'Close it' }).click();
    await expect(page.getByTestId('value')).toHaveText('none');
    await expect(page.getByRole('link', { name: 'Link one' })).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('without a viewport, content scales in and out on its own', async ({
    page,
  }) => {
    const content = '[data-testid="inline"] [aria-labelledby]';
    const probe = await probeFirstFrame(page, `${content}[data-state="open"]`);
    await page.getByRole('button', { name: 'Inline' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeLessThan(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Inline' }).click();
    await expect(page.getByRole('link', { name: 'Inline link' })).toHaveCount(
      0,
      {
        timeout: 600,
      },
    );
  });

  test('the indicator follows the active trigger', async ({ page }) => {
    const indicator = page.getByTestId('indicator');
    await page.getByRole('button', { name: 'Star one' }).click();
    await expect(indicator).toHaveCount(1);
    await page.waitForTimeout(700);
    const x = () =>
      indicator.evaluate(
        (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
      );
    const start = await x();
    await page.getByRole('button', { name: 'Star two' }).click();
    await page.waitForTimeout(60);
    const during = await x();
    await page.waitForTimeout(800);
    const end = await x();
    expect(end).toBeGreaterThan(start);
    expect(during).toBeGreaterThan(start);
    expect(during).toBeLessThan(end);
  });
});
