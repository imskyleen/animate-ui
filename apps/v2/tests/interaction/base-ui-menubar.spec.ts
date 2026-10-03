import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

const CONTENT = '[data-slot="menubar-content"]';

/** First frame of the menu content that contains `text`, once it mounts. */
async function probeMenu(page: Page, text: string) {
  await page.evaluate(
    ({ selector, text }) => {
      const w = window as unknown as { __menu?: Promise<unknown> };
      w.__menu = new Promise((resolve) => {
        const check = () => {
          const el = [...document.querySelectorAll(selector)].find((node) =>
            node.textContent?.includes(text),
          );
          if (!el) return false;
          requestAnimationFrame(() => {
            const cs = getComputedStyle(el);
            const match = cs.transform.match(/matrix\(([^,]+)/);
            resolve({
              opacity: Number(cs.opacity),
              scale: match ? Number(match[1]) : 1,
            });
          });
          return true;
        };
        const observer = new MutationObserver(() => {
          if (check()) observer.disconnect();
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

test.describe('base-ui menubar demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/menubar', {
      waitUntil: 'networkidle',
    });
  });

  test('opening the bar scales and fades the menu in', async ({ page }) => {
    const probe = await probeFirstFrame(page, CONTENT);
    await page.getByRole('menuitem', { name: 'File' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    await page.waitForTimeout(650);
    expect((await sample(page, CONTENT)).opacity).toBe(1);
  });

  test('moving to another menu is instant', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.waitForTimeout(700);
    const firstFrame = await probeMenu(page, 'Cut');
    await page.getByRole('menuitem', { name: 'Edit' }).hover();
    const first = await firstFrame();
    expect(first.opacity).toBe(1);
    expect(first.scale).toBe(1);
    await expect(page.locator(CONTENT, { hasText: 'New window' })).toHaveCount(
      0,
      { timeout: 150 },
    );
  });

  test('closing the bar plays the exit, then unmounts', async ({ page }) => {
    await page.getByRole('menuitem', { name: 'File' }).click();
    await page.waitForTimeout(700);
    await page.mouse.click(5, 5);
    await page.waitForTimeout(60);
    expect((await sample(page, CONTENT)).opacity).toBeLessThan(1);
    await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 450 });
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

test.describe('base-ui menubar API', () => {
  test('Menubar and Menu from Animate UI work together', async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-menubar', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('menuitem', { name: 'Alpha' }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Alpha item' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(
      page.getByRole('menuitem', { name: 'Beta item' }),
    ).toBeVisible();
    await expect(
      page.getByRole('menuitem', { name: 'Alpha item' }),
    ).toHaveCount(0, {
      timeout: 150,
    });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menuitem', { name: 'Beta item' })).toHaveCount(
      0,
      {
        timeout: 600,
      },
    );
  });
});
