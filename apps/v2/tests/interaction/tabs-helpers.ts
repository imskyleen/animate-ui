import { expect, test, type Page } from '@playwright/test';

import {
  expectCssCurve,
  expectCurvePace,
  expectSpringPace,
  type CurveOptions,
  type Sample,
} from './spring-curves';

// Shared by the Radix UI, Base UI and React Aria tabs specs (and Animate UI's
// own Tabs). They move like Motion's Radix tabs example: one indicator slides
// to the new tab, and the panels change one after the other (the outgoing one
// fades out into a blur, then the incoming one fades in from it while the
// height glides).

export const INDICATOR = '[data-slot="tabs-indicator"]';
export const PANEL = '[role="tabpanel"]';
/**
 * Every panel, selected or not: React Aria only gives the selected one its
 * `tabpanel` role (not one leaving).
 */
export const ANY_PANEL =
  '[role="tabpanel"], [data-slot="tabs-content"], .react-aria-TabPanel';

/** The indicator's slide: `spring.selection`. */
export const SELECTION_SPRING = { stiffness: 300, damping: 30 };
/** The outgoing panel's fade into the blur: `transition.panelOut`. */
export const PANEL_OUT: CurveOptions = { duration: 150, ease: [0, 0, 0.58, 1] };
/** The incoming panel's fade from the blur: `transition.panelIn`. */
export const PANEL_IN: CurveOptions = {
  duration: 300,
  ease: [0.25, 0.1, 0.35, 1],
};
/** The height gliding from the outgoing panel's: `transition.panelHeight`. */
export const PANEL_HEIGHT: CurveOptions = {
  duration: 450,
  ease: [0.4, 0, 0.1, 1],
};
/** `blur.panel`, in px. */
export const PANEL_BLUR = 5;
/** The tabs' text color: `transition.color`. */
const COLOR: CurveOptions = { duration: 200, ease: [0.25, 0.1, 0.25, 1] };

/**
 * Waits until React has hydrated the tabs (in dev, `networkidle` can come
 * before hydration, and a click then does nothing). React Aria's tabs aren't
 * buttons, so the tabs themselves are checked.
 */
export async function waitForTabs(page: Page) {
  await page.waitForFunction(() => {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    return (
      tabs.length > 0 &&
      tabs.every((tab) =>
        Object.keys(tab).some((key) => key.startsWith('__reactProps')),
      )
    );
  });
}

export async function gotoTabs(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await waitForTabs(page);
}

// The helpers below look at the whole page, or only inside the element the
// selector `scope` matches (a fixture's section: the page holds other tabs).

const within = (page: Page, scope?: string) =>
  scope ? page.locator(scope) : page;

/** Left edge of the indicator relative to the tab `name`. */
export const offsetFrom = (
  page: Page,
  name: string,
  scope?: string,
  indicator = INDICATOR,
) =>
  page.evaluate(
    ({ indicator, name, scope }) => {
      const root = scope ? document.querySelector(scope)! : document;
      const tab = [...root.querySelectorAll('[role="tab"]')].find(
        (el) => el.textContent?.trim() === name,
      )!;
      const ind = root.querySelector(indicator)!;
      return (
        ind.getBoundingClientRect().left - tab.getBoundingClientRect().left
      );
    },
    { indicator, name, scope },
  );

export const tabLeft = (page: Page, name: string, scope?: string) =>
  within(page, scope)
    .getByRole('tab', { name, exact: true })
    .evaluate((el) => el.getBoundingClientRect().left);

