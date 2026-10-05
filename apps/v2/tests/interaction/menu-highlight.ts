import { expect, test, type Locator, type Page } from '@playwright/test';

// Animate UI v1's menu highlight, shared by the specs of every menu-like
// primitive (dropdown and context menus, menubars, selects, comboboxes, React
// Aria's ListBox): one surface glides behind the highlighted item on a
// spring, instead of each item lighting up on its own. It's handed from item
// to item: there's never more than one on screen.

const HIGHLIGHT = '[data-slot="item-highlight"]';

export type HighlightFrame = {
  t: number;
  /** Every copy on screen: its visual box and the opacity of its fill. */
  copies: { top: number; left: number; width: number; opacity: number }[];
};

/**
 * Records every highlight copy frame by frame for `duration` ms: call it right
 * before the interaction, then await it.
 */
export function recordHighlight(page: Page, duration: number) {
  return page.evaluate(
    ({ selector, duration }) =>
      new Promise<HighlightFrame[]>((resolve) => {
        const frames: HighlightFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const t = performance.now() - t0;
          frames.push({
            t,
            copies: [...document.querySelectorAll<HTMLElement>(selector)].map(
              (el) => {
                const box = el.getBoundingClientRect();
                const fill = el.firstElementChild ?? el;
                return {
                  top: box.top,
                  left: box.left,
                  width: box.width,
                  opacity: Number(getComputedStyle(fill).opacity),
                };
              },
            ),
          });
          if (t < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { selector: HIGHLIGHT, duration },
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
};

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
      expect(
        recorded.every((f) => f.copies.every((copy) => copy.opacity > 0.99)),
      ).toBe(true);
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
      expect(Math.abs(recorded.at(-1)!.copies[0]!.top - to)).toBeLessThan(1);
    });

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
