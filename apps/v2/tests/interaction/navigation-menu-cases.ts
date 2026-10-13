import { expect, test, type Page } from '@playwright/test';

import { paintedLeft } from './menubar-handoff';
import { recordSwap, seriesOf, type SwapFrame } from './navigation-menu-swap';

const COPY = '[data-animate-ui-handoff]';
const SURFACE = '[data-slot="trigger-highlight"]';
const SHIFT = 24;

const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

async function hoverBox(
  page: Page,
  box: { x: number; y: number; width: number; height: number },
) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

async function hover(page: Page, name: string) {
  await hoverBox(page, (await button(page, name).boundingBox())!);
}

async function restOf(page: Page, label: string) {
  return (await page
    .getByRole('link', { name: label, exact: true })
    .boundingBox())!.x;
}

async function pixel(page: Page, x: number, y: number) {
  const png = await page.screenshot({
    clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 },
  });
  return page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, png.toString('base64'));
}

function contentsShown(page: Page, duration: number) {
  return page.evaluate(
    (duration) =>
      new Promise<{ t: number; shown: number[] }[]>((resolve) => {
        const frames: { t: number; shown: number[] }[] = [];
        const t0 = performance.now();
        const tick = () => {
          frames.push({
            t: Math.round(performance.now() - t0),
            shown: [
              ...document.querySelectorAll(
                '[data-slot="navigation-menu-content"], [data-animate-ui-handoff]',
              ),
            ].map((el) => Number(getComputedStyle(el).opacity)),
          });
          if (performance.now() - t0 < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    duration,
  );
}

async function expectResizeKeepsSpeed(page: Page, container: string) {
  const widthOf = async () =>
    (await page.locator(container).boundingBox())!.width;
  await page
    .getByTestId('sizes')
    .evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await hover(page, 'Small');
  await page.waitForTimeout(700);
  const start = await widthOf();
  const recording = recordSwap(page, container, 1100);
  await hover(page, 'Medium');
  await page.waitForFunction(
    ({ container, than }) =>
      document.querySelector(container)!.getBoundingClientRect().width > than,
    { container, than: start + 20 },
    { polling: 'raf' },
  );
  await hover(page, 'Large');
  const frames = await recording;
  const end = await widthOf();
  const widths = frames.map((frame) => frame.box.width);
  const trace = frames
    .map((f) => `${Math.round(f.clock)}:${f.box.width.toFixed(1)}`)
    .join(' ');
  const shows = (frame: SwapFrame) =>
    frame.contents.some((c) => !c.copy && c.label.startsWith('Large'));
  const next = frames.findIndex(shows);
  expect(next, trace).toBeGreaterThan(1);
  for (let i = 1; i < widths.length; i++)
    expect(widths[i]!, trace).toBeGreaterThanOrEqual(widths[i - 1]! - 0.5);
  expect(Math.max(...widths), trace).toBeLessThanOrEqual(end + 0.5);
  const speed = (i: number) =>
    (widths[i]! - widths[i - 1]!) / (frames[i]!.clock - frames[i - 1]!.clock);
  const before = Math.max(...frames.slice(1, next).map((_, i) => speed(i + 1)));
  expect(before, trace).toBeGreaterThan(0.1);
  for (const i of [next, next + 1, next + 2])
    expect(speed(i) / before, `frame ${i}: ${trace}`).toBeGreaterThan(0.3);
}

export function describeRadixNavigationMenuCases() {
  test.describe('radix-ui navigation-menu content, more setups', () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 900 } });
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/radix-ui-navigation-menu-swap', {
        waitUntil: 'networkidle',
      });
    });

    test('under StrictMode, the content still changes in place', async ({
      page,
    }) => {
      await hover(page, 'Strict one');
      await page.waitForTimeout(700);
      const one = await restOf(page, 'Strict one link');
      const recording = recordSwap(page, 'body', 600);
      await hover(page, 'Strict two');
      const frames = await recording;
      const two = await restOf(page, 'Strict two link');
      const leaving = seriesOf(frames, 'Strict one link', true);
      expect(leaving.length).toBeGreaterThan(2);
      expect(Math.abs(leaving[0]!.left - one)).toBeLessThan(1.5);
      expect(seriesOf(frames, 'Strict two link', true)).toEqual([]);
      const coming = seriesOf(frames, 'Strict two link', false);
      expect(coming[0]!.shown).toBeLessThan(0.2);
      expect(coming[0]!.left - two).toBeGreaterThan(SHIFT / 2);
    });

    test('right to left, the next content comes from the side the pointer goes', async ({
      page,
    }) => {
      await hover(page, 'Right one');
      await page.waitForTimeout(700);
      const one = await restOf(page, 'Right one link');
      const recording = recordSwap(page, 'body', 600);
      await hover(page, 'Right two');
      const frames = await recording;
      const two = await restOf(page, 'Right two link');
      const coming = seriesOf(frames, 'Right two link', false);
      expect(coming[0]!.left - two).toBeLessThan(-SHIFT / 2);
      const leaving = seriesOf(frames, 'Right one link', true);
      expect(leaving.at(-1)!.left - one).toBeGreaterThan(SHIFT / 2);
    });

    test('resizing on to a larger content before it has grown, it keeps growing at its speed', async ({
      page,
    }) => {
      await expectResizeKeepsSpeed(page, '[data-testid="sizes-viewport"]');
    });

    test("without a viewport, a link's highlight shows on its content", async ({
      page,
    }) => {
      await hover(page, 'Panel');
      await page.waitForTimeout(600);
      const link = (await page
        .getByRole('link', { name: 'Panel link', exact: true })
        .boundingBox())!;
      await hoverBox(page, link);
      await page.waitForTimeout(500);
      const [r, g, b] = await pixel(page, link.x + 3, link.y + 3);
      expect(r).toBeGreaterThan(200);
      expect(g).toBeLessThan(80);
      expect(b).toBeLessThan(80);
    });
  });
}