/** Where to click the tab `name`: read ahead, so quick clicks land in time. */
export async function tabCenter(page: Page, name: string, scope?: string) {
  const tab = within(page, scope).getByRole('tab', { name, exact: true });
  await tab.scrollIntoViewIfNeeded();
  const box = (await tab.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export const panelOpacity = (page: Page, scope?: string) =>
  within(page, scope)
    .locator(`${PANEL}:not([hidden])`)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

/** The active tab's own surface is hidden; the indicator carries it. */
export async function expectSurfaceOnIndicator(page: Page, scope?: string) {
  const { tab, indicator } = await page.evaluate(
    ({ selector, scope }) => {
      const root = scope ? document.querySelector(scope)! : document;
      const active = root.querySelector('[role="tab"][aria-selected="true"]')!;
      const ind = root.querySelector(selector)!;
      return {
        tab: getComputedStyle(active).backgroundColor,
        indicator: getComputedStyle(ind).backgroundColor,
      };
    },
    { selector: INDICATOR, scope },
  );
  expect(tab).toBe('rgba(0, 0, 0, 0)');
  expect(indicator).not.toBe('rgba(0, 0, 0, 0)');
}

/**
 * A panel on screen in a frame (its top in the element holding the panels),
 * and the start of its text.
 */
export type PanelFrame = {
  text: string;
  y: number;
  h: number;
  o: number;
  blur: number;
  inert: boolean;
};

export type SwitchFrame = {
  t: number;
  indicators: { x: number; width: number; o: number }[];
  /** The panels on screen (neither `hidden` nor `display: none`). */
  panels: PanelFrame[];
  color: string;
};

/**
 * Clicks the tab `name` and records, on every frame (in the page, on the
 * frames' own times, so it holds up on a busy machine): the indicators (left edge, width and opacity of
 * each), the panels on screen (top, height, opacity, blur, inert) and the
 * tab's text color. Times are relative to the frame the tab is selected in
 * (earlier frames are negative), and the recording lasts `ms` from there,
 * however long the click takes.
 */
export async function recordSwitch(
  page: Page,
  name: string,
  ms = 900,
  /** How the tab gets selected: a click by default. */
  select?: () => Promise<void>,
  scope?: string,
  indicator = INDICATOR,
) {
  await page.evaluate(
    ({ indicator, panel, name, ms, scope }) => {
      const root = scope ? document.querySelector(scope)! : document;
      const tab = [...root.querySelectorAll<HTMLElement>('[role="tab"]')].find(
        (el) => el.textContent?.trim() === name,
      )!;
      const w = window as unknown as { __switch?: Promise<unknown> };
      w.__switch = new Promise((resolve) => {
        const frames: { t: number }[] = [];
        const start = performance.now();
        let selectedAt: number | null = null;
        // On the frame's time: the clock the animations run on (a frame
        // late after a long task still says when it was meant to show).
        const tick = (now: number) => {
          if (
            selectedAt === null &&
            tab.getAttribute('aria-selected') === 'true'
          )
            selectedAt = now;
          const panels = [...root.querySelectorAll<HTMLElement>(panel)]
            .filter((el) => !el.hidden && el.getClientRects().length > 0)
            .map((el) => {
              const style = getComputedStyle(el);
              const box = el.getBoundingClientRect();
              // Its place in the element holding the panels, whatever
              // scrolls the page.
              const holder = el.parentElement!.getBoundingClientRect();
              return {
                text: el.textContent?.trim().slice(0, 40) ?? '',
                y: box.top - holder.top,
                h: box.height,
                o: Number(style.opacity),
                blur: parseFloat(
                  style.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0',
                ),
                inert: el.inert,
              };
            });
          frames.push({
            t: now,
            indicators: [...root.querySelectorAll<HTMLElement>(indicator)].map(
              (el) => ({
                x: el.getBoundingClientRect().left,
                width: el.getBoundingClientRect().width,
                o: Number(getComputedStyle(el).opacity),
              }),
            ),
            panels,
            color: getComputedStyle(tab).color,
          } as { t: number });
          const done =
            selectedAt === null ? now - start > 30_000 : now - selectedAt > ms;
          if (!done) requestAnimationFrame(tick);
          else {
            const origin = selectedAt ?? start;
            resolve(frames.map((f) => ({ ...f, t: f.t - origin })));
          }
        };
        requestAnimationFrame(tick);
      });
    },
    { indicator, panel: ANY_PANEL, name, ms, scope },
  );
  await (
    select ??
    (() => within(page, scope).getByRole('tab', { name, exact: true }).click())
  )();
  return (await page.evaluate(
    () => (window as unknown as { __switch: Promise<unknown> }).__switch,
  )) as SwitchFrame[];
}

/**
 * The frames where the panel whose text starts with `name` is on screen, from
 * the selection on.
 */
export const framesOf = (frames: SwitchFrame[], name: string) =>
  frames.flatMap((f) =>
    f.t >= 0
      ? f.panels
          .filter((p) => p.text.startsWith(name))
          .map((p) => ({ ...p, t: f.t }))
      : [],
  );

/** Never two panels on screen at once. */
export function expectOnePanelAtATime(frames: SwitchFrame[]) {
  const most = Math.max(...frames.map((f) => f.panels.length));
  expect(most, 'panels on screen in one frame').toBeLessThanOrEqual(1);
}

/** A single indicator on every frame, never fading. */
export function expectOneIndicator(frames: SwitchFrame[]) {
  expect(
    frames.every((f) => f.indicators.length === 1),
    'one indicator on every frame',
  ).toBe(true);
  expect(frames.every((f) => f.indicators[0]!.o === 1)).toBe(true);
}

/**
 * The panel `from` fades out into the blur, staying in the page, then `to`
 * fades in from it, once `from` has gone: on `transition.panelOut`, then
 * `transition.panelIn`.
 */
export function expectPanelsInSequence(
  frames: SwitchFrame[],
  from: string,
  to: string,
) {
  expectOnePanelAtATime(frames);
  const out = framesOf(frames, from);
  const comes = framesOf(frames, to);
  expect(out.length, `${from} is still on screen as it leaves`).toBeGreaterThan(
    2,
  );
  expect(comes.length).toBeGreaterThan(2);
  // In the page while it leaves, out of reach.
  const y = (
    frames.find((f) => f.t < 0 && f.panels[0]?.text.startsWith(from))
      ?.panels[0] ?? out[0]!
  ).y;
  expect(out.every((p) => Math.abs(p.y - y) < 0.5)).toBe(true);
  expect(out.every((p) => p.inert)).toBe(true);
  // Into the blur, on the ease-out.
  expect(out.some((p) => p.o > 0.1 && p.o < 0.9 && p.blur > 0.5)).toBe(true);
  const blurred = Math.max(...out.map((p) => p.blur));
  expect(blurred).toBeGreaterThan(PANEL_BLUR - 1);
  expect(blurred).toBeLessThanOrEqual(PANEL_BLUR + 0.01);
  expectCurvePace(
    out.map((p): Sample => [p.t, p.o]),
    PANEL_OUT,
    { from: 1, to: 0, a: 0.8, b: 0.2 },
  );
  // Once it has gone (150ms), the next one, from the blur, where it was.
  const last = out.at(-1)!.t;
  const first = comes[0]!;
  expect(first.t).toBeGreaterThan(last);
  expect(first.t).toBeGreaterThanOrEqual(PANEL_OUT.duration - 25);
  expect(first.o).toBeLessThan(0.2);
  expect(first.blur).toBeGreaterThan(PANEL_BLUR - 1.5);
  expect(Math.abs(first.y - y)).toBeLessThan(0.5);
  expectCurvePace(
    comes.map((p): Sample => [p.t, p.o]),
    PANEL_IN,
    { from: 0, to: 1, a: 0.2, b: 0.8 },
  );
  // At rest: shown, without a filter.
  const rest = frames.at(-1)!.panels[0]!;
  expect(rest.text.startsWith(to)).toBe(true);
  expect(rest.o).toBe(1);
  expect(rest.blur).toBe(0);
}

/**
 * shadcn's tabs demo: Overview (selected), Analytics, Reports and Settings,
 * each panel a card of the same height.
 */
export function describeTabsDemo(
  library: string,
  { selectKeys }: { selectKeys: string[] },
) {
  const url = `/tests/demos/${library}/tabs`;
  test.describe(`${library} tabs demo`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoTabs(page, url);
    });

    test('page load: nothing moves, the indicator sits on the active tab', async ({
      page,
    }) => {
      // Sampled from the first frames (for up to a minute: a busy dev server
      // can hydrate late).
      await page.addInitScript((panel) => {
        const w = window as unknown as { __load: number[][] };
        w.__load = [];
        const tick = () => {
          const el = document.querySelector<HTMLElement>(panel);
          if (el) {
            const style = getComputedStyle(el);
            w.__load.push([
              Number(style.opacity),
              parseFloat(style.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0'),
            ]);
          }
          if (w.__load.length < 3600) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, PANEL);
      await page.reload({ waitUntil: 'networkidle' });
      await waitForTabs(page);
      await expect(page.locator(INDICATOR)).toHaveCount(1);
      expect(Math.abs(await offsetFrom(page, 'Overview'))).toBeLessThan(1);
      await page.waitForTimeout(400);
      const load = await page.evaluate(
        () => (window as unknown as { __load: number[][] }).__load,
      );
      expect(load.length).toBeGreaterThan(10);
      expect(load.every(([o, blur]) => o === 1 && blur === 0)).toBe(true);
      await expectSurfaceOnIndicator(page);
    });

    test('pointer: one indicator slides to the new tab on the selection spring', async ({
      page,
    }) => {
      const start = await tabLeft(page, 'Overview');
      const target = await tabLeft(page, 'Settings');
      const frames = await recordSwitch(page, 'Settings');
      // One surface, never two crossfading.
      expectOneIndicator(frames);
      expect(
        frames.some(
          (f) =>
            f.indicators[0]!.x > start + 4 && f.indicators[0]!.x < target - 4,
        ),
      ).toBe(true);
      expectSpringPace(
        frames.map((f): Sample => [f.t, f.indicators[0]!.x]),
        SELECTION_SPRING,
        {
          from: start,
          to: target,
          a: start + (target - start) * 0.1,
          b: start + (target - start) * 0.9,
        },
      );
      await expect(page.locator(INDICATOR)).toHaveCount(1);
      expect(Math.abs(await offsetFrom(page, 'Settings'))).toBeLessThan(1);
      await expectSurfaceOnIndicator(page);
    });

    test("the tabs' text color changes on transition.color (200ms, ease)", async ({
      page,
    }) => {
      const tab = page.getByRole('tab', { name: 'Analytics' });
      expectCssCurve(
        await tab.evaluate((el) => {
          const style = getComputedStyle(el);
          return {
            duration: style.transitionDuration,
            easing: style.transitionTimingFunction,
          };
        }),
        COLOR,
      );
      const frames = await recordSwitch(page, 'Analytics');
      const final = frames.at(-1)!.color;
      const started = frames.find((f) => f.color !== frames[0]!.color)!;
      const reached = frames.find((f) => f.color === final)!;
      expect(new Set(frames.map((f) => f.color)).size).toBeGreaterThan(3);
      // From its first change to the final color: 200ms, give or take frames.
      expect(reached.t - started.t).toBeGreaterThan(120);
      expect(reached.t - started.t).toBeLessThan(COLOR.duration + 80);
    });

    test('the panels change one after the other: the old one fades out into a blur, then the new one fades in from it', async ({
      page,
    }) => {
      const frames = await recordSwitch(page, 'Analytics', 900);
      expectPanelsInSequence(frames, 'Overview', 'Analytics');
    });

    test('keyboard: the selection animates like a click', async ({ page }) => {
      const start = await tabLeft(page, 'Overview');
      const target = await tabLeft(page, 'Analytics');
      await page.getByRole('tab', { name: 'Overview' }).focus();
      const frames = await recordSwitch(page, 'Analytics', 900, async () => {
        // Radix and React Aria select on arrow keys; Base UI moves focus,
        // then Enter selects.
        for (const key of selectKeys) await page.keyboard.press(key);
      });
      await expect(
        page.getByRole('tab', { name: 'Analytics' }),
      ).toHaveAttribute('aria-selected', 'true');
      expectOneIndicator(frames);
      expect(
        frames.some(
          (f) =>
            f.indicators[0]!.x > start + 4 && f.indicators[0]!.x < target - 4,
        ),
      ).toBe(true);
      expectPanelsInSequence(frames, 'Overview', 'Analytics');
      expect(Math.abs(await offsetFrom(page, 'Analytics'))).toBeLessThan(1);
      // Focus moved with the selection, nothing delayed it.
      await expect(page.getByRole('tab', { name: 'Analytics' })).toBeFocused();
    });

    test('quick changes: a panel passed over before it shows never does; the indicator goes on from where it is', async ({
      page,
    }) => {
      const analytics = await tabCenter(page, 'Analytics');
      const reports = await tabCenter(page, 'Reports');
      const frames = await recordSwitch(page, 'Analytics', 1000, async () => {
        await page.mouse.click(analytics.x, analytics.y);
        await page.mouse.click(reports.x, reports.y);
      });
      expectOneIndicator(frames);
      // Retargeted on the way: no jump from one frame to the next.
      const steps = frames
        .slice(1)
        .map((f, i) =>
          Math.abs(f.indicators[0]!.x - frames[i]!.indicators[0]!.x),
        );
      expect(Math.max(...steps)).toBeLessThan(40);
      expect(framesOf(frames, 'Analytics')).toHaveLength(0);
      expectOnePanelAtATime(frames);
      const out = framesOf(frames, 'Overview');
      const comes = framesOf(frames, 'Reports');
      expect(out.some((p) => p.o > 0 && p.o < 1)).toBe(true);
      expect(comes[0]!.t).toBeGreaterThan(out.at(-1)!.t);
      expect(comes[0]!.o).toBeLessThan(0.2);
      await expect(page.getByRole('tab', { name: 'Reports' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect.poll(() => panelOpacity(page)).toBe(1);
      await expect
        .poll(async () => Math.abs(await offsetFrom(page, 'Reports')))
        .toBeLessThan(1);
    });

    test('quick changes: passed over as it comes in, a panel fades out from where it is', async ({
      page,
    }) => {
      const analytics = await tabCenter(page, 'Analytics');
      const reports = await tabCenter(page, 'Reports');
      const frames = await recordSwitch(page, 'Analytics', 1000, async () => {
        await page.mouse.click(analytics.x, analytics.y);
        // Halfway in.
        await page.waitForFunction((panel) => {
          const el = [...document.querySelectorAll<HTMLElement>(panel)].find(
            (p) => !p.hidden && p.textContent?.trim().startsWith('Analytics'),
          );
          const o = el ? Number(getComputedStyle(el).opacity) : 0;
          return o > 0.25 && o < 0.75;
        }, ANY_PANEL);
        await page.mouse.click(reports.x, reports.y);
      });
      expectOneIndicator(frames);
      expectOnePanelAtATime(frames);
      const passed = framesOf(frames, 'Analytics');
      const peak = passed.reduce((i, p, j) => (p.o > passed[i]!.o ? j : i), 0);
      // Up, then back down from there: no jump either way.
      expect(passed[peak]!.o).toBeLessThan(0.98);
      const after = passed.slice(peak);
      expect(after.length).toBeGreaterThan(2);
      expect(after.at(-1)!.o).toBeLessThan(0.2);
      const steps = passed.slice(1).map((p, i) => Math.abs(p.o - passed[i]!.o));
      expect(Math.max(...steps)).toBeLessThan(0.3);
      const comes = framesOf(frames, 'Reports');
      expect(comes[0]!.t).toBeGreaterThan(passed.at(-1)!.t);
      expect(comes[0]!.o).toBeLessThan(0.2);
      await expect.poll(() => panelOpacity(page)).toBe(1);
    });
  });
}

/**
 * The panels' height, on the `heights` section of the library's fixture:
 * shadcn's demo has panels of one height. Its tabs are Short (selected) and
 * Tall, whose panel is taller.
 */
export function describeTabsHeights(library: string) {
  const url = `/tests/fixtures/${library}-tabs`;
  const scope = '[data-testid="heights"]';

  test.describe(`${library} tabs, panels of different heights`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoTabs(page, url);
      // In view before anything is measured: a click would scroll it there.
      await page.locator(scope).scrollIntoViewIfNeeded();
    });

    const panelHeight = (page: Page) =>
      page
        .locator(scope)
        .locator(`${PANEL}:not([hidden])`)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);

    test("the height glides from the old panel's once it has gone, on Motion's layout curve", async ({
      page,
    }) => {
      const before = await panelHeight(page);
      const frames = await recordSwitch(page, 'Tall', 1100, undefined, scope);
      const panel = page.locator(scope).locator(`${PANEL}:not([hidden])`);
      await expect(panel).toHaveCount(1);
      await expect(panel).toContainText('Tall panel');
      expectPanelsInSequence(frames, 'Short', 'Tall');
      // The old panel keeps its height while it leaves.
      const out = framesOf(frames, 'Short');
      expect(out.every((p) => Math.abs(p.h - before) < 0.5)).toBe(true);
      const comes = framesOf(frames, 'Tall');
      const after = comes.at(-1)!.h;
      expect(after).toBeGreaterThan(before + 20);
      // The new one starts at the old one's height, then glides to its own,
      // never past it.
      expect(Math.abs(comes[0]!.h - before)).toBeLessThan(3);
      expect(comes.some((p) => p.h > before + 2 && p.h < after - 2)).toBe(true);
      expect(comes.every((p) => p.h <= after + 0.5)).toBe(true);
      expectCurvePace(
        comes.map((p): Sample => [p.t, p.h]),
        PANEL_HEIGHT,
        {
          from: before,
          to: after,
          a: before + (after - before) * 0.1,
          b: before + (after - before) * 0.9,
        },
      );
    });

    test('changed again while it glides, the height goes on from where it is', async ({
      page,
    }) => {
      const before = await panelHeight(page);
      const tall = await tabCenter(page, 'Tall', scope);
      const short = await tabCenter(page, 'Short', scope);
      const frames = await recordSwitch(
        page,
        'Tall',
        1400,
        async () => {
          await page.mouse.click(tall.x, tall.y);
          await page.waitForFunction(
            ({ scope, panel, before }) => {
              const el = [
                ...document
                  .querySelector(scope)!
                  .querySelectorAll<HTMLElement>(panel),
              ].find(
                (p) => !p.hidden && p.textContent?.trim().startsWith('Tall'),
              );
              return el
                ? el.getBoundingClientRect().height > before + 15
                : false;
            },
            { scope, panel: ANY_PANEL, before },
          );
          await page.mouse.click(short.x, short.y);
        },
        scope,
      );
      expectOnePanelAtATime(frames);
      const leaving = framesOf(frames, 'Tall');
      // Tall fades out from where it is, its height still gliding.
      const peak = leaving.reduce(
        (i, p, j) => (p.o > leaving[i]!.o ? j : i),
        0,
      );
      expect(leaving.slice(peak).length).toBeGreaterThan(2);
      expect(leaving.at(-1)!.o).toBeLessThan(0.2);
      // Then Short comes in from Tall's height, back down to its own.
      const back = framesOf(frames, 'Short').filter(
        (p) => p.t > leaving.at(-1)!.t,
      );
      expect(back.length).toBeGreaterThan(2);
      expect(Math.abs(back[0]!.h - leaving.at(-1)!.h)).toBeLessThan(6);
      expect(back.at(-1)!.h).toBeCloseTo(before, 0);
      // No jump in the height on the way.
      const heights = frames
        .filter((f) => f.t >= 0 && f.panels.length)
        .map((f) => f.panels[0]!.h);
      const steps = heights.slice(1).map((h, i) => Math.abs(h - heights[i]!));
      expect(Math.max(...steps)).toBeLessThan(12);
    });

    test('reduced motion: the indicator and the height jump, the panels only fade', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await waitForTabs(page);
      const before = await panelHeight(page);
      const start = await tabLeft(page, 'Short', scope);
      const target = await tabLeft(page, 'Tall', scope);
      const frames = await recordSwitch(page, 'Tall', 700, undefined, scope);
      const after = frames.at(-1)!.panels[0]!.h;
      expect(after).toBeGreaterThan(before + 20);
      // No blur, no height in between, no indicator in between.
      expect(frames.every((f) => f.panels.every((p) => p.blur === 0))).toBe(
        true,
      );
      const heights = frames.flatMap((f) => f.panels.map((p) => p.h));
      expect(heights.some((h) => h > before + 1 && h < after - 1)).toBe(false);
      const lefts = frames.map((f) => f.indicators[0]!.x);
      expect(lefts.some((x) => x > start + 1 && x < target - 1)).toBe(false);
      // Still one after the other, fading.
      expectOnePanelAtATime(frames);
      expect(framesOf(frames, 'Short').some((p) => p.o > 0 && p.o < 1)).toBe(
        true,
      );
      expect(framesOf(frames, 'Tall').some((p) => p.o > 0 && p.o < 1)).toBe(
        true,
      );
      expect(Math.abs(await offsetFrom(page, 'Tall', scope))).toBeLessThan(1);
    });
  });
}
