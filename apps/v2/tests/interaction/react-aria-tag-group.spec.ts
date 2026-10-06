import { expect, test, type Page } from '@playwright/test';

import {
  expectChipLeaves,
  expectOneGo,
  expectPlaceholderWaits,
  recordChips,
} from './chip-motion';

// React Aria's tags (shadcn/ui's combobox chips). Animate UI v1 had no tag
// group: an added tag pops in like v1's small overlays (opacity from 0, scale
// from 0.5, spring stiffness 300, damping 25); a removed one shrinks out where
// it was while the others close the gap.

type Frame = { t: number; scale: number; opacity: number } | null;

/** Records the tag's scale and opacity on every frame, from its first one. */
async function sampleTag(page: Page, testId: string, frames = 45) {
  await page.evaluate(
    ([id, n]) => {
      const w = window as unknown as { __tag: Frame[] };
      const out: Frame[] = (w.__tag = []);
      let t0: number | null = null;
      const tick = () => {
        const el = document.querySelector(`[data-testid="${id}"]`);
        if (el) {
          t0 ??= performance.now();
          const style = getComputedStyle(el);
          const matrix = style.transform.match(/matrix\(([^,]+)/);
          out.push({
            t: performance.now() - t0,
            scale: matrix ? Number(matrix[1]) : 1,
            opacity: Number(style.opacity),
          });
        }
        if (out.length < (n as number)) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    [testId, frames] as const,
  );
  return () =>
    page.evaluate(
      () => (window as unknown as { __tag: NonNullable<Frame>[] }).__tag,
    );
}

test.describe('react-aria tag group', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/react-aria-tag-group', {
      waitUntil: 'networkidle',
    });
  });

  test('tags there on mount stay at rest', async ({ page }) => {
    const astro = page.getByTestId('tag-Astro');
    await expect(astro).toHaveCSS('opacity', '1');
    await expect(astro).toHaveCSS('transform', 'none');
  });

  test('an added tag pops in from half size, past full size a little', async ({
    page,
  }) => {
    const frames = await sampleTag(page, 'tag-Nuxt');
    await page.getByRole('button', { name: 'Add Nuxt' }).click();
    await page.waitForTimeout(1000);
    const samples = await frames();
    // Its very first frame is already the start: no flash at full size.
    expect(samples[0]!.scale).toBeCloseTo(0.5, 1);
    expect(samples[0]!.opacity).toBeLessThan(0.1);
    // A spring: on its way, then a touch past 1, then at rest.
    expect(samples.some((s) => s.scale > 0.6 && s.scale < 0.95)).toBe(true);
    expect(Math.max(...samples.map((s) => s.scale))).toBeGreaterThan(1.005);
    const last = samples[samples.length - 1]!;
    expect(last.scale).toBeCloseTo(1, 2);
    expect(last.opacity).toBeCloseTo(1, 2);
  });

  test('a removed tag shrinks out where it was, the others close the gap', async ({
    page,
  }) => {
    const recording = await recordChips(page, {
      container: '[role="grid"][aria-label="Frameworks"]',
      next: '[data-testid="tag-Next.js"]',
      chip: { selector: '[data-testid="tag-Astro"]', text: 'Astro' },
      act: () => page.getByRole('button', { name: 'Remove first' }).click(),
    });
    // Out of the list at once: only its copy (no test id) leaves.
    await expect(page.getByTestId('tag-Astro')).toHaveCount(0, {
      timeout: 50,
    });
    await expect(page.getByTestId('tag-Next.js')).toHaveCount(1);
    expectChipLeaves(recording);
  });

  test('the last tag removed: the input glides back in one go, a placeholder showing up waits for it there', async ({
    page,
  }) => {
    const remove = page.getByRole('button', { name: 'Remove picked' });
    await remove.click();
    await page.waitForTimeout(650);
    const recording = await recordChips(page, {
      container: '[data-testid="field"]',
      next: '[data-testid="field-input"]',
      chip: { selector: '[data-slot="picked"]', text: 'Gatsby' },
      act: () => remove.click(),
    });
    expectChipLeaves(recording);
    expectOneGo(recording);
    expectPlaceholderWaits(recording);
  });

  test('an added tag pushes nothing back: those before it stay put', async ({
    page,
  }) => {
    const before = await page
      .getByTestId('tag-Next.js')
      .evaluate((el) => el.getBoundingClientRect().x);
    await page.getByRole('button', { name: 'Add Nuxt' }).click();
    await page.waitForTimeout(40);
    expect(
      await page
        .getByTestId('tag-Next.js')
        .evaluate((el) => el.getBoundingClientRect().x),
    ).toBe(before);
  });

  test('reduced motion: an added tag fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const frames = await sampleTag(page, 'tag-Nuxt', 30);
    await page.getByRole('button', { name: 'Add Nuxt' }).click();
    await page.waitForTimeout(700);
    const samples = await frames();
    expect(samples[0]!.opacity).toBeLessThan(0.1);
    for (const s of samples) expect(s.scale).toBe(1);
    expect(samples[samples.length - 1]!.opacity).toBeCloseTo(1, 2);
  });
});