export function describeBaseNavigationMenuCases() {
  test.describe('base-ui navigation-menu content, more setups', () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 900 } });
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/fixtures/base-ui-navigation-menu-swap', {
        waitUntil: 'networkidle',
      });
    });

    test('kept mounted, a content shows again, and one never shown shows too', async ({
      page,
    }) => {
      for (const name of ['Alpha', 'Beta', 'Alpha', 'Gamma']) {
        await hover(page, name);
        await page.waitForTimeout(700);
        const link = page.getByRole('link', { name: `${name} link` });
        await expect(link).toBeVisible();
        const shown = await link.evaluate((el) => {
          const content = el.closest(
            '[data-slot="navigation-menu-content"], [data-open]',
          ) as HTMLElement;
          let opacity = 1;
          for (let e: Element | null = el; e; e = e.parentElement)
            opacity *= Number(getComputedStyle(e).opacity);
          return { opacity, inline: content.style.opacity };
        });
        expect(shown, name).toEqual({ opacity: 1, inline: '' });
      }
    });

    test('a submenu shown in its content (no popup of its own) changes in place too', async ({
      page,
    }) => {
      const glide = async (name: string) => {
        const box = (await button(page, name).boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
          steps: 6,
        });
      };
      await hover(page, 'Parent');
      await page.waitForTimeout(700);
      await glide('One');
      await page.waitForTimeout(700);
      const recording = recordSwap(page, 'body', 700);
      await glide('Two');
      const frames = await recording;
      expect(seriesOf(frames, 'One link', true).length).toBeGreaterThan(2);
      const coming = seriesOf(frames, 'Two link', false);
      expect(coming[0]!.shown).toBeLessThan(0.2);
    });

    test('a link whose label is in its render element still gets a highlight', async ({
      page,
    }) => {
      const link = (await page
        .getByRole('link', { name: 'Docs in render' })
        .boundingBox())!;
      await hoverBox(page, link);
      await page.waitForTimeout(500);
      await expect(
        page.getByRole('link', { name: 'Docs in render' }).locator(SURFACE),
      ).toHaveCount(1);
      const [r, g] = await pixel(page, link.x + 3, link.y + 3);
      expect(r).toBeGreaterThan(200);
      expect(g).toBeLessThan(80);
    });

    test('resizing on to a larger content before it has grown, it keeps growing at its speed', async ({
      page,
    }) => {
      await expectResizeKeepsSpeed(page, '.sizes-popup');
    });

    test('a popup with its own translate moves from where it shows', async ({
      page,
    }) => {
      await hover(page, 'Delta');
      await page.waitForTimeout(700);
      const popup = page.locator('[class*="translate-y-1.5"]');
      const before = (await popup.boundingBox())!.y;
      const tops = page.evaluate(
        () =>
          new Promise<number[]>((resolve) => {
            const seen: number[] = [];
            const t0 = performance.now();
            const tick = () => {
              const el = document.querySelector('[class*="translate-y-1.5"]');
              if (el) seen.push(el.getBoundingClientRect().top);
              if (performance.now() - t0 < 500) requestAnimationFrame(tick);
              else resolve(seen);
            };
            requestAnimationFrame(tick);
          }),
      );
      await hover(page, 'Epsilon');
      for (const top of await tops)
        expect(Math.abs(top - before)).toBeLessThan(0.5);
    });
  });

  test.describe('base-ui navigation-menu content, harder sequences', () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test.beforeEach(async ({ page }) => {
      await page.goto('/tests/demos/base-ui/navigation-menu', {
        waitUntil: 'networkidle',
      });
      await hover(page, 'Getting started');
      await page.waitForTimeout(700);
    });

    test('back and forth faster than it settles, the popup never ends up empty', async ({
      page,
    }) => {
      for (const gap of [130, 200]) {
        await hover(page, 'Components');
        await page.waitForTimeout(700);
        for (const name of ['Getting started', 'Components']) {
          await page.waitForTimeout(gap);
          await hover(page, name);
        }
        const frames = await contentsShown(page, 900);
        for (const frame of frames.filter((frame) => frame.t > 600))
          expect(Math.max(...frame.shown), `${gap}ms, ${frame.t}ms`).toBe(1);
        await expect(
          page.getByRole('link', { name: /Alert Dialog/ }),
        ).toBeVisible();
        await hover(page, 'Getting started');
        await page.waitForTimeout(700);
      }
    });

    test('switching again while the popup moves, the content leaves from where it shows', async ({
      page,
    }) => {
      const recording = recordSwap(page, 'body', 700);
      await hover(page, 'Components');
      await page.waitForTimeout(160);
      await hover(page, 'With Icon');
      const frames = await recording;
      const seen = frames.flatMap((frame) => {
        const found = frame.contents.find(
          (c) => c.label.startsWith('Alert Dialog') && c.shown > 0.02,
        );
        return found ? [{ t: frame.t, ...found }] : [];
      });
      const copied = seen.findIndex((frame) => frame.copy);
      expect(copied).toBeGreaterThan(0);
      expect(
        Math.abs(seen[copied]!.left - seen[copied - 1]!.left),
      ).toBeLessThan(SHIFT / 4);
    });

    test('as painted, switch after switch, the content leaving never jumps', async ({
      page,
    }) => {
      await hover(page, 'Components');
      await page.waitForTimeout(700);
      const row = (await page
        .getByRole('link', { name: /Alert Dialog/ })
        .boundingBox())!;
      for (let run = 0; run < 8; run++) {
        const lefts = await paintedLeft(
          page,
          {
            left: row.x - 30,
            right: row.x + 60,
            top: row.y + 6,
            bottom: row.y + 18,
          },
          () => hover(page, 'Getting started'),
          300,
        );
        const seen = lefts.filter((left): left is number => left !== null);
        expect(seen.length).toBeGreaterThan(2);
        for (let i = 1; i < seen.length; i++) {
          const step = seen[i]! - seen[i - 1]!;
          expect(
            step,
            `run ${run}, frame ${i}: ${seen.join(', ')}`,
          ).toBeLessThan(14);
          expect(
            step,
            `run ${run}, frame ${i}: ${seen.join(', ')}`,
          ).toBeGreaterThan(-3);
        }
        await hover(page, 'Components');
        await page.waitForTimeout(700);
      }
    });
  });
}
