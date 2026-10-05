import { expect, test, type Locator, type Page } from '@playwright/test';

// Animate UI v1's menu highlight, shared by the specs of every menu-like
// primitive (dropdown and context menus, menubars, selects, comboboxes, React
// Aria's ListBox): one surface glides behind the highlighted item on a
// spring, instead of each item lighting up on its own. It's handed from item
// to item: there's never more than one on screen.

const HIGHLIGHT = '[data-slot="item-highlight"]';
/** The items of the open menus and lists. */
const ITEMS =
  '[role="menu"] [role^="menuitem"], [role="listbox"] [role="option"]';

export type HighlightFrame = {
  t: number;
  /**
   * Every copy on screen: its visual box, the opacity of its fill, and whether
   * the fill has a background at all.
   */
  copies: {
    top: number;
    left: number;
    width: number;
    opacity: number;
    painted: boolean;
  }[];
  /** A copy runs a Web Animation of `transform`. */
  composited: boolean;
  /**
   * Items painting a background of their own: the highlight stands in for
   * theirs, so any is a second highlight.
   */
  lit: string[];
  /**
   * How much highlight shows: each copy's opacity times the part of it its
   * menu doesn't clip, summed (1 for one highlight in full view).
   */
  presence: number;
};

/**
 * Records every highlight copy frame by frame for `duration` ms: call it right
 * before the interaction, then await it.
 */
