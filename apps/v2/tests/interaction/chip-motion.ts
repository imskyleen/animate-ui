import { expect, test, type Page } from '@playwright/test';

// A combobox's chips (Base UI's chips, React Aria's tags) and what follows
// them (the input), in a wrapping row. A chip added pops in while what
// follows glides to make room; a chip removed leaves through a copy of itself
// (`data-exiting`), shrinking in place out of the flow, while what follows
// glides to close the gap. Recorded frame by frame in the page.

type Box = { x: number; y: number; width: number; height: number };

type ChipFrame = {
  t: number;
  /** The removed chip's copy, while it leaves. */
  copy: (Box & { opacity: number; scale: number }) | null;
  /** The element that moves (the next chip, the input), on screen. */
  next: Box | null;
  /** The element the chips are laid out in (the field). */
  container: Box;
  /** A chip that stays on its line, if watched. */
  stay: Box | null;
};

type ChipCase = {
  /** The element the chips are laid out in. */
  container: string;
  /** The element that moves, inside the container. */
  next: string;
  /** A chip about to be removed: its selector and its text. */
  chip?: { selector: string; text: string };
  /** A chip that stays on its line: its selector and its text. */
  stay?: { selector: string; text: string };
  /** Adds or removes a chip. */
  act: () => Promise<void>;
};

type Recording = {
  /** Where things were, before. */
  before: { next: Box; chip: Box | null; container: Box; stay: Box | null };
  frames: ChipFrame[];
};

type Recorder = { __chips?: Promise<Recording> };

/** Records the frames that follow `act`, for 500ms. */
export async function recordChips(page: Page, c: ChipCase) {
  await page.evaluate(
    ({ container, next, chip, stay }) => {
      const box = (el: Element | null) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const root = document.querySelector(container)!;
      const live = (selector: string, text?: string) =>
        [...root.querySelectorAll(selector)].find(
          (el) =>
            !el.closest('[data-exiting]') &&
            (text === undefined || el.textContent?.includes(text)),
        ) ?? null;
      const before = {
        next: box(live(next))!,
        chip: chip ? box(live(chip.selector, chip.text)) : null,
        container: box(root)!,
        stay: stay ? box(live(stay.selector, stay.text)) : null,
      };
      (window as Recorder).__chips = new Promise((resolve) => {
        const frames: ChipFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const copy = root.querySelector<HTMLElement>('[data-exiting]');
          const style = copy && getComputedStyle(copy);
          // Its transform's scale, times its `scale`.
          const matrix = style?.transform.match(/matrix\(([^,]+)/);
          const own =
            style && style.scale !== 'none' ? parseFloat(style.scale) : 1;
          frames.push({
            t: performance.now() - t0,
            copy:
              copy && style
                ? {
                    ...box(copy)!,
                    opacity: Number(style.opacity),
                    scale: (matrix ? Number(matrix[1]) : 1) * own,
                  }
                : null,
            next: box(live(next)),
            container: box(root)!,
            stay: stay ? box(live(stay.selector, stay.text)) : null,
          });
          if (performance.now() - t0 < 500) requestAnimationFrame(tick);
          else resolve({ before, frames });
        };
        requestAnimationFrame(tick);
      });
    },
    { container: c.container, next: c.next, chip: c.chip, stay: c.stay },
  );
  await c.act();
  return page.evaluate(() => (window as Recorder).__chips!);
}

/**
 * What follows moved (more than 10px) and glided there: frames on the way.
 * Under reduced motion, it's at once where it rests.
 */
function expectGlided(
  { before, frames }: Recording,
  { reduce }: { reduce: boolean },
) {
  const end = frames.at(-1)!.next!;
  const travel = Math.hypot(end.x - before.next.x, end.y - before.next.y);
  expect(travel).toBeGreaterThan(10);
  const onTheWay = frames.filter(({ next }) => {
    const left = Math.hypot(next!.x - end.x, next!.y - end.y);
    return left > 1 && left < travel - 1;
  });
  if (reduce) expect(onTheWay).toEqual([]);
  else expect(onTheWay.length).toBeGreaterThan(2);
}

/**
 * A removed chip: its copy, where it was, shrinks out (its scale and opacity
 * on one progress, to half its size and transparent), gone within 450ms;
 * what follows glides to close the gap.
 */
export function expectChipLeaves(
  recording: Recording,
  { reduce = false }: { reduce?: boolean } = {},
) {
  const { before, frames } = recording;
  const leaving = frames.filter((f) => f.copy !== null);
  expect(leaving.length).toBeGreaterThan(1);
  // Where the chip was (it shrinks around its center).
  const copy = leaving[0]!.copy!;
  const chip = before.chip!;
  expect(
    Math.abs(copy.x + copy.width / 2 - (chip.x + chip.width / 2)),
  ).toBeLessThan(1.5);
  expect(
    Math.abs(copy.y + copy.height / 2 - (chip.y + chip.height / 2)),
  ).toBeLessThan(1.5);
  const partway = leaving.filter(
    (f) => f.copy!.opacity > 0.02 && f.copy!.opacity < 0.98,
  );
  expect(partway.length).toBeGreaterThan(0);
  for (const f of partway) {
    const expected = reduce ? 1 : 0.5 + 0.5 * f.copy!.opacity;
    expect(Math.abs(f.copy!.scale - expected)).toBeLessThan(0.06);
  }
  const start = frames.indexOf(leaving[0]!);
  const gone = frames.findIndex((f, i) => i > start && f.copy === null);
  expect(gone).toBeGreaterThan(start);
  expect(frames[gone]!.t - leaving[0]!.t).toBeLessThan(450);
  expectGlided(recording, { reduce });
}

