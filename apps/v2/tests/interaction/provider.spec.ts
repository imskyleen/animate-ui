import { expect, test, type Page } from '../test';

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
  await expect.poll(() => height(page, 'Default')).toBe(200);
  expect(await height(page, 'Slow')).toBeLessThan(200);
  await expect.poll(() => height(page, 'Slow')).toBe(200);
});

type CheckFrame = { t: number; scale: number; dash: number; opacity: number };

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
  expect(drawn(await recordBox(page, 'Own prop'))).toBe(true);
  expect(popped(await recordBox(page, 'Nested pop'))).toBe(true);
  const slow = await recordBox(page, 'Slow pop');
  expect(popped(slow)).toBe(true);
  for (const f of slow.filter((f) => f.t < 300))
    expect(f.opacity).toBeLessThan(0.05);
});

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
  await page.waitForTimeout(1500);
  const normal = await dotLeaves(page, 'Default');
  const slow = await dotLeaves(page, 'Slow');
  expect(slow / normal).toBeGreaterThan(1.4);
  expect(slow / normal).toBeLessThan(2.8);
});

test('AnimateUIProvider tempo paces a spring written with visualDuration, keeping its bounce', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/provider-tempo-visual-duration', {
    waitUntil: 'networkidle',
  });
  const read = async (id: string) =>
    JSON.parse((await page.getByTestId(id).textContent()) ?? '{}');
  expect(await read('default')).toMatchObject({
    visualDuration: 0.4,
    bounce: 0.3,
  });
  expect(await read('slow')).toMatchObject({
    visualDuration: 0.8,
    bounce: 0.3,
  });
});

test('AnimateUIProvider tempo paces the avatar group tooltip once', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/provider-avatar-group-tempo', {
    waitUntil: 'networkidle',
  });
  await page.waitForFunction(() =>
    Object.keys(document.querySelector('[role="img"]')!).some((key) =>
      key.startsWith('__reactProps'),
    ),
  );
  const growth = async (label: string) => {
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    const frames = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let start = 0;
          const tick = () => {
            const tooltip = document.querySelector('[role="tooltip"]');
            if (tooltip) {
              const scale = new DOMMatrix(getComputedStyle(tooltip).transform)
                .a;
              if (!start) start = performance.now();
              if (scale >= 0.995) return resolve(performance.now() - start);
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    await page.getByRole('img', { name: `${label} A` }).hover();
    return frames;
  };
  const normal = await growth('Default');
  const slow = await growth('Slow');
  expect(slow / normal).toBeGreaterThan(1.5);
  expect(slow / normal).toBeLessThan(2.6);
});

test('Vue AnimateUIProvider tempo paces the avatar group tooltip once', async ({
  page,
}) => {
  await page.goto('/tests/vue-demos/fixtures/provider-avatar-group-tempo', {
    waitUntil: 'networkidle',
  });
  const growth = async (label: string) => {
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    const frames = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let start = 0;
          const tick = () => {
            const tooltip = document.querySelector('[role="tooltip"]');
            if (tooltip) {
              const scale = new DOMMatrix(getComputedStyle(tooltip).transform)
                .a;
              if (!start) start = performance.now();
              if (scale >= 0.995) return resolve(performance.now() - start);
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );
    await page.getByRole('img', { name: `${label} A` }).hover();
    return frames;
  };
  const normal = await growth('Default');
  const slow = await growth('Slow');
  expect(slow / normal).toBeGreaterThan(1.5);
  expect(slow / normal).toBeLessThan(2.6);
});
