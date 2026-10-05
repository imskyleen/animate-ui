import { expect, test, type Page } from '@playwright/test';

import { expectEscapeWithoutHold, expectPickHold } from './pick-hold';

// The checks of a menu's checkbox and radio items, shared by the specs of the
// dropdown and context menus and the menubars of every library: a checkbox
// item's check pops in from half its size out of a light blur, with a little
// overshoot, and shrinks back out when it's unchecked; a radio item's check
// glides to the newly checked item, like a select's. When choosing an item
// closes the menu (Radix, React Aria's single selection), the menu holds still
// while the check moves, then fades out.

type MenuChecksCase = {
  path: string;
  /** Opens the menu. */
  open: (page: Page) => Promise<void>;
  /** The menu's popup. */
  popup: string;
  /** The element of a check, inside its item (the one that moves). */
  indicator: string;
  /** A checked and an unchecked checkbox item. */
  checkbox: { checked: string; unchecked: string };
  /** The checked radio item, and another of its group. */
  radio: { from: string; to: string };
  /** Choosing a radio item closes the menu. */
  radioCloses: boolean;
};

type CheckFrame = {
  t: number;
  /** The check's scale (as drawn) and opacity, null while it has none. */
  scale: number | null;
  opacity: number | null;
  /** The menu's opacity, null once it's gone. */
  menu: number | null;
};

