import { expect, test, type Page } from '../test';

import {
  expectCssCurve,
  expectCurvePace,
  expectSpringPace,
  type CurveOptions,
  type Sample,
} from './spring-curves';

export const INDICATOR = '[data-slot="tabs-indicator"]';
export const PANEL = '[role="tabpanel"]';
export const ANY_PANEL =
  '[role="tabpanel"], [data-slot="tabs-content"], .react-aria-TabPanel';

export const SELECTION_SPRING = { stiffness: 300, damping: 30 };
export const PANEL_OUT: CurveOptions = { duration: 150, ease: [0, 0, 0.58, 1] };
export const PANEL_IN: CurveOptions = {
  duration: 300,
  ease: [0.25, 0.1, 0.35, 1],
};
export const PANEL_HEIGHT: CurveOptions = {
  duration: 450,
  ease: [0.4, 0, 0.1, 1],
};
export const PANEL_SHIFT = 12;
export const PANEL_BLUR = 5;
const COLOR: CurveOptions = { duration: 200, ease: [0.25, 0.1, 0.25, 1] };

const VUE = 'vue-reka-ui';

/** A library's tabs demo and fixture pages (Vue's live under /tests/vue-demos). */
export const tabsDemo = (library: string) =>
  library === VUE
    ? '/tests/vue-demos/reka-ui/tabs'
    : `/tests/demos/${library}/tabs`;
export const tabsFixture = (library: string) =>
  library === VUE
    ? '/tests/vue-demos/fixtures/reka-ui-tabs'
    : `/tests/fixtures/${library}-tabs`;

export async function waitForTabs(page: Page) {
  if (page.url().includes('/vue-demos/')) return;
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
  if (!url.includes('/vue-demos/')) await waitForTabs(page);
  await page.waitForTimeout(250);
}

const within = (page: Page, scope?: string) =>
  scope ? page.locator(scope) : page;

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

