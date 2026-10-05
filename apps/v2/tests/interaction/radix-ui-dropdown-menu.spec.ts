import { expect, test } from '@playwright/test';

import { describeMenuHighlight, recordHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="dropdown-menu-content"]';
const SUB_CONTENT = '[data-slot="dropdown-menu-sub-content"]';

test.describe('radix-ui dropdown-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/dropdown-menu', {
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
    // align="start" below the trigger: it grows from its top-left corner.
    expect(first.origin.startsWith('0px 0px')).toBe(true);

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
    expect(leaving.scale).toBeGreaterThanOrEqual(0.899);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 600 });
  });

  test('Escape gives focus back to the trigger at once', async ({ page }) => {
    // By selector: Radix hides the page from assistive tech while a modal
    // menu is mounted, which includes its exit.
    const trigger = page.locator('[data-slot="dropdown-menu-trigger"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: /Profile/ })).toBeFocused();
    await page.keyboard.press('Escape');
    // Not 250ms later, when the exit ends: keys must not reach a leaving menu.
    await expect(trigger).toBeFocused({ timeout: 50 });
  });

  test('the highlight follows into a submenu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(500);
    const trigger = page.getByRole('menuitem', { name: 'Invite people' });
    await trigger.hover();
    await page.waitForTimeout(700);
    const from = (await trigger.boundingBox())!;
    const email = page.getByRole('menuitem', { name: 'Email' });
    const to = (await email.boundingBox())!;
    const frames = recordHighlight(page, 900);
    await email.hover();
    const lefts = (await frames)
      .map((f) => f.copies.at(-1)?.left)
      .filter((left): left is number => left !== undefined);
    // From the sub trigger in the menu to the item in the submenu.
    expect(lefts.some((left) => left > from.x + 2 && left < to.x - 2)).toBe(
      true,
    );
    expect(Math.abs(lefts.at(-1)! - to.x)).toBeLessThan(1);
    // The open sub trigger keeps no background of its own.
    expect(
      await trigger.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).toBe('rgba(0, 0, 0, 0)');
  });

  test('a submenu grows from its side', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(page, SUB_CONTENT);
    await page.getByRole('menuitem', { name: 'Invite people' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    // Opens on the right: anchored on its left edge.
    expect(first.origin.startsWith('0px')).toBe(true);
    await page.waitForTimeout(400);
    expect((await sample(page, SUB_CONTENT)).opacity).toBe(1);
  });

  test('checking an item pops its check in from half its size', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(500);
    // Click and sample in the page: the first frames go by too fast for a
    // round trip.
    const frames = await page.evaluate(async () => {
      const item = [
        ...document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'),
      ].find((el) => el.textContent?.includes('Activity panel'))!;
      item.click();
      const read = () => {
        const check = item.querySelector('[data-slot$="indicator"] > span')!;
        const cs = getComputedStyle(check);
        const match = cs.transform.match(/matrix\(([^,]+)/);
        return {
          opacity: Number(cs.opacity),
          scale: match ? Number(match[1]) : 1,
        };
      };
      const seen: { opacity: number; scale: number }[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 700) {
        await new Promise(requestAnimationFrame);
        seen.push(read());
      }
      return seen;
    });
    expect(frames[0]!.opacity).toBeLessThan(1);
    expect(frames[0]!.scale).toBeLessThan(0.75);
    // Motion's default spring for scale: a small overshoot (~1.04).
    expect(Math.max(...frames.map((f) => f.scale))).toBeGreaterThan(1.01);
    expect(frames.at(-1)).toEqual({ opacity: 1, scale: 1 });
  });

  test('choosing a radio item glides its indicator there', async ({ page }) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(500);
    const offsets = await page.evaluate(async () => {
      const item = [
        ...document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
      ].find((el) => el.textContent?.includes('Top'))!;
      item.click();
      const seen: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 150) {
        await new Promise(requestAnimationFrame);
        const indicator = item.querySelector('[data-slot$="indicator"] > span');
        if (!indicator) continue;
        const match = getComputedStyle(indicator).transform.match(
          /matrix\([^,]+,[^,]+,[^,]+,[^,]+,[^,]+,\s*([^)]+)\)/,
        );
        seen.push(match ? Number(match[1]) : 0);
      }
      return seen;
    });
    // It comes from the item below ("Bottom"), while the menu closes.
    expect(offsets.some((y) => y > 5)).toBe(true);
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
  test.describe.configure({ timeout: 180_000 });
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

describeMenuHighlight('radix-ui dropdown-menu highlight', {
  path: '/tests/demos/radix-ui/dropdown-menu',
  open: async (page) => {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('menuitem', { name: /Profile/ }),
  second: (page) => page.getByRole('menuitem', { name: /Billing/ }),
  keyboardNext: 'ArrowDown',
});
