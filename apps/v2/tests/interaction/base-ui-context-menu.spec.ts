import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="context-menu-content"]';

test.describe('base-ui context-menu demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/context-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('grows from the pointer, then settles', async ({ page }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByText('Right click here').click({ button: 'right' });
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    // Opens to the bottom right of the pointer: anchored near its top-left.
    const [x, y] = first.origin.split(' ').map(parseFloat);
    expect(Math.abs(x!)).toBeLessThan(8);
    expect(Math.abs(y!)).toBeLessThan(8);

    await page.waitForTimeout(650);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes faster than it opens, then unmounts', async ({ page }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60);
    expect((await sample(page, CONTENT)).opacity).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 450 });
  });

  test('the keyboard moves the highlight instantly', async ({ page }) => {
    await page.getByText('Right click here').click({ button: 'right' });
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowDown');
    const highlighted = page.locator('[role="menuitem"]:focus');
    await expect(highlighted).toHaveCount(1);
    expect(
      await highlighted.evaluate(
        (el) => getComputedStyle(el).transitionDuration,
      ),
    ).toBe('0s');
  });

  test('reduced motion: it fades without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByText('Right click here').click({ button: 'right' });
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui context-menu API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-context-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    await page.getByText('Controlled area').click({ button: 'right' });
    await expect(page.getByTestId('open')).toHaveText('open');
    await page.getByRole('menuitem', { name: 'Controlled item' }).click();
    await expect(page.getByTestId('open')).toHaveText('closed');
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toHaveCount(0, { timeout: 600 });
  });

  test('a submenu opens and closes with its parent', async ({ page }) => {
    await page.getByText('Controlled area').click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'More' }).hover();
    await expect(
      page.getByRole('menuitem', { name: 'Nested item' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('menuitem', { name: 'Nested item' }),
    ).toHaveCount(0, { timeout: 900 });
  });
});
