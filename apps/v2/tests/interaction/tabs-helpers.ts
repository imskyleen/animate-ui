import { expect, test, type Page } from '@playwright/test';

import { expectSpringPace, type Sample } from './spring-curves';

// Shared by the Radix UI, Base UI and React Aria tabs specs.

export const INDICATOR = '[data-slot="tabs-indicator"]';
export const PANEL = '[role="tabpanel"]';

/** The panels' height: the spring of Auto Height and Animate UI's Tabs. */
const HEIGHT_SPRING = { stiffness: 300, damping: 30, restDelta: 0.01 };

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
export const offsetFrom = (page: Page, name: string, scope?: string) =>
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
    { indicator: INDICATOR, name, scope },
  );

export const tabLeft = (page: Page, name: string, scope?: string) =>
  within(page, scope)
    .getByRole('tab', { name, exact: true })
    .evaluate((el) => el.getBoundingClientRect().left);

export const panelOpacity = (page: Page, scope?: string) =>
  within(page, scope)
    .locator(PANEL)
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

type SwitchFrame = {
  t: number;
  indicators: { x: number; o: number }[];
  panel: { h: number; o: number; blur: number } | null;
  color: string;
};

/**
 * Clicks the tab `name` and records, on every frame (in the page, so it holds
 * up on a busy machine): the indicators (left edge and opacity of each), the
 * visible panel (height, opacity, blur) and the tab's text color. Times are
 * relative to the frame the tab is selected in (earlier frames are negative),
 * and the recording lasts `ms` from there, however long the click takes.
 */
