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
  const scales = (page: Page, testId: string) =>
    page
      .getByTestId(testId)
      .evaluate((el) =>
        [...el.children].map((child) =>
          Number((child as HTMLElement).style.scale || 1),
        ),
      );

  test('items shrink into the fade, by how deep they sit in it, down to 97%', async ({
    page,
  }) => {
    await open(page);
    let s = await scales(page, 'long');
    expect(s.slice(0, 3)).toEqual([1, 1, 1]);
    expect(s[3]).toBeLessThan(1);
    expect(s[4]).toBeLessThan(s[3]!);
    expect(s[5]).toBeLessThanOrEqual(s[4]!);
    expect(s[5]).toBeCloseTo(0.97, 2);
    await scrollTo(page, 'long', 'middle');
    await settled(page, 'long', { top: 1, bottom: 1 });
    s = await scales(page, 'long');
    const shrunk = s.filter((value) => value < 1);
    expect(shrunk.length).toBeGreaterThanOrEqual(2);
    for (const value of shrunk) expect(value).toBeGreaterThanOrEqual(0.97);
    await scrollTo(page, 'long', 'start');
    await settled(page, 'long', { top: 0, bottom: 1 });
    s = await scales(page, 'long');
    expect(s[0]).toBe(1);
  });

  test('items inside a wrapper (a list) shrink too', async ({ page }) => {
    await page.goto('/tests/demos/animate-ui/scroll-fade', {
      waitUntil: 'networkidle',
    });
    const rows = await page
      .locator('[data-slot="scroll-fade"] li')
      .evaluateAll((items) =>
        items.map((item) => Number((item as HTMLElement).style.scale || 1)),
      );
    expect(rows[0]).toBe(1);
    expect(rows.some((value) => value < 1 && value >= 0.95)).toBe(true);
  });

  test('in a list split into groups, the lines shrink one by one, never a whole group', async ({
    page,
  }) => {
    await open(page);
    await scrollTo(page, 'grouped', 'middle');
    const shrunk = () =>
      page
        .getByTestId('grouped')
        .evaluate((el) =>
          [...el.querySelectorAll<HTMLElement>('*')]
            .filter((child) => child.style.scale)
            .map((child) => child.tagName),
        );
    await expect.poll(async () => (await shrunk()).length).toBeGreaterThan(0);
    const tags = await shrunk();
    expect(tags.every((tag) => tag === 'LI' || tag === 'P')).toBe(true);
  });

  test('scrolling reads the items once per gesture, not every frame', async ({
    page,
  }) => {
    await open(page);
    await page.getByTestId('long').evaluate((el) => {
      const counter = { reads: 0 };
      (window as unknown as { counter: typeof counter }).counter = counter;
      const read = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        if (el.contains(this)) counter.reads++;
        return read.call(this);
      };
    });
    const box = (await page.getByTestId('long').boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 20);
      await page.waitForTimeout(16);
    }
    await page.waitForTimeout(300);
    const reads = await page.evaluate(
      () => (window as unknown as { counter: { reads: number } }).counter.reads,
    );
    expect(reads).toBeLessThanOrEqual(22);
    const scales = await page
      .getByTestId('long')
      .evaluate(
        (el) =>
          [...el.children].filter((child) => (child as HTMLElement).style.scale)
            .length,
      );
    expect(scales).toBeGreaterThan(0);
  });

  test('inside a scaled parent, the items shrink as they would at full size', async ({
    page,
  }) => {
    await open(page);
    const scales = (testId: string) =>
      page
        .getByTestId(testId)
        .evaluate((el) =>
          [...el.children].map((child) =>
            Number((child as HTMLElement).style.scale || 1).toFixed(3),
          ),
        );
    await expect.poll(() => scales('scaled')).toEqual(await scales('long'));
  });

  test("an item's own filter stays: it isn't blurred over", async ({
    page,
  }) => {
    await open(page);
    const item = page.getByTestId('filtered').locator(':scope > div').nth(4);
    await expect
      .poll(() =>
        page
          .getByTestId('filtered')
          .evaluate((el) =>
            (el.children[5] as HTMLElement).style.filter.startsWith('blur('),
          ),
      )
      .toBe(true);
    expect(await item.evaluate((el) => el.style.filter)).toBe('grayscale(1)');
  });

  test('blur: items deep in the fade blur, those in the middle stay sharp', async ({
    page,
  }) => {
    await page.goto('/tests/demos/animate-ui/scroll-fade?blur=4', {
      waitUntil: 'networkidle',
    });
    const items = page.locator('[data-slot="scroll-fade"] li');
    await expect
      .poll(() => items.last().evaluate((item) => item.style.filter))
      .toMatch(/blur\((?:[3-4](?:\.\d+)?)px\)/);
    expect(await items.first().evaluate((item) => item.style.filter)).toBe('');
  });

  test('reduced motion keeps the blur, only the shrinking goes', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tests/demos/animate-ui/scroll-fade?blur=4', {
      waitUntil: 'networkidle',
    });
    const last = page.locator('[data-slot="scroll-fade"] li').last();
    await expect
      .poll(() => last.evaluate((item) => item.style.filter))
      .toMatch(/blur\(/);
    expect(await last.evaluate((item) => item.style.scale)).toBe('');
  });

  test('reduced motion: nothing shrinks, the fade alone stays', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await scrollTo(page, 'long', 'middle');
    await settled(page, 'long', { top: 1, bottom: 1 });
    expect((await scales(page, 'long')).every((value) => value === 1)).toBe(
      true,
    );
  });
  test('asChild: the fade goes on the child, keeping its ref, classes and style', async ({
    page,
  }) => {
    await open(page);
    const child = page.getByTestId('as-child');
    await expect(child).toHaveAttribute('data-ref', 'UL');
    await expect(child).toHaveAttribute('data-slot', 'scroll-fade');
    await expect(child).toHaveClass(/h-\[200px\]/);
    await expect(child).toHaveClass(/faded/);
    const look = await child.evaluate((el) => ({
      overflowY: getComputedStyle(el).overflowY,
      paddingTop: getComputedStyle(el).paddingTop,
      mask: getComputedStyle(el).maskImage,
    }));
    expect(look.overflowY).toBe('auto');
    expect(look.paddingTop).toBe('4px');
    expect(look.mask).not.toBe('none');
  });
});
