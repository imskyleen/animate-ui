import { expect, test, type Page } from '@playwright/test';

import {
  expectDrawnIn,
  expectErased,
  expectPoppedIn,
  expectPoppedOut,
  recordCheck,
  withAnimation,
  type CheckAnimation,
} from './item-checks';
import { expectEscapeWithoutHold, expectPickHold } from './pick-hold';

// The checks of a menu's checkbox and radio items, shared by the specs of the
// dropdown and context menus and the menubars of every library, in both
// animations. `draw` (the default): an item's check draws itself, like a
// checkbox's, and erases itself when it's unchecked; a radio item's new check
// draws itself while the old one erases itself. `pop`: a checkbox item's
// check pops in and shrinks back out; a radio item's check glides to the
// newly checked item, like a select's. When choosing an item closes the menu
// (Radix, React Aria's single selection), the menu holds still while the
// check changes, then fades out.

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

const ITEMS = '[role^="menuitem"]';

/** Moves the pointer onto an item, and lets the highlight settle there. */
async function hover(page: Page, label: string) {
  const item = page.locator(ITEMS, { hasText: label }).first();
  const box = await item.boundingBox();
  if (!box) throw new Error(`No ${label}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
}

async function press(page: Page) {
  await page.mouse.down();
  await page.mouse.up();
}

/** Clicks an item, recording a check (its own, or `of`'s) for 700ms. */
async function clickRecording(
  page: Page,
  c: MenuChecksCase,
  label: string,
  of = label,
) {
  await hover(page, label);
  const frames = recordCheck(page, {
    items: ITEMS,
    label: of,
    indicator: c.indicator,
  });
  await press(page);
  return frames;
}

function describeAnimation(
  name: string,
  c: MenuChecksCase,
  animation: CheckAnimation,
) {
  test.describe(`${name} (${animation})`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(withAnimation(c.path, animation), {
        waitUntil: 'networkidle',
        timeout: 150_000,
      });
      await page.mouse.move(1, 1);
      await c.open(page);
      await page.waitForTimeout(500);
    });

    test('the checks sit where they did, centered on their item', async ({
      page,
    }) => {
      // Made a box so it can glide (radio items, `pop`), a plain <span>
      // indicator lays out as it would inline.
      const offsets = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '[role="menuitemcheckbox"], [role="menuitemradio"]',
          ),
        ]
          .filter((item) => item.getAttribute('aria-checked') === 'true')
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

    if (animation === 'draw') {
      test("a checkbox item's check draws itself, like a checkbox's", async ({
        page,
      }) => {
        expectDrawnIn(await clickRecording(page, c, c.checkbox.unchecked));
      });

      test('unchecking erases the check', async ({ page }) => {
        expectErased(await clickRecording(page, c, c.checkbox.checked));
      });
    } else {
      test("a checkbox item's check pops in from half its size", async ({
        page,
      }) => {
        expectPoppedIn(await clickRecording(page, c, c.checkbox.unchecked));
      });

      test('unchecking shrinks the check back out', async ({ page }) => {
        expectPoppedOut(await clickRecording(page, c, c.checkbox.checked));
      });
    }

    const change =
      animation === 'draw'
        ? 'draws itself while the old one erases itself'
        : 'glides there';

    if (c.radioCloses) {
      test(`a radio item's check ${change}, while the menu holds still`, async ({
        page,
      }) => {
        await hover(page, c.radio.to);
        await expectPickHold(page, {
          popup: c.popup,
          item: c.radio.to,
          from: c.radio.from,
          check: c.indicator,
          animation,
          pick: () => press(page),
        });
      });

      test('closing with Escape does not hold', async ({ page }) => {
        await expectEscapeWithoutHold(page, c.popup);
      });
    } else if (animation === 'draw') {
      test(`a radio item's check ${change}`, async ({ page }) => {
        const leaving = recordCheck(page, {
          items: ITEMS,
          label: c.radio.from,
          indicator: c.indicator,
        });
        const arriving = await clickRecording(page, c, c.radio.to);
        expectDrawnIn(arriving);
        expectErased(await leaving);
        await expect(page.locator(c.popup)).toBeVisible();
      });
    } else {
      test(`a radio item's check ${change}`, async ({ page }) => {
        await hover(page, c.radio.to);
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
                const icon = mark?.querySelector('svg');
                const parent = mark?.offsetParent as HTMLElement | null;
                // While its check shows.
                if (
                  mark &&
                  icon &&
                  parent &&
                  getComputedStyle(icon).opacity !== '0'
                )
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
        await press(page);
        const recorded = await offsets;
        // It starts on the previous item (above it), and lands.
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

export function describeMenuChecks(name: string, c: MenuChecksCase) {
  describeAnimation(name, c, 'draw');
  describeAnimation(name, c, 'pop');
}
