import { expect, test, type Page } from '@playwright/test';

import {
  expectCssSpring,
  expectSpringPace,
  linearPoints,
  overshootOf,
  springAsCss,
  type Sample,
  type SpringOptions,
} from './spring-curves';

export const LINK = '[data-slot="pagination-link"]';
export const INDICATOR = '[data-slot="pagination-indicator"]';
export const TRANSPARENT = 'rgba(0, 0, 0, 0)';
export const SELECTION: SpringOptions = { stiffness: 300, damping: 30 };
export const FADE = { duration: 200, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };
export const COLOR = {
  duration: 200,
  easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
};

export const fadeTiming = (
  opacities: string[],
  duration: number = FADE.duration,
): Timing => ({
  duration,
  easing: FADE.easing,
  properties: ['opacity'],
  opacities,
  composite: 'replace',
  translates: opacities.map(() => null),
});

export const atTempo = (
  spring: SpringOptions,
  tempo: number,
): SpringOptions => ({
  stiffness: spring.stiffness / tempo ** 2,
  damping: spring.damping / tempo,
});

export type Box = { x: number; y: number; w: number; h: number };

export type Paint = {
  background: string;
  border: string;
  shadow: string;
  radius: string;
};

export type Surface = Box &
  Paint & {
    o: number;
    leaving: boolean;
    animations: number;
    slides: boolean;
    slideStart: number | null;
    slideTime: number | null;
    timings: Timing[];
  };

export type Timing = {
  duration: number;
  easing: string;
  properties: string[];
  opacities: (string | null)[];
  composite: string;
  translates: (string | null)[];
};

export type Drawn = {
  surfaces: Surface[];
  current: string | null;
  own: Paint | null;
  link: Box | null;
};

export type Frame = Drawn & { t: number };

function readPagination(nav: Element | null) {
  if (!nav) return { surfaces: [], current: null, own: null, link: null };
  const origin = nav.getBoundingClientRect();
  const boxOf = (el: Element) => {
    const box = el.getBoundingClientRect();
    return {
      x: box.left - origin.left,
      y: box.top - origin.top,
      w: box.width,
      h: box.height,
    };
  };
  const paint = (el: Element) => {
    const style = getComputedStyle(el);
    return {
      background: style.backgroundColor,
      border: style.borderTopColor,
      shadow: style.boxShadow,
      radius: style.borderTopLeftRadius,
    };
  };
  const time = (value: CSSNumberish | null) =>
    value === null ? null : Number(value);
  const surfaces = Array.from(nav.children)
    .filter((el) => el.getAttribute('data-slot') === 'pagination-indicator')
    .map((el) => {
      const animations = el
        .getAnimations()
        .filter((animation) => !('transitionProperty' in animation));
      const timings = animations.map((animation) => {
        const effect = animation.effect as KeyframeEffect;
        const timing = effect.getTiming();
        const keyframes = effect.getKeyframes();
        const skip = ['offset', 'easing', 'composite', 'computedOffset'];
        return {
          duration: Number(timing.duration),
          easing: String(timing.easing),
          properties: [
            ...new Set(
              keyframes.flatMap((keyframe) =>
                Object.keys(keyframe).filter((key) => !skip.includes(key)),
              ),
            ),
          ].sort(),
          opacities: keyframes.map((keyframe) =>
            keyframe.opacity === undefined ? null : String(keyframe.opacity),
          ),
          composite: String(effect.composite),
          translates: keyframes.map((keyframe) =>
            keyframe.translate === undefined
              ? null
              : String(keyframe.translate),
          ),
        };
      });
      const slide = animations[
        timings.findIndex((timing) => timing.properties.includes('translate'))
      ] as Animation | undefined;
      return {
        ...boxOf(el),
        o: Number(getComputedStyle(el).opacity),
        leaving: el.hasAttribute('data-animate-ui-leaving'),
        animations: animations.length,
        slides: slide !== undefined,
        slideStart: slide ? time(slide.startTime) : null,
        slideTime: slide ? time(slide.currentTime) : null,
        timings,
        ...paint(el),
      };
    });
  const current = Array.from(
    nav.querySelectorAll('[data-slot="pagination-link"][aria-current="page"]'),
  ).find(
    (el) =>
      el.closest('[data-animate-ui-pagination]') === nav &&
      el.getClientRects().length > 0,
  );
  return {
    surfaces,
    current: current?.textContent?.trim() ?? null,
    own: current ? paint(current) : null,
    link: current ? boxOf(current) : null,
  };
}
const READ = readPagination.toString();

