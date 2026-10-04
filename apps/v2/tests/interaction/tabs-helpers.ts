import { expect, test, type Page } from '@playwright/test';

// Shared by the Radix UI, Base UI and React Aria tabs specs.

export const INDICATOR = '[data-slot="tabs-indicator"]';
export const PANEL = '[role="tabpanel"]';

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

/** Left edge of the indicator relative to the tab `name`. */
export const offsetFrom = (page: Page, name: string) =>
  page.evaluate(
    ({ indicator, name }) => {
      const tab = [...document.querySelectorAll('[role="tab"]')].find(
        (el) => el.textContent?.trim() === name,
      )!;
      const ind = document.querySelector(indicator)!;
      return (
        ind.getBoundingClientRect().left - tab.getBoundingClientRect().left
      );
    },
    { indicator: INDICATOR, name },
  );

export const tabLeft = (page: Page, name: string) =>
  page
    .getByRole('tab', { name, exact: true })
    .evaluate((el) => el.getBoundingClientRect().left);

export const panelOpacity = (page: Page) =>
  page
    .locator(PANEL)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

/** The active tab's own surface is hidden; the indicator carries it. */
export async function expectSurfaceOnIndicator(page: Page) {
  const { tab, indicator } = await page.evaluate((selector) => {
    const active = document.querySelector(
      '[role="tab"][aria-selected="true"]',
    )!;
    const ind = document.querySelector(selector)!;
    return {
      tab: getComputedStyle(active).backgroundColor,
      indicator: getComputedStyle(ind).backgroundColor,
    };
  }, INDICATOR);
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
  select: () => Promise<void> = () =>
    page.getByRole('tab', { name, exact: true }).click(),
) {
  await page.evaluate(
    ({ indicator, panel, name, ms }) => {
      const tab = [
        ...document.querySelectorAll<HTMLElement>('[role="tab"]'),
      ].find((el) => el.textContent?.trim() === name)!;
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
          const shown = [...document.querySelectorAll<HTMLElement>(panel)].find(
            (el) => !el.hidden,
          );
          const style = shown ? getComputedStyle(shown) : null;
          frames.push({
            t: now,
            indicators: [
              ...document.querySelectorAll<HTMLElement>(indicator),
            ].map((el) => ({
              x: el.getBoundingClientRect().left,
              o: Number(getComputedStyle(el).opacity),
            })),
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
    { indicator: INDICATOR, panel: PANEL, name, ms },
  );
  await select();
  return (await page.evaluate(
    () => (window as unknown as { __switch: Promise<unknown> }).__switch,
  )) as SwitchFrame[];
}

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
      // Sampled from the first frames, as v1 fades the panel in on mount.
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
          if (w.__load.length < 600) requestAnimationFrame(tick);
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
      const frames = await recordSwitch(page, 'Activity');
      const final = frames.at(-1)!.color;
      const started = frames.find((f) => f.color !== frames[0]!.color)!;
      const reached = frames.find((f) => f.color === final)!;
      expect(new Set(frames.map((f) => f.color)).size).toBeGreaterThan(3);
      // From its first change to the final color (shadcn's own is 150ms).
      expect(reached.t - started.t).toBeGreaterThan(300);
    });

    test('keyboard: the selection animates like a click', async ({ page }) => {
      const start = await tabLeft(page, 'Overview');
      const target = await tabLeft(page, 'Activity');
      await page.getByRole('tab', { name: 'Overview' }).focus();
      const frames = await recordSwitch(page, 'Activity', 900, async () => {
        // Radix and React Aria select on arrow keys; Base UI moves focus,
        // then Enter selects.
        for (const key of selectKeys) await page.keyboard.press(key);
      });
      await expect(page.getByRole('tab', { name: 'Activity' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
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
      expect(Math.abs(await offsetFrom(page, 'Activity'))).toBeLessThan(1);
      // Focus moved with the selection, nothing delayed it.
      await expect(page.getByRole('tab', { name: 'Activity' })).toBeFocused();
    });

    test('the new panel fades in from a blur while its height springs, the old one is gone at once', async ({
      page,
    }) => {
      const before = await page
        .locator(PANEL)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);
      const frames = await recordSwitch(page, 'Activity');
      await expect(page.locator(PANEL)).toHaveCount(1);
      await expect(page.locator(PANEL)).toContainText('Recent activity');
      const after = frames.at(-1)!.panel!.h;
      // The Activity panel is taller: it grows from the previous height.
      expect(after).toBeGreaterThan(before + 20);
      const panels = frames.map((f) => f.panel).filter((p) => p !== null);
      expect(panels.some((p) => p.o > 0 && p.o < 1 && p.blur > 0)).toBe(true);
      expect(panels.some((p) => p.h > before + 1 && p.h < after - 1)).toBe(
        true,
      );
      // Never taller than its own height (no flash of the full panel).
      const entered = panels.filter((p) => p.o < 0.5);
      expect(entered.every((p) => p.h < after - 1)).toBe(true);
      await expect.poll(() => panelOpacity(page)).toBe(1);
    });

    test('reduced motion: the indicator and the height jump', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await waitForTabs(page);
      const before = await page
        .locator(PANEL)
        .first()
        .evaluate((el) => el.getBoundingClientRect().height);
      const frames = await recordSwitch(page, 'Activity', 600);
      const after = frames.at(-1)!.panel!.h;
      const heights = frames.map((f) => f.panel?.h ?? 0);
      expect(heights.some((h) => h > before + 1 && h < after - 1)).toBe(false);
      expect(Math.abs(await offsetFrom(page, 'Activity'))).toBeLessThan(1);
    });
  });
}
