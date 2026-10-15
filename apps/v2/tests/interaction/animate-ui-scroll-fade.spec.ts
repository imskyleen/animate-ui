import { expect, test, type Page } from '../test';

const open = (page: Page) =>
  page.goto('/tests/fixtures/animate-ui-scroll-fade', {
    waitUntil: 'networkidle',
  });

type Edge = 'top' | 'bottom' | 'left' | 'right';

const state = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => {
    const read = (edge: string) =>
      Number(el.style.getPropertyValue(`--scroll-fade-${edge}`) || 0);
    return {
      top: read('top'),
      bottom: read('bottom'),
      left: read('left'),
      right: read('right'),
      mask: getComputedStyle(el).maskImage,
    };
  });

const scrollTo = (page: Page, testId: string, to: 'start' | 'middle' | 'end') =>
  page.getByTestId(testId).evaluate((el, to) => {
    const vertical = el.scrollHeight > el.clientHeight;
    const max = vertical
      ? el.scrollHeight - el.clientHeight
      : el.scrollWidth - el.clientWidth;
    const value = to === 'start' ? 0 : to === 'middle' ? max / 2 : max;
    if (vertical) el.scrollTop = value;
    else el.scrollLeft = value;
  }, to);

const sample = (page: Page, testId: string, edge: Edge, ms: number) =>
  page.getByTestId(testId).evaluate(
    (el, { edge, ms }) =>
      new Promise<number[]>((resolve) => {
        const values: number[] = [];
        const start = performance.now();
        const tick = () => {
          values.push(
            Number(el.style.getPropertyValue(`--scroll-fade-${edge}`) || 0),
          );
          if (performance.now() - start < ms) requestAnimationFrame(tick);
          else resolve(values);
        };
        requestAnimationFrame(tick);
      }),
    { edge, ms },
  );

const settled = async (
  page: Page,
  testId: string,
  expected: Partial<Record<Edge, number>>,
) => {
  for (const [edge, value] of Object.entries(expected)) {
    await expect
      .poll(async () => (await state(page, testId))[edge as Edge])
      .toBeCloseTo(value, 2);
  }
};

test.describe('animate-ui scroll fade', () => {
  test('no mask when the content does not overflow', async ({ page }) => {
    await open(page);
    const s = await state(page, 'short');
    expect(s.mask).toBe('none');
    expect([s.top, s.bottom, s.left, s.right]).toEqual([0, 0, 0, 0]);
  });

  test('at the top: only the bottom fades, without animating in', async ({
    page,
  }) => {
    await open(page);
    const s = await state(page, 'long');
    expect(s.mask).not.toBe('none');
    expect(s.top).toBe(0);
    expect(s.bottom).toBe(1);
  });

  test('mid-scroll both edges fade; at the end only the top', async ({
    page,
  }) => {
    await open(page);
    await scrollTo(page, 'long', 'middle');
    await settled(page, 'long', { top: 1, bottom: 1 });
    await scrollTo(page, 'long', 'end');
    await settled(page, 'long', { top: 1, bottom: 0 });
    await scrollTo(page, 'long', 'start');
    await settled(page, 'long', { top: 0, bottom: 1 });
  });

  test('the fade follows the scroll with no lag: on the next frame, the edge is where the position puts it', async ({
    page,
  }) => {
    await open(page);
    const read = await page.getByTestId('long').evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const seen: number[] = [];
          const value = () =>
            Number(el.style.getPropertyValue('--scroll-fade-top') || 0);
          requestAnimationFrame(() => {
            el.scrollTop = 5;
            requestAnimationFrame(() => {
              seen.push(value());
              el.scrollTop = 10;
              requestAnimationFrame(() => {
                seen.push(value());
                el.scrollTop = 30;
                requestAnimationFrame(() => {
                  seen.push(value());
                  resolve(seen);
                });
              });
            });
          });
        }),
    );
    expect(read[0]).toBeCloseTo(0.25, 2);
    expect(read[1]).toBeCloseTo(0.5, 2);
    expect(read[2]).toBe(1);
  });

  test('the fade keeps its depth: only the edge itself clears', async ({
    page,
  }) => {
    await open(page);
    const mask = await page
      .getByTestId('long')
      .evaluate((el) => el.style.getPropertyValue('mask-image'));
    expect(mask).toContain(
      'calc(var(--scroll-fade-size) * min(1, var(--scroll-fade-top, 0) * 1000))',
    );
    expect(mask).toContain(
      'rgb(0 0 0 / calc(1 - var(--scroll-fade-bottom, 0)))',
    );
  });

  test('content resized without a scroll: the edge eases to its new amount', async ({
    page,
  }) => {
    await open(page);
    const frames = sample(page, 'long', 'bottom', 400);
    await page.getByTestId('long').evaluate((el) => {
      while (el.children.length > 2) el.lastElementChild!.remove();
    });
    const values = await frames;
    expect(values.filter((v) => v > 0.05 && v < 0.95).length).toBeGreaterThan(
      1,
    );
    expect(values.at(-1)).toBe(0);
  });

  test('reduced motion: the fade follows the scroll at once', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const frames = sample(page, 'long', 'top', 200);
    await scrollTo(page, 'long', 'middle');
    const values = await frames;
    expect(values.filter((v) => v > 0.05 && v < 0.95)).toHaveLength(0);
    expect(values.at(-1)).toBe(1);
  });

  test('horizontal: left and right edges', async ({ page }) => {
    await open(page);
    let s = await state(page, 'horizontal');
    expect(s.mask).not.toBe('none');
    expect([s.left, s.right, s.top, s.bottom]).toEqual([0, 1, 0, 0]);
    await scrollTo(page, 'horizontal', 'middle');
    await settled(page, 'horizontal', { left: 1, right: 1 });
    await scrollTo(page, 'horizontal', 'end');
    await settled(page, 'horizontal', { left: 1, right: 0 });
    s = await state(page, 'horizontal');
    expect(s.top + s.bottom).toBe(0);
  });

  test('the mask goes away when the content stops overflowing', async ({
    page,
  }) => {
    await open(page);
    await page.getByTestId('long').evaluate((el) => {
      while (el.children.length > 2) el.lastElementChild!.remove();
    });
    await expect
      .poll(async () => (await state(page, 'long')).mask)
      .toBe('none');
  });
});