/** Clicks an item, recording its check (and the menu) for `duration` ms. */
async function recordCheck(
  page: Page,
  c: MenuChecksCase,
  label: string,
  duration = 700,
) {
  const item = page.locator('[role^="menuitem"]', { hasText: label }).first();
  const box = await item.boundingBox();
  if (!box) throw new Error(`No ${label}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
  // Armed before the click: it's recorded from the first frame.
  await page.evaluate(
    ({ popup, indicator, label, duration }) => {
      (window as { __checks?: Promise<CheckFrame[]> }).__checks = new Promise(
        (resolve) => {
          const frames: CheckFrame[] = [];
          const t0 = performance.now();
          const tick = () => {
            const t = performance.now() - t0;
            const menu = document.querySelector<HTMLElement>(popup);
            const owner = [
              ...document.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
            ].find((el) => el.textContent?.includes(label));
            const mark = owner?.querySelector<HTMLElement>(indicator);
            const style = mark ? getComputedStyle(mark) : null;
            frames.push({
              t,
              // As drawn: a transform on an inline box draws nothing.
              scale:
                mark && mark.offsetWidth
                  ? mark.getBoundingClientRect().width / mark.offsetWidth
                  : null,
              opacity: style ? Number(style.opacity) : null,
              menu: menu ? Number(getComputedStyle(menu).opacity) : null,
            });
            if (t < duration) requestAnimationFrame(tick);
            else resolve(frames);
          };
          tick();
        },
      );
    },
    { popup: c.popup, indicator: c.indicator, label, duration },
  );
  await page.mouse.down();
  await page.mouse.up();
  return page.evaluate(
    () => (window as { __checks?: Promise<CheckFrame[]> }).__checks!,
  );
}

export function describeMenuChecks(name: string, c: MenuChecksCase) {
  test.describe(name, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(c.path, { waitUntil: 'networkidle', timeout: 150_000 });
      await page.mouse.move(1, 1);
      await c.open(page);
      await page.waitForTimeout(500);
    });

    test('the checks sit where they did, centered on their item', async ({
      page,
    }) => {
      // Made a box so it can scale and glide, a plain <span> indicator lays
      // out as it would inline.
      const offsets = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '[role="menuitemcheckbox"], [role="menuitemradio"]',
          ),
        ]
          .map((item) => {
            const mark = item.querySelector('svg');
            if (!mark) return null;
            const box = item.getBoundingClientRect();
            const check = mark.getBoundingClientRect();
            return check.top + check.height / 2 - (box.top + box.height / 2);
          })
          .filter((offset): offset is number => offset !== null),
      );
      expect(offsets.length).toBeGreaterThan(1);
      for (const offset of offsets) expect(Math.abs(offset)).toBeLessThan(0.5);
    });

    test("a checkbox item's check pops in from half its size", async ({
      page,
    }) => {
      const frames = await recordCheck(page, c, c.checkbox.unchecked);
      const shown = frames.filter(
        (f) => f.scale !== null && f.opacity! > 0 && f.menu !== null,
      );
      expect(shown.length).toBeGreaterThan(2);
      // From half its size and transparent…
      expect(shown[0]!.scale!).toBeLessThan(0.8);
      expect(shown[0]!.opacity!).toBeLessThan(0.7);
      // …to its size, with a little overshoot on the way.
      expect(Math.max(...shown.map((f) => f.scale!))).toBeGreaterThan(1.01);
      expect(shown.some((f) => f.scale! > 0.97 && f.opacity! > 0.97)).toBe(
        true,
      );
    });

    test('unchecking shrinks the check back out', async ({ page }) => {
      const frames = await recordCheck(page, c, c.checkbox.checked);
      // On the way out: smaller and fading, the menu still there.
      expect(
        frames.some(
          (f) =>
            f.menu !== null &&
            f.scale !== null &&
            f.scale < 0.95 &&
            f.scale > 0.5 &&
            f.opacity! > 0.03 &&
            f.opacity! < 0.95,
        ),
      ).toBe(true);
      // Then gone (or the menu with it).
      const last = frames.at(-1)!;
      expect(
        last.menu === null || last.scale === null || last.opacity === 0,
      ).toBe(true);
    });

    if (c.radioCloses) {
      test("a radio item's check glides there while the menu holds still", async ({
        page,
      }) => {
        const item = page
          .locator('[role="menuitemradio"]', { hasText: c.radio.to })
          .first();
        const box = await item.boundingBox();
        if (!box) throw new Error(`No ${c.radio.to}`);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
        await expectPickHold(page, {
          popup: c.popup,
          item: c.radio.to,
          check: c.indicator,
          pick: async () => {
            await page.mouse.down();
            await page.mouse.up();
          },
        });
      });

      test('closing with Escape does not hold', async ({ page }) => {
        await expectEscapeWithoutHold(page, c.popup);
      });
    } else {
      test("a radio item's check glides there", async ({ page }) => {
        const to = page
          .locator('[role="menuitemradio"]', { hasText: c.radio.to })
          .first();
        const box = await to.boundingBox();
        if (!box) throw new Error(`No ${c.radio.to}`);
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(300);
        const offsets = page.evaluate(
          ({ indicator, label }) =>
            new Promise<number[]>((resolve) => {
              const offsets: number[] = [];
              const t0 = performance.now();
              const tick = () => {
                const owner = [
                  ...document.querySelectorAll<HTMLElement>(
                    '[role="menuitemradio"]',
                  ),
                ].find((el) => el.textContent?.includes(label));
                const mark = owner?.querySelector<HTMLElement>(indicator);
                const parent = mark?.offsetParent as HTMLElement | null;
                if (mark && parent && getComputedStyle(mark).opacity !== '0')
                  offsets.push(
                    mark.getBoundingClientRect().top -
                      (parent.getBoundingClientRect().top + mark.offsetTop),
                  );
                if (performance.now() - t0 < 700) requestAnimationFrame(tick);
                else resolve(offsets);
              };
              tick();
            }),
          { indicator: c.indicator, label: c.radio.to },
        );
        await page.mouse.down();
        await page.mouse.up();
        const recorded = await offsets;
        // It starts on the previous item (above it), and lands. (The first
        // frame can be read before Motion places it.)
        expect(Math.max(...recorded.map((o) => Math.abs(o)))).toBeGreaterThan(
          10,
        );
        expect(
          recorded.filter((o) => Math.abs(o) > 1 && Math.abs(o) < 20).length,
        ).toBeGreaterThan(2);
        expect(Math.abs(recorded.at(-1)!)).toBeLessThan(1);
        await expect(page.locator(c.popup)).toBeVisible();
      });
    }
  });
}
