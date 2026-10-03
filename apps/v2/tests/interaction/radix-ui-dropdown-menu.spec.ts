import { expect, test } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="dropdown-menu-content"]';
const SUB_CONTENT = '[data-slot="dropdown-menu-sub-content"]';

test.describe('radix-ui dropdown-menu demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/dropdown-menu', {
      waitUntil: 'networkidle',
    });
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
    // align="start" below the trigger: it grows from its top-left corner.
    expect(first.origin.startsWith('0px 0px')).toBe(true);

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
    const leaving = await sample(page, CONTENT);
    expect(leaving.opacity).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 450 });
  });

  test('Escape gives focus back to the trigger at once', async ({ page }) => {
    // By selector: Radix hides the page from assistive tech while a modal
    // menu is mounted, which includes its exit.
    const trigger = page.locator('[data-slot="dropdown-menu-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: /Profile/ })).toBeFocused();
    await page.keyboard.press('Escape');
    // Not 400ms later, when the exit ends: keys must not reach a leaving menu.
    await expect(trigger).toBeFocused({ timeout: 50 });
  });

  test('the keyboard moves the highlight instantly', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    await page.keyboard.press('ArrowDown');
    const billing = page.getByRole('menuitem', { name: /Billing/ });
    await expect(billing).toBeFocused();
    // Same frame: no transition on the highlight.
    const transition = await billing.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    expect(transition).toBe('0s');
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
    expect(first.origin.startsWith('0px')).toBe(true);
    await page.waitForTimeout(450);
    expect((await sample(page, SUB_CONTENT)).opacity).toBe(1);
  });

  test('checking an item fades its check in', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(700);
    // Click and sample in the page: the first frames go by too fast for a
    // round trip.
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

test.describe('radix-ui dropdown-menu API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-dropdown-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await page.getByRole('button', { name: 'Controlled' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toBeVisible();
    await page.getByRole('menuitem', { name: 'Controlled item' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(
      page.getByRole('menuitem', { name: 'Controlled item' }),
    ).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('the parent can close it', async ({ page }) => {
    await page.getByRole('button', { name: 'Controlled' }).click();
    await page.getByRole('button', { name: 'Close from outside' }).click({
      force: true,
    });
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
  });

  test('uncontrolled defaultOpen, with the import * style', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Show star menu' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Star item' }),
    ).toBeVisible();
  });

  test('forceMount keeps closed content hidden in the DOM', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Show force-mounted menu' }).click();
    const item = page.getByText('Kept item');
    await expect(item).toHaveCount(1);
    await expect(item).toBeHidden();
    // From the keyboard: a closed force-mounted menu is still a dismissable
    // layer, so Radix takes a pointer down on the trigger for an outside one.
    await page.getByRole('button', { name: 'Force mounted' }).focus();
    await page.keyboard.press('Enter');
    await expect(item).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(item).toBeHidden({ timeout: 600 });
    await expect(item).toHaveCount(1);
  });

  test('radio group and checkbox items stay controlled', async ({ page }) => {
    await page.getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitemradio', { name: 'Large' }).click();
    await expect(page.getByTestId('size')).toHaveText('large');
    await page.getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitemcheckbox', { name: 'Bold' }).click();
    await expect(page.getByTestId('bold')).toHaveText('true');
  });
});
