import { expect, test, type Page } from '@playwright/test';

import { paintedLeft } from './menubar-handoff';
import { describeBarTriggers, type BarSetup } from './menubar-triggers';

const CONTENT = '[data-slot="navigation-menu-content"]';
const SHIFT = 24;
const COPY = '[data-animate-ui-handoff]';

type Shown = {
  label: string;
  shown: number;
  left: number;
  copy: boolean;
};

export type SwapFrame = {
  t: number;
  clock: number;
  box: { left: number; width: number };
  contents: Shown[];
  nested: number;
};

export function recordSwap(page: Page, container: string, duration: number) {
  return page.evaluate(
    ({ container, content, copy, duration }) =>
      new Promise<SwapFrame[]>((resolve) => {
        const frames: SwapFrame[] = [];
        const t0 = performance.now();
        const opacity = (el: Element) => Number(getComputedStyle(el).opacity);
        const tick = () => {
          const host = document.querySelector(container);
          const box = host?.getBoundingClientRect();
          const contents = [
            ...document.querySelectorAll(`${content}, ${copy}`),
          ].flatMap((el) => {
            const link = el.querySelector('a');
            if (!link || el.querySelector(content)) return [];
            const title = link.querySelector('div') ?? link;
            return [
              {
                label: (title.textContent ?? '').trim(),
                shown: opacity(el) * opacity(link),
                left: link.getBoundingClientRect().left,
                copy: el.matches(copy),
              },
            ];
          });
          frames.push({
            t: Math.round(performance.now() - t0),
            clock: Number(document.timeline.currentTime),
            box: { left: box?.left ?? 0, width: box?.width ?? 0 },
            contents,
            nested: document.querySelectorAll(`${copy} ${copy}`).length,
          });
          if (performance.now() - t0 < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    { container, content: CONTENT, copy: COPY, duration },
  );
}

const trigger = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

async function hover(page: Page, name: string) {
  const box = (await trigger(page, name).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

async function restOf(page: Page, label: string) {
  return page
    .locator(CONTENT, { hasText: label })
    .locator('a')
    .first()
    .evaluate((el) => el.getBoundingClientRect().left);
}

export function seriesOf(frames: SwapFrame[], label: string, copy: boolean) {
  return frames.flatMap((frame) => {
    const found = frame.contents.find(
      (c) => c.copy === copy && c.label.startsWith(label) && c.shown > 0.02,
    );
    return found ? [{ t: frame.t, ...found }] : [];
  });
}

function expectOneWay(values: number[], way: 1 | -1, slack = 0.5) {
  expect(values.length).toBeGreaterThan(3);
  for (let i = 1; i < values.length; i++)
    expect((values[i]! - values[i - 1]!) * way).toBeGreaterThanOrEqual(-slack);
}

type NavSetup = {
  container: string;
  moves: boolean;
};

export function describeNavigationMenuSwap(
  title: string,
  path: string,
  nav: NavSetup,
) {
  test.describe(title, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await hover(page, 'Getting started');
      await page.waitForTimeout(700);
    });

    test("the content changes in place: Getting started's leaves to the left, Components' comes from the right", async ({
      page,
    }) => {
      const intro = await restOf(page, 'Introduction');
      let recording = recordSwap(page, nav.container, 700);
      await hover(page, 'Components');
      await page.waitForTimeout(40);
      const copy = page.locator(COPY).first();
      await expect(copy).toHaveAttribute('aria-hidden', 'true');
      await expect(copy).toHaveAttribute('inert', '');
      expect(await copy.locator('[id]').count()).toBe(0);
      await expect(
        page.getByRole('link', { name: /Introduction/ }),
      ).toHaveCount(0);
      let frames = await recording;
      const alert = await restOf(page, 'Alert Dialog');

      let leaving = seriesOf(frames, 'Introduction', true);
      expect(Math.abs(leaving[0]!.left - intro)).toBeLessThan(1.5);
      expect(leaving[0]!.shown).toBeGreaterThan(0.75);
      expectOneWay(
        leaving.map((c) => c.left),
        -1,
      );
      expect(leaving.at(-1)!.left - intro).toBeLessThan(-SHIFT / 2);
      expect(leaving.at(-1)!.left - intro).toBeGreaterThanOrEqual(-SHIFT - 0.5);
      const coming = seriesOf(frames, 'Alert Dialog', false);
      expect(coming[0]!.shown).toBeLessThan(0.1);
      expect(coming[0]!.left - alert).toBeGreaterThan(SHIFT / 2);
      expect(coming[0]!.left - alert).toBeLessThanOrEqual(SHIFT + 0.5);
      expectOneWay(
        coming.map((c) => c.left),
        -1,
      );
      expect(coming.at(-1)!.shown).toBe(1);
      expect(Math.abs(coming.at(-1)!.left - alert)).toBeLessThan(0.3);
      await expect(page.locator(COPY)).toHaveCount(0, { timeout: 600 });

      await page.waitForTimeout(300);
      recording = recordSwap(page, nav.container, 600);
      await hover(page, 'Getting started');
      frames = await recording;
      leaving = seriesOf(frames, 'Alert Dialog', true);
      expect(Math.abs(leaving[0]!.left - alert)).toBeLessThan(1.5);
      expectOneWay(
        leaving.map((c) => c.left),
        1,
      );
      const back = seriesOf(frames, 'Introduction', false);
      expect(back[0]!.left - intro).toBeLessThan(-SHIFT / 2);
      expectOneWay(
        back.map((c) => c.left),
        1,
      );
    });

    test("going back and forth, each content shows once, never inside another's", async ({
      page,
    }) => {
      const recording = recordSwap(page, nav.container, 1800);
      for (let pass = 0; pass < 3; pass++)
        for (const name of ['Components', 'Getting started']) {
          await hover(page, name);
          await page.waitForTimeout(130);
        }
      const frames = await recording;
      for (const frame of frames) {
        expect(frame.nested, `${frame.t}ms`).toBe(0);
        const shown = frame.contents
          .filter((c) => c.shown > 0.02)
          .map((c) => c.label);
        expect(new Set(shown).size, `${frame.t}ms: ${shown.join(' + ')}`).toBe(
          shown.length,
        );
      }
    });

    test('back to an item still leaving, its content comes back from where it is', async ({
      page,
    }) => {
      const intro = await restOf(page, 'Introduction');
      const recording = recordSwap(page, nav.container, 900);
      await hover(page, 'Components');
      await page.locator(COPY).first().waitFor({ state: 'attached' });
      await hover(page, 'Getting started');
      const frames = await recording;
      const seen = frames.flatMap((frame) => {
        const found = frame.contents.find(
          (c) => c.label.startsWith('Introduction') && c.shown > 0.02,
        );
        return found ? [{ t: frame.t, ...found }] : [];
      });
      const back = seen.findIndex(
        (frame, i) => i > 0 && !frame.copy && seen[i - 1]!.copy,
      );
      expect(back).toBeGreaterThan(0);
      const leaving = seen[back - 1]!;
      const returning = seen[back]!;
      expect(leaving.shown).toBeGreaterThan(0.1);
      expect(returning.shown).toBeGreaterThan(leaving.shown * 0.6);
      expect(Math.abs(returning.left - leaving.left)).toBeLessThan(1.5);
      const rest = seen.slice(back);
      expect(rest.every((frame) => !frame.copy)).toBe(true);
      for (let i = 1; i < rest.length; i++)
        expect(rest[i]!.shown, `${rest[i]!.t}ms`).toBeGreaterThanOrEqual(
          rest[i - 1]!.shown - 0.01,
        );
      expectOneWay(
        rest.map((frame) => frame.left),
        1,
      );
      expect(rest.at(-1)!.shown).toBe(1);
      expect(Math.abs(rest.at(-1)!.left - intro)).toBeLessThan(0.3);
    });

    test('once it has landed, nothing of the change is left', async ({
      page,
    }) => {
      await hover(page, 'Components');
      await page.waitForTimeout(800);
      await expect(page.locator(COPY)).toHaveCount(0);
      const rest = await page.evaluate(
        ({ container, content }) => {
          const host = document.querySelector<HTMLElement>(container)!;
          const own = document.querySelector<HTMLElement>(content)!;
          return {
            translate: [
              getComputedStyle(host).translate,
              getComputedStyle(own).translate,
            ],
            animations: own.getAnimations().length,
            opacity: getComputedStyle(own).opacity,
          };
        },
        { container: nav.container, content: CONTENT },
      );
      expect(rest).toEqual({
        translate: ['none', 'none'],
        animations: 0,
        opacity: '1',
      });
    });

    test('as painted, the content holds still as the popup starts moving', async ({
      page,
    }) => {
      const row = (await page
        .getByRole('link', { name: /Introduction/ })
        .boundingBox())!;
      const host = (await page.locator(nav.container).boundingBox())!;
      const lefts = await paintedLeft(
        page,
        {
          left: host.x - 12,
          right: row.x + 80,
          top: row.y + 6,
          bottom: row.y + 18,
        },
        () => hover(page, 'Components'),
        300,
      );
      const seen = lefts.filter((left): left is number => left !== null);
      expect(seen.length).toBeGreaterThan(2);
      for (let i = 1; i < seen.length; i++)
        expect(
          seen[i]! - seen[i - 1]!,
          `frame ${i}: ${seen.join(', ')}`,
        ).toBeGreaterThan(-8);
    });

    if (nav.moves)
      test('the popup moves to the next trigger while the contents stay where they are on screen', async ({
        page,
      }) => {
        const intro = await restOf(page, 'Introduction');
        const recording = recordSwap(page, nav.container, 600);
        await hover(page, 'Components');
        const frames = await recording;
        const alert = await restOf(page, 'Alert Dialog');
        const lefts = frames.map((frame) => frame.box.left);
        const start = lefts[0]!;
        const end = lefts.at(-1)!;
        expect(end - start).toBeGreaterThan(40);
        expectOneWay(lefts, 1);
        expect(
          lefts.filter((left) => left > start + 1 && left < end - 1).length,
          lefts.join(', '),
        ).toBeGreaterThanOrEqual(3);
        for (const c of seriesOf(frames, 'Introduction', true)) {
          expect(c.left - intro).toBeLessThanOrEqual(0.5);
          expect(c.left - intro).toBeGreaterThanOrEqual(-SHIFT - 0.5);
        }
        for (const c of seriesOf(frames, 'Alert Dialog', false)) {
          expect(c.left - alert).toBeGreaterThanOrEqual(-0.5);
          expect(c.left - alert).toBeLessThanOrEqual(SHIFT + 0.5);
        }
      });
  });

  test.describe(`${title}, on a spring`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await hover(page, 'Getting started');
      await page.waitForTimeout(700);
    });

    const boxOf = async (page: Page) =>
      (await page.locator(nav.container).boundingBox())!;

    const speedOf = (values: number[], frames: SwapFrame[], i: number) =>
      (values[i]! - values[i - 1]!) / (frames[i]!.clock - frames[i - 1]!.clock);

    const shows = (label: string) => (frame: SwapFrame) =>
      frame.contents.some((c) => !c.copy && c.label.startsWith(label));

    test('resizing to the next content, it starts gently and eases in, never past it', async ({
      page,
    }) => {
      const before = (await boxOf(page)).width;
      const recording = recordSwap(page, nav.container, 900);
      await hover(page, 'Components');
      const frames = await recording;
      const after = (await boxOf(page)).width;
      expect(after - before).toBeGreaterThan(100);
      const widths = frames.map((frame) => frame.box.width);
      const trace = frames
        .map((f) => `${Math.round(f.clock)}:${f.box.width.toFixed(1)}`)
        .join(' ');
      const fastest = Math.max(
        ...widths.slice(1).map((_, i) => speedOf(widths, frames, i + 1)),
      );
      expect(fastest, trace).toBeLessThan((after - before) * 0.0105);
      if (nav.moves) {
        const first = widths.findIndex(
          (width, i) => i > 0 && width > widths[i - 1]! + 0.01,
        );
        expect(first).toBeGreaterThan(0);
        expect(speedOf(widths, frames, first), trace).toBeLessThan(
          speedOf(widths, frames, first + 1) * 0.95,
        );
      }
      expect(Math.max(...widths)).toBeLessThanOrEqual(after + 0.5);
      expect(Math.abs(widths.at(-1)! - after)).toBeLessThan(0.5);
    });

    test('sent back before it has grown, it shrinks back at once, without growing on', async ({
      page,
    }) => {
      const before = (await boxOf(page)).width;
      const recording = recordSwap(page, nav.container, 1000);
      await hover(page, 'Components');
      await page.waitForFunction(
        ({ container, than }) =>
          document.querySelector(container)!.getBoundingClientRect().width >
          than,
        { container: nav.container, than: before + 20 },
        { polling: 'raf' },
      );
      await hover(page, 'Getting started');
      const frames = await recording;
      const gone = frames.findIndex(
        (frame) =>
          shows('Alert Dialog')(frame) && !shows('Introduction')(frame),
      );
      expect(gone).toBeGreaterThan(0);
      const back = gone + frames.slice(gone).findIndex(shows('Introduction'));
      expect(back).toBeGreaterThan(gone);
      const widths = frames.map((frame) => frame.box.width);
      const at = nav.moves ? widths[back - 1]! : widths[back + 1]!;
      expect(at - before).toBeGreaterThan(10);
      expect(Math.max(...widths.slice(back + 1))).toBeLessThanOrEqual(at + 0.5);
      expect(Math.min(...widths)).toBeGreaterThanOrEqual(before - 0.5);
      expect(Math.abs(widths.at(-1)! - before)).toBeLessThan(0.5);
    });

    if (nav.moves) {
      test('swept on before it lands, the popup keeps its speed', async ({
        page,
      }) => {
        const start = (await boxOf(page)).x;
        const recording = recordSwap(page, nav.container, 1100);
        await hover(page, 'Components');
        await page.waitForFunction(
          ({ container, left }) =>
            document.querySelector(container)!.getBoundingClientRect().left >
            left,
          { container: nav.container, left: start + 20 },
          { polling: 'raf' },
        );
        await hover(page, 'With Icon');
        const frames = await recording;
        const end = (await boxOf(page)).x;
        const next = frames.findIndex(shows('Backlog'));
        expect(next).toBeGreaterThan(1);
        const lefts = frames.map((frame) => frame.box.left);
        const before = speedOf(lefts, frames, next - 1);
        expect(before).toBeGreaterThan(0.05);
        const trace = frames
          .map((f) => `${Math.round(f.clock)}:${f.box.left.toFixed(1)}`)
          .join(' ');
        const ratio = speedOf(lefts, frames, next) / before;
        expect(ratio, trace).toBeGreaterThan(0.5);
        expect(ratio, trace).toBeLessThan(2.5);
        for (const i of [next + 1, next + 2])
          expect(speedOf(lefts, frames, i) / before, trace).toBeGreaterThan(
            0.5,
          );
        expect(Math.max(...lefts)).toBeLessThanOrEqual(end + 0.5);
      });

      test('sent back before it lands, the popup turns back at once, without carrying on', async ({
        page,
      }) => {
        const start = (await boxOf(page)).x;
        const recording = recordSwap(page, nav.container, 1100);
        await hover(page, 'With Icon');
        await page.waitForFunction(
          ({ container, left }) =>
            document.querySelector(container)!.getBoundingClientRect().left >
            left,
          { container: nav.container, left: start + 150 },
          { polling: 'raf' },
        );
        await hover(page, 'Components');
        const frames = await recording;
        const components = (await boxOf(page)).x;
        const back = frames.findIndex(shows('Alert Dialog'));
        expect(back).toBeGreaterThan(1);
        const lefts = frames.map((frame) => frame.box.left);
        const at = lefts[back - 1]!;
        expect(at - components).toBeGreaterThan(10);
        expect(Math.max(...lefts.slice(back))).toBeLessThanOrEqual(at + 0.5);
        expect(Math.min(...lefts.slice(back))).toBeGreaterThanOrEqual(
          components - 0.5,
        );
        expect(Math.abs(lefts.at(-1)! - components)).toBeLessThan(0.5);
      });
    }
  });

  test.describe(`${title}, reduced motion`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test('each content fades in place', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path, { waitUntil: 'networkidle' });
      await hover(page, 'Getting started');
      await page.waitForTimeout(700);
      const recording = recordSwap(page, nav.container, 500);
      await hover(page, 'Components');
      const frames = await recording;
      const alert = await restOf(page, 'Alert Dialog');
      expect(
        frames.every((frame) => frame.contents.every((c) => !c.copy)),
      ).toBe(true);
      const coming = seriesOf(frames, 'Alert Dialog', false);
      expect(coming.length).toBeGreaterThan(3);
      for (const c of coming)
        expect(Math.abs(c.left - alert)).toBeLessThan(0.5);
      expect(coming[0]!.shown).toBeLessThan(1);
    });
  });

  test.describe(`${title}, links`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test("a content's links share one highlight, gliding from link to link", async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await hover(page, 'Components');
      await page.waitForTimeout(700);
      const link = (name: string) =>
        page.getByRole('link', { name: new RegExp(`^${name}`) });
      const center = async (name: string) => {
        const box = (await link(name).boundingBox())!;
        return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
      };
      const from = await center('Alert Dialog');
      await page.mouse.move(from.x, from.y);
      await page.waitForTimeout(400);
      const to = await center('Hover Card');
      const recording = page.evaluate(
        () =>
          new Promise<{ left: number; opacity: number }[][]>((resolve) => {
            const frames: { left: number; opacity: number }[][] = [];
            const t0 = performance.now();
            const tick = () => {
              frames.push(
                [
                  ...document.querySelectorAll<HTMLElement>(
                    '[data-slot="navigation-menu-content"] [data-slot="trigger-highlight"]',
                  ),
                ]
                  .map((el) => ({
                    left: el.getBoundingClientRect().left,
                    opacity: Number(getComputedStyle(el).opacity),
                  }))
                  .filter((s) => s.opacity > 0.02),
              );
              if (performance.now() - t0 < 600) requestAnimationFrame(tick);
              else resolve(frames);
            };
            requestAnimationFrame(tick);
          }),
      );
      await page.mouse.move(to.x, to.y);
      const frames = await recording;
      for (const surfaces of frames) expect(surfaces.length).toBe(1);
      const lefts = frames.map((surfaces) => surfaces[0]!.left);
      expectOneWay(lefts, 1, 1.5);
      expect(
        lefts.filter((l) => l > from.box.x + 1 && l < to.box.x - 1).length,
      ).toBeGreaterThanOrEqual(3);
      expect(Math.abs(lefts.at(-1)! - to.box.x)).toBeLessThan(0.5);
      expect(
        await link('Hover Card').evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      ).toBe('rgba(0, 0, 0, 0)');
    });
  });
}

