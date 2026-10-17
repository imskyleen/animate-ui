import { expect, test, type Locator, type Page } from '../test';

const ANIMATED = [
  'bubble',
  'fireworks',
  'gradient',
  'gravity-stars',
  'hole',
  'stars',
  'topography',
] as const;
const CANVAS = ['fireworks', 'gravity-stars', 'hole', 'topography'];

async function open(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
      errors.push(message.text());
  });
  await page.goto('/tests/fixtures/backgrounds', { waitUntil: 'networkidle' });
  return errors;
}

async function show(section: Locator) {
  await section.evaluate((el) =>
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40),
  );
}

async function hide(section: Locator) {
  await section.evaluate((el) => {
    const { bottom } = el.getBoundingClientRect();
    window.scrollTo(0, bottom + window.scrollY + window.innerHeight * 0.2);
  });
}

async function setPageVisible(page: Page, visible: boolean) {
  await page.evaluate((visible) => {
    Object.defineProperty(document, 'visibilityState', {
      value: visible ? 'visible' : 'hidden',
      configurable: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visible);
}

function frame(section: Locator) {
  return section.evaluate((root) => {
    const hash = (text: string) => {
      let h = 0;
      for (let i = 0; i < text.length; i += 3)
        h = (h * 31 + text.charCodeAt(i)) | 0;
      return h;
    };
    const parts: (string | number)[] = [];
    for (const canvas of root.querySelectorAll('canvas'))
      parts.push(hash(canvas.toDataURL()));
    for (const el of [root, ...root.querySelectorAll('*')]) {
      const style = getComputedStyle(el);
      parts.push(style.transform, style.backgroundPosition);
    }
    return parts.join('|');
  });
}

async function expectMoving(section: Locator) {
  const before = await frame(section);
  await expect.poll(() => frame(section), { timeout: 5_000 }).not.toBe(before);
}

async function expectStill(page: Page, section: Locator) {
  let previous = await frame(section);
  await expect
    .poll(
      async () => {
        await page.waitForTimeout(250);
        const current = await frame(section);
        const same = current === previous;
        previous = current;
        return same;
      },
      { timeout: 5_000 },
    )
    .toBe(true);
  await page.waitForTimeout(1_000);
  expect(await frame(section)).toBe(previous);
}

async function withoutWebGl(page: Page) {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type.includes('webgl')) return null;
      return (getContext as (...args: unknown[]) => unknown).call(
        this,
        type,
        ...rest,
      );
    } as typeof getContext;
  });
}

function paintedPixels(section: Locator) {
  return section.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const context = copy.getContext('2d')!;
    context.drawImage(canvas, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let count = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]! > 0) count++;
    return count;
  });
}

