import { expect, test, type Page } from '../test';

import {
  COLOR,
  FADE,
  INDICATOR,
  LINK,
  SELECTION,
  TRANSPARENT,
  atTempo,
  clickLink,
  clickTwice,
  clickedAt,
  drawnNow,
  expectAtRest,
  expectCovers,
  expectCrossfade,
  expectMomentum,
  expectOneSurface,
  expectSlide,
  expectSlideTiming,
  fadeTiming,
  gotoPagination,
  linkBox,
  outlineOf,
  paintOf,
  record,
  restOn,
  timingsIn,
  translateOf,
  waitFrames,
  type Box,
  type Frame,
} from './pagination-cases';
import {
  expectCurvePace,
  expectSpringPace,
  overshootOf,
  type Sample,
} from './spring-curves';

const PATH = '/tests/fixtures/animate-ui-pagination';
const nav = (id: string) => `[data-testid="${id}"]`;
const CONTROLLED = nav('controlled');

const box = (page: Page, id: string, label: string) =>
  linkBox(page, nav(id), label);
const linkOf = (page: Page, id: string, label: string) =>
  page
    .locator(nav(id))
    .locator(LINK)
    .filter({ hasText: new RegExp(`^${label}$`) });

async function settle(page: Page, id: string, label: string) {
  await restOn(page, nav(id), label);
  expectAtRest(await drawnNow(page, nav(id)), await box(page, id, label));
}

const when = (f: Frame) => `${Math.round(f.t)}ms`;

const alphaOf = (color: string) => {
  const slash = /\/\s*([\d.e-]+)\s*\)$/.exec(color);
  if (slash) return Number(slash[1]);
  const parts = /^rgba?\(([^)]+)\)$/.exec(color)?.[1]?.split(',');
  return parts?.length === 4 ? Number(parts[3]) : 1;
};

const changeAt = (
  page: Page,
  selector: string,
  change: (el: Element) => void,
) =>
  page.locator(selector).evaluate((el, change) => {
    const w = window as unknown as { __frames: unknown[]; __at: number };
    w.__at = w.__frames.length;
    (new Function(`return (${change})`)() as (el: Element) => void)(el);
  }, change.toString());

const pixelsOf = (page: Page, png: Buffer) =>
  page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const { data: rgba } = context.getImageData(
      0,
      0,
      image.width,
      image.height,
    );
    return { width: image.width, height: image.height, rgba: [...rgba] };
  }, png.toString('base64'));

const rgbOf = (page: Page, color: string) =>
  page.evaluate((color) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  }, color);

