import { expect, test, type Locator, type Page } from '@playwright/test';

// The icon core (@animate-ui/react/icons) on the Bell icon
// (tests/fixtures/icons.tsx), whose group swings through
// [0, 20, -10, 10, -5, 3, 0]° in 0.9s. Its triggers work as in v1: hover and
// tap animate while active, and a stopped animation returns to rest with
// Motion's default transition (a spring for rotations).

type Sample = [time: number, degrees: number];
type Recorder = { samples: Sample[]; reachedAt: number };

async function open(page: Page) {
  await page.goto('/tests/fixtures/icons', { waitUntil: 'networkidle' });
}

/**
 * Records the element's rotation on every frame, and the time it first goes
 * above `threshold` degrees.
 */
function record(svg: Locator, threshold: number) {
  return svg.evaluate((el, threshold) => {
    const recorder: Recorder = { samples: [], reachedAt: 0 };
    (window as unknown as { __recorder: Recorder }).__recorder = recorder;
    const tick = (now: number) => {
      const { a, b } = new DOMMatrix(getComputedStyle(el).transform);
      const degrees = (Math.atan2(b, a) * 180) / Math.PI;
      recorder.samples.push([now, degrees]);
      if (!recorder.reachedAt && degrees > threshold) recorder.reachedAt = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, threshold);
}

function waitForThreshold(page: Page) {
  return page.waitForFunction(
    () => (window as unknown as { __recorder: Recorder }).__recorder.reachedAt,
    null,
    { polling: 'raf' },
  );
}

const now = (page: Page) => page.evaluate(() => performance.now());

/** Rotations recorded between `from` and `to` (ms, page clock). */
function between(page: Page, from: number, to = Infinity) {
  return page.evaluate(
    ([from, to]) =>
      (window as unknown as { __recorder: Recorder }).__recorder.samples
        .filter(([time]) => time >= from && time <= to)
        .map(([, degrees]) => degrees),
    [from, to] as const,
  );
}

const rotation = (svg: Locator) =>
  svg.evaluate((el) => {
    const { a, b } = new DOMMatrix(getComputedStyle(el).transform);
    return (Math.atan2(b, a) * 180) / Math.PI;
  });

const maxAbs = (values: number[]) => Math.max(...values.map(Math.abs));

test.describe('icons', () => {
  test('hover plays the animation, leaving returns to rest on a spring', async ({
    page,
  }) => {
    await open(page);
    const svg = page.getByTestId('hover').locator('svg');
    await record(svg, 15);
    await svg.hover();
    await waitForThreshold(page);
    await page.mouse.move(600, 600);
    const left = await now(page);
    await page.waitForTimeout(900);
    const after = await between(page, left);
    // A spring: it swings past 0 on the way back (an ease-out would not)...
    expect(Math.max(...after)).toBeGreaterThan(0.3);
    expect(Math.min(...after)).toBeLessThan(-0.3);
    // ...and settles instead of playing the rest of the swing.
    expect(maxAbs(await between(page, left + 300))).toBeLessThan(3);
    await expect.poll(() => rotation(svg)).toBeCloseTo(0, 1);
  });

  test('tap: animates while pressed, returns to rest on release', async ({
    page,
  }) => {
    await open(page);
    const svg = page.getByTestId('tap').locator('svg');
    await record(svg, 5);
    await svg.hover();
    await page.mouse.down();
    await waitForThreshold(page);
    await page.mouse.up();
    const released = await now(page);
    await page.waitForTimeout(900);
    expect(maxAbs(await between(page, released + 300))).toBeLessThan(3);
    await expect.poll(() => rotation(svg)).toBeCloseTo(0, 1);
  });

  test('tap with completeOnStop: the animation finishes after release', async ({
    page,
  }) => {
    await open(page);
    const svg = page.getByTestId('tap-complete').locator('svg');
    await record(svg, 5);
    await svg.hover();
    await page.mouse.down();
    await waitForThreshold(page);
    await page.mouse.up();
    const released = await now(page);
    await page.waitForTimeout(900);
    // The swing goes on (through its -10° and 10° keyframes).
    expect(
      maxAbs(await between(page, released + 200, released + 450)),
    ).toBeGreaterThan(5);
  });

  test('speed 2 plays twice as fast, speed 1 as authored', async ({ page }) => {
    await open(page);
    const section = page.getByTestId('speed');
    // Time of the last frame each bell is rotated, from the first one.
    const done = section.evaluate((root) => {
      const bells = [...root.querySelectorAll('svg')];
      return new Promise<number[]>((resolve) => {
        const last = bells.map(() => 0);
        let start = 0;
        const tick = (now: number) => {
          bells.forEach((bell, i) => {
            if (getComputedStyle(bell).transform !== 'none') {
              if (!start) start = now;
              last[i] = now;
            }
          });
          if (start && now - start > 1600)
            resolve(last.map((time) => time - start));
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
    await section.getByRole('button', { name: 'Play' }).click();
    const [normal, fast] = await done;
    // The 0.9s swing (a few frames of slack).
    expect(normal).toBeGreaterThan(800);
    expect(normal).toBeLessThan(1000);
    expect(fast! / normal!).toBeGreaterThan(0.4);
    expect(fast! / normal!).toBeLessThan(0.6);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('icons stay at rest', async ({ page }) => {
      await open(page);
      const svg = page.getByTestId('hover').locator('svg');
      await svg.hover();
      await page.waitForTimeout(500);
      expect(await svg.evaluate((el) => getComputedStyle(el).transform)).toBe(
        'none',
      );
    });
  });
});
