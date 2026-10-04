import { expect, test, type Page } from '@playwright/test';

import { describeMenuHighlight } from './menu-highlight';
import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="menubar-content"]';

/** First frame of the menu content that contains `text`, once it mounts. */
async function probeMenu(page: Page, text: string) {
  await page.evaluate(
    ({ selector, text }) => {
      const w = window as unknown as { __menu?: Promise<unknown> };
      w.__menu = new Promise((resolve) => {
        const observer = new MutationObserver(() => {
          const el = [...document.querySelectorAll(selector)].find((node) =>
            node.textContent?.includes(text),
          );
          if (!el) return;
          observer.disconnect();
          requestAnimationFrame(() => {
            const cs = getComputedStyle(el);
            const match = cs.transform.match(/matrix\(([^,]+)/);
            resolve({
              opacity: Number(cs.opacity),
              scale: match ? Number(match[1]) : 1,
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    },
    { selector: CONTENT, text },
  );
  return () =>
    page.evaluate(
      () =>
        (window as unknown as { __menu: Promise<unknown> }).__menu as Promise<{
          opacity: number;
          scale: number;
        }>,
    );
}

test.describe('radix-ui menubar demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/menubar', {
      waitUntil: 'networkidle',
    });
  });

  test('opening the bar scales and fades the menu in', async ({ page }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('menuitem', { name: 'File' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    expect(first.origin.startsWith('0px 0px')).toBe(true);
    await page.waitForTimeout(400);
    expect((await sample(page, CONTENT)).opacity).toBe(1);
  });

  test('moving to another menu plays its entrance, like any menu', async ({
    page,
  }) => {
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.waitForTimeout(500);
    const firstFrame = await probeMenu(page, 'Cut');
    await page.getByRole('menuitem', { name: 'Edit' }).hover();
    const first = await firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    // The previous menu plays its exit, then unmounts.
    await expect(page.locator(CONTENT, { hasText: 'New window' })).toHaveCount(
      0,
      { timeout: 600 },
    );
  });

  test('arrow keys move between menus the same way', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'File' }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    const firstFrame = await probeMenu(page, 'Cut');
    await page.keyboard.press('ArrowRight');
    const first = await firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
  });

  test('closing the bar plays the exit, then unmounts', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, CONTENT)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 600 });
    // Focus is back on the trigger right away.
    await expect(
      page.locator('[data-slot="menubar-trigger"]').first(),
    ).toBeFocused();
  });

  test('reduced motion: it fades without scaling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('menuitem', { name: 'File' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
  });
});

test.describe('radix-ui menubar API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-menubar', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await expect(page.getByTestId('value')).toHaveText('none');
    await page.getByRole('menuitem', { name: 'Alpha' }).click();
    await expect(page.getByTestId('value')).toHaveText('alpha');
    await page.getByRole('menuitem', { name: 'Beta' }).hover();
    await expect(page.getByTestId('value')).toHaveText('beta');
    await expect(
      page.getByRole('menuitem', { name: 'Beta item' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('value')).toHaveText('none');
  });

  test('menus without a value, with the import * style', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'Star menu' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Star item' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Star item' })).toHaveCount(
      0,
      {
        timeout: 600,
      },
    );
  });
});

describeMenuHighlight('radix-ui menubar highlight', {
  path: '/tests/demos/radix-ui/menubar',
  open: async (page) => {
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.waitForTimeout(400);
  },
  first: (page) => page.getByRole('menuitem', { name: /New file/ }),
  second: (page) => page.getByRole('menuitem', { name: /New window/ }),
  keyboardNext: 'ArrowDown',
});
