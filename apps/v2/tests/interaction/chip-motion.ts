import { expect, test, type Page } from '../test';

type Box = { x: number; y: number; width: number; height: number };

type ChipFrame = {
  t: number;
  copy: (Box & { opacity: number; scale: number }) | null;
  next: Box | null;
  placeholder: number;
  placeholderBlur: number;
  container: Box;
  stay: Box | null;
};

type ChipCase = {
  container: string;
  next: string;
  chip?: { selector: string; text: string };
  stay?: { selector: string; text: string };
  act: () => Promise<void>;
  ms?: number;
};

type Recording = {
  before: { next: Box; chip: Box | null; container: Box; stay: Box | null };
  frames: ChipFrame[];
};

type Recorder = { __chips?: Promise<Recording> };

export async function recordChips(page: Page, c: ChipCase) {
  await page.evaluate(
    ({ container, next, chip, stay, ms }) => {
      const box = (el: Element | null) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const root = document.querySelector(container)!;
      const placeholder = (el: Element | null) => {
        if (
          !el?.matches(':placeholder-shown') ||
          el.getAttribute('placeholder') === ''
        )
          return { opacity: 0, blur: 0 };
        const style = getComputedStyle(el, '::placeholder');
        const blur = style.filter.match(/blur\(([\d.e-]+)px\)/);
        return {
          opacity: Number(style.opacity),
          blur: blur ? Number(blur[1]) : 0,
        };
      };
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
      const moved = (now: Box | null, was: Box) =>
        !now || Math.hypot(now.x - was.x, now.y - was.y) > 0.5;
      (window as Recorder).__chips = new Promise((resolve) => {
        const frames: ChipFrame[] = [];
        const t0 = performance.now();
        let changed: number | null = null;
        const tick = () => {
          const t = performance.now() - t0;
          const copy = root.querySelector<HTMLElement>('[data-exiting]');
          const style = copy && getComputedStyle(copy);
          const matrix = style?.transform.match(/matrix\(([^,]+)/);
          const own =
            style && style.scale !== 'none' ? parseFloat(style.scale) : 1;
          const moving = live(next);
          const shown = placeholder(moving);
          const frame = {
            t,
            copy:
              copy && style
                ? {
                    ...box(copy)!,
                    opacity: Number(style.opacity),
                    scale: (matrix ? Number(matrix[1]) : 1) * own,
                  }
                : null,
            next: box(moving),
            placeholder: shown.opacity,
            placeholderBlur: shown.blur,
            container: box(root)!,
            stay: stay ? box(live(stay.selector, stay.text)) : null,
          };
          frames.push(frame);
          if (
            changed === null &&
            (frame.copy !== null ||
              moved(frame.next, before.next) ||
              Math.abs(frame.container.height - before.container.height) > 0.5)
          )
            changed = t;
          if (changed === null ? t < 3000 : t - changed < ms)
            requestAnimationFrame(tick);
          else resolve({ before, frames });
        };
        requestAnimationFrame(tick);
      });
    },
    {
      container: c.container,
      next: c.next,
      chip: c.chip,
      stay: c.stay,
      ms: c.ms ?? 500,
    },
  );
  await c.act();
  return page.evaluate(() => (window as Recorder).__chips!);
}

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

export function expectChipLeaves(
  recording: Recording,
  { reduce = false }: { reduce?: boolean } = {},
) {
  const { before, frames } = recording;
  const leaving = frames.filter((f) => f.copy !== null);
  expect(leaving.length).toBeGreaterThan(1);
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

export function expectOneGo({ before, frames }: Recording) {
  const end = frames.at(-1)!.next!;
  const away = (box: Box) => Math.hypot(box.x - end.x, box.y - end.y);
  const start = frames.find((f) => f.copy !== null)!;
  expect(
    Math.hypot(start.next!.x - before.next.x, start.next!.y - before.next.y),
  ).toBeLessThan(1.5);
  for (const [i, f] of frames.entries())
    if (i > 0)
      expect(away(f.next!)).toBeLessThan(away(frames[i - 1]!.next!) + 0.5);
}

export function expectPlaceholderComesIn(
  { frames }: Recording,
  { reduce = false }: { reduce?: boolean } = {},
) {
  const end = frames.at(-1)!.next!;
  const away = (f: ChipFrame) =>
    Math.hypot(f.next!.x - end.x, f.next!.y - end.y);
  const onTheWay = frames.filter((f) => away(f) > 1);
  if (!reduce) expect(onTheWay.length).toBeGreaterThan(2);
  for (const f of onTheWay) expect(f.placeholder).toBe(0);
  const landed = frames.find((f) => away(f) < 0.5)!;
  const appearing = frames.find((f) => f.placeholder > 0);
  expect(appearing).toBeDefined();
  expect(appearing!.t - landed.t).toBeLessThan(40);
  const fading = frames.filter(
    (f) => f.placeholder > 0.02 && f.placeholder < 0.98,
  );
  expect(fading.length).toBeGreaterThan(1);
  for (const f of fading) {
    const blur = reduce ? 0 : 2 * (1 - f.placeholder);
    expect(Math.abs(f.placeholderBlur - blur)).toBeLessThan(0.25);
  }
  const last = frames.at(-1)!;
  expect(last.placeholder).toBe(1);
  expect(last.placeholderBlur).toBe(0);
}

export function expectPlaceholderRides({ frames }: Recording) {
  for (const f of frames) expect(f.placeholder).toBe(1);
}

export function expectRoomMade(
  recording: Recording,
  { reduce = false }: { reduce?: boolean } = {},
) {
  expectGlided(recording, { reduce });
}

const CONTAINER = '[data-slot="combobox-chips"]';
const INPUT = '[data-slot="combobox-chip-input"]';
const CHIP = '[data-slot="combobox-chip"]';
const REMOVE = '[data-slot="combobox-chip-remove"]';

type ChipsDemo = {
  path: string;
  label?: string;
  first: string;
  last: string;
  add: string;
  more: string[];
  placeholder?: 'empty' | 'always';
};

export function describeChipMotion(name: string, c: ChipsDemo) {
  const chip = (page: Page, text: string) =>
    page.locator(`${CHIP}:not([data-exiting])`, { hasText: text });
  const input = (page: Page) =>
    c.label === undefined
      ? page.locator(INPUT)
      : page.getByRole('combobox', { name: c.label });
  const keepLast = async (page: Page) => {
    if (c.first === c.last) return;
    await chip(page, c.first).locator(REMOVE).click();
    await expect(chip(page, c.first)).toHaveCount(0);
    await page.waitForTimeout(650);
  };

  test.describe(`${name} chips`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(c.path, { waitUntil: 'networkidle' });
    });

    test('an added chip pops in while the input glides to make room', async ({
      page,
    }) => {
      await input(page).click();
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
        act: () => chip(page, c.first).locator(REMOVE).click(),
      });
      await expect(chip(page, c.first)).toHaveCount(0, { timeout: 50 });
      expectChipLeaves(recording);
    });

    test('Backspace removes the last chip the same way', async ({ page }) => {
      await input(page).focus();
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
      await input(page).click();
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(650);
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
      await page.keyboard.press('Escape');
      expectResized(
        await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          chip: { selector: CHIP, text: grown!.added },
          stay: { selector: CHIP, text: c.first },
          act: () => chip(page, grown!.added).locator(REMOVE).click(),
        }),
      );
    });

    test(
      c.placeholder === 'empty'
        ? 'the last chip removed: the input glides back in one go, its placeholder fades in once it is there'
        : c.placeholder === 'always'
          ? 'the last chip removed: the input glides back in one go, its placeholder with it'
          : 'the last chip removed: the input glides back in one go',
      async ({ page }) => {
        await keepLast(page);
        const recording = await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          chip: { selector: CHIP, text: c.last },
          act: () => chip(page, c.last).locator(REMOVE).click(),
          ms: 900,
        });
        expectChipLeaves(recording);
        expectOneGo(recording);
        if (c.placeholder === 'empty') expectPlaceholderComesIn(recording);
        else if (c.placeholder === 'always') expectPlaceholderRides(recording);
      },
    );
  });

  test.describe(`${name} chips, reduced motion`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(c.path, { waitUntil: 'networkidle' });
    });

    if (c.placeholder === 'empty')
      test('reduced motion: the last chip removed, its placeholder only fades in', async ({
        page,
      }) => {
        await keepLast(page);
        const recording = await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          chip: { selector: CHIP, text: c.last },
          act: () => chip(page, c.last).locator(REMOVE).click(),
          ms: 700,
        });
        expectChipLeaves(recording, { reduce: true });
        expectPlaceholderComesIn(recording, { reduce: true });
      });

    test('reduced motion: a removed chip only fades, the input jumps', async ({
      page,
    }) => {
      expectChipLeaves(
        await recordChips(page, {
          container: CONTAINER,
          next: INPUT,
          chip: { selector: CHIP, text: c.first },
          act: () => chip(page, c.first).locator(REMOVE).click(),
        }),
        { reduce: true },
      );
    });
  });
}
