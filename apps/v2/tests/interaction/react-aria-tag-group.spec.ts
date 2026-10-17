import { expect, test, type Page } from '../test';

import {
  expectChipLeaves,
  expectOneGo,
  expectPlaceholderComesIn,
  expectPlaceholderRides,
  recordChips,
} from './chip-motion';

type Frame = { t: number; scale: number; opacity: number } | null;

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
    expect(samples[0]!.scale).toBeCloseTo(0.5, 1);
    expect(samples[0]!.opacity).toBeLessThan(0.1);
    expect(samples.some((s) => s.scale > 0.6 && s.scale < 0.95)).toBe(true);
    expect(Math.max(...samples.map((s) => s.scale))).toBeGreaterThan(1.005);
    const last = samples[samples.length - 1]!;
    expect(last.scale).toBeCloseTo(1, 2);
    expect(last.opacity).toBeCloseTo(1, 2);
  });

  test('a tag removed while it pops in fades out from how it looks, instead of vanishing', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add Nuxt' }).click();
    await page.waitForTimeout(80);
    await page.evaluate(() => {
      const samples: number[] = [];
      (window as unknown as { samples: number[] }).samples = samples;
      const start = performance.now();
      const tick = () => {
        const copy = document.querySelector<HTMLElement>('[data-exiting]');
        if (copy) samples.push(Number(getComputedStyle(copy).opacity));
        if (performance.now() - start < 400) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.getByRole('button', { name: 'Remove last' }).click();
    await page.waitForTimeout(500);
    const samples = await page.evaluate(
      () => (window as unknown as { samples: number[] }).samples,
    );
    expect(samples.length).toBeGreaterThan(0);
    expect(Math.max(...samples)).toBeGreaterThan(0.3);
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
    await expect(page.getByTestId('tag-Astro')).toHaveCount(0, {
      timeout: 50,
    });
    await expect(page.getByTestId('tag-Next.js')).toHaveCount(1);
    expectChipLeaves(recording);
  });

  test('the last tag removed: the input glides back in one go, a placeholder showing up fades in once it is there', async ({
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
      ms: 900,
    });
    expectChipLeaves(recording);
    expectOneGo(recording);
    expectPlaceholderComesIn(recording);
  });

  test('reduced motion: the last tag removed, a placeholder showing up fades in out of its blur', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const remove = page.getByRole('button', { name: 'Remove picked' });
    await remove.click();
    await page.waitForTimeout(650);
    const recording = await recordChips(page, {
      container: '[data-testid="field"]',
      next: '[data-testid="field-input"]',
      chip: { selector: '[data-slot="picked"]', text: 'Gatsby' },
      act: () => remove.click(),
      ms: 700,
    });
    expectChipLeaves(recording, { reduce: true });
    expectPlaceholderComesIn(recording, { reduce: true });
  });

  test('the last tag removed: the input glides back in one go, a placeholder there all along rides with it', async ({
    page,
  }) => {
    const remove = page.getByRole('button', { name: 'Remove searched' });
    await remove.click();
    await page.waitForTimeout(650);
    const recording = await recordChips(page, {
      container: '[data-testid="search-field"]',
      next: '[data-testid="search-input"]',
      chip: { selector: '[data-slot="searched"]', text: 'Qwik' },
      act: () => remove.click(),
      ms: 900,
    });
    expectChipLeaves(recording);
    expectOneGo(recording);
    expectPlaceholderRides(recording);
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
