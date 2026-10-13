import { expect, test, type Locator, type Page } from '@playwright/test';

const ANIMATED = [
  'bubble',
  'fireworks',
  'gradient',
  'gravity-stars',
  'hole',
  'stars',
] as const;
const CANVAS = ['fireworks', 'gravity-stars', 'hole'];

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
});
