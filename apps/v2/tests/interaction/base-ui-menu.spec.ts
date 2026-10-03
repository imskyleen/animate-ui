import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="dropdown-menu-content"]';
const SUB_CONTENT = '[data-slot="dropdown-menu-sub-content"]';

test.describe('base-ui menu demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/dropdown-menu', { waitUntil: 'networkidle' });
  });

  test('opens with a scale and fade from the trigger, then settles', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.95);
    // Below the trigger, aligned to its start: its top-left corner (Base UI
    // offsets the origin by the side offset).
    expect(first.origin).toMatch(/^0px -?\d/);

    await page.waitForTimeout(650);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes faster than it opens, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60);
    expect((await sample(page, CONTENT)).opacity).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 450 });
  });

  test('Escape gives focus back to the trigger at once', async ({ page }) => {
    const trigger = page.locator('[data-slot="dropdown-menu-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused({ timeout: 50 });
  });

  test('the keyboard moves the highlight instantly', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowDown');
    const highlighted = page.locator('[role="menuitem"]:focus');
    await expect(highlighted).toHaveCount(1);
    // Same frame: no transition on the highlight.
    expect(
      await highlighted.evaluate(
        (el) => getComputedStyle(el).transitionDuration,
      ),
    ).toBe('0s');
  });

  test('a submenu grows from its side', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(page, SUB_CONTENT);
    await page.getByRole('menuitem', { name: 'Invite people' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    // Opens on the right: anchored on its left edge.
    expect(first.origin).toMatch(/^-?0px/);
  });

  test('checking an item fades its check in', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(700);
    const opacities = await page.evaluate(async () => {
      const item = [
        ...document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'),
      ].find((el) => el.textContent?.includes('Activity panel'))!;
      item.click();
      const read = () =>
        Number(
          getComputedStyle(
            item.querySelector('[data-slot$="indicator"] > span')!,
          ).opacity,
        );
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const early = read();
      await new Promise((resolve) => setTimeout(resolve, 700));
      return { early, settled: read() };
    });
    expect(opacities.early).toBeLessThan(1);
    expect(opacities.settled).toBe(1);
  });

  test('reduced motion: it fades without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('base-ui menu API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open, onOpenChange and onOpenChangeComplete', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Controlled' }).click();
    await expect(page.getByTestId('open')).toHaveText('open');
    await page.getByRole('menuitem', { name: 'Controlled item' }).click();
    await expect(page.getByTestId('open')).toHaveText('closed');
    // Called once the exit has played and the popup unmounted.
    await expect(page.getByTestId('complete')).toHaveText('closed', {
      timeout: 600,
    });
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toHaveCount(0);
  });

  test('the parent can close it', async ({ page }) => {
    await page.getByRole('button', { name: 'Controlled' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toBeVisible();
    await page.getByTestId('close').dispatchEvent('click');
    await expect(page.getByTestId('open')).toHaveText('closed');
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toHaveCount(0, { timeout: 600 });
  });

  test('a user actionsRef still works', async ({ page }) => {
    await page.getByRole('button', { name: 'Controlled' }).click();
    await page.getByTestId('imperative-close').dispatchEvent('click');
    await expect(page.getByTestId('open')).toHaveText('closed');
  });

  test('keepMounted keeps the closed popup hidden in the DOM', async ({
    page,
  }) => {
    const item = page.getByText('Kept item');
    await expect(item).toHaveCount(1);
    await expect(item).toBeHidden();
    await page.getByRole('button', { name: 'Kept' }).click();
    await expect(item).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(item).toBeHidden({ timeout: 600 });
    await expect(item).toHaveCount(1);
  });

  test('radio group and checkbox items stay controlled', async ({ page }) => {
    await page.getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitemradio', { name: 'Large' }).click();
    await expect(page.getByTestId('size')).toHaveText('large');
    await page.getByRole('menuitemcheckbox', { name: 'Bold' }).click();
    await expect(page.getByTestId('bold')).toHaveText('true');
  });
});