export async function tabCenter(page: Page, name: string, scope?: string) {
  const tab = within(page, scope).getByRole('tab', { name, exact: true });
  await tab.scrollIntoViewIfNeeded();
  const box = (await tab.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function tabCenterNow(page: Page, name: string) {
  const box = (await page
    .getByRole('tab', { name, exact: true })
    .boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export const panelOpacity = (page: Page, scope?: string) =>
  within(page, scope)
    .locator(`${PANEL}:not([hidden])`)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

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

export const nextFrames = (page: Page, count: number) =>
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

export async function waitForIndicatorRest(page: Page, scope?: string) {
  await page.waitForFunction(
    ({ indicator, scope }) => {
      const root = scope ? document.querySelector(scope) : document;
      const el = root?.querySelector(indicator);
      return (
        !!el &&
        !el.hasAttribute('data-animate-ui-sliding') &&
        el
          .getAnimations()
          .every((a) => a.playState === 'finished' || a.playState === 'idle')
      );
    },
    { indicator: INDICATOR, scope },
    { polling: 'raf' },
  );
  await nextFrames(page, 3);
}

export async function expectOnActiveTab(
  page: Page,
  tolerance: number,
  scope?: string,
) {
  const off = await page.evaluate(
    ({ indicator, scope }) => {
      const root = scope ? document.querySelector(scope)! : document;
      const tab = root.querySelector('[role="tab"][aria-selected="true"]')!;
      const a = root.querySelector(indicator)!.getBoundingClientRect();
      const b = tab.getBoundingClientRect();
      return {
        left: a.left - b.left,
        top: a.top - b.top,
        width: a.width - b.width,
        height: a.height - b.height,
      };
    },
    { indicator: INDICATOR, scope },
  );
  for (const [side, by] of Object.entries(off))
    expect(
      Math.abs(by),
      `the indicator's ${side} is ${by}px off the active tab's`,
    ).toBeLessThanOrEqual(tolerance);
}

export type PanelFrame = {
  text: string;
  y: number;
  h: number;
  o: number;
  blur: number;
  tx: number;
  ty: number;
  inert: boolean;
};

export type SwitchFrame = {
  t: number;
  indicators: { x: number; width: number; o: number }[];
  panels: PanelFrame[];
  color: string;
};

export async function recordSwitch(
  page: Page,
  name: string,
  ms = 900,
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
        const tick = (now: number) => {
          if (
            selectedAt === null &&
            tab.getAttribute('aria-selected') === 'true'
          )
            selectedAt = now;
          const panels = [...root.querySelectorAll<HTMLElement>(panel)]
            .filter((el) => !el.hidden && el.getClientRects().length > 0)
            .map((el) => {
              const box = el.getBoundingClientRect();
              const holder = el.parentElement!.getBoundingClientRect();
              let o = 1;
              let blur = 0;
              let tx = 0;
              let ty = 0;
              const slide = (style: CSSStyleDeclaration) => {
                if (style.translate === 'none') return;
                const [x = '0', y = '0'] = style.translate.split(' ');
                tx += parseFloat(x);
                ty += parseFloat(y);
              };
              let node: Element | undefined = el;
              while (node) {
                const style = getComputedStyle(node);
                o *= Number(style.opacity);
                slide(style);
                blur = Math.max(
                  blur,
                  parseFloat(style.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0'),
                );
                const last: Element = node;
                node = last.firstElementChild ?? undefined;
                if (last.children.length !== 1) {
                  if (node) {
                    const own = getComputedStyle(node);
                    o *= Number(own.opacity);
                    slide(own);
                    blur = Math.max(
                      blur,
                      parseFloat(
                        own.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0',
                      ),
                    );
                  }
                  break;
                }
              }
              return {
                text: el.textContent?.trim().slice(0, 40) ?? '',
                y: box.top - holder.top,
                h: box.height,
                o,
                blur,
                tx,
                ty,
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

export const framesOf = (frames: SwitchFrame[], name: string) =>
  frames.flatMap((f) =>
    f.t >= 0
      ? f.panels
          .filter((p) => p.text.startsWith(name))
          .map((p) => ({ ...p, t: f.t }))
      : [],
  );

export function expectSlides(
  frames: SwitchFrame[],
  from: string,
  to: string,
  axis: 'tx' | 'ty',
  sign: 1 | -1,
) {
  const out = framesOf(frames, from);
  const comes = framesOf(frames, to);
  const away = out.map((p) => p[axis] * -sign);
  expect(
    Math.min(...away),
    `${from} never slides the other way`,
  ).toBeGreaterThan(-0.5);
  expect(Math.max(...away), `${from} slides away`).toBeGreaterThan(
    PANEL_SHIFT / 2,
  );
  expect(Math.max(...away)).toBeLessThanOrEqual(PANEL_SHIFT + 0.01);
  const first = comes[0]![axis] * sign;
  expect(first, `${to} comes in from the far side`).toBeGreaterThan(
    PANEL_SHIFT * 0.6,
  );
  expect(first).toBeLessThanOrEqual(PANEL_SHIFT + 0.01);
  const ins = comes.map((p) => p[axis] * sign);
  expect(
    ins.slice(1).every((v, i) => v <= ins[i]! + 0.01),
    `${to} settles`,
  ).toBe(true);
  expect(comes.at(-1)![axis]).toBe(0);
  const other = axis === 'tx' ? 'ty' : 'tx';
  expect([...out, ...comes].every((p) => p[other] === 0)).toBe(true);
}

export function expectOnePanelAtATime(frames: SwitchFrame[]) {
  const most = Math.max(...frames.map((f) => f.panels.length));
  expect(most, 'panels on screen in one frame').toBeLessThanOrEqual(1);
}

export function expectOneIndicator(frames: SwitchFrame[]) {
  expect(
    frames.every((f) => f.indicators.length === 1),
    'one indicator on every frame',
  ).toBe(true);
  expect(frames.every((f) => f.indicators[0]!.o === 1)).toBe(true);
}

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
  const y = (
    frames.find((f) => f.t < 0 && f.panels[0]?.text.startsWith(from))
      ?.panels[0] ?? out[0]!
  ).y;
  expect(out.every((p) => Math.abs(p.y - y) < 0.5)).toBe(true);
  expect(out.every((p) => p.inert)).toBe(true);
  expect(out.some((p) => p.o > 0.1 && p.o < 0.9 && p.blur > 0.5)).toBe(true);
  const blurred = Math.max(...out.map((p) => p.blur));
  expect(blurred).toBeGreaterThan(PANEL_BLUR - 1);
  expect(blurred).toBeLessThanOrEqual(PANEL_BLUR + 0.01);
  expectCurvePace(
    out.map((p): Sample => [p.t, p.o]),
    PANEL_OUT,
    { from: 1, to: 0, a: 0.8, b: 0.2 },
  );
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
  const rest = frames.at(-1)!.panels[0]!;
  expect(rest.text.startsWith(to)).toBe(true);
  expect(rest.o).toBe(1);
  expect(rest.blur).toBe(0);
}

export function describeTabsDemo(
  library: string,
  { selectKeys }: { selectKeys: string[] },
) {
  const url = tabsDemo(library);
  test.describe(`${library} tabs demo`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoTabs(page, url);
    });

    test('page load: nothing moves, the indicator sits on the active tab', async ({
      page,
    }) => {
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

    test(
      "the tabs' text color changes on transition.color (200ms, ease)",
      { tag: '@timing' },
      async ({ page }) => {
        // shadcn-vue's tabs keep one text color in the light theme.
        if (library === VUE) {
          await page.emulateMedia({ colorScheme: 'dark' });
          await gotoTabs(page, url);
        }
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
        expect(reached.t - started.t).toBeGreaterThan(120);
        expect(reached.t - started.t).toBeLessThan(COLOR.duration + 80);
      },
    );

    test('the panels change one after the other: the old one fades out into a blur, then the new one fades in from it', async ({
      page,
    }) => {
      const frames = await recordSwitch(page, 'Analytics', 900);
      expectPanelsInSequence(frames, 'Overview', 'Analytics');
    });

    test("the content slides by the tabs' order: toward the start going to a later tab, toward the end going back", async ({
      page,
    }) => {
      expectSlides(
        await recordSwitch(page, 'Analytics', 900),
        'Overview',
        'Analytics',
        'tx',
        1,
      );
      expectSlides(
        await recordSwitch(page, 'Overview', 900),
        'Analytics',
        'Overview',
        'tx',
        -1,
      );
    });

    test('turned back as it comes in, the content slides back out from where it is', async ({
      page,
    }) => {
      const analytics = await tabCenter(page, 'Analytics');
      const frames = await recordSwitch(page, 'Analytics', 1000, async () => {
        await page.mouse.click(analytics.x, analytics.y);
        await page.waitForFunction((panel) => {
          const el = [...document.querySelectorAll<HTMLElement>(panel)].find(
            (p) => !p.hidden && p.textContent?.trim().startsWith('Analytics'),
          );
          const header = el?.querySelector('[data-slot="card-header"]');
          if (!header) return false;
          const x = parseFloat(getComputedStyle(header).translate) || 0;
          return x > 2 && x < 9;
        }, ANY_PANEL);
        const overview = await tabCenterNow(page, 'Overview');
        await page.mouse.click(overview.x, overview.y);
      });
      expectOnePanelAtATime(frames);
      const passed = framesOf(frames, 'Analytics');
      const xs = passed.map((p) => p.tx);
      expect(Math.min(...xs)).toBeGreaterThan(0);
      const low = xs.indexOf(Math.min(...xs));
      expect(low).toBeLessThan(xs.length - 2);
      expect(xs.at(-1)!).toBeGreaterThan(xs[low]! + 2);
      const steps = xs.slice(1).map((x, i) => Math.abs(x - xs[i]!));
      expect(Math.max(...steps)).toBeLessThan(5);
      const back = framesOf(frames, 'Overview').filter(
        (p) => p.t > passed.at(-1)!.t,
      );
      expect(back[0]!.tx).toBeLessThan(-PANEL_SHIFT * 0.6);
      expect(back.at(-1)!.tx).toBe(0);
    });

    test('keyboard: the selection animates like a click', async ({ page }) => {
      const start = await tabLeft(page, 'Overview');
      const target = await tabLeft(page, 'Analytics');
      await page.getByRole('tab', { name: 'Overview' }).focus();
      const frames = await recordSwitch(page, 'Analytics', 900, async () => {
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
      for (let i = 1; i < frames.length; i++) {
        const step = Math.abs(
          frames[i]!.indicators[0]!.x - frames[i - 1]!.indicators[0]!.x,
        );
        const dt = frames[i]!.t - frames[i - 1]!.t;
        expect(step, `${frames[i]!.t}ms`).toBeLessThan(Math.max(40, dt * 1.5));
      }
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
      const frames = await recordSwitch(page, 'Analytics', 1000, async () => {
        await page.mouse.click(analytics.x, analytics.y);
        await page.waitForFunction((panel) => {
          const el = [...document.querySelectorAll<HTMLElement>(panel)].find(
            (p) => !p.hidden && p.textContent?.trim().startsWith('Analytics'),
          );
          let o = el ? 1 : 0;
          for (let node = el?.firstElementChild ? el : null; node;) {
            o *= Number(getComputedStyle(node).opacity);
            if (node.children.length !== 1) {
              const first = node.firstElementChild;
              if (first) o *= Number(getComputedStyle(first).opacity);
              break;
            }
            node = node.firstElementChild as HTMLElement;
          }
          return o > 0.25 && o < 0.75;
        }, ANY_PANEL);
        const reports = await tabCenterNow(page, 'Reports');
        await page.mouse.click(reports.x, reports.y);
      });
      expectOneIndicator(frames);
      expectOnePanelAtATime(frames);
      const passed = framesOf(frames, 'Analytics');
      const peak = passed.reduce((i, p, j) => (p.o > passed[i]!.o ? j : i), 0);
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

    test('a list of a fractional width: the indicator sits exactly on the active tab', async ({
      page,
    }) => {
      const list = page.getByRole('tablist');
      const rounding = await list.evaluate((el: HTMLElement) => {
        el.style.width = '301.37px';
        return parseFloat(getComputedStyle(el).width) - el.offsetWidth;
      });
      expect(Math.abs(rounding)).toBeGreaterThan(0.1);
      await waitForIndicatorRest(page);
      await expectOnActiveTab(page, 0.005);
      for (const name of ['Settings', 'Reports']) {
        await page.getByRole('tab', { name }).click();
        await waitForIndicatorRest(page);
        await expectOnActiveTab(page, 0.005);
      }
    });

    test('under an ancestor scaled close to 1: the indicator sits on the active tab, scaled and once the scale has gone', async ({
      page,
    }) => {
      const list = page.getByRole('tablist');
      for (const [scale, name] of [
        ['1.02', 'Settings'],
        ['0.985', 'Reports'],
      ] as const) {
        await list.evaluate((el, scale) => {
          el.parentElement!.style.scale = scale;
        }, scale);
        await page.getByRole('tab', { name }).click();
        await waitForIndicatorRest(page);
        await expectOnActiveTab(page, 0.05);
        await list.evaluate((el) => {
          el.parentElement!.style.scale = '';
        });
        await nextFrames(page, 5);
        await expectOnActiveTab(page, 0.05);
      }
    });

    test('selected while drawn tilted and scaled (a dialog coming in): once the transform has gone, the indicator sits on the active tab', async ({
      page,
    }) => {
      const transform = 'perspective(500px) rotateX(-20deg) scale(0.8)';
      const list = page.getByRole('tablist');
      await list.evaluate((el, transform) => {
        el.parentElement!.style.transform = transform;
      }, transform);
      await nextFrames(page, 2);
      await page.getByRole('tab', { name: 'Settings' }).click();
      await list.evaluate(async (el, transform) => {
        const parent = el.parentElement!;
        parent.style.transform = '';
        await parent.animate([{ transform }, { transform: 'none' }], {
          duration: 300,
          easing: 'ease-out',
        }).finished;
      }, transform);
      await waitForIndicatorRest(page);
      await expectOnActiveTab(page, 0.05);
    });

    test("the slide runs on the compositor: its translate replaces the indicator's own (added to it, it ran on the main thread)", async ({
      page,
    }) => {
      await page.locator(INDICATOR).evaluate((el) => {
        const w = window as unknown as { __slide?: Promise<unknown> };
        w.__slide = new Promise((resolve) => {
          new MutationObserver((_, observer) => {
            if (!el.hasAttribute('data-animate-ui-sliding')) return;
            observer.disconnect();
            resolve(
              el.getAnimations().map((animation) => {
                const effect = animation.effect as KeyframeEffect;
                return {
                  composite: effect.composite,
                  keyframes: effect.getKeyframes().map((keyframe) => ({
                    translate: keyframe.translate as string | undefined,
                    composite: keyframe.composite,
                  })),
                };
              }),
            );
          }).observe(el, {
            attributes: true,
            attributeFilter: ['data-animate-ui-sliding'],
          });
        });
      });
      await page.getByRole('tab', { name: 'Settings' }).click();
      const animations = (await page.evaluate(
        () => (window as unknown as { __slide: Promise<unknown> }).__slide,
      )) as {
        composite: string;
        keyframes: { translate?: string; composite: string }[];
      }[];
      const slide = animations.find((animation) =>
        animation.keyframes.some((keyframe) => keyframe.translate),
      );
      expect(slide, 'a translate animation').toBeDefined();
      expect(slide!.composite).toBe('replace');
      expect(
        slide!.keyframes.every((keyframe) =>
          ['auto', 'replace'].includes(keyframe.composite),
        ),
      ).toBe(true);
      const still = (translate = '') =>
        translate.split(/\s+/).every((value) => parseFloat(value) === 0);
      expect(still(slide!.keyframes[0]!.translate)).toBe(false);
      expect(still(slide!.keyframes.at(-1)!.translate)).toBe(true);
    });
  });
}

export function describeTabsMounted(library: string) {
  test.describe(`${library} tabs, mounted after the page has loaded`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        library === VUE
          ? '/tests/vue-demos/fixtures/reka-ui-tabs-indicator-mount'
          : '/tests/fixtures/tabs-indicator-mount',
        { waitUntil: 'networkidle' },
      );
      if (library !== VUE)
        await page.waitForFunction(() => {
          const buttons = [...document.querySelectorAll('button')];
          return (
            buttons.length > 0 &&
            buttons.every((button) =>
              Object.keys(button).some((key) => key.startsWith('__reactProps')),
            )
          );
        });
      await page.waitForTimeout(250);
    });

    test("the active tab's own look goes at once as the indicator shows, never fading out over it (shadcn's transition-all)", async ({
      page,
    }) => {
      const scope = `[data-testid="${library}-settle"]`;
      const section = page.locator(scope);
      for (const round of ['mounted', 'mounted again']) {
        await page.evaluate(
          ({ scope, indicator }) => {
            const root = document.querySelector(scope)!;
            const alpha = (color: string) => {
              if (color === 'transparent') return 0;
              const slash = color.match(/\/\s*([\d.]+)(%?)\s*\)$/);
              if (slash) return parseFloat(slash[1]!) / (slash[2] ? 100 : 1);
              const rgba = color.match(/^rgba\(.*,\s*([\d.]+)\)$/);
              return rgba ? parseFloat(rgba[1]!) : 1;
            };
            const w = window as unknown as { __mount?: Promise<unknown> };
            w.__mount = new Promise((resolve) => {
              const frames: unknown[] = [];
              const start = performance.now();
              let shownAt: number | null = null;
              const tick = (now: number) => {
                const el = root.querySelector(indicator);
                const tab = root.querySelector(
                  '[role="tab"][aria-selected="true"]',
                );
                if (el && tab) {
                  shownAt ??= now;
                  const own = getComputedStyle(tab);
                  frames.push({
                    t: now - shownAt,
                    border: alpha(own.borderTopColor),
                    background: alpha(own.backgroundColor),
                    indicator: alpha(getComputedStyle(el).borderTopColor),
                  });
                }
                const done =
                  shownAt === null ? now - start > 30_000 : now - shownAt > 400;
                if (done) resolve(frames);
                else requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            });
          },
          { scope, indicator: INDICATOR },
        );
        await section.getByRole('button', { name: 'Show tabs' }).click();
        const frames = (await page.evaluate(
          () => (window as unknown as { __mount: Promise<unknown> }).__mount,
        )) as {
          t: number;
          border: number;
          background: number;
          indicator: number;
        }[];
        expect(frames.length, `${round}: frames shown`).toBeGreaterThan(2);
        expect(frames.at(-1)!.t).toBeGreaterThan(300);
        expect(frames[0]!.indicator).toBeGreaterThan(0);
        expect(frames[0]!.indicator).toBeLessThan(1);
        for (const { t, border, background } of frames) {
          expect(border, `${round}: the tab's own border at ${t}ms`).toBe(0);
          expect(
            background,
            `${round}: the tab's own background at ${t}ms`,
          ).toBe(0);
        }
        await section.getByRole('button', { name: 'Hide tabs' }).click();
        await expect(section.locator(INDICATOR)).toHaveCount(0);
      }
    });

    test('mounted in a box coming in like a dialog (tilted and scaled): once it has come in, the indicator sits on the active tab', async ({
      page,
    }) => {
      const scope = `[data-testid="${library}-entrance"]`;
      const section = page.locator(scope);
      await section.getByRole('button', { name: 'Show in entrance' }).click();
      await section.getByTestId('entrance-box').evaluate(async (el) => {
        await Promise.all(el.getAnimations().map((a) => a.finished));
      });
      await waitForIndicatorRest(page, scope);
      await expectOnActiveTab(page, 0.05, scope);
    });
  });
}

export function describeTabsHeights(library: string) {
  const url = tabsFixture(library);
  const scope = '[data-testid="heights"]';

  test.describe(`${library} tabs, panels of different heights`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoTabs(page, url);
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
      const out = framesOf(frames, 'Short');
      expect(out.every((p) => Math.abs(p.h - before) < 0.5)).toBe(true);
      const comes = framesOf(frames, 'Tall');
      const after = comes.at(-1)!.h;
      expect(after).toBeGreaterThan(before + 20);
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
          // The growing panel can move the tabs (a centered page): aim where Short is now.
          const short = await tabCenter(page, 'Short', scope);
          await page.mouse.click(short.x, short.y);
        },
        scope,
      );
      expectOnePanelAtATime(frames);
      const leaving = framesOf(frames, 'Tall');
      const peak = leaving.reduce(
        (i, p, j) => (p.o > leaving[i]!.o ? j : i),
        0,
      );
      expect(leaving.slice(peak).length).toBeGreaterThan(2);
      expect(leaving.at(-1)!.o).toBeLessThan(0.2);
      const back = framesOf(frames, 'Short').filter(
        (p) => p.t > leaving.at(-1)!.t,
      );
      expect(back.length).toBeGreaterThan(2);
      expect(Math.abs(back[0]!.h - leaving.at(-1)!.h)).toBeLessThan(6);
      expect(back.at(-1)!.h).toBeCloseTo(before, 0);
      const heights = frames
        .filter((f) => f.t >= 0 && f.panels.length)
        .map((f) => f.panels[0]!.h);
      const steps = heights.slice(1).map((h, i) => Math.abs(h - heights[i]!));
      expect(Math.max(...steps)).toBeLessThan(12);
    });

    test("under an ancestor's scale: the height glides from the old panel's own height to the new one's (laid out, unrounded), not as drawn scaled", async ({
      page,
    }) => {
      const section = page.locator(scope);
      const before = await section
        .locator(`${PANEL}:not([hidden])`)
        .first()
        .evaluate((el: HTMLElement) => {
          el.style.height = '40.37px';
          el.closest<HTMLElement>('[data-testid]')!.style.scale = '0.9';
          return {
            layout: parseFloat(getComputedStyle(el).height),
            drawn: el.getBoundingClientRect().height,
          };
        });
      expect(before.layout % 1, 'a fractional height').not.toBe(0);
      expect(before.drawn, 'drawn scaled').toBeCloseTo(before.layout * 0.9, 2);
      const glide = page.evaluate(
        ({ scope, panel }) =>
          new Promise<string[]>((resolve) => {
            const read = () => {
              const tall = [
                ...document.querySelector(scope)!.querySelectorAll(panel),
              ].find((el) => el.textContent?.trim().startsWith('Tall'));
              const animation = tall
                ?.getAnimations()
                .find((a) =>
                  (a.effect as KeyframeEffect)
                    .getKeyframes()
                    .some((k) => k.minHeight),
                );
              if (animation)
                resolve(
                  (animation.effect as KeyframeEffect)
                    .getKeyframes()
                    .map((k) => String(k.minHeight)),
                );
              else requestAnimationFrame(read);
            };
            read();
          }),
        { scope, panel: ANY_PANEL },
      );
      await section.getByRole('tab', { name: 'Tall', exact: true }).click();
      const [from, to] = await glide;
      const tall = section.locator(`${PANEL}:not([hidden])`);
      await expect(tall).toContainText('Tall panel');
      await expect
        .poll(() => tall.evaluate((el) => el.getAnimations().length))
        .toBe(0);
      const after = await tall.evaluate((el) =>
        parseFloat(getComputedStyle(el).height),
      );
      expect(
        Math.abs(parseFloat(from!) - before.layout),
        `it starts at ${from} (the old panel: ${before.layout}px laid out, ${before.drawn}px drawn)`,
      ).toBeLessThan(0.01);
      expect(
        Math.abs(parseFloat(to!) - after),
        `it ends at ${to} (its own: ${after}px laid out)`,
      ).toBeLessThan(0.01);
    });

    test('reduced motion: the indicator and the height jump, the panels fade through their blur without moving', async ({
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
      const blurs = frames.flatMap((f) => f.panels.map((p) => p.blur));
      expect(blurs.some((blur) => blur > 0)).toBe(true);
      expect(blurs.every((blur) => blur <= 5)).toBe(true);
      expect(frames.at(-1)!.panels.every((p) => p.blur === 0)).toBe(true);
      expect(
        frames.every((f) => f.panels.every((p) => p.tx === 0 && p.ty === 0)),
      ).toBe(true);
      const heights = frames.flatMap((f) => f.panels.map((p) => p.h));
      expect(heights.some((h) => h > before + 1 && h < after - 1)).toBe(false);
      const lefts = frames.map((f) => f.indicators[0]!.x);
      expect(lefts.some((x) => x > start + 1 && x < target - 1)).toBe(false);
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

const BOX = '[data-box], [data-slot="card"]';

export type BoxFrame = {
  text: string;
  o: number;
  blur: number;
  clip: number;
  h: number;
  content: number;
};

export async function recordBoxes(
  page: Page,
  root: string,
  last: string,
  select: () => Promise<void>,
  ms = 1000,
) {
  await page.evaluate(
    ({ root, box, last, ms }) => {
      const host = document.querySelector(root)!;
      const tab = [...host.querySelectorAll('[role="tab"]')].find(
        (el) => el.textContent?.trim() === last,
      )!;
      const w = window as unknown as { __boxes?: Promise<unknown> };
      w.__boxes = new Promise((resolve) => {
        const frames: { t: number; boxes: unknown[] }[] = [];
        let start: number | null = null;
        let selectedAt: number | null = null;
        const blurOf = (style: CSSStyleDeclaration) =>
          parseFloat(style.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0');
        const tick = (now: number) => {
          start ??= now;
          const boxes = [...host.querySelectorAll<HTMLElement>(box)]
            .filter((el) => el.getClientRects().length > 0)
            .map((el) => {
              const rect = el.getBoundingClientRect();
              const ring = getComputedStyle(el).boxShadow === 'none' ? 0 : 1;
              let o = 1;
              let blur = 0;
              let clip = 0;
              for (
                let node: Element | null = el;
                node && node !== document.documentElement;
                node = node.parentElement
              ) {
                const style = getComputedStyle(node);
                o *= Number(style.opacity);
                blur = Math.max(blur, blurOf(style));
                if (
                  node !== el &&
                  (style.overflowX !== 'visible' ||
                    style.overflowY !== 'visible')
                ) {
                  const a = node.getBoundingClientRect();
                  clip = Math.max(
                    clip,
                    rect.bottom + ring - a.bottom,
                    a.top - (rect.top - ring),
                    rect.right + ring - a.right,
                    a.left - (rect.left - ring),
                  );
                }
              }
              const first = el.firstElementChild;
              return {
                text: el.textContent?.trim().slice(0, 40) ?? '',
                o,
                blur,
                clip,
                h: rect.height,
                content: first
                  ? o * Number(getComputedStyle(first).opacity)
                  : o,
              };
            });
          frames.push({ t: now, boxes });
          if (
            selectedAt === null &&
            tab.getAttribute('aria-selected') === 'true'
          )
            selectedAt = now;
          const done =
            selectedAt === null ? now - start > 30_000 : now - selectedAt > ms;
          if (!done) requestAnimationFrame(tick);
          else resolve(frames.map((f) => ({ ...f, t: f.t - start! })));
        };
        requestAnimationFrame(tick);
      });
    },
    { root, box: BOX, last, ms },
  );
  await select();
  return (await page.evaluate(
    () => (window as unknown as { __boxes: Promise<unknown> }).__boxes,
  )) as { t: number; boxes: BoxFrame[] }[];
}

export function expectBoxStays(
  frames: { t: number; boxes: BoxFrame[] }[],
  from: string,
  to: string,
) {
  expect(
    frames.every((f) => f.boxes.length === 1),
    'one box on every frame',
  ).toBe(true);
  const boxes = frames.map((f) => ({ t: f.t, ...f.boxes[0]! }));
  const worst = (key: 'o' | 'blur' | 'clip', pick: typeof Math.min) =>
    pick(...boxes.map((b) => b[key]));
  expect(worst('o', Math.min), 'the box is never faded').toBe(1);
  expect(worst('blur', Math.max), 'the box is never blurred').toBe(0);
  expect(worst('clip', Math.max), 'the box is never cut').toBeLessThan(0.5);
  expect(
    boxes.some((b) => b.text.startsWith(from) && b.content < 0.9),
    `${from}'s content fades out`,
  ).toBe(true);
  expect(
    boxes.some((b) => b.text.startsWith(to) && b.content < 0.9),
    `${to}'s content fades in`,
  ).toBe(true);
  expect(boxes.at(-1)!.text.startsWith(to), `${to} at the end`).toBe(true);
  expect(boxes.at(-1)!.content).toBe(1);
  for (let i = 1; i < boxes.length; i++) {
    const step = Math.abs(boxes[i]!.h - boxes[i - 1]!.h);
    const dt = boxes[i]!.t - boxes[i - 1]!.t;
    expect(step, `height step at ${Math.round(boxes[i]!.t)}ms`).toBeLessThan(
      Math.max(20, dt * 1.2),
    );
  }
  const swap = boxes.findIndex((b) => b.text.startsWith(to));
  expect(swap).toBeGreaterThan(0);
  expect(Math.abs(boxes[swap]!.h - boxes[swap - 1]!.h)).toBeLessThan(8);
}

export function describeTabsFrames(library: string) {
  test.describe(`${library} tabs, panels holding a box`, () => {
    const demo = tabsDemo(library);
    const fixture = tabsFixture(library);
    const root = '[data-slot="tabs"]';
    const frames = '[data-testid="frames"]';

    for (const [from, to, label] of [
      ['Overview', 'Analytics', 'a taller one'],
      ['Analytics', 'Reports', 'a shorter one'],
    ] as const)
      test(`the Card stays on screen as the next one takes over, ${label}: only its content fades`, async ({
        page,
      }) => {
        await gotoTabs(page, demo);
        if (from !== 'Overview') {
          await page.getByRole('tab', { name: from }).click();
          await page.waitForTimeout(900);
        }
        const before = await page
          .locator(`${PANEL}:not([hidden]) [data-slot="card"]`)
          .evaluate((el) => el.getBoundingClientRect().height);
        const target = await tabCenter(page, to);
        const recorded = await recordBoxes(page, root, to, () =>
          page.mouse.click(target.x, target.y),
        );
        expectBoxStays(recorded, from, to);
        const after = recorded.at(-1)!.boxes[0]!.h;
        expect(Math.abs(after - before)).toBeGreaterThan(20);
        const glide = recorded
          .map((f) => ({ t: f.t, ...f.boxes[0]! }))
          .filter((b) => b.text.startsWith(to));
        expectCurvePace(
          glide.map((b): Sample => [b.t, b.h]),
          PANEL_HEIGHT,
          {
            from: before,
            to: after,
            a: before + (after - before) * 0.1,
            b: before + (after - before) * 0.9,
          },
        );
      });

    test('quick changes: the Card stays on screen, its height goes on from where it is', async ({
      page,
    }) => {
      await gotoTabs(page, demo);
      const analytics = await tabCenter(page, 'Analytics');
      const recorded = await recordBoxes(page, root, 'Settings', async () => {
        await page.mouse.click(analytics.x, analytics.y);
        await page.waitForFunction(() => {
          const card = [
            ...document.querySelectorAll<HTMLElement>('[data-slot="card"]'),
          ].find((el) => el.getClientRects().length > 0);
          return (
            !!card?.textContent?.startsWith('Analytics') &&
            card.getBoundingClientRect().height > 150
          );
        });
        const settings = await tabCenterNow(page, 'Settings');
        await page.mouse.click(settings.x, settings.y);
      });
      expectBoxStays(recorded, 'Overview', 'Settings');
      expect(
        recorded.some((f) => f.boxes[0]!.text.startsWith('Analytics')),
        'Analytics showed on the way',
      ).toBe(true);
    });

    test('a box that looks different: the panels fade whole', async ({
      page,
    }) => {
      await gotoTabs(page, fixture);
      await page.locator(frames).scrollIntoViewIfNeeded();
      const target = await tabCenter(page, 'Other box', frames);
      const recorded = await recordBoxes(page, frames, 'Other box', () =>
        page.mouse.click(target.x, target.y),
      );
      const boxes = recorded.flatMap((f) => f.boxes);
      expect(
        boxes.some((b) => b.text.startsWith('Boxed panel') && b.o < 0.3),
      ).toBe(true);
      expect(
        boxes.some((b) => b.text.startsWith('Other box') && b.o < 0.3),
      ).toBe(true);
      expect(recorded.every((f) => f.boxes.length <= 1)).toBe(true);
      expect(boxes.at(-1)!.o).toBe(1);
    });

    test('text right inside the box: the panels fade whole', async ({
      page,
    }) => {
      await gotoTabs(page, fixture);
      await page.locator(frames).scrollIntoViewIfNeeded();
      const target = await tabCenter(page, 'Text box', frames);
      const recorded = await recordBoxes(page, frames, 'Text box', () =>
        page.mouse.click(target.x, target.y),
      );
      const boxes = recorded.flatMap((f) => f.boxes);
      expect(
        boxes.some((b) => b.text.startsWith('Boxed panel') && b.o < 0.3),
      ).toBe(true);
      expect(
        boxes.some((b) => b.text.startsWith('Text box') && b.o < 0.3),
      ).toBe(true);
      expect(recorded.every((f) => f.boxes.length <= 1)).toBe(true);
    });

    test('boxes that look alike in a fixture: the box stays', async ({
      page,
    }) => {
      await gotoTabs(page, fixture);
      await page.locator(frames).scrollIntoViewIfNeeded();
      const target = await tabCenter(page, 'Boxed tall', frames);
      const recorded = await recordBoxes(page, frames, 'Boxed tall', () =>
        page.mouse.click(target.x, target.y),
      );
      expectBoxStays(recorded, 'Boxed panel', 'Boxed tall');
    });
  });
}