export async function recordSwitch(
  page: Page,
  name: string,
  ms = 900,
  /** How the tab gets selected: a click by default. */
  select?: () => Promise<void>,
  scope?: string,
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
        const tick = () => {
          const now = performance.now();
          if (
            selectedAt === null &&
            tab.getAttribute('aria-selected') === 'true'
          )
            selectedAt = now;
          const shown = [...root.querySelectorAll<HTMLElement>(panel)].find(
            (el) => !el.hidden,
          );
          const style = shown ? getComputedStyle(shown) : null;
          frames.push({
            t: now,
            indicators: [...root.querySelectorAll<HTMLElement>(indicator)].map(
              (el) => ({
                x: el.getBoundingClientRect().left,
                o: Number(getComputedStyle(el).opacity),
              }),
            ),
            panel: shown
              ? {
                  h: shown.getBoundingClientRect().height,
                  o: Number(style!.opacity),
                  blur: parseFloat(
                    style!.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0',
                  ),
                }
              : null,
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
    { indicator: INDICATOR, panel: PANEL, name, ms, scope },
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
 * shadcn's tabs demo: Overview (selected), Analytics, Reports and Settings,
 * each panel a card of the same height.
 */
export function describeTabsDemo(
  library: string,
  { selectKeys }: { selectKeys: string[] },
) {
  test.describe(`${library} tabs demo`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoTabs(page, `/tests/demos/${library}/tabs`);
    });

    test('page load: the indicator sits on the active tab, the panel fades in from a blur', async ({
      page,
    }) => {
      // Sampled from the first frames, as v1 fades the panel in on mount
      // (for up to a minute: a busy dev server can hydrate late).
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
      await expect.poll(() => panelOpacity(page)).toBe(1);
      const load = await page.evaluate(
        () => (window as unknown as { __load: number[][] }).__load,
      );
      expect(load.some(([o, blur]) => o! < 1 && blur! > 0)).toBe(true);
      await expectSurfaceOnIndicator(page);
    });

    test('pointer: the surface slides to the new tab, the previous one fades out after it', async ({
      page,
    }) => {
      const start = await tabLeft(page, 'Overview');
      const target = await tabLeft(page, 'Settings');
      const frames = await recordSwitch(page, 'Settings');
      const sliding = frames.filter((f) => f.indicators.length === 2);
      // Both surfaces move together, strictly between the two tabs.
      expect(
        sliding.some((f) =>
          f.indicators.every((i) => i.x > start + 4 && i.x < target - 4),
        ),
      ).toBe(true);
      // The new one (last) fades in; the previous one stays opaque at first
      // (v1's 200ms exit delay), then fades out.
      expect(sliding.some((f) => f.indicators[1]!.o < 0.5)).toBe(true);
      expect(
        sliding.some((f) => f.indicators[1]!.o < 1 && f.indicators[0]!.o === 1),
      ).toBe(true);
      expect(
        sliding.some((f) => f.indicators[0]!.o > 0 && f.indicators[0]!.o < 1),
      ).toBe(true);

      await expect(page.locator(INDICATOR)).toHaveCount(1);
      expect(Math.abs(await offsetFrom(page, 'Settings'))).toBeLessThan(1);
      await expectSurfaceOnIndicator(page);
    });

    test("the tabs' text color changes over 500ms", async ({ page }) => {
      const frames = await recordSwitch(page, 'Analytics');
      const final = frames.at(-1)!.color;
      const started = frames.find((f) => f.color !== frames[0]!.color)!;
      const reached = frames.find((f) => f.color === final)!;
      expect(new Set(frames.map((f) => f.color)).size).toBeGreaterThan(3);
      // From its first change to the final color (shadcn's own is 150ms).
      expect(reached.t - started.t).toBeGreaterThan(300);
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
      // The surface slides (both surfaces between the two tabs) and the panel
      // fades in from a blur, as on click.
      expect(
        frames.some(
          (f) =>
            f.indicators.length === 2 &&
            f.indicators.every((i) => i.x > start + 4 && i.x < target - 4),
        ),
      ).toBe(true);
      expect(
        frames.some((f) => f.panel && f.panel.o < 1 && f.panel.blur > 0),
      ).toBe(true);
      await expect(page.locator(INDICATOR)).toHaveCount(1);
      expect(Math.abs(await offsetFrom(page, 'Analytics'))).toBeLessThan(1);
      // Focus moved with the selection, nothing delayed it.
      await expect(page.getByRole('tab', { name: 'Analytics' })).toBeFocused();
    });
  });
}

/**
 * The panels' height, on the `heights` section of the library's fixture:
 * shadcn's demo has panels of one height. Its tabs are Short (selected) and
 * Tall, whose panel is taller.
 */
export function describeTabsHeights(library: string) {
  const scope = '[data-testid="heights"]';

  test.describe(`${library} tabs, panels of different heights`, () => {
    test.beforeEach(async ({ page }) => {
      await gotoTabs(page, `/tests/fixtures/${library}-tabs`);
    });

    const panelHeight = (page: Page) =>
      page
        .locator(scope)
        .locator(PANEL)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);

    test('the new panel fades in from a blur while its height springs, the old one is gone at once', async ({
      page,
    }) => {
      const before = await panelHeight(page);
      const frames = await recordSwitch(page, 'Tall', 900, undefined, scope);
      const panel = page.locator(scope).locator(PANEL);
      await expect(panel).toHaveCount(1);
      await expect(panel).toContainText('Tall panel');
      const after = frames.at(-1)!.panel!.h;
      // The Tall panel is taller: it grows from the previous height.
      expect(after).toBeGreaterThan(before + 20);
      const panels = frames.map((f) => f.panel).filter((p) => p !== null);
      expect(panels.some((p) => p.o > 0 && p.o < 1 && p.blur > 0)).toBe(true);
      expect(panels.some((p) => p.h > before + 1 && p.h < after - 1)).toBe(
        true,
      );
      // On the height spring: from 10% to 90% of the way in the time it
      // takes.
      expectSpringPace(
        frames.flatMap((f): Sample[] => (f.panel ? [[f.t, f.panel.h]] : [])),
        HEIGHT_SPRING,
        {
          from: before,
          to: after,
          a: before + (after - before) * 0.1,
          b: before + (after - before) * 0.9,
        },
      );
      // Never taller than its own height (no flash of the full panel).
      const entered = panels.filter((p) => p.o < 0.5);
      expect(entered.every((p) => p.h < after - 1)).toBe(true);
      await expect.poll(() => panelOpacity(page, scope)).toBe(1);
    });

    test('reduced motion: the indicator and the height jump', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await waitForTabs(page);
      const before = await panelHeight(page);
      const frames = await recordSwitch(page, 'Tall', 600, undefined, scope);
      const after = frames.at(-1)!.panel!.h;
      expect(after).toBeGreaterThan(before + 20);
      const heights = frames.map((f) => f.panel?.h ?? 0);
      expect(heights.some((h) => h > before + 1 && h < after - 1)).toBe(false);
      expect(Math.abs(await offsetFrom(page, 'Tall', scope))).toBeLessThan(1);
    });
  });
}