export const drawnNow = (page: Page, nav: string) =>
  page.evaluate(
    ({ read, nav }) =>
      (new Function(`return (${read})`)() as (el: Element | null) => Drawn)(
        document.querySelector(nav),
      ),
    { read: READ, nav },
  );

export async function record(
  page: Page,
  nav: string,
  target: string,
  act: () => Promise<unknown>,
  ms = 900,
) {
  await page.evaluate(
    ({ read, nav, target, ms }) => {
      const readFn = new Function(`return (${read})`)() as (
        el: Element | null,
      ) => { current: string | null };
      const w = window as unknown as {
        __frames: { t: number }[];
        __recording: Promise<unknown>;
      };
      const frames: { t: number }[] = (w.__frames = []);
      let started: () => void;
      const ready = new Promise<void>((resolve) => (started = resolve));
      w.__recording = new Promise((resolve) => {
        const start = performance.now();
        let at: number | null = null;
        const tick = (now: number) => {
          const drawn = readFn(document.querySelector(nav));
          if (at === null && drawn.current === target) at = now;
          frames.push({ ...drawn, t: now });
          if (frames.length === 2) started();
          const done = at === null ? now - start > 30_000 : now - at > ms;
          if (!done) requestAnimationFrame(tick);
          else {
            started();
            const origin = at ?? start;
            resolve(frames.map((f) => ({ ...f, t: f.t - origin })));
          }
        };
        requestAnimationFrame(tick);
      });
      return ready;
    },
    { read: READ, nav, target, ms },
  );
  await act();
  return (await page.evaluate(
    () => (window as unknown as { __recording: Promise<unknown> }).__recording,
  )) as Frame[];
}

export const linkBox = (page: Page, nav: string, label: string) =>
  page.evaluate(
    ({ nav, label }): Box => {
      const root = document.querySelector(nav)!;
      const origin = root.getBoundingClientRect();
      const link = Array.from(
        root.querySelectorAll('[data-slot="pagination-link"]'),
      ).find(
        (el) =>
          el.closest('[data-animate-ui-pagination]') === root &&
          el.getClientRects().length > 0 &&
          el.textContent?.trim() === label,
      )!;
      const box = link.getBoundingClientRect();
      return {
        x: box.left - origin.left,
        y: box.top - origin.top,
        w: box.width,
        h: box.height,
      };
    },
    { nav, label },
  );

export const clickLink = (page: Page, nav: string, label: string) =>
  page.evaluate(
    ({ nav, label }) => {
      const root = document.querySelector(nav)!;
      Array.from(
        root.querySelectorAll<HTMLElement>('[data-slot="pagination-link"]'),
      )
        .find(
          (el) =>
            el.closest('[data-animate-ui-pagination]') === root &&
            el.getClientRects().length > 0 &&
            el.textContent?.trim() === label,
        )!
        .click();
    },
    { nav, label },
  );

