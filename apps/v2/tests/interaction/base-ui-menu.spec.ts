import { expect, test } from '@playwright/test';

import { describeMenuChecks } from './menu-checks';
import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="dropdown-menu-content"]';
const SUB_CONTENT = '[data-slot="dropdown-menu-sub-content"]';

test.describe('base-ui menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/dropdown-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('opens with a 250ms scale and fade from the trigger', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    // Below the trigger, aligned to its start: its top-left corner (Base UI
    // offsets the origin by the side offset).
    expect(first.origin).toMatch(/^0px -?\d/);

    await page.waitForTimeout(400);
    const settled = await sample(page, CONTENT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, CONTENT)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    const leaving = await sample(page, CONTENT);
    expect(leaving.scale).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 600 });
  });

  test('Escape gives focus back to the trigger at once', async ({ page }) => {
    const trigger = page.locator('[data-slot="dropdown-menu-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused({ timeout: 50 });
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

  test('checking an item pops its check in from half its size', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(500);
    const frames = await page.evaluate(async () => {
      const item = [
        ...document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'),
      ].find((el) => el.textContent?.includes('Activity panel'))!;
      item.click();
      const seen: { opacity: number; scale: number }[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 700) {
        await new Promise(requestAnimationFrame);
        const check = item.querySelector('[data-slot$="indicator"] > span');
        if (!check) continue;
        const cs = getComputedStyle(check);
        const match = cs.transform.match(/matrix\(([^,]+)/);
        seen.push({
          opacity: Number(cs.opacity),
          scale: match ? Number(match[1]) : 1,
        });
      }
      return seen;
    });
    expect(frames[0]!.opacity).toBeLessThan(1);
    expect(frames[0]!.scale).toBeLessThan(0.75);
    expect(Math.max(...frames.map((f) => f.scale))).toBeGreaterThan(1.01);
    expect(frames.at(-1)).toEqual({ opacity: 1, scale: 1 });
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
  test.describe.configure({ timeout: 180_000 });
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

describeMenuHighlight('base-ui menu highlight', {
  path: '/tests/demos/base-ui/dropdown-menu',
  open: async (page) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('menuitem', { name: /Profile/ }),
  second: (page) => page.getByRole('menuitem', { name: /Billing/ }),
  submenuTrigger: (page) =>
    page.getByRole('menuitem', { name: 'Invite people' }),
  submenuItem: (page) => page.getByRole('menuitem', { name: 'Email' }),
  keyboardNext: 'ArrowDown',
});

describeMenuChecks('base-ui menu checks', {
  path: '/tests/demos/base-ui/dropdown-menu',
  open: async (page) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
  },
  popup: '[data-slot="dropdown-menu-content"]',
  indicator: 'span[aria-hidden="true"]',
  checkbox: { checked: 'Status bar', unchecked: 'Activity panel' },
  radio: { from: 'Bottom', to: 'Right' },
  radioCloses: false,
});
