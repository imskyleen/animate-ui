import { expect, test, type Locator, type Page } from '../test';

const ANIMATED = [
  'bubble',
  'fireworks',
  'glow',
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

function paintedPixels(section: Locator) {
  return section.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const { data } = canvas
      .getContext('2d')!
      .getImageData(0, 0, canvas.width, canvas.height);
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

  test.describe('glow', () => {
    const cursorGlow = (section: Locator) =>
      section.locator('[data-slot="glow-cursor"]');
    const opacity = (section: Locator) =>
      cursorGlow(section).evaluate((el) =>
        Number(getComputedStyle(el).opacity),
      );
    const center = (section: Locator) =>
      cursorGlow(section).evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });

    test('a faint glow fades in on the cursor, trails it, then fades out when it leaves', async ({
      page,
    }) => {
      await open(page);
      const section = page.getByTestId('glow');
      await show(section);
      expect(await opacity(section)).toBe(0);
      const box = (await section.boundingBox())!;
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.move(box.x + 120, box.y + 110, { steps: 3 });
      await expect.poll(() => opacity(section)).toBeGreaterThan(0.1);
      expect(await opacity(section)).toBeLessThanOrEqual(0.2);
      await page.mouse.move(box.x + 500, box.y + 300, { steps: 4 });
      const trailing = await center(section);
      expect(trailing.x).toBeLessThan(box.x + 450);
      await expect
        .poll(
          async () => {
            const { x, y } = await center(section);
            return Math.hypot(x - (box.x + 500), y - (box.y + 300));
          },
          { timeout: 4000 },
        )
        .toBeLessThan(10);
      await page.mouse.move(box.x + box.width + 40, box.y - 40);
      await expect.poll(() => opacity(section)).toBe(0);
    });

    test('colors tint the glows; grain={false} leaves the grain out', async ({
      page,
    }) => {
      await open(page);
      const glows = page
        .getByTestId('glow-plain')
        .locator('[data-slot="glow"]');
      await expect(glows).toHaveCount(3);
      const images = await glows.evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).backgroundImage),
      );
      expect(images[0]).toContain('rgb(255, 0, 0)');
      expect(images[1]).toContain('rgb(0, 255, 0)');
      expect(images[2]).toContain('rgb(0, 0, 255)');
      await expect(
        page.getByTestId('glow-plain').locator('[data-slot="glow-grain"]'),
      ).toHaveCount(0);
      await expect(
        page.getByTestId('glow').locator('[data-slot="glow-grain"]'),
      ).toHaveCount(1);
    });

    test('reduced motion: the cursor glow stays hidden', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const section = page.getByTestId('glow');
      await show(section);
      const box = (await section.boundingBox())!;
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.move(box.x + 300, box.y + 200, { steps: 5 });
      await page.waitForTimeout(1200);
      expect(await opacity(section)).toBe(0);
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
          const { data } = canvas
            .getContext('2d')!
            .getImageData(0, 0, canvas.width, canvas.height);
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

    test('the lines are drawn as smooth curves, not as grid segments', async ({
      page,
    }) => {
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

    test('the relief rises on mount: the lines bloom out', async ({ page }) => {
      await page.goto('/tests/fixtures/backgrounds');
      const section = page.getByTestId('topography');
      await section.locator('canvas').waitFor();
      await show(section);
      const early = await paintedPixels(section);
      await page.waitForTimeout(2500);
      expect(early).toBeLessThan((await paintedPixels(section)) * 0.75);
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
            const { data } = canvas
              .getContext('2d')!
              .getImageData(0, 0, canvas.width, canvas.height);
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