export const clickTwice = (
  page: Page,
  nav: string,
  first: string,
  second: string,
  when: { gap: number } | { past: number } = { gap: 70 },
) =>
  page.evaluate(
    async ({ nav, first, second, when }) => {
      const w = window as unknown as {
        __frames: { t: number }[];
        __at: number;
      };
      const root = document.querySelector(nav)!;
      const link = (label: string) =>
        Array.from(
          root.querySelectorAll<HTMLElement>('[data-slot="pagination-link"]'),
        ).find(
          (el) =>
            el.closest('[data-animate-ui-pagination]') === root &&
            el.getClientRects().length > 0 &&
            el.textContent?.trim() === label,
        )!;
      const surface = () =>
        Array.from(root.children).find(
          (el) =>
            el.getAttribute('data-slot') === 'pagination-indicator' &&
            !el.hasAttribute('data-animate-ui-leaving'),
        );
      const clicked = performance.now();
      link(first).click();
      await new Promise<void>((resolve) => {
        const check = () => {
          const el = surface();
          if (performance.now() - clicked > 5000) return resolve();
          if ('gap' in when) {
            const start = el
              ?.getAnimations()
              .find(
                (animation) => !('transitionProperty' in animation),
              )?.startTime;
            if (
              start !== null &&
              start !== undefined &&
              w.__frames.filter((f) => f.t > Number(start)).length >= 2
            ) {
              const left = when.gap - (performance.now() - Number(start));
              setTimeout(resolve, Math.max(0, left));
              return;
            }
          } else if (el) {
            const x =
              el.getBoundingClientRect().left -
              root.getBoundingClientRect().left;
            if (x > when.past) return void setTimeout(resolve, 0);
          }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      });
      w.__at = w.__frames.length;
      link(second).click();
    },
    { nav, first, second, when },
  );

export const clickedAt = (page: Page) =>
  page.evaluate(() => (window as unknown as { __at: number }).__at);

export const outlineOf = (page: Page, nav: string) =>
  page.evaluate((nav): Paint => {
    const root = document.querySelector(nav)!;
    const link = Array.from(
      root.querySelectorAll(
        '[data-slot="pagination-link"][aria-current="page"]',
      ),
    ).find(
      (el) =>
        el.closest('[data-animate-ui-pagination]') === root &&
        el.getClientRects().length > 0,
    )!;
    const copy = link.cloneNode(true) as HTMLElement;
    copy.style.position = 'fixed';
    copy.style.top = '0px';
    copy.style.left = '-1000px';
    document.body.append(copy);
    const style = getComputedStyle(copy);
    const paint = {
      background: style.backgroundColor,
      border: style.borderTopColor,
      shadow: style.boxShadow,
      radius: style.borderTopLeftRadius,
    };
    copy.remove();
    return paint;
  }, nav);

export const paintOf = ({ background, border, shadow, radius }: Paint) => ({
  background,
  border,
  shadow,
  radius,
});

export function timingsIn(frames: Frame[], leaving = false) {
  for (const f of frames)
    for (const s of f.surfaces)
      if (s.leaving === leaving && s.timings.length) return s.timings;
  return [];
}

export function expectSlideTiming(timings: Timing[], spring: SpringOptions) {
  const slide = timings.find((t) => t.properties.includes('translate'))!;
  expect(slide, 'a translate animation').toBeDefined();
  expectCssSpring(
    { duration: `${slide.duration / 1000}s`, easing: slide.easing },
    spring,
  );
  expect(slide.properties, 'its translate only').toEqual(['translate']);
  expect(slide.composite, 'replacing its translate').toBe('replace');
  const translates = slide.translates.map((value) => translateOf(value!));
  expect(translates.at(-1), String(slide.translates)).toEqual([0, 0]);
  expect(translates[0]!.every(Number.isFinite), String(slide.translates)).toBe(
    true,
  );
}

export function translateOf(value: string) {
  const [x = '0px', y = '0px'] = value.trim().split(/\s+/);
  return [x, y].map((part) =>
    /^-?[\d.]+(e-?\d+)?px$/.test(part) ? parseFloat(part) : NaN,
  );
}

export function expectOneSurface(frames: Frame[]) {
  for (const f of frames) {
    expect(f.surfaces, `${Math.round(f.t)}ms`).toHaveLength(1);
    expect(f.surfaces[0]!.o, `${Math.round(f.t)}ms`).toBe(1);
    expect(f.surfaces[0]!.leaving).toBe(false);
  }
}

export function expectAtRest(drawn: Drawn, box: Box, label = '') {
  expect(drawn.surfaces, label).toHaveLength(1);
  const [surface] = drawn.surfaces;
  for (const key of ['x', 'y', 'w', 'h'] as const)
    expect(Math.abs(surface![key] - box[key]), `${label} ${key}`).toBeLessThan(
      0.5,
    );
  expect(surface!.o, label).toBe(1);
  expect(surface!.animations, label).toBe(0);
}

export function expectCovers(drawn: Drawn, tolerance: number, label = '') {
  expect(drawn.surfaces, label).toHaveLength(1);
  expect(drawn.link, `${label}: a current link`).not.toBeNull();
  const [surface] = drawn.surfaces;
  for (const key of ['x', 'y', 'w', 'h'] as const)
    expect(
      Math.abs(surface![key] - drawn.link![key]),
      `${label} ${key}: surface ${surface![key]}, link ${drawn.link![key]}`,
    ).toBeLessThan(tolerance);
  expect(surface!.o, label).toBe(1);
}

export const waitFrames = (page: Page, count: number) =>
  page.evaluate(
    (count) =>
      new Promise<void>((resolve) => {
        let left = count;
        const tick = () =>
          --left <= 0 ? resolve() : requestAnimationFrame(tick);
        requestAnimationFrame(tick);
      }),
    count,
  );

export async function restOn(page: Page, nav: string, label: string) {
  await expect
    .poll(async () => {
      const drawn = await drawnNow(page, nav);
      return drawn.current === label &&
        drawn.surfaces.length === 1 &&
        drawn.surfaces[0]!.animations === 0
        ? 'rest'
        : 'moving';
    })
    .toBe('rest');
}

export function expectSlide(
  frames: Frame[],
  from: Box,
  to: Box,
  spring = SELECTION,
) {
  expectOneSurface(frames);
  const xs = frames.map((f) => f.surfaces[0]!.x);
  const way = Math.sign(to.x - from.x);
  const between = xs.filter(
    (x) => (x - from.x) * way > 2 && (to.x - x) * way > 2,
  );
  expect(between.length, 'frames strictly between').toBeGreaterThanOrEqual(3);
  const past = overshootOf(spring) * Math.abs(to.x - from.x) + 0.5;
  for (const x of xs) expect((x - to.x) * way).toBeLessThanOrEqual(past);
  expectSpringPace(
    frames.map((f): Sample => [f.t, f.surfaces[0]!.x]),
    spring,
    {
      from: from.x,
      to: to.x,
      a: from.x + (to.x - from.x) * 0.1,
      b: from.x + (to.x - from.x) * 0.9,
    },
  );
  const last = frames.at(-1)!.surfaces[0]!;
  expect(Math.abs(last.x - to.x)).toBeLessThan(0.5);
  expect(Math.abs(last.w - to.w)).toBeLessThan(0.5);
  expect(last.animations).toBe(0);
}

export function expectMomentum(frames: Frame[], at: number, to: Box) {
  expectOneSurface(frames);
  const xs = frames.map((f) => f.surfaces[0]!.x);
  const ts = frames.map((f) => f.t);
  const speed = (i: number) => (xs[i]! - xs[i - 1]!) / (ts[i]! - ts[i - 1]!);
  const first = frames[at - 1]?.surfaces[0]?.slideStart ?? null;
  const underWay = (i: number) => {
    const surface = frames[i]?.surfaces[0];
    return (
      first !== null &&
      surface?.slideStart === first &&
      (surface.slideTime ?? 0) > 0
    );
  };
  expect(
    underWay(at - 2) && underWay(at - 1),
    'two frames drawn of the first slide under way before the second change (fewer: the machine stalled, nothing to compare with)',
  ).toBe(true);
  const before = speed(at - 1);
  expect(before, 'moving when picked again').toBeGreaterThan(0.05);
  const next = frames.findIndex(
    (f, i) =>
      i >= at && f.surfaces[0]!.slides && f.surfaces[0]!.slideStart !== first,
  );
  expect(next, 'the second change starts another slide').toBeGreaterThan(-1);
  const curve = frames[next]!.surfaces[0]!.timings.find((t) =>
    t.properties.includes('translate'),
  )!;
  const fromRest = springAsCss(SELECTION).points[1]!;
  expect(
    linearPoints(curve.easing)[1],
    `its curve carries the speed it had (from rest: ${fromRest})`,
  ).toBeGreaterThan(2 * fromRest);
  for (const i of [next + 1, next + 2]) {
    expect(speed(i) / before, `frame ${i - next} after`).toBeGreaterThan(0.6);
    expect(speed(i) / before, `frame ${i - next} after`).toBeLessThan(2.5);
  }
  for (let i = 1; i < xs.length; i++) {
    const step = xs[i]! - xs[i - 1]!;
    expect(step, `${Math.round(ts[i]!)}ms`).toBeGreaterThan(-0.5);
    expect(step, `${Math.round(ts[i]!)}ms`).toBeLessThanOrEqual(
      (ts[i]! - ts[i - 1]!) * 1.6 + 2,
    );
  }
  const past = overshootOf(SELECTION) * Math.abs(to.x - xs[0]!) + 0.5;
  expect(Math.max(...xs)).toBeLessThanOrEqual(to.x + past);
  expect(Math.abs(xs.at(-1)! - to.x)).toBeLessThan(0.5);
}

export function expectCrossfade(frames: Frame[], from: Box, to: Box) {
  for (const f of frames) {
    const when = `${Math.round(f.t)}ms`;
    expect(f.surfaces.length, when).toBeGreaterThanOrEqual(1);
    expect(f.surfaces.length, when).toBeLessThanOrEqual(2);
    for (const s of f.surfaces) {
      expect(s.slides, when).toBe(false);
      const on = [from, to].find(
        (b) =>
          Math.abs(s.x - b.x) < 0.5 &&
          Math.abs(s.y - b.y) < 0.5 &&
          Math.abs(s.w - b.w) < 0.5,
      );
      expect(on, `${when}: x ${s.x}`).toBeDefined();
      if (s.leaving) expect(on, when).toBe(from);
    }
  }
  const both = frames.filter(
    (f) =>
      f.surfaces.length === 2 &&
      f.surfaces.every((s) => s.o > 0.02 && s.o < 0.98),
  );
  expect(both.length, 'frames crossfading').toBeGreaterThanOrEqual(1);
  for (const f of both) {
    const leaving = f.surfaces.find((s) => s.leaving)!;
    const coming = f.surfaces.find((s) => !s.leaving)!;
    expect(Math.abs(leaving.x - from.x)).toBeLessThan(0.5);
    expect(Math.abs(coming.x - to.x)).toBeLessThan(0.5);
  }
  const outs = frames.flatMap((f) =>
    f.surfaces.filter((s) => s.leaving).map((s) => s.o),
  );
  const ins = frames
    .filter((f) => f.surfaces.some((s) => s.leaving))
    .map((f) => f.surfaces.find((s) => !s.leaving)!.o);
  for (let i = 1; i < outs.length; i++)
    expect(outs[i]!).toBeLessThanOrEqual(outs[i - 1]! + 0.001);
  for (let i = 1; i < ins.length; i++)
    expect(ins[i]!).toBeGreaterThanOrEqual(ins[i - 1]! - 0.001);
  const last = frames.at(-1)!;
  expect(last.surfaces).toHaveLength(1);
  expect(last.surfaces[0]!.leaving).toBe(false);
  expect(last.surfaces[0]!.o).toBe(1);
  expect(Math.abs(last.surfaces[0]!.x - to.x)).toBeLessThan(0.5);
}

export async function waitForPagination(page: Page) {
  await page.waitForFunction(() => {
    const links = [
      ...document.querySelectorAll('[data-slot="pagination-link"]'),
    ];
    const roots = [
      ...document.querySelectorAll('[data-animate-ui-pagination]'),
    ];
    return (
      links.length > 0 &&
      links.every((el) =>
        Object.keys(el).some((key) => key.startsWith('__reactProps')),
      ) &&
      roots.length > 0 &&
      roots.every((el) => el.hasAttribute('data-animate-ui-pagination-ready'))
    );
  });
}

export async function gotoPagination(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitForPagination(page);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(250);
}

export function describePagination(library: string) {
  const url = `/tests/demos/${library}/pagination`;
  const NAV = '[data-slot="pagination"]';
  const box = (page: Page, label: string) => linkBox(page, NAV, label);
  const link = (page: Page, label: string) =>
    page
      .locator(NAV)
      .locator(LINK)
      .filter({ hasText: new RegExp(`^${label}$`) });

  test.describe(`${library} pagination demo`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page }) => {
      await gotoPagination(page, url);
    });

    test("at rest: one surface on page 2, wearing the outline link's look, the link's own look hidden", async ({
      page,
    }) => {
      const drawn = await drawnNow(page, NAV);
      expect(drawn.current).toBe('2');
      expectAtRest(drawn, await box(page, '2'));
      const outline = await outlineOf(page, NAV);
      expect(outline.border).not.toBe(TRANSPARENT);
      expect(outline.background).not.toBe(TRANSPARENT);
      expect(paintOf(drawn.surfaces[0]!)).toEqual(outline);
      expect(drawn.own!.background).toBe(TRANSPARENT);
      expect(drawn.own!.border).toBe(TRANSPARENT);
      expect(drawn.own!.shadow).toBe('none');
      const hit = await link(page, '2').evaluate((el) => {
        const b = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2),
        );
      });
      expect(hit).toBe(true);
    });

    test('clicking page 3: one surface slides from 2 to 3 on spring.selection', async ({
      page,
    }) => {
      const [from, to] = [await box(page, '2'), await box(page, '3')];
      const outline = await outlineOf(page, NAV);
      const frames = await record(page, NAV, '3', () =>
        link(page, '3').click(),
      );
      expectSlideTiming(timingsIn(frames), SELECTION);
      expectSlide(frames, from, to);
      for (const f of frames) {
        const when = `${Math.round(f.t)}ms`;
        const paint = paintOf(f.surfaces[0]!);
        if (f.surfaces[0]!.slides) expect(paint, when).toEqual(outline);
        else
          expect({ ...paint, background: outline.background }).toEqual(outline);
        expect(f.own!.border, when).toBe(TRANSPARENT);
      }
      expect(
        frames.filter((f) => f.surfaces[0]!.slides).length,
      ).toBeGreaterThan(3);
      await expect
        .poll(async () => (await drawnNow(page, NAV)).surfaces[0]!.background)
        .toBe(TRANSPARENT);
      expectAtRest(await drawnNow(page, NAV), to);
    });

    test('Next and Previous slide it one page', async ({ page }) => {
      const [two, three] = [await box(page, '2'), await box(page, '3')];
      expectSlide(
        await record(page, NAV, '3', () => link(page, 'Next').click()),
        two,
        three,
      );
      expectSlide(
        await record(page, NAV, '2', () => link(page, 'Previous').click()),
        three,
        two,
      );
    });

    test('pressed with the pointer: it lands where the link rests, not where its press nudge has it', async ({
      page,
    }) => {
      const to = await box(page, '3');
      const target = (await link(page, '3').boundingBox())!;
      const frames = await record(page, NAV, '3', async () => {
        await page.mouse.move(
          target.x + target.width / 2,
          target.y + target.height / 2,
        );
        await page.mouse.down();
        await expect
          .poll(() =>
            link(page, '3').evaluate((el) => getComputedStyle(el).translate),
          )
          .toBe('0px 1px');
        await page.mouse.up();
      });
      for (const f of frames)
        expect(
          Math.abs(f.surfaces[0]!.y - to.y),
          `${Math.round(f.t)}ms`,
        ).toBeLessThan(0.05);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
      expectAtRest(await drawnNow(page, NAV), to);
    });

    test('keyboard: Tab to a page and Enter, it slides like a click; the link keeps its focus ring', async ({
      page,
    }) => {
      const [from, to] = [await box(page, '2'), await box(page, '3')];
      await link(page, '2').focus();
      await page.keyboard.press('Tab');
      await expect(link(page, '3')).toBeFocused();
      const frames = await record(page, NAV, '3', () =>
        page.keyboard.press('Enter'),
      );
      expectSlide(frames, from, to);
      await expect(link(page, '3')).toBeFocused();
      const own = frames.at(-1)!.own!;
      expect(own.border).not.toBe(TRANSPARENT);
      expect(own.shadow).not.toBe('none');
      expect(own.background).toBe(TRANSPARENT);
    });

    if (library === 'base-ui')
      test('keyboard: Space on a page link changes the page too, sliding like a click, without scrolling', async ({
        page,
      }) => {
        const [from, to] = [await box(page, '2'), await box(page, '3')];
        await link(page, '3').focus();
        const scroll = await page.evaluate(() => window.scrollY);
        const frames = await record(page, NAV, '3', () =>
          page.keyboard.press('Space'),
        );
        expectSlide(frames, from, to);
        await expect(link(page, '3')).toBeFocused();
        expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
        expect(await page.evaluate(() => location.hash)).toBe('');
      });

    test('picked again on the way, it goes on from where it is with the speed it had', async ({
      page,
    }) => {
      await clickLink(page, NAV, '1');
      await expect
        .poll(async () => (await drawnNow(page, NAV)).surfaces[0]!.animations)
        .toBe(0);
      const to = await box(page, '3');
      const frames = await record(
        page,
        NAV,
        '3',
        () => clickTwice(page, NAV, '2', '3'),
        900,
      );
      expectMomentum(frames, await clickedAt(page), to);
    });

    test('hovered, the current link paints its own hover background over the surface', async ({
      page,
    }) => {
      await link(page, '1').hover();
      await page.waitForTimeout(300);
      const hovered = await link(page, '1').evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(hovered).not.toBe(TRANSPARENT);
      await link(page, '2').hover();
      await page.waitForTimeout(300);
      const drawn = await drawnNow(page, NAV);
      expect(drawn.own!.background).toBe(hovered);
      expect(drawn.own!.border).toBe(TRANSPARENT);
      expectAtRest(drawn, await box(page, '2'));
    });

    test("the surface copies the link's look, not the library's own attributes", async ({
      page,
    }) => {
      const attributes = await page
        .locator(NAV)
        .locator(INDICATOR)
        .evaluate((el) => [...el.attributes].map((a) => a.name));
      expect(
        attributes.filter((name) =>
          /^data-(react-aria-|rac|radix-|base-ui-)/.test(name),
        ),
      ).toEqual([]);
    });

    test('the links change the page without navigating', async ({ page }) => {
      const before = page.url();
      await link(page, '3').click();
      await link(page, 'Previous').click();
      await link(page, 'Next').click();
      await expect
        .poll(async () => (await drawnNow(page, NAV)).current)
        .toBe('3');
      expect(page.url()).toBe(before);
      expect(await page.evaluate(() => location.hash)).toBe('');
    });
  });

  test.describe(`${library} pagination demo, on load`, () => {
    test.describe.configure({ timeout: 120_000 });
    test('nothing moves: from its first frame, the surface rests on page 2', async ({
      page,
    }) => {
      await page.addInitScript(
        ({ read, nav }) => {
          const readFn = new Function(`return (${read})`)() as (
            el: Element | null,
          ) => unknown;
          const w = window as unknown as { __load: unknown[] };
          w.__load = [];
          const tick = () => {
            const el = document.querySelector(nav);
            if (el) w.__load.push(readFn(el));
            if (w.__load.length < 3600) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        },
        { read: READ, nav: NAV },
      );
      await gotoPagination(page, url);
      await page.waitForTimeout(400);
      const load = await page.evaluate(
        () => (window as unknown as { __load: Drawn[] }).__load,
      );
      const two = await box(page, '2');
      expect(load.length).toBeGreaterThan(10);
      for (const [i, drawn] of load.entries()) {
        if (!drawn.surfaces.length) {
          expect(drawn.own!.border, `frame ${i}`).not.toBe(TRANSPARENT);
          continue;
        }
        expectAtRest(drawn, two, `frame ${i}`);
      }
      expect(load.at(-1)!.surfaces).toHaveLength(1);
    });
  });

  test.describe(`${library} pagination demo, reduced motion`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.use({ reducedMotion: 'reduce' });
    test('it crossfades: out on the page it leaves, in on the new one, never sliding', async ({
      page,
    }) => {
      await gotoPagination(page, url);
      const [from, to] = [await box(page, '2'), await box(page, '3')];
      const frames = await record(
        page,
        NAV,
        '3',
        () => link(page, '3').click(),
        500,
      );
      expectCrossfade(frames, from, to);
      await expect(page.locator('[data-animate-ui-leaving]')).toHaveCount(0);
    });
  });

  test.describe(`${library} pagination demo, dark`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.use({ colorScheme: 'dark' });
    test("it wears the dark outline link's look, and follows the theme", async ({
      page,
    }) => {
      await gotoPagination(page, url);
      await expect(page.locator('html')).toHaveClass(/dark/);
      const dark = await outlineOf(page, NAV);
      expect(paintOf((await drawnNow(page, NAV)).surfaces[0]!)).toEqual(dark);
      const [from, to] = [await box(page, '2'), await box(page, '3')];
      const frames = await record(page, NAV, '3', () =>
        clickLink(page, NAV, '3'),
      );
      expectSlide(frames, from, to);
      for (const f of frames)
        expect(paintOf(f.surfaces[0]!), `${Math.round(f.t)}ms`).toEqual(dark);
      await page.emulateMedia({ colorScheme: 'light' });
      await expect(page.locator('html')).not.toHaveClass(/dark/);
      const light = await outlineOf(page, NAV);
      expect(light.background).not.toBe(dark.background);
      expect(light.border).not.toBe(dark.border);
      await expect
        .poll(async () => paintOf((await drawnNow(page, NAV)).surfaces[0]!))
        .toEqual(light);
    });

    test("hovered, the current link's hover background shows alone: the surface's own goes once it has arrived", async ({
      page,
    }) => {
      await gotoPagination(page, url);
      const dark = await outlineOf(page, NAV);
      const surface = async () => (await drawnNow(page, NAV)).surfaces[0]!;
      await link(page, '2').hover();
      await expect
        .poll(async () => (await surface()).background)
        .toBe(TRANSPARENT);
      const drawn = await drawnNow(page, NAV);
      expect(drawn.own!.background).not.toBe(TRANSPARENT);
      expect((await surface()).border).toBe(dark.border);
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => (await surface()).background)
        .toBe(dark.background);
      await link(page, '3').hover();
      const frames = await record(page, NAV, '3', () =>
        link(page, '3').click(),
      );
      const sliding = frames.filter(
        (f) => f.t >= 0 && f.surfaces.length === 1 && f.surfaces[0]!.slides,
      );
      expect(sliding.length).toBeGreaterThan(3);
      for (const f of sliding)
        expect(f.surfaces[0]!.background, `${Math.round(f.t)}ms`).toBe(
          dark.background,
        );
      await expect
        .poll(async () => (await surface()).background)
        .toBe(TRANSPARENT);
    });
  });
}