/**
 * The field grew or shrank with its rows (more than 10px), through heights on
 * the way, and a chip that stays on its line moved with the field (no jump
 * inside it, wherever the field's free space puts its rows). Under reduced
 * motion, it's at its height at once.
 */
export function expectResized(
  { before, frames }: Recording,
  { reduce = false }: { reduce?: boolean } = {},
) {
  const end = frames.at(-1)!.container.height;
  const travel = Math.abs(end - before.container.height);
  expect(travel).toBeGreaterThan(10);
  const onTheWay = frames.filter(({ container }) => {
    const left = Math.abs(container.height - end);
    return left > 0.5 && left < travel - 0.5;
  });
  if (reduce) expect(onTheWay).toEqual([]);
  else expect(onTheWay.length).toBeGreaterThan(2);
  if (!before.stay) return;
  const offset = (stay: Box, container: Box) => stay.y - container.y;
  const was = offset(before.stay, before.container);
  for (const f of frames)
    if (f.stay)
      expect(Math.abs(offset(f.stay, f.container) - was)).toBeLessThan(1);
}

/** An added chip: what follows glides to make room. */
export function expectRoomMade(
  recording: Recording,
  { reduce = false }: { reduce?: boolean } = {},
) {
  expectGlided(recording, { reduce });
}

const CONTAINER = '[data-slot="combobox-chips"]';
const INPUT = '[data-slot="combobox-chip-input"]';
const CHIP = '[data-slot="combobox-chip"]';

type ChipsDemo = {
  path: string;
  /** The combobox's accessible name. */
  label: string;
  /** The first chip and the last one, on load. */
  first: string;
  last: string;
  /** An item to add. */
  add: string;
  /** Items to add, in turn, until the row wraps. */
  more: string[];
};

/** The chips of a combobox demo (shadcn/ui's, Base UI's or React Aria's). */
export function describeChipMotion(name: string, c: ChipsDemo) {
  const chip = (page: Page, text: string) =>
    page.locator(`${CHIP}:not([data-exiting])`, { hasText: text });

  test.describe(`${name} chips`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(c.path, { waitUntil: 'networkidle' });
    });

    test('an added chip pops in while the input glides to make room', async ({
      page,
    }) => {
      await page.getByRole('combobox', { name: c.label }).click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
      expectRoomMade(
        await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          act: () => page.getByRole('option', { name: c.add }).click(),
        }),
      );
    });

    test('a removed chip shrinks out where it was, the others close the gap', async ({
      page,
    }) => {
      const recording = await recordChips(page, {
        container: CONTAINER,
        next: INPUT,
        chip: { selector: CHIP, text: c.first },
        act: () =>
          chip(page, c.first)
            .locator('[data-slot="combobox-chip-remove"]')
            .click(),
      });
      // Out of the selection at once: only its copy leaves.
      await expect(chip(page, c.first)).toHaveCount(0, { timeout: 50 });
      expectChipLeaves(recording);
    });

    test('Backspace removes the last chip the same way', async ({ page }) => {
      await page.getByRole('combobox', { name: c.label }).focus();
      const recording = await recordChips(page, {
        container: CONTAINER,
        next: INPUT,
        chip: { selector: CHIP, text: c.last },
        act: () => page.keyboard.press('Backspace'),
      });
      await expect(chip(page, c.last)).toHaveCount(0, { timeout: 50 });
      expectChipLeaves(recording);
    });

    test('the field grows and shrinks with its rows, instead of jumping', async ({
      page,
    }) => {
      await page.getByRole('combobox', { name: c.label }).click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
      // Chips added until the row wraps onto a line more: the field grows.
      let grown: { recording: Recording; added: string } | null = null;
      for (const added of c.more) {
        const recording = await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          stay: { selector: CHIP, text: c.first },
          act: () => page.getByRole('option', { name: added }).click(),
        });
        const { before, frames } = recording;
        if (
          Math.abs(frames.at(-1)!.container.height - before.container.height) >
          10
        ) {
          grown = { recording, added };
          break;
        }
      }
      expect(grown).not.toBeNull();
      expectResized(grown!.recording);
      // Removed, the row comes back onto its line: the field shrinks.
      await page.keyboard.press('Escape');
      expectResized(
        await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          chip: { selector: CHIP, text: grown!.added },
          stay: { selector: CHIP, text: c.first },
          act: () =>
            chip(page, grown!.added)
              .locator('[data-slot="combobox-chip-remove"]')
              .click(),
        }),
      );
    });

    test('reduced motion: a removed chip only fades, the input jumps', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      expectChipLeaves(
        await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          chip: { selector: CHIP, text: c.first },
          act: () =>
            chip(page, c.first)
              .locator('[data-slot="combobox-chip-remove"]')
              .click(),
        }),
        { reduce: true },
      );
    });
  });
}