test.describe('animate-ui pagination primitive', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeEach(async ({ page }) => {
    await gotoPagination(page, PATH);
  });

  test('Root: a nav, its surface as its first child, over the list, under the links, wearing the current link’s look', async ({
    page,
  }) => {
    const root = page.locator(CONTROLLED);
    expect(await root.evaluate((el) => el.tagName)).toBe('NAV');
    await expect(root).toHaveAttribute('data-animate-ui-pagination', '');
    await expect(root).toHaveAttribute('data-animate-ui-pagination-ready', '');
    const layout = await root.evaluate((el) => {
      const surface = el.firstElementChild as HTMLElement;
      const current = el.querySelector('[aria-current="page"]')!;
      const style = getComputedStyle(surface);
      return {
        position: getComputedStyle(el).position,
        isolation: getComputedStyle(el).isolation,
        slot: surface.getAttribute('data-slot'),
        hidden: surface.getAttribute('aria-hidden'),
        surfacePosition: style.position,
        boxSizing: style.boxSizing,
        zIndex: style.zIndex,
        pointerEvents: style.pointerEvents,
        sameClasses: surface.className === current.className,
        links: [
          ...new Set(
            [...el.querySelectorAll('[data-slot="pagination-link"]')].map(
              (link) => getComputedStyle(link).position,
            ),
          ),
        ],
      };
    });
    expect(layout).toEqual({
      position: 'relative',
      isolation: 'isolate',
      slot: 'pagination-indicator',
      hidden: 'true',
      surfacePosition: 'absolute',
      boxSizing: 'border-box',
      zIndex: '1',
      pointerEvents: 'none',
      sameClasses: true,
      links: ['relative'],
    });
    expect(
      await page
        .locator(nav('window'))
        .locator('[data-slot="pagination-ellipsis"]')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).position)),
    ).toEqual(['relative', 'relative']);
    const drawn = await drawnNow(page, CONTROLLED);
    expectAtRest(drawn, await box(page, 'controlled', '1'));
    const outline = await outlineOf(page, CONTROLLED);
    expect(outline.border).not.toBe(TRANSPARENT);
    expect(outline.background).not.toBe(TRANSPARENT);
    expect(outline.shadow).not.toBe('none');
    expect(paintOf(drawn.surfaces[0]!)).toEqual(outline);
    expect(drawn.own).toEqual({
      background: TRANSPARENT,
      border: TRANSPARENT,
      shadow: 'none',
      radius: outline.radius,
    });
    const hit = await root.locator('[aria-current="page"]').evaluate((el) => {
      const b = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2),
      );
    });
    expect(hit).toBe(true);
  });

  test('another page current: one surface slides there on spring.selection, only its translate animated, replacing it (on the compositor)', async ({
    page,
  }) => {
    const [from, to] = [
      await box(page, 'controlled', '1'),
      await box(page, 'controlled', '4'),
    ];
    const outline = await outlineOf(page, CONTROLLED);
    const frames = await record(page, CONTROLLED, '4', () =>
      clickLink(page, CONTROLLED, '4'),
    );
    const timings = timingsIn(frames);
    expectSlideTiming(timings, SELECTION);
    expect(timings.map((t) => t.properties)).toEqual([['translate']]);
    const [slide] = timings;
    expect(slide!.composite).toBe('replace');
    const [dx, dy] = translateOf(slide!.translates[0]!);
    expect(Math.abs(dx! - (from.x - to.x))).toBeLessThan(0.5);
    expect(dy).toBe(0);
    for (const f of frames)
      for (const t of f.surfaces[0]!.timings)
        expect(t.composite, when(f)).toBe('replace');
    expectSlide(frames, from, to);
    for (const f of frames) {
      expect(paintOf(f.surfaces[0]!), when(f)).toEqual(outline);
      expect(f.own, when(f)).toEqual({
        background: TRANSPARENT,
        border: TRANSPARENT,
        shadow: 'none',
        radius: outline.radius,
      });
    }
    await expect(page.getByTestId('controlled-page')).toHaveText('4');
  });

  test('controlled, changed from outside: it slides the same way', async ({
    page,
  }) => {
    const [from, to] = [
      await box(page, 'controlled', '1'),
      await box(page, 'controlled', '3'),
    ];
    const frames = await record(page, CONTROLLED, '3', () =>
      page.getByTestId('controlled-go-3').click(),
    );
    expectSlide(frames, from, to);
  });

  test('a re-render, or the current page clicked again, moves nothing', async ({
    page,
  }) => {
    const one = await box(page, 'controlled', '1');
    const frames = await record(
      page,
      CONTROLLED,
      '1',
      async () => {
        await page.getByTestId('controlled-rerender').click();
        await expect(page.getByTestId('controlled-renders')).toHaveText('1');
        await clickLink(page, CONTROLLED, '1');
      },
      1500,
    );
    expect(frames.length).toBeGreaterThan(10);
    for (const f of frames) expectAtRest(f, one, when(f));
  });

  test('picked again 70ms in, it goes on from where it is with the speed it had', async ({
    page,
  }) => {
    const to = await box(page, 'controlled', '5');
    const frames = await record(page, CONTROLLED, '5', () =>
      clickTwice(page, CONTROLLED, '3', '5'),
    );
    expectMomentum(frames, await clickedAt(page), to);
  });

  test('sent back on the way, it turns back from where it is, without carrying on', async ({
    page,
  }) => {
    const to = await box(page, 'controlled', '2');
    const three = await box(page, 'controlled', '3');
    const frames = await record(page, CONTROLLED, '2', () =>
      clickTwice(page, CONTROLLED, '5', '2', { past: three.x }),
    );
    expectOneSurface(frames);
    const at = await clickedAt(page);
    const xs = frames.map((f) => f.surfaces[0]!.x);
    expect(xs[at - 1]! - to.x).toBeGreaterThan(5);
    expect(xs[at - 1]!).toBeGreaterThan(xs[at - 2]!);
    const back = xs.slice(at);
    expect(Math.max(...back)).toBeLessThanOrEqual(back[0]! + 0.5);
    expect(Math.abs(back[0]! - xs[at - 1]!)).toBeLessThan(20);
    const past = overshootOf(SELECTION) * (back[0]! - to.x) + 0.5;
    expect(Math.min(...back)).toBeGreaterThanOrEqual(to.x - past);
    expect(Math.abs(back.at(-1)! - to.x)).toBeLessThan(0.5);
  });

  test('AnimateUIProvider tempo={2}: the same spring, paced (stiffness / 4, damping / 2)', async ({
    page,
  }) => {
    const slow = atTempo(SELECTION, 2);
    const [from, to] = [
      await box(page, 'tempo', '1'),
      await box(page, 'tempo', '4'),
    ];
    const frames = await record(
      page,
      nav('tempo'),
      '4',
      () => clickLink(page, nav('tempo'), '4'),
      1600,
    );
    expectSlideTiming(timingsIn(frames), slow);
    expectSlide(frames, from, to, slow);
  });

  test('transition: its own, a 400ms linear tween', async ({ page }) => {
    const [from, to] = [
      await box(page, 'custom', '1'),
      await box(page, 'custom', '4'),
    ];
    const frames = await record(page, nav('custom'), '4', () =>
      clickLink(page, nav('custom'), '4'),
    );
    expect(
      timingsIn(frames).map(({ duration, easing, properties, composite }) => ({
        duration,
        easing,
        properties,
        composite,
      })),
    ).toEqual([
      {
        duration: 400,
        easing: 'linear',
        properties: ['translate'],
        composite: 'replace',
      },
    ]);
    expectOneSurface(frames);
    const xs = frames.map((f) => f.surfaces[0]!.x);
    expect(
      xs.filter((x) => x > from.x + 2 && x < to.x - 2).length,
    ).toBeGreaterThanOrEqual(10);
    expect(Math.max(...xs)).toBeLessThanOrEqual(to.x + 0.5);
    expectCurvePace(
      frames.map((f): Sample => [f.t, f.surfaces[0]!.x]),
      { duration: 400, ease: [0, 0, 1, 1] },
      {
        from: from.x,
        to: to.x,
        a: from.x + (to.x - from.x) * 0.1,
        b: from.x + (to.x - from.x) * 0.9,
      },
    );
    expect(Math.abs(xs.at(-1)! - to.x)).toBeLessThan(0.5);
  });

  test('links of different sizes: its width and height slide with it, on the same spring', async ({
    page,
  }) => {
    const WIDTHS = nav('widths');
    const [a, wide] = [
      await box(page, 'widths', 'A'),
      await box(page, 'widths', 'Wide page'),
    ];
    expect(wide.w - a.w).toBeGreaterThan(40);
    let frames = await record(page, WIDTHS, 'Wide page', () =>
      clickLink(page, WIDTHS, 'Wide page'),
    );
    const timings = timingsIn(frames);
    expectSlideTiming(timings, SELECTION);
    const resize = timings.find((t) => t.properties.includes('width'))!;
    expect(resize, 'a width and height animation').toBeDefined();
    expect(resize.properties.sort()).toEqual(['height', 'width']);
    expect(resize.duration).toBe(timings[0]!.duration);
    expect(resize.easing).toBe(timings[0]!.easing);
    expectOneSurface(frames);
    const ws = frames.map((f) => f.surfaces[0]!.w);
    expect(
      ws.filter((w) => w > a.w + 2 && w < wide.w - 2).length,
    ).toBeGreaterThanOrEqual(3);
    expectSpringPace(
      frames.map((f): Sample => [f.t, f.surfaces[0]!.w]),
      SELECTION,
      {
        from: a.w,
        to: wide.w,
        a: a.w + (wide.w - a.w) * 0.1,
        b: a.w + (wide.w - a.w) * 0.9,
      },
    );
    expectAtRest(frames.at(-1)!, wide);

    const tall = await box(page, 'widths', 'Tall');
    expect(tall.h - wide.h).toBeGreaterThan(10);
    frames = await record(page, WIDTHS, 'Tall', () =>
      clickLink(page, WIDTHS, 'Tall'),
    );
    expectOneSurface(frames);
    const hs = frames.map((f) => f.surfaces[0]!.h);
    expect(
      hs.filter((h) => h > wide.h + 1 && h < tall.h - 1).length,
    ).toBeGreaterThanOrEqual(3);
    const ys = frames.map((f) => f.surfaces[0]!.y);
    expect(
      ys.filter((y) => y < wide.y - 1 && y > tall.y + 1).length,
    ).toBeGreaterThanOrEqual(3);
    expectSpringPace(
      frames.map((f): Sample => [f.t, f.surfaces[0]!.h]),
      SELECTION,
      {
        from: wide.h,
        to: tall.h,
        a: wide.h + (tall.h - wide.h) * 0.1,
        b: wide.h + (tall.h - wide.h) * 0.9,
      },
    );
    expectAtRest(frames.at(-1)!, tall);
  });

  test('a window of pages: the new current link where the surface is, the numbers shifting around it, nothing moves', async ({
    page,
  }) => {
    const WINDOW = nav('window');
    const place = await box(page, 'window', '5');
    for (const [label, old] of [
      ['6', '5'],
      ['5', '6'],
    ] as const) {
      const frames = await record(
        page,
        WINDOW,
        label,
        () => clickLink(page, WINDOW, label),
        600,
      );
      for (const f of frames) expectAtRest(f, place, when(f));
      const now = await box(page, 'window', label);
      expect(Math.abs(now.x - place.x)).toBeLessThan(0.5);
      expect(
        Math.abs((await box(page, 'window', old)).x - place.x),
      ).toBeGreaterThan(20);
    }
  });

  test('a window of pages: the old current link moving in the same commit, it slides from where it was drawn', async ({
    page,
  }) => {
    const WINDOW = nav('window');
    await page.getByTestId('window-go-3').click();
    await settle(page, 'window', '3');
    const from = await box(page, 'window', '3');
    const frames = await record(page, WINDOW, '4', () =>
      clickLink(page, WINDOW, '4'),
    );
    const [moved, to] = [
      await box(page, 'window', '3'),
      await box(page, 'window', '4'),
    ];
    expect(moved.x - from.x).toBeGreaterThan(10);
    expect(to.x - moved.x).toBeGreaterThan(10);
    const after = frames.filter((f) => f.t >= 0);
    expect(after[0]!.surfaces[0]!.x).toBeLessThan(
      from.x + (to.x - from.x) * 0.2,
    );
    expectSlide(frames, from, to);
  });

  test('remounted (a new key) on another page: it shows there at once, nothing moves, the link’s own look gone without its transition', async ({
    page,
  }) => {
    const REMOUNT = nav('remount');
    const link = linkOf(page, 'remount', '1');
    expect(
      await link.evaluate((el) => getComputedStyle(el).transitionProperty),
    ).toBe('all');
    const outline = await outlineOf(page, REMOUNT);
    expect(alphaOf(outline.border)).toBeLessThan(1);
    expect(alphaOf(outline.border)).toBeGreaterThan(0);
    for (const label of ['4', '1']) {
      const place = await box(page, 'remount', label);
      const frames = await record(
        page,
        REMOUNT,
        label,
        () => page.getByTestId('remount-button').click(),
        600,
      );
      const mounted = frames.filter((f) => f.t >= 0);
      expect(mounted.filter((f) => f.surfaces.length).length).toBeGreaterThan(
        10,
      );
      for (const f of mounted) {
        if (!f.surfaces.length) {
          expect(f.own!.border, when(f)).not.toBe(TRANSPARENT);
          continue;
        }
        expectAtRest(f, place, when(f));
        expect(f.own, when(f)).toEqual({
          background: TRANSPARENT,
          border: TRANSPARENT,
          shadow: 'none',
          radius: outline.radius,
        });
      }
    }
  });

  test('nested: each pagination slides its own surface only', async ({
    page,
  }) => {
    const [OUTER, INNER] = [nav('nested-outer'), nav('nested-inner')];
    const outer1 = await box(page, 'nested-outer', 'Outer 1');
    const [inner1, inner3] = [
      await box(page, 'nested-inner', 'Inner 1'),
      await box(page, 'nested-inner', 'Inner 3'),
    ];
    const still = await record(
      page,
      OUTER,
      'Outer 1',
      async () => {
        await clickLink(page, INNER, 'Inner 3');
      },
      1000,
    );
    for (const f of still) expectAtRest(f, outer1, when(f));
    expectAtRest(await drawnNow(page, INNER), inner3);
    const outer2 = await box(page, 'nested-outer', 'Outer 2');
    const [frames, inner] = await Promise.all([
      record(page, OUTER, 'Outer 2', () => clickLink(page, OUTER, 'Outer 2')),
      page.evaluate(
        (inner) =>
          new Promise<number[]>((resolve) => {
            const xs: number[] = [];
            const root = document.querySelector(inner)!;
            const tick = () => {
              const el = root.firstElementChild!;
              xs.push(
                el.getBoundingClientRect().left -
                  root.getBoundingClientRect().left,
              );
              if (xs.length < 30) requestAnimationFrame(tick);
              else resolve(xs);
            };
            requestAnimationFrame(tick);
          }),
        INNER,
      ),
    ]);
    expectSlide(frames, outer1, outer2);
    for (const x of inner) expect(Math.abs(x - inner3.x)).toBeLessThan(0.5);
    expect(inner1.x).toBeLessThan(inner3.x);
  });

  test('nested: hovering the inner pagination’s current link leaves the outer surface’s background as it is', async ({
    page,
  }) => {
    const [OUTER, INNER] = [nav('nested-outer'), nav('nested-inner')];
    const outline = await outlineOf(page, OUTER);
    const frames = await record(
      page,
      OUTER,
      'Outer 1',
      () => linkOf(page, 'nested-inner', 'Inner 1').hover(),
      600,
    );
    await expect
      .poll(async () => (await drawnNow(page, INNER)).surfaces[0]!.background)
      .toBe(TRANSPARENT);
    for (const f of [...frames, await drawnNow(page, OUTER)])
      expect(
        paintOf(f.surfaces[0]!),
        't' in f ? when(f as Frame) : 'now',
      ).toEqual(outline);
  });

  test('nested before its own links: the outer surface is on its own current link, not the inner one’s; without one of its own, it has none', async ({
    page,
  }) => {
    const [OUTER, INNER] = [
      nav('nested-first-outer'),
      nav('nested-first-inner'),
    ];
    expect(
      await page
        .locator(OUTER)
        .evaluate((el) =>
          el
            .querySelector(
              '[data-slot="pagination-link"][aria-current="page"]',
            )!
            .textContent?.trim(),
        ),
    ).toBe('Inner 1');
    const [outer1, inner1] = [
      await box(page, 'nested-first-outer', 'Outer 1'),
      await box(page, 'nested-first-inner', 'Inner 1'),
    ];
    expectAtRest(await drawnNow(page, OUTER), outer1);
    expectAtRest(await drawnNow(page, INNER), inner1);
    const outer3 = await box(page, 'nested-first-outer', 'Outer 3');
    const frames = await record(page, OUTER, 'Outer 3', () =>
      clickLink(page, OUTER, 'Outer 3'),
    );
    expectSlide(frames, outer1, outer3);
    expectAtRest(await drawnNow(page, INNER), inner1);
    await page.getByTestId('nested-first-none').click();
    await expect(page.locator(OUTER)).not.toHaveAttribute(
      'data-animate-ui-pagination-ready',
    );
    expect((await drawnNow(page, OUTER)).surfaces).toHaveLength(0);
    expectAtRest(await drawnNow(page, INNER), inner1);
  });

  test('hovered, the current link paints its own hover background; keyboard-focused, its own focus border and ring', async ({
    page,
  }) => {
    const one = await box(page, 'controlled', '1');
    const own = (label: string) =>
      linkOf(page, 'controlled', label).evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          background: style.backgroundColor,
          border: style.borderTopColor,
          shadow: style.boxShadow,
        };
      });
    await linkOf(page, 'controlled', '2').hover();
    const hover = (await own('2')).background;
    expect(hover).not.toBe(TRANSPARENT);
    await linkOf(page, 'controlled', '1').hover();
    expect((await own('1')).background).toBe(hover);
    expect((await own('1')).border).toBe(TRANSPARENT);
    expectAtRest(await drawnNow(page, CONTROLLED), one);
    await page.mouse.move(0, 0);
    expect((await own('1')).background).toBe(TRANSPARENT);
    const outline = await outlineOf(page, CONTROLLED);
    await expect
      .poll(
        async () => (await drawnNow(page, CONTROLLED)).surfaces[0]!.background,
      )
      .toBe(outline.background);

    await linkOf(page, 'controlled', '3').focus();
    await page.keyboard.press('Shift+Tab');
    const focus = await own('2');
    expect(focus.border).not.toBe(TRANSPARENT);
    expect(focus.shadow).not.toBe('none');
    await page.keyboard.press('Shift+Tab');
    await expect(linkOf(page, 'controlled', '1')).toBeFocused();
    const focused = await own('1');
    expect(focused.border).toBe(focus.border);
    expect(focused.shadow).not.toBe('none');
    expect(focused.background).toBe(TRANSPARENT);
    const drawn = await drawnNow(page, CONTROLLED);
    expectAtRest(drawn, one);
    expect(paintOf(drawn.surfaces[0]!)).toEqual(outline);
  });

  test('hovered, the current link’s surface fades its own background away on transition.color (200ms, ease; 400ms under tempo={2}), and back', async ({
    page,
  }) => {
    for (const [id, duration] of [
      ['controlled', COLOR.duration],
      ['tempo', COLOR.duration * 2],
    ] as const) {
      const NAV = nav(id);
      const transition = await page
        .locator(NAV)
        .locator(`> ${INDICATOR}`)
        .evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            property: style.transitionProperty,
            duration: style.transitionDuration,
            easing: style.transitionTimingFunction,
          };
        });
      expect(transition, id).toEqual({
        property: 'background-color',
        duration: `${duration / 1000}s`,
        easing: COLOR.easing,
      });
      const outline = await outlineOf(page, NAV);
      expect(alphaOf(outline.background)).toBe(1);
      const alphas = async (act: () => Promise<unknown>) =>
        (await record(page, NAV, '1', act, duration + 800)).map((f) =>
          alphaOf(f.surfaces[0]!.background),
        );
      const out = await alphas(() => linkOf(page, id, '1').hover());
      expect(out[0], id).toBe(1);
      expect(out.at(-1), id).toBe(0);
      expect(
        out.filter((a) => a > 0.05 && a < 0.95).length,
        `${id}: ${out.join(' ')}`,
      ).toBeGreaterThanOrEqual(duration / 70);
      for (let i = 1; i < out.length; i++)
        expect(out[i]!, id).toBeLessThanOrEqual(out[i - 1]! + 0.001);
      const back = await alphas(() => page.mouse.move(0, 0));
      expect(back[0], id).toBe(0);
      expect(back.at(-1), id).toBe(1);
      expect(
        back.filter((a) => a > 0.05 && a < 0.95).length,
        `${id}: ${back.join(' ')}`,
      ).toBeGreaterThanOrEqual(duration / 70);
      expect(paintOf((await drawnNow(page, NAV)).surfaces[0]!)).toEqual(
        outline,
      );
    }
  });

  test("in a nav whose width isn't a whole number of pixels, it covers the current link exactly", async ({
    page,
  }) => {
    for (const id of ['window', 'nested-inner']) {
      const width = await page
        .getByTestId(id)
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(Math.abs(width - Math.round(width)), id).toBeGreaterThan(0.01);
      const drawn = await drawnNow(page, nav(id));
      const link = await box(page, id, drawn.current!);
      const [surface] = drawn.surfaces;
      for (const key of ['x', 'y', 'w', 'h'] as const)
        expect(
          Math.abs(surface![key] - link[key]),
          `${id} ${key}`,
        ).toBeLessThan(0.005);
    }
  });

  test('under an ancestor scaled close to 1 (1.02, 0.985): measured in the nav’s own pixels, it still covers the current link exactly once the scale is gone', async ({
    page,
  }) => {
    const SCALED = nav('scaled');
    const wrap = page.getByTestId('scaled-wrap');
    for (const [scale, label] of [
      ['1.02', '3'],
      ['0.985', '5'],
    ] as const) {
      await wrap.evaluate((el, scale) => {
        (el as HTMLElement).style.scale = scale;
      }, scale);
      const size = await page.locator(SCALED).evaluate((el) => ({
        drawn: el.getBoundingClientRect().height,
        own: (el as HTMLElement).offsetHeight,
        width: el.getBoundingClientRect().width / Number(el.style.scale || 1),
      }));
      const off = Math.abs(size.drawn - size.own);
      expect(off, scale).toBeGreaterThan(0.4);
      expect(off, scale).toBeLessThan(1);
      await clickLink(page, SCALED, label);
      await restOn(page, SCALED, label);
      await waitFrames(page, 100);
      await wrap.evaluate((el) => {
        (el as HTMLElement).style.scale = '';
      });
      await waitFrames(page, 5);
      const drawn = await drawnNow(page, SCALED);
      expect(drawn.current).toBe(label);
      expectCovers(drawn, 0.05, scale);
      expect(drawn.surfaces[0]!.animations).toBe(0);
    }
  });

  test('mounted inside an ancestor coming in like a dialog (perspective, rotateX, scale): once it has come in, it covers the current link exactly', async ({
    page,
  }) => {
    const ENTRANCE = nav('entrance');
    const frames = await record(
      page,
      ENTRANCE,
      '3',
      () => page.getByTestId('entrance-open').click(),
      600,
    );
    const first = frames.find((f) => f.surfaces.length)!;
    expect(first.link!.w).toBeLessThan(30);
    const wrap = page.getByTestId('entrance-wrap');
    await expect
      .poll(() => wrap.evaluate((el) => el.getAnimations().length))
      .toBe(0);
    await waitFrames(page, 3);
    const drawn = await drawnNow(page, ENTRANCE);
    expect(drawn.current).toBe('3');
    expect(drawn.link!.w).toBe(32);
    expectCovers(drawn, 0.05);
    expect(drawn.surfaces[0]!.animations).toBe(0);
  });

  test('text beside the links changing in place (a text node): it follows the current link at once, without sliding', async ({
    page,
  }) => {
    const LABEL = nav('label');
    const before = await box(page, 'label', '2');
    const frames = await record(
      page,
      LABEL,
      '2',
      () =>
        changeAt(page, '[data-testid="label-text"]', (el) => {
          el.firstChild!.nodeValue = 'Showing page 2 of 1,234 pages';
        }),
      400,
    );
    const at = await clickedAt(page);
    const after = await box(page, 'label', '2');
    expect(after.x - before.x).toBeGreaterThan(50);
    expect(after.w).toBe(before.w);
    expect(
      await page
        .locator(LABEL)
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBe(480);
    for (const [i, f] of frames.entries()) {
      expect(f.surfaces, when(f)).toHaveLength(1);
      const [surface] = f.surfaces;
      expect(surface!.animations, when(f)).toBe(0);
      const x = surface!.x;
      expect(
        Math.min(Math.abs(x - before.x), Math.abs(x - after.x)),
        `${when(f)}: x ${x}`,
      ).toBeLessThan(0.05);
      if (i >= at + 2) expectCovers(f, 0.05, when(f));
    }
    expectCovers(await drawnNow(page, LABEL), 0.05);
  });

  test('a list scrolling inside the nav: it follows the current link at once', async ({
    page,
  }) => {
    const SCROLL = nav('scroll');
    const before = await box(page, 'scroll', '4');
    const frames = await record(
      page,
      SCROLL,
      '4',
      () =>
        changeAt(page, `${SCROLL} ul`, (el) => {
          el.scrollLeft = 60;
        }),
      400,
    );
    const at = await clickedAt(page);
    const after = await box(page, 'scroll', '4');
    expect(after.x - before.x).toBeCloseTo(-60, 1);
    expect(await page.locator(SCROLL).evaluate((el) => el.scrollLeft)).toBe(0);
    for (const [i, f] of frames.entries()) {
      expect(f.surfaces, when(f)).toHaveLength(1);
      expect(f.surfaces[0]!.animations, when(f)).toBe(0);
      if (i >= at + 2) expectCovers(f, 0.05, when(f));
    }
    expectCovers(await drawnNow(page, SCROLL), 0.05);
  });

  test('links with box-sizing: content-box (padding, a border): the surface is the link’s border box, not larger', async ({
    page,
  }) => {
    const CONTENT = nav('content-box');
    const link = linkOf(page, 'content-box', '1');
    expect(await link.evaluate((el) => getComputedStyle(el).boxSizing)).toBe(
      'content-box',
    );
    expectCovers(await drawnNow(page, CONTENT), 0.05);
    const [from, to] = [
      await box(page, 'content-box', '1'),
      await box(page, 'content-box', '3'),
    ];
    const frames = await record(page, CONTENT, '3', () =>
      clickLink(page, CONTENT, '3'),
    );
    expectSlide(frames, from, to);
    expectCovers(frames.at(-1)!, 0.05);
  });

  test('pressed with a press scale (scale, or a transform) easing back: it lands on the link at rest', async ({
    page,
  }) => {
    for (const id of ['press', 'press-transform']) {
      const NAV = nav(id);
      const link = linkOf(page, id, '3');
      await link.scrollIntoViewIfNeeded();
      const target = (await link.boundingBox())!;
      await page.mouse.move(
        target.x + target.width / 2,
        target.y + target.height / 2,
      );
      await page.mouse.down();
      await page.waitForTimeout(200);
      const pressed = await link.evaluate(
        (el) => el.getBoundingClientRect().width,
      );
      expect(pressed, id).toBeLessThan(31.8);
      await page.mouse.up();
      await restOn(page, NAV, '3');
      await expect
        .poll(() => link.evaluate((el) => el.getAnimations().length))
        .toBe(0);
      await waitFrames(page, 3);
      const drawn = await drawnNow(page, NAV);
      expect(drawn.link!.w, id).toBe(32);
      expectCovers(drawn, 0.05, id);
      await page.mouse.move(0, 0);
    }
  });

  test('links translated by a percentage at rest: the surface covers the link exactly, on mount and once it slides', async ({
    page,
  }) => {
    const PERCENT = nav('percent');
    expect(
      await linkOf(page, 'percent', '2').evaluate(
        (el) => getComputedStyle(el).translate,
      ),
    ).toBe('0px -10%');
    expectCovers(await drawnNow(page, PERCENT), 0.05);
    await clickLink(page, PERCENT, '4');
    await restOn(page, PERCENT, '4');
    expectCovers(await drawnNow(page, PERCENT), 0.05);
  });

  test('a list and items with backgrounds: the surface is drawn over them, under the links', async ({
    page,
  }) => {
    const UL = nav('ul-bg');
    const root = page.locator(UL);
    await root.scrollIntoViewIfNeeded();
    const drawn = await drawnNow(page, UL);
    expectAtRest(drawn, await box(page, 'ul-bg', '2'));
    expect(
      await root.evaluate((el) => {
        const link = el.querySelector('[aria-current="page"]')!;
        return [el.querySelector('ul')!, link.parentElement!].map(
          (e) => getComputedStyle(e).backgroundColor,
        );
      }),
    ).not.toContain(TRANSPARENT);
    const geometry = await root.evaluate((el) => {
      const surface = el.firstElementChild!;
      const link = el.querySelector('[aria-current="page"]')!;
      const s = surface.getBoundingClientRect();
      const l = link.getBoundingClientRect();
      return {
        surface: { x: s.x, y: s.y, w: s.width, h: s.height },
        link: { x: l.x, y: l.y, w: l.width, h: l.height },
        border: getComputedStyle(surface).borderTopColor,
      };
    });
    const { surface, link } = geometry;
    const clip = {
      x: Math.floor(surface.x) - 2,
      y: Math.floor(surface.y) - 2,
      width: Math.ceil(surface.w) + 4,
      height: Math.ceil(surface.h) + 4,
    };
    const image = await pixelsOf(page, await page.screenshot({ clip }));
    const at = (x: number, y: number) => {
      const i = ((y - clip.y) * image.width + (x - clip.x)) * 4;
      return image.rgba.slice(i, i + 3);
    };
    const border = await rgbOf(page, geometry.border);
    const middle = Math.round(surface.x + surface.w / 2);
    const top = Math.round(surface.y);
    const distance = Math.min(
      ...[top - 1, top, top + 1].map((y) =>
        Math.max(...at(middle, y).map((c, i) => Math.abs(c - border[i]!))),
      ),
    );
    expect(distance, `border ${border.join(',')}`).toBeLessThanOrEqual(4);
    let darkest = 255;
    for (let y = Math.round(link.y + 8); y < link.y + link.h - 8; y++)
      for (let x = Math.round(link.x + 8); x < link.x + link.w - 8; x++)
        darkest = Math.min(darkest, ...at(x, y));
    expect(darkest).toBeLessThan(100);
    const hit = await root.locator('[aria-current="page"]').evaluate((el) => {
      const b = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2),
      );
    });
    expect(hit).toBe(true);
  });

  test('a copy of the list hidden at this breakpoint (display: none) before the one shown: the surface is on the current link shown', async ({
    page,
  }) => {
    const HIDDEN = nav('hidden-dup');
    expect(
      await page
        .locator(HIDDEN)
        .evaluate(
          (el) =>
            el
              .querySelector(
                '[data-slot="pagination-link"][aria-current="page"]',
              )!
              .getClientRects().length,
        ),
    ).toBe(0);
    const three = await box(page, 'hidden-dup', '3');
    const outline = await outlineOf(page, HIDDEN);
    const drawn = await drawnNow(page, HIDDEN);
    expectAtRest(drawn, three);
    expect(paintOf(drawn.surfaces[0]!)).toEqual(outline);
    expect(drawn.own).toEqual({
      background: TRANSPARENT,
      border: TRANSPARENT,
      shadow: 'none',
      radius: outline.radius,
    });
    const five = await box(page, 'hidden-dup', '5');
    const frames = await record(page, HIDDEN, '5', () =>
      clickLink(page, HIDDEN, '5'),
    );
    expectSlide(frames, three, five);
  });

  test('its page set as it mounts (in a layout effect, in an effect, once its surface shows): nothing slides, from its first frame it rests on that page', async ({
    page,
  }) => {
    for (const id of ['restored-layout', 'restored-effect', 'restored-ready']) {
      const frames = await record(
        page,
        nav(id),
        '3',
        () => page.getByTestId('restored-toggle').click(),
        600,
      );
      const three = await box(page, id, '3');
      const shown = frames.filter((f) => f.current !== null);
      expect(shown.length, id).toBeGreaterThan(10);
      for (const f of shown) {
        expect(f.current, `${id} ${when(f)}`).toBe('3');
        expectAtRest(f, three, `${id} ${when(f)}`);
      }
      await page.getByTestId('restored-toggle').click();
      await expect(page.locator(nav(id))).toHaveCount(0);
    }
  });

  test('pressed with the pointer: it lands where the link rests, not where its press nudge has it', async ({
    page,
  }) => {
    const to = await box(page, 'controlled', '3');
    const link = linkOf(page, 'controlled', '3');
    const target = (await link.boundingBox())!;
    const frames = await record(page, CONTROLLED, '3', async () => {
      await page.mouse.move(
        target.x + target.width / 2,
        target.y + target.height / 2,
      );
      await page.mouse.down();
      await expect
        .poll(() => link.evaluate((el) => getComputedStyle(el).translate))
        .toBe('0px 1px');
      await page.mouse.up();
    });
    for (const f of frames)
      expect(Math.abs(f.surfaces[0]!.y - to.y), when(f)).toBeLessThan(0.05);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    expectAtRest(await drawnNow(page, CONTROLLED), to);
  });
});

