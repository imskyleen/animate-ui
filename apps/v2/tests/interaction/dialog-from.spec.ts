import { expect, test, type Page } from '@playwright/test';

// Animate UI v1's `from` on every library's dialog content: it tips from that
// edge, around the Y axis for left and right (left: rotateY(20deg)), the X
// axis for top and bottom (bottom: rotateX(20deg)), scaled to 0.8. Read from
// the computed matrix: rotateY(a) puts -sin(a) in m13, rotateX(a) puts
// sin(a) in m23.

const LIBS = [
  ['radix', 'Radix'],
  ['base', 'Base'],
  ['aria', 'Aria'],
] as const;

/** The transform matrix of `selector` on its first frame in the DOM. */
async function probeMatrix(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as unknown as { __firstMatrix?: Promise<number[]> };
    w.__firstMatrix = new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const el = document.querySelector(sel);
        if (!el) return;
        observer.disconnect();
        requestAnimationFrame(() => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          resolve([m.m13, m.m23]);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }, selector);
  return async () => {
    const [m13, m23] = await page.evaluate(
      () =>
        (window as unknown as { __firstMatrix: Promise<number[]> })
          .__firstMatrix,
    );
    return { m13: m13!, m23: m23! };
  };
}

for (const [id, label] of LIBS) {
  test.describe(`${id} dialog from`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/dialog-from', {
        waitUntil: 'networkidle',
      });
    });

    test('from="left": tipped around the Y axis, its left edge back', async ({
      page,
    }) => {
      const first = await probeMatrix(page, `[data-testid="${id}-left"]`);
      await page.getByRole('button', { name: `${label} from left` }).click();
      const { m13, m23 } = await first();
      expect(m13).toBeLessThan(-0.15);
      expect(Math.abs(m23)).toBeLessThan(0.01);
    });

    test('from="bottom": tipped around the X axis, its bottom edge back', async ({
      page,
    }) => {
      const first = await probeMatrix(page, `[data-testid="${id}-bottom"]`);
      await page.getByRole('button', { name: `${label} from bottom` }).click();
      const { m13, m23 } = await first();
      expect(m23).toBeGreaterThan(0.15);
      expect(Math.abs(m13)).toBeLessThan(0.01);
    });
  });
}