export function recordHighlight(page: Page, duration: number) {
  return page.evaluate(
    ({ selector, items, duration }) =>
      new Promise<HighlightFrame[]>((resolve) => {
        const frames: HighlightFrame[] = [];
        const t0 = performance.now();
        // The part of a copy its menu (the closest clipping element) shows.
        const shown = (copy: HTMLElement) => {
          const box = copy.getBoundingClientRect();
          let clip: DOMRect | null = null;
          for (
            let el = copy.parentElement?.parentElement;
            el && el !== document.body;
            el = el.parentElement
          ) {
            const style = getComputedStyle(el);
            if (
              style.overflowX !== 'visible' ||
              style.overflowY !== 'visible'
            ) {
              clip = el.getBoundingClientRect();
              break;
            }
          }
          if (!clip || !box.width || !box.height) return 1;
          const width =
            Math.min(box.right, clip.right) - Math.max(box.left, clip.left);
          const height =
            Math.min(box.bottom, clip.bottom) - Math.max(box.top, clip.top);
          return (
            (Math.max(0, width) * Math.max(0, height)) /
            (box.width * box.height)
          );
        };
        const tick = () => {
          const t = performance.now() - t0;
          const elements = [
            ...document.querySelectorAll<HTMLElement>(selector),
          ];
          frames.push({
            t,
            composited: elements.some((el) =>
              el
                .getAnimations()
                .some(
                  (animation) =>
                    animation.playState === 'running' &&
                    (animation.effect as KeyframeEffect | null)
                      ?.getKeyframes()
                      .some((keyframe) => 'transform' in keyframe),
                ),
            ),
            copies: elements.map((el) => {
              const box = el.getBoundingClientRect();
              const fill = getComputedStyle(el.firstElementChild ?? el);
              return {
                top: box.top,
                left: box.left,
                width: box.width,
                opacity: Number(fill.opacity),
                painted:
                  fill.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                  fill.backgroundImage !== 'none',
              };
            }),
            lit: [...document.querySelectorAll<HTMLElement>(items)]
              .filter((el) => {
                const own = getComputedStyle(el);
                return (
                  own.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                  own.backgroundImage !== 'none'
                );
              })
              .map((el) => el.textContent?.trim() ?? ''),
            presence: elements.reduce(
              (sum, el) =>
                sum + Number(getComputedStyle(el).opacity) * shown(el),
              0,
            ),
          });
          if (t < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { selector: HIGHLIGHT, items: ITEMS, duration },
  );
}

/** The item's own background, which the highlight replaces. */
export function ownBackground(item: Locator) {
  return item.evaluate((el) => getComputedStyle(el).backgroundColor);
}

export async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('No box');
  return box;
}

/** Moves the pointer to the middle of an element (no actionability wait). */
export async function pointAt(page: Page, locator: Locator, steps = 1) {
  const box = await boxOf(locator);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps,
  });
}

type MenuHighlightCase = {
  path: string;
  /** Opens the menu (or list) and leaves its first item unhighlighted. */
  open: (page: Page) => Promise<void>;
  /** Two items next to each other, top to bottom. */
  first: (page: Page) => Locator;
  second: (page: Page) => Locator;
  /** Moves the highlight from `first` to `second` from the keyboard. */
  keyboardNext?: string;
  /**
   * The list highlights an item as it opens (a select highlights its value):
   * there is no first fade in to check.
   */
  highlightedOnOpen?: boolean;
  /**
   * A submenu trigger in the same menu as `first`. Its highlighted background
   * is often on `:focus` only, which Base UI and React Aria set a moment after
   * they mark it highlighted.
   */
  submenuTrigger?: (page: Page) => Locator;
  /** The first item of that trigger's submenu, beside it. */
  submenuItem?: (page: Page) => Locator;
};

/** Every copy of every frame has its fill: no transparent highlight. */
const allPainted = (frames: HighlightFrame[]) =>
  frames.every((f) => f.copies.every((copy) => copy.painted));

export function describeMenuHighlight(name: string, c: MenuHighlightCase) {
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(c.path, { waitUntil: 'networkidle', timeout: 150_000 });
      await page.mouse.move(1, 1);
      await c.open(page);
    });

    test('fades in behind the first highlighted item', async ({ page }) => {
      test.skip(Boolean(c.highlightedOnOpen), 'Highlighted as it opens');
      const first = c.first(page);
      const frames = recordHighlight(page, 700);
      await pointAt(page, first);
      const recorded = await frames;
      const shown = recorded.filter((f) => f.copies.length > 0);
      expect(shown.length).toBeGreaterThan(0);
      // A short fade, not a highlight that just appears.
      expect(shown[0]!.copies[0]!.opacity).toBeLessThan(0.5);
      expect(shown.at(-1)!.copies[0]!.opacity).toBe(1);
      const box = await boxOf(first);
      expect(Math.abs(shown.at(-1)!.copies[0]!.top - box.y)).toBeLessThan(1);
      // The item's own highlighted background is cleared: the surface is it.
      expect(await ownBackground(first)).toBe('rgba(0, 0, 0, 0)');
    });

    test('glides to the next item on a spring, handed over: one opaque copy', async ({
      page,
    }) => {
      const first = c.first(page);
      const second = c.second(page);
      await pointAt(page, first);
      await page.waitForTimeout(700);
      const from = (await boxOf(first)).y;
      const to = (await boxOf(second)).y;
      const frames = recordHighlight(page, 900);
      await pointAt(page, second);
      const recorded = await frames;
      // The second item's copy starts on the first one and glides.
      const tops = recorded
        .map((f) => f.copies.at(-1)?.top)
        .filter((top): top is number => top !== undefined);
      const between = tops.filter(
        (top) => top > Math.min(from, to) + 1 && top < Math.max(from, to) - 1,
      );
      expect(between.length).toBeGreaterThan(3);
      expect(Math.abs(tops.at(-1)! - to)).toBeLessThan(1);
      // One highlight on screen, as opaque as it was: no copy fades in or
      // lingers behind.
      expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
      // It glided as a Web Animation of `transform`: on the compositor, so a
      // busy main thread (a submenu mounting) doesn't stall it.
      expect(recorded.some((f) => f.composited)).toBe(true);
      expect(
        recorded.every((f) => f.copies.every((copy) => copy.opacity > 0.99)),
      ).toBe(true);
      expect(allPainted(recorded)).toBe(true);
    });

    test('a quick sweep back and forth leaves no trail', async ({ page }) => {
      const first = c.first(page);
      const second = c.second(page);
      await pointAt(page, first);
      await page.waitForTimeout(700);
      const to = (await boxOf(second)).y;
      const frames = recordHighlight(page, 1400);
      for (const item of [second, first, second, first, second]) {
        await pointAt(page, item);
        await page.waitForTimeout(30);
      }
      const recorded = await frames;
      expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
      expect(
        recorded.every((f) => f.copies.every((copy) => copy.opacity > 0.99)),
      ).toBe(true);
      expect(allPainted(recorded)).toBe(true);
      expect(Math.abs(recorded.at(-1)!.copies[0]!.top - to)).toBeLessThan(1);
    });

    test('a fast sweep on a busy main thread: no item lights up on its own', async ({
      page,
    }) => {
      const first = c.first(page);
      const list = first.locator(
        'xpath=ancestor::*[@role="menu" or @role="listbox"][1]',
      );
      await pointAt(page, first);
      await page.waitForTimeout(700);
      const start = await boxOf(first);
      const bounds = await boxOf(list);
      const x = start.x + start.width / 2;
      const top = start.y + start.height / 2;
      const bottom = Math.min(
        bounds.y + bounds.height - 6,
        top + 8 * start.height,
      );
      // A slower machine: the library's highlight and its focus can land in
      // different frames (React Aria moves the focus in an effect).
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const frames = recordHighlight(page, 1600);
      for (const y of [bottom, top, bottom, top])
        await page.mouse.move(x, y, { steps: 10 });
      const recorded = await frames;
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      // The item left keeps the focus a moment: its `focus:` background
      // mustn't show meanwhile.
      expect(recorded.flatMap((f) => f.lit)).toEqual([]);
      expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
      expect(allPainted(recorded)).toBe(true);
    });

    if (c.submenuTrigger) {
      test('reached quickly, a submenu trigger wears it all the way', async ({
        page,
      }) => {
        const first = c.first(page);
        const trigger = c.submenuTrigger!(page);
        await pointAt(page, first);
        await page.waitForTimeout(700);
        // Through the items in between, and on past its submenu opening.
        const frames = recordHighlight(page, 700);
        await pointAt(page, trigger, 4);
        const recorded = await frames;
        expect(recorded.every((f) => f.copies.length <= 1)).toBe(true);
        expect(allPainted(recorded)).toBe(true);
        const box = await boxOf(trigger);
        expect(Math.abs(recorded.at(-1)!.copies[0]!.top - box.y)).toBeLessThan(
          1,
        );
      });
    }

    if (c.submenuTrigger && c.submenuItem) {
      test('into its submenu and out, the highlight never drops out', async ({
        page,
      }) => {
        const trigger = c.submenuTrigger!(page);
        const item = c.submenuItem!(page);
        await pointAt(page, trigger);
        await expect(item).toBeVisible();
        await page.waitForTimeout(500);
        // The submenu clips the surface gliding in from its trigger: the
        // trigger's fades out as the new one shows, never a gap. Then out to
        // another item of the menu (React Aria keeps the focus in an open
        // submenu over its trigger).
        for (const target of [item, c.first(page)]) {
          const frames = recordHighlight(page, 700);
          await pointAt(page, target, 6);
          const recorded = await frames;
          expect(Math.min(...recorded.map((f) => f.presence))).toBeGreaterThan(
            0.85,
          );
          // Then one highlight, on the target.
          const last = recorded.at(-1)!;
          expect(last.copies).toHaveLength(1);
          expect(
            Math.abs(last.copies[0]!.top - (await boxOf(target)).y),
          ).toBeLessThan(1);
        }
      });
    }

    if (c.keyboardNext) {
      test('the keyboard moves it the same way', async ({ page }) => {
        const first = c.first(page);
        const second = c.second(page);
        await pointAt(page, first);
        await page.waitForTimeout(700);
        const from = (await boxOf(first)).y;
        const to = (await boxOf(second)).y;
        const frames = recordHighlight(page, 700);
        await page.keyboard.press(c.keyboardNext!);
        const tops = (await frames)
          .map((f) => f.copies.at(-1)?.top)
          .filter((top): top is number => top !== undefined);
        expect(
          tops.filter(
            (top) =>
              top > Math.min(from, to) + 1 && top < Math.max(from, to) - 1,
          ).length,
        ).toBeGreaterThan(3);
        expect(Math.abs(tops.at(-1)! - to)).toBeLessThan(1);
      });
    }

    test('stays on the last item when the pointer leaves', async ({ page }) => {
      const first = c.first(page);
      await pointAt(page, first);
      await page.waitForTimeout(700);
      await page.mouse.move(2, 2, { steps: 4 });
      await page.waitForTimeout(500);
      const copies = page.locator(HIGHLIGHT);
      await expect(copies).toHaveCount(1);
      const box = await boxOf(first);
      expect(Math.abs((await boxOf(copies.first())).y - box.y)).toBeLessThan(1);
    });
  });
}