export function describeNavigationMenuTriggerColors(
  title: string,
  path: string,
) {
  test.describe(`${title} triggers' colors`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test('the highlight changes color gently between hovered and open', async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const box = (await trigger(page, 'Getting started').boundingBox())!;
      await hover(page, 'Getting started');
      await page.waitForTimeout(800);
      const alphas = page.evaluate(
        () =>
          new Promise<number[]>((resolve) => {
            const seen: number[] = [];
            const t0 = performance.now();
            const tick = () => {
              const surface = document.querySelector(
                '[data-slot="navigation-menu-trigger"] [data-slot="trigger-highlight"]',
              );
              if (surface) {
                const color = getComputedStyle(surface).backgroundColor;
                const alpha = color.match(/\/\s*([\d.]+)\)|,\s*([\d.]+)\)$/);
                seen.push(alpha ? Number(alpha[1] ?? alpha[2]) : 1);
              }
              if (performance.now() - t0 < 500) requestAnimationFrame(tick);
              else resolve(seen);
            };
            requestAnimationFrame(tick);
          }),
      );
      await page.mouse.move(box.x + box.width / 2, box.y + box.height + 60);
      const seen = await alphas;
      const start = seen[0]!;
      const end = seen.at(-1)!;
      expect(start - end).toBeGreaterThan(0.2);
      expect(
        seen.filter((a) => a < start - 0.02 && a > end + 0.02).length,
      ).toBeGreaterThanOrEqual(3);
    });
  });
}

export function describeNavigationMenuTriggers(title: string, path: string) {
  const setup: BarSetup = {
    triggers:
      '[data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-list"] > li > [data-slot="navigation-menu-link"]',
    locate: (page, name) =>
      name === 'Docs'
        ? page.getByRole('link', { name, exact: true })
        : page.getByRole('button', { name, exact: true }),
    first: 'Getting started',
    second: 'Components',
    third: 'Docs',
    menu: {
      trigger: 'Components',
      content: (page) => page.locator(CONTENT, { hasText: 'Alert Dialog' }),
    },
    open: (page, name) => hover(page, name),
    escapeClears: false,
  };
  test.describe(`${title} triggers`, () => {
    test.use({ viewport: { width: 1280, height: 800 } });
    describeBarTriggers(title, path, setup);
  });
}
