import { expect, test, type Page } from '@playwright/test';

const height = (page: Page, label: string) =>
  page
    .locator('[role="region"]', { hasText: `${label} content` })
    .evaluate((el) => el.getBoundingClientRect().height);

test('AnimateUIProvider tempo slows animations down; default without it', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/provider-tempo', {
    waitUntil: 'networkidle',
  });
  await page.getByRole('button', { name: 'Default' }).click();
  await page.getByRole('button', { name: 'Slow' }).click();
  // The default disclosure takes 350ms, tempo 2 makes it 700ms: when
  // the default one is fully open, the slow one is still opening.
  await expect.poll(() => height(page, 'Default')).toBe(200);
  expect(await height(page, 'Slow')).toBeLessThan(200);
  await expect.poll(() => height(page, 'Slow')).toBe(200);
});

type CheckFrame = { t: number; scale: number; dash: number; opacity: number };

/** Clicks a box and records its check for 900ms. */
async function recordBox(page: Page, label: string) {
  return page.evaluate(async (label) => {
    const box = document.querySelector<HTMLElement>(`[aria-label="${label}"]`)!;
    box.click();
    const frames: CheckFrame[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 900) {
      await new Promise(requestAnimationFrame);
      const svg = box.querySelector('svg');
      const path = svg?.querySelector('path');
      if (!svg || !path) continue;
      const matrix = getComputedStyle(svg).transform.match(/matrix\(([^,]+)/);
      const dash = getComputedStyle(path).strokeDasharray;
      frames.push({
        t: performance.now() - t0,
        scale: matrix ? Number(matrix[1]) : 1,
        dash: dash === 'none' ? 1 : parseFloat(dash),
        opacity:
          Number(getComputedStyle(svg).opacity) *
          Number(getComputedStyle(path).opacity),
      });
    }
    return frames;
  }, label);
}

const drawn = (frames: CheckFrame[]) =>
  frames.some((f) => f.dash > 0.1 && f.dash < 0.9) &&
  frames.every((f) => Math.abs(f.scale - 1) < 0.01);
const popped = (frames: CheckFrame[]) =>
  frames.some((f) => f.scale < 0.9 && f.opacity > 0.05) &&
  frames.every((f) => f.dash === 1);

test('AnimateUIProvider checkAnimation: the closest one, the prop first', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/provider-check-animation', {
    waitUntil: 'networkidle',
  });
  expect(drawn(await recordBox(page, 'Default'))).toBe(true);
  expect(popped(await recordBox(page, 'Popped'))).toBe(true);
  // The indicator's own `animation` wins.
  expect(drawn(await recordBox(page, 'Own prop'))).toBe(true);
  // A provider that only sets `tempo` keeps the one around it's
  // `checkAnimation`…
  expect(popped(await recordBox(page, 'Nested pop'))).toBe(true);
  // …and one that only sets `checkAnimation` keeps its tempo: tempo 2
  // doubles the 0.2s delay, the check is still hidden 0.3s after the click.
  const slow = await recordBox(page, 'Slow pop');
  expect(popped(slow)).toBe(true);
  for (const f of slow.filter((f) => f.t < 300))
    expect(f.opacity).toBeLessThan(0.05);
});

/** Picks a group's other radio: how long (ms) its first dot takes to go. */
function dotLeaves(page: Page, label: string) {
  return page.evaluate(async (label) => {
    const radio = document.querySelector<HTMLElement>(
      `[aria-label="${label} b"]`,
    )!;
    const t0 = performance.now();
    radio.click();
    while (performance.now() - t0 < 8000) {
      await new Promise(requestAnimationFrame);
      if (!document.querySelector(`[data-testid="${label}-dot-a"]`))
        return performance.now() - t0;
    }
    return Infinity;
  }, label);
}

test('AnimateUIProvider tempo paces a radio dot leaving once', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/provider-radio-tempo', {
    waitUntil: 'networkidle',
  });
  // Let the dots there on load pop in first.
  await page.waitForTimeout(1500);
  const normal = await dotLeaves(page, 'Default');
  const slow = await dotLeaves(page, 'Slow');
  // Tempo 2 makes the spring twice as long (paced twice, it took 4 times).
  expect(slow / normal).toBeGreaterThan(1.4);
  expect(slow / normal).toBeLessThan(2.8);
});