test.describe('backgrounds', () => {
  test('all render without errors', async ({ page }) => {
    const errors = await open(page);
    for (const name of [...ANIMATED, 'hexagon']) {
      const section = page.getByTestId(name);
      await show(section);
      await expect(section.locator('[data-slot$="-background"]')).toBeVisible();
    }
    expect(errors).toEqual([]);
  });

  for (const name of ANIMATED) {
    test.describe(name, () => {
      test('animates on screen', async ({ page }) => {
        await open(page);
        const section = page.getByTestId(name);
        await show(section);
        await expectMoving(section);
      });

      test('pauses off screen, then resumes', async ({ page }) => {
        await open(page);
        const section = page.getByTestId(name);
        await show(section);
        await expectMoving(section);
        await hide(section);
        await expectStill(page, section);
        await show(section);
        await expectMoving(section);
      });

      test('pauses while the tab is hidden, then resumes', async ({ page }) => {
        await open(page);
        const section = page.getByTestId(name);
        await show(section);
        await expectMoving(section);
        await setPageVisible(page, false);
        await expectStill(page, section);
        await setPageVisible(page, true);
        await expectMoving(section);
      });

      test('reduced motion: a still frame', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const errors = await open(page);
        const section = page.getByTestId(name);
        await show(section);
        await page.mouse.move(200, 200);
        await page.mouse.move(400, 300, { steps: 5 });
        await expectStill(page, section);
        if (CANVAS.includes(name))
          expect(await paintedPixels(section)).toBeGreaterThan(100);
        expect(errors).toEqual([]);
      });
    });
  }

  test.describe('pointer', () => {
    const follower = {
      bubble: '[class*="sixth-color"]',
      stars: '[data-slot="stars-background"] > div',
    } as const;

    for (const [name, selector] of Object.entries(follower)) {
      test(`${name} follows the mouse`, async ({ page }) => {
        await open(page);
        const section = page.getByTestId(name);
        await show(section);
        const layer = section.locator(selector).first();
        const before = await layer.evaluate(
          (el) => getComputedStyle(el).transform,
        );
        const box = (await section.boundingBox())!;
        await page.mouse.move(box.x + 20, box.y + 20);
        await page.mouse.move(box.x + box.width - 20, box.y + 40, {
          steps: 10,
        });
        await expect
          .poll(() => layer.evaluate((el) => getComputedStyle(el).transform))
          .not.toBe(before);
      });
    }

    test.describe('touch', () => {
      test.use({ hasTouch: true });

      for (const [name, selector] of Object.entries(follower)) {
        test(`${name}: a tap moves the follower`, async ({ page }) => {
          await open(page);
          const section = page.getByTestId(name);
          await show(section);
          const layer = section.locator(selector).first();
          const read = () =>
            layer.evaluate((el) => getComputedStyle(el).transform);
          const before = await read();
          const box = (await section.boundingBox())!;
          await page.touchscreen.tap(box.x + 30, box.y + 30);
          await expect.poll(read).not.toBe(before);
        });
      }
    });
  });

  test('fireworks: drawn in a window-wide space scaled to the container', async ({
    page,
  }) => {
    await open(page);
    const section = page.getByTestId('fireworks');
    await show(section);
    await expectMoving(section);
    const { scale, expected } = await section
      .locator('canvas')
      .evaluate((canvas: HTMLCanvasElement) => ({
        scale: canvas.getContext('2d')!.getTransform().a,
        expected: canvas.width / window.innerWidth,
      }));
    expect(scale).toBeCloseTo(expected, 5);
  });

  test.describe('hexagon', () => {
    test('the grid covers the container', async ({ page }) => {
      await open(page);
      const section = page.getByTestId('hexagon');
      await show(section);
      const cells = section.locator(
        '[data-slot="hexagon-background"] .inline-flex > div',
      );
      expect(await cells.count()).toBeGreaterThan(20);
      const sectionBox = (await section.boundingBox())!;
      const lastBox = (await cells.last().boundingBox())!;
      expect(lastBox.y + lastBox.height).toBeGreaterThanOrEqual(
        sectionBox.y + sectionBox.height,
      );
    });

    test('a hovered hexagon lights up', async ({ page }) => {
      await open(page);
      const section = page.getByTestId('hexagon');
      await show(section);
      const cell = section
        .locator('[data-slot="hexagon-background"] .inline-flex')
        .nth(2)
        .locator('> div')
        .nth(3);
      const color = () =>
        cell.evaluate((el) => getComputedStyle(el, '::before').backgroundColor);
      const resting = await color();
      await cell.hover();
      await expect.poll(color).not.toBe(resting);
    });
  });

  test.describe('topography', () => {
    const inCircle = (
      section: Locator,
      center: { x: number; y: number },
      inner: number,
      outer: number,
    ) =>
      section.locator('canvas').evaluate(
        (canvas: HTMLCanvasElement, { center, inner, outer }) => {
          const ratio = canvas.width / canvas.clientWidth;
          const copy = document.createElement('canvas');
          copy.width = canvas.width;
          copy.height = canvas.height;
          const context = copy.getContext('2d')!;
          context.drawImage(canvas, 0, 0);
          const { data } = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          let count = 0;
          for (let y = 0; y < canvas.height; y++)
            for (let x = 0; x < canvas.width; x++) {
              const d = Math.hypot(x / ratio - center.x, y / ratio - center.y);
              if (
                d >= inner &&
                d < outer &&
                data[(y * canvas.width + x) * 4 + 3]! > 40
              )
                count++;
            }
          return count;
        },
        { center, inner, outer },
      );

    test('without WebGL, the lines are drawn as smooth curves, not as grid segments', async ({
      page,
    }) => {
      await withoutWebGl(page);
      await page.addInitScript(() => {
        const counts = { curves: 0, lines: 0 };
        (window as unknown as { __strokes: typeof counts }).__strokes = counts;
        const curve = Path2D.prototype.quadraticCurveTo;
        const line = Path2D.prototype.lineTo;
        Path2D.prototype.quadraticCurveTo = function (...args) {
          counts.curves++;
          return curve.apply(this, args);
        };
        Path2D.prototype.lineTo = function (...args) {
          counts.lines++;
          return line.apply(this, args);
        };
      });
      await open(page);
      const section = page.getByTestId('topography');
      await show(section);
      await page.waitForTimeout(1500);
      const { curves, lines } = await page.evaluate(
        () =>
          (
            window as unknown as {
              __strokes: { curves: number; lines: number };
            }
          ).__strokes,
      );
      expect(curves).toBeGreaterThan(1000);
      expect(lines).toBeLessThan(curves / 5);
    });

    test('without WebGL, the lines bend steadily, without kinks', async ({
      page,
    }) => {
      await withoutWebGl(page);
      await page.addInitScript(() => {
        const loops: number[][] = [];
        (window as unknown as { __loops: number[][] }).__loops = loops;
        const move = Path2D.prototype.moveTo;
        const curve = Path2D.prototype.quadraticCurveTo;
        let current: number[] | null = null;
        Path2D.prototype.moveTo = function (x, y) {
          current = [x, y];
          loops.push(current);
          return move.call(this, x, y);
        };
        Path2D.prototype.quadraticCurveTo = function (cx, cy, x, y) {
          current?.push(x, y);
          return curve.call(this, cx, cy, x, y);
        };
      });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const section = page.getByTestId('topography');
      await show(section);
      await page.waitForTimeout(800);
      const jerk = await page.evaluate(() => {
        const loops = (window as unknown as { __loops: number[][] }).__loops;
        let total = 0;
        let count = 0;
        for (const loop of loops) {
          const n = loop.length / 2;
          if (n < 8) continue;
          const turns: number[] = [];
          for (let i = 1; i < n - 1; i++) {
            const a = Math.atan2(
              loop[i * 2 + 1]! - loop[i * 2 - 1]!,
              loop[i * 2]! - loop[i * 2 - 2]!,
            );
            const b = Math.atan2(
              loop[i * 2 + 3]! - loop[i * 2 + 1]!,
              loop[i * 2 + 2]! - loop[i * 2]!,
            );
            let turn = b - a;
            if (turn > Math.PI) turn -= 2 * Math.PI;
            if (turn < -Math.PI) turn += 2 * Math.PI;
            turns.push(turn);
          }
          for (let i = 1; i < turns.length; i++) {
            total += Math.abs(turns[i]! - turns[i - 1]!);
            count++;
          }
        }
        return { mean: (total / count) * (180 / Math.PI), count };
      });
      expect(jerk.count).toBeGreaterThan(500);
      expect(jerk.mean).toBeLessThan(2);
    });

    test('drawing a frame allocates next to nothing, so the garbage collector never stutters it', async ({
      page,
      browser,
    }) => {
      await page.goto('/tests/demos/backgrounds/topography', {
        waitUntil: 'networkidle',
      });
      await page.waitForTimeout(2500);
      await browser.startTracing(page, {
        categories: ['v8', 'devtools.timeline'],
      });
      await page.waitForTimeout(3000);
      const trace = JSON.parse((await browser.stopTracing()).toString()) as {
        traceEvents: { name: string; ph: string }[];
      };
      const pauses = trace.traceEvents.filter(
        (event) => event.name === 'MinorGC' && event.ph === 'X',
      ).length;
      expect(pauses).toBeLessThan(18);
    });

    test('without WebGL, a 120Hz screen gets a redraw every other frame, at a steady pace', async ({
      page,
    }) => {
      await withoutWebGl(page);
      await page.addInitScript(() => {
        let now = 0;
        let queue: FrameRequestCallback[] = [];
        const base = performance.now();
        performance.now = () => base + now;
        window.requestAnimationFrame = (callback) => {
          queue.push(callback);
          return queue.length;
        };
        window.cancelAnimationFrame = () => {};
        const strokes: number[] = [];
        let frame = 0;
        const stroke = CanvasRenderingContext2D.prototype.stroke;
        CanvasRenderingContext2D.prototype.stroke = function (
          this: CanvasRenderingContext2D,
          path?: Path2D,
        ) {
          strokes.push(frame);
          if (path) stroke.call(this, path);
          else (stroke as () => void).call(this);
        } as typeof stroke;
        (
          window as unknown as {
            __step: () => void;
            __strokes: number[];
          }
        ).__step = () => {
          frame++;
          now += 1000 / 120;
          const due = queue;
          queue = [];
          for (const callback of due) callback(base + now);
        };
        (window as unknown as { __strokes: number[] }).__strokes = strokes;
      });
      await page.goto('/tests/demos/backgrounds/topography', {
        waitUntil: 'networkidle',
      });
      const drawn = await page.evaluate(() => {
        const w = window as unknown as {
          __step: () => void;
          __strokes: number[];
        };
        for (let i = 0; i < 240; i++) w.__step();
        w.__strokes.length = 0;
        for (let i = 0; i < 120; i++) w.__step();
        return [...new Set(w.__strokes)];
      });
      expect(drawn.length).toBeGreaterThanOrEqual(58);
      expect(drawn.length).toBeLessThanOrEqual(62);
      const gaps = drawn.slice(1).map((frame, i) => frame - drawn[i]!);
      for (const gap of gaps) expect(gap).toBe(2);
    });

    test('with WebGL, the relief is drawn per pixel, never through a grid', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        const counts = { strokes: 0 };
        (window as unknown as { __strokes: typeof counts }).__strokes = counts;
        const stroke = CanvasRenderingContext2D.prototype.stroke;
        CanvasRenderingContext2D.prototype.stroke = function (
          this: CanvasRenderingContext2D,
          path?: Path2D,
        ) {
          if (this.canvas.closest('[data-testid="topography"]'))
            counts.strokes++;
          if (path) stroke.call(this, path);
          else (stroke as () => void).call(this);
        } as typeof stroke;
      });
      await open(page);
      const section = page.getByTestId('topography');
      await show(section);
      await page.waitForTimeout(1500);
      expect(
        await section
          .locator('canvas')
          .evaluate(
            (canvas: HTMLCanvasElement) => !!canvas.getContext('webgl'),
          ),
      ).toBe(true);
      expect(await paintedPixels(section)).toBeGreaterThan(1000);
      expect(
        await page.evaluate(
          () =>
            (window as unknown as { __strokes: { strokes: number } }).__strokes
              .strokes,
        ),
      ).toBe(0);
    });

    test('with WebGL, a 120Hz screen gets a redraw on every frame', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        let now = 0;
        let queue: FrameRequestCallback[] = [];
        const base = performance.now();
        performance.now = () => base + now;
        window.requestAnimationFrame = (callback) => {
          queue.push(callback);
          return queue.length;
        };
        window.cancelAnimationFrame = () => {};
        const draws: number[] = [];
        let frame = 0;
        const drawArrays = WebGLRenderingContext.prototype.drawArrays;
        WebGLRenderingContext.prototype.drawArrays = function (
          this: WebGLRenderingContext,
          ...args: Parameters<typeof drawArrays>
        ) {
          draws.push(frame);
          drawArrays.apply(this, args);
        };
        const w = window as unknown as {
          __step: () => void;
          __draws: number[];
        };
        w.__step = () => {
          frame++;
          now += 1000 / 120;
          const due = queue;
          queue = [];
          for (const callback of due) callback(base + now);
        };
        w.__draws = draws;
      });
      await page.goto('/tests/demos/backgrounds/topography', {
        waitUntil: 'networkidle',
      });
      const drawn = await page.evaluate(() => {
        const w = window as unknown as {
          __step: () => void;
          __draws: number[];
        };
        for (let i = 0; i < 240; i++) w.__step();
        w.__draws.length = 0;
        for (let i = 0; i < 120; i++) w.__step();
        return [...new Set(w.__draws)];
      });
      expect(drawn.length).toBeGreaterThanOrEqual(118);
    });

    test('the relief rises on mount from a blank canvas: the lines bloom out', async ({
      page,
    }) => {
      await page.addInitScript(() => {
        let now = 0;
        let queue: FrameRequestCallback[] = [];
        const base = performance.now();
        performance.now = () => base + now;
        window.requestAnimationFrame = (callback) => {
          queue.push(callback);
          return queue.length;
        };
        window.cancelAnimationFrame = () => {};
        (window as unknown as { __step: (ms: number) => void }).__step = (
          ms,
        ) => {
          now += ms;
          const due = queue;
          queue = [];
          for (const callback of due) callback(base + now);
        };
      });
      await page.goto('/tests/demos/backgrounds/topography', {
        waitUntil: 'networkidle',
      });
      const section = page.locator('[data-slot="topography-background"]');
      const step = (frames: number) =>
        page.evaluate((frames) => {
          const w = window as unknown as { __step: (ms: number) => void };
          for (let i = 0; i < frames; i++) w.__step(1000 / 60);
        }, frames);
      expect(await paintedPixels(section)).toBeLessThan(100);
      await step(2);
      const early = await paintedPixels(section);
      await step(150);
      const late = await paintedPixels(section);
      expect(late).toBeGreaterThan(1000);
      expect(early).toBeLessThan(late * 0.75);
    });

    test('a peak rises under the cursor, its rings tight around it, and sinks when it leaves', async ({
      page,
    }) => {
      await open(page);
      const section = page.getByTestId('topography');
      await show(section);
      await page.waitForTimeout(2000);
      const box = (await section.boundingBox())!;
      const spot = { x: 320, y: 200 };
      const before = await inCircle(section, spot, 0, 70);
      await page.mouse.move(box.x + spot.x - 60, box.y + spot.y);
      await page.mouse.move(box.x + spot.x, box.y + spot.y, { steps: 5 });
      await expect
        .poll(() => inCircle(section, spot, 0, 70), { timeout: 3000 })
        .toBeGreaterThan(before * 1.5 + 50);
      const raised = await inCircle(section, spot, 0, 70);
      await page.mouse.move(box.x + box.width + 40, box.y - 40);
      await expect
        .poll(() => inCircle(section, spot, 0, 70), { timeout: 4000 })
        .toBeLessThan(raised * 0.7);
    });

    test('a click sends a wave out from the point, which fades away', async ({
      page,
    }) => {
      await open(page);
      const section = page.getByTestId('topography');
      await show(section);
      await page.waitForTimeout(2000);
      const box = (await section.boundingBox())!;
      const spot = { x: 320, y: 200 };
      await page.mouse.move(box.x + spot.x, box.y + spot.y);
      await page.waitForTimeout(1500);
      const quiet = await inCircle(section, spot, 90, 190);
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(250);
      const wave = await inCircle(section, spot, 90, 190);
      expect(wave).toBeGreaterThan(quiet * 1.3);
      await page.waitForTimeout(3000);
      expect(await inCircle(section, spot, 90, 190)).toBeLessThan(wave);
    });

    test('lineColor paints the lines; the default takes the text color', async ({
      page,
    }) => {
      await open(page);
      const colors = async (id: string) => {
        const section = page.getByTestId(id);
        await show(section);
        await page.waitForTimeout(2000);
        return section
          .locator('canvas')
          .evaluate((canvas: HTMLCanvasElement) => {
            const copy = document.createElement('canvas');
            copy.width = canvas.width;
            copy.height = canvas.height;
            const context = copy.getContext('2d')!;
            context.drawImage(canvas, 0, 0);
            const { data } = context.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            for (let i = 0; i < data.length; i += 4)
              if (data[i + 3]! > 200)
                return [data[i], data[i + 1], data[i + 2]];
            return null;
          });
      };
      expect(await colors('topography-red')).toEqual([255, 0, 0]);
      const text = await page.getByTestId('topography').evaluate((el) => {
        const probe = document.createElement('canvas').getContext('2d')!;
        probe.fillStyle = getComputedStyle(el).color;
        probe.fillRect(0, 0, 1, 1);
        return [...probe.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      });
      const painted = (await colors('topography'))!;
      painted.forEach((channel, i) =>
        expect(Math.abs(channel! - text[i]!)).toBeLessThanOrEqual(2),
      );
    });

    test('reduced motion: no peak and no wave', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const section = page.getByTestId('topography');
      await show(section);
      await page.waitForTimeout(500);
      const still = await frame(section);
      const box = (await section.boundingBox())!;
      await page.mouse.move(box.x + 300, box.y + 200, { steps: 5 });
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(800);
      expect(await frame(section)).toBe(still);
    });
  });
});