test.describe('animate-ui pagination primitive, reduced motion', () => {
  test.describe.configure({ timeout: 120_000 });
  test.use({ reducedMotion: 'reduce' });
  test.beforeEach(async ({ page }) => {
    await gotoPagination(page, PATH);
  });

  test('the copy holds its first opacity until its fade starts: never shown at full opacity first', async ({
    page,
  }) => {
    const fill = await page.evaluate(async (nav) => {
      const root = document.querySelector(nav)!;
      const link = Array.from(
        root.querySelectorAll<HTMLElement>('[data-slot="pagination-link"]'),
      ).find((el) => el.textContent?.trim() === '3')!;
      link.click();
      for (let i = 0; i < 60; i++) {
        const copy = root.querySelector('[data-animate-ui-leaving]');
        const fill = copy?.getAnimations()[0]?.effect?.getTiming().fill;
        if (fill) return fill;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      return null;
    }, CONTROLLED);
    expect(fill).toBe('both');
  });

  test('it crossfades on transition.fade: a copy fades out on the link it leaves, the surface in on the new one', async ({
    page,
  }) => {
    const [from, to] = [
      await box(page, 'controlled', '1'),
      await box(page, 'controlled', '3'),
    ];
    const frames = await record(
      page,
      CONTROLLED,
      '3',
      () => clickLink(page, CONTROLLED, '3'),
      500,
    );
    expect(timingsIn(frames, true)).toEqual([fadeTiming(['1', '0'])]);
    expect(timingsIn(frames)).toEqual([fadeTiming(['0', '1'])]);
    expectCrossfade(frames, from, to);
    const copy = frames.flatMap((f) => f.surfaces).find((s) => s.leaving)!;
    expect(paintOf(copy)).toEqual(await outlineOf(page, CONTROLLED));
    await expect(page.locator('[data-animate-ui-leaving]')).toHaveCount(0);
  });

  test('AnimateUIProvider tempo={2} paces the crossfade: 400ms, out and in', async ({
    page,
  }) => {
    const frames = await record(
      page,
      nav('tempo'),
      '3',
      () => clickLink(page, nav('tempo'), '3'),
      700,
    );
    expect(timingsIn(frames, true)).toEqual([
      fadeTiming(['1', '0'], FADE.duration * 2),
    ]);
    expect(timingsIn(frames)).toEqual([
      fadeTiming(['0', '1'], FADE.duration * 2),
    ]);
  });

  test('its own transition (a 400ms linear tween) leaves the crossfade as it is: transition.fade, 200ms', async ({
    page,
  }) => {
    const CUSTOM = nav('custom');
    const [from, to] = [
      await box(page, 'custom', '1'),
      await box(page, 'custom', '3'),
    ];
    const frames = await record(
      page,
      CUSTOM,
      '3',
      () => clickLink(page, CUSTOM, '3'),
      500,
    );
    expect(timingsIn(frames, true)).toEqual([fadeTiming(['1', '0'])]);
    expect(timingsIn(frames)).toEqual([fadeTiming(['0', '1'])]);
    expectCrossfade(frames, from, to);
  });

  test('links with box-sizing: content-box: the copy fading out and the surface fading in are the links’ border boxes', async ({
    page,
  }) => {
    const CONTENT = nav('content-box');
    const [from, to] = [
      await box(page, 'content-box', '1'),
      await box(page, 'content-box', '3'),
    ];
    const frames = await record(
      page,
      CONTENT,
      '3',
      () => clickLink(page, CONTENT, '3'),
      500,
    );
    expectCrossfade(frames, from, to);
    for (const f of frames)
      for (const s of f.surfaces) {
        const b = s.leaving ? from : Math.abs(s.x - from.x) < 0.5 ? from : to;
        expect(Math.abs(s.w - b.w), when(f)).toBeLessThan(0.05);
        expect(Math.abs(s.h - b.h), when(f)).toBeLessThan(0.05);
      }
  });

  test('changed again while it crossfades: nothing pops, the copy already leaving goes on, the surface leaves from where its fade had it', async ({
    page,
  }) => {
    const TEMPO = nav('tempo');
    const duration = FADE.duration * 2;
    const [one, two, four] = [
      await box(page, 'tempo', '1'),
      await box(page, 'tempo', '2'),
      await box(page, 'tempo', '4'),
    ];
    const frames = await record(
      page,
      TEMPO,
      '4',
      () => clickTwice(page, TEMPO, '2', '4'),
      700,
    );
    const at = await clickedAt(page);
    const on = (b: Box) => (s: Frame['surfaces'][number]) =>
      Math.abs(s.x - b.x) < 0.5 && Math.abs(s.y - b.y) < 0.5;
    for (const f of frames)
      expect(
        f.surfaces.some((s) => s.slides),
        when(f),
      ).toBe(false);
    const fading = frames[at - 1]!.surfaces.find(
      (s) => !s.leaving && on(two)(s),
    )!;
    expect(fading, 'fading in on 2').toBeDefined();
    expect(fading.o).toBeGreaterThan(0.05);
    expect(fading.o).toBeLessThan(0.98);
    const after = frames.slice(at);
    const copy = timingsIn(
      after.map((f) => ({ ...f, surfaces: f.surfaces.filter(on(two)) })),
      true,
    );
    expect(copy, 'a copy fading out on 2').toHaveLength(1);
    const start = Number(copy[0]!.opacities[0]);
    expect(start).toBeGreaterThanOrEqual(fading.o - 0.001);
    expect(start).toBeLessThan(0.98);
    expect(copy[0]!.opacities[1]).toBe('0');
    expect(copy[0]!.easing).toBe(FADE.easing);
    expect(Math.abs(copy[0]!.duration - duration * start)).toBeLessThan(1);
    const leaving2 = after
      .flatMap((f) => f.surfaces.filter((s) => s.leaving && on(two)(s)))
      .map((s) => s.o);
    expect(leaving2.length).toBeGreaterThan(2);
    expect(leaving2[0]!).toBeLessThanOrEqual(start + 0.001);
    for (let i = 1; i < leaving2.length; i++)
      expect(leaving2[i]!).toBeLessThanOrEqual(leaving2[i - 1]! + 0.001);
    const leaving1 = frames
      .flatMap((f) => f.surfaces.filter((s) => s.leaving && on(one)(s)))
      .map((s) => s.o);
    for (let i = 1; i < leaving1.length; i++)
      expect(leaving1[i]!).toBeLessThanOrEqual(leaving1[i - 1]! + 0.001);
    expect(leaving1.at(-1)!).toBeLessThan(0.1);
    expect(
      timingsIn(
        after.map((f) => ({ ...f, surfaces: f.surfaces.filter(on(four)) })),
      ),
    ).toEqual([fadeTiming(['0', '1'], duration)]);
    const coming = after
      .flatMap((f) => f.surfaces.filter((s) => !s.leaving && on(four)(s)))
      .map((s) => s.o);
    expect(coming.length).toBeGreaterThan(2);
    expect(coming[0]!, coming.join(' ')).toBeLessThan(0.3);
    for (let i = 1; i < coming.length; i++)
      expect(coming[i]!).toBeGreaterThanOrEqual(coming[i - 1]! - 0.001);
    const partly = (o: number) => o > 0.02 && o < 0.98;
    expect(
      after.filter(
        (f) =>
          f.surfaces.some((s) => s.leaving && on(two)(s) && partly(s.o)) &&
          f.surfaces.some((s) => !s.leaving && on(four)(s) && partly(s.o)),
      ).length,
      'frames crossfading from 2 to 4',
    ).toBeGreaterThanOrEqual(1);
    expectAtRest(frames.at(-1)!, four);
    await expect(page.locator('[data-animate-ui-leaving]')).toHaveCount(0);
  });
});
