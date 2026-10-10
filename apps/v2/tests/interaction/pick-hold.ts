import { expect, type Page } from '@playwright/test';

import type { CheckAnimation } from './item-checks';

// Choosing an item closes a single-selection list (selects, comboboxes, a
// menu's radio items) after a hold: the list stays as it is while the checks
// change, then fades out. `draw` (the default, 250ms): the chosen item's
// check draws itself while the previous one erases itself, both nearly done
// when the list starts fading. `pop` (150ms): the check glides from the
// previous item to the chosen one. Closing any other way doesn't wait.

type CheckState = {
  /** How much it shows (its opacities up to the indicator, multiplied). */
  opacity: number;
  /** How much of its stroke is drawn (1 when not dashed). */
  dash: number;
  /** The scale of its icon. */
  scale: number;
};

type PickFrame = {
  t: number;
  /** The list's opacity, null once it's gone. */
  opacity: number | null;
  /** The chosen item's check, null while it isn't there. */
  chosen: CheckState | null;
  /** The top of that check, and where it rests (without its glide). */
  checkTop: number | null;
  restTop: number | null;
  /** The previously chosen item's check. */
  previous: CheckState | null;
};

type PickCase = {
  /** The list's popup. */
  popup: string;
  /** The text of the item about to be chosen. */
  item: string;
  /** The text of the item chosen until then (null: none, a first choice). */
  from: string | null;
  /** Its check, inside the item (`:scope > div`…). */
  check: string;
  /** Chooses the item. */
  pick: () => Promise<void>;
  animation: CheckAnimation;
};

type Recorder<T> = { __recording?: Promise<T> };

/**
 * Arms a frame-by-frame recording in the page, which runs until the list is
 * gone after the pick (or for 3s at most: a loaded machine can deliver the
 * click late). Resolves once it's armed; collect it with `collect`.
 */
async function armPickRecording(
  page: Page,
  { popup, item, from, check }: Omit<PickCase, 'pick' | 'animation'>,
) {
  await page.evaluate(
    ({ popup, item, from, check }) => {
      const markOf = (label: string) =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '[role="option"], [role^="menuitem"]',
          ),
        ]
          .find((el) => el.textContent?.includes(label))
          ?.querySelector<HTMLElement>(check) ?? null;
      const stateOf = (mark: HTMLElement | null) => {
        if (!mark) return null;
        const icon = mark.querySelector('svg') ?? mark;
        const shape = icon.querySelector('path, line, polyline') ?? icon;
        let opacity = 1;
        for (let el: Element | null = shape; el; el = el.parentElement) {
          opacity *= Number(getComputedStyle(el).opacity);
          if (el === mark) break;
        }
        const dash = getComputedStyle(shape).strokeDasharray;
        const matrix =
          getComputedStyle(icon).transform.match(/matrix\(([^,]+)/);
        return {
          opacity,
          dash: dash === 'none' ? 1 : parseFloat(dash),
          scale: matrix ? Number(matrix[1]) : 1,
        };
      };
      (window as Recorder<PickFrame[]>).__recording = new Promise((resolve) => {
        const frames: PickFrame[] = [];
        const t0 = performance.now();
        let picked = false;
        const tick = () => {
          const t = performance.now() - t0;
          const list = document.querySelector<HTMLElement>(popup);
          const mark = markOf(item);
          const chosen = stateOf(mark);
          const parent = mark?.offsetParent as HTMLElement | null;
          frames.push({
            t,
            opacity: list ? Number(getComputedStyle(list).opacity) : null,
            chosen,
            checkTop: mark ? mark.getBoundingClientRect().top : null,
            restTop:
              mark && parent
                ? parent.getBoundingClientRect().top + mark.offsetTop
                : null,
            previous: from === null ? null : stateOf(markOf(from)),
          });
          if (chosen && chosen.opacity > 0.02) picked = true;
          if ((picked && !list) || t > 3000) resolve(frames);
          else requestAnimationFrame(tick);
        };
        tick();
      });
    },
    { popup, item, from, check },
  );
}

function collect<T>(page: Page) {
  return page.evaluate(() => (window as Recorder<T>).__recording!);
}

/**
 * Chooses an item in an open list (that has another one chosen, unless
 * `from` is null): the checks change while the list holds still, then the
 * list closes.
 */
export async function expectPickHold(page: Page, c: PickCase) {
  await armPickRecording(page, c);
  await c.pick();
  const recorded = await collect<PickFrame[]>(page);

  // The first frame the chosen item's check shows: the pick.
  const picked = recorded.findIndex(
    (f) => f.chosen !== null && f.chosen.opacity > 0.02,
  );
  expect(picked).toBeGreaterThanOrEqual(0);
  const fading = recorded.findIndex(
    (f, i) => i > picked && (f.opacity === null || f.opacity < 0.98),
  );
  expect(fading).toBeGreaterThan(picked);
  // The list held still (250ms for a drawn check, 150ms for a glide or a
  // pop) while the checks changed.
  expect(recorded[fading]!.t - recorded[picked]!.t).toBeGreaterThan(
    c.animation === 'draw' ? 200 : 100,
  );
  const first = recorded[picked]!;
  const held = recorded[fading - 1]!;

  // While the list holds (it scales as it leaves, which `restTop`, read from
  // layout offsets, doesn't follow).
  const inPlace = () => {
    for (const f of recorded.slice(picked, fading))
      if (f.checkTop !== null && f.restTop !== null)
        expect(Math.abs(f.checkTop - f.restTop)).toBeLessThan(0.5);
  };
  if (c.animation === 'pop' && c.from !== null) {
    // The check glided from the previous item, shown all the way (the
    // previous one went at once): when the list starts fading, it's most of
    // the way there (~95% at 60fps; a loaded headless machine starts the
    // glide a frame or two late, so only 60% is required).
    expect(first.chosen!.opacity).toBeGreaterThan(0.9);
    expect(first.previous?.opacity ?? 0).toBeLessThan(0.02);
    const travel = Math.abs(first.checkTop! - first.restTop!);
    expect(travel).toBeGreaterThan(10);
    expect(Math.abs(held.checkTop! - held.restTop!)).toBeLessThan(travel * 0.4);
  } else if (c.animation === 'pop') {
    // Nothing to glide from: it pops in, in place.
    inPlace();
    expect(first.chosen!.scale).toBeLessThan(0.9);
    expect(held.chosen!.opacity).toBeGreaterThan(0.5);
    for (const f of recorded) expect(f.chosen?.dash ?? 1).toBe(1);
  } else {
    // In place: the chosen check draws itself while the previous one erases
    // itself, both nearly done when the list starts fading (~95%; at 150ms,
    // two thirds, and the list was half gone before they were done).
    inPlace();
    expect(first.chosen!.dash).toBeLessThan(0.5);
    expect(held.chosen!.dash).toBeGreaterThan(0.85);
    for (const f of recorded) expect(f.chosen?.scale ?? 1).toBeCloseTo(1, 2);
    if (c.from !== null) expect(held.previous!.dash).toBeLessThan(0.15);
  }
  // Then it closed.
  const last = recorded.at(-1)!;
  expect(last.opacity === null || last.opacity === 0).toBe(true);
}

type CloseRecording = {
  acted: number | null;
  frames: { t: number; opacity: number | null }[];
};

/**
 * `close` (Escape, or choosing the item already chosen) starts the list's
 * exit at once: measured from its first key or pointer press.
 */
export async function expectCloseWithoutHold(
  page: Page,
  popup: string,
  close: () => Promise<void>,
) {
  // Armed before acting: `keyboard.press` doesn't wait for anything.
  await page.evaluate((popup) => {
    (window as Recorder<CloseRecording>).__recording = new Promise(
      (resolve) => {
        const frames: CloseRecording['frames'] = [];
        let acted: number | null = null;
        const t0 = performance.now();
        const onAct = () => {
          if (acted === null) acted = performance.now() - t0;
        };
        document.addEventListener('keydown', onAct, true);
        document.addEventListener('pointerdown', onAct, true);
        // Until the list is gone (or for 3s at most).
        const tick = () => {
          const t = performance.now() - t0;
          const list = document.querySelector<HTMLElement>(popup);
          frames.push({
            t,
            opacity: list ? Number(getComputedStyle(list).opacity) : null,
          });
          if ((acted !== null && !list) || t > 3000) {
            document.removeEventListener('keydown', onAct, true);
            document.removeEventListener('pointerdown', onAct, true);
            resolve({ acted, frames });
          } else requestAnimationFrame(tick);
        };
        tick();
      },
    );
  }, popup);
  await close();
  const { acted, frames } = await collect<CloseRecording>(page);
  expect(acted).not.toBeNull();
  // It starts fading on the next frames, not after a hold.
  const fading = frames.find(
    (f) => f.t >= acted! && (f.opacity === null || f.opacity < 0.98),
  );
  expect(fading).toBeDefined();
  expect(fading!.t - acted!).toBeLessThan(120);
}

/** Closing with Escape, without choosing, starts the exit at once. */
export function expectEscapeWithoutHold(page: Page, popup: string) {
  return expectCloseWithoutHold(page, popup, () =>
    page.keyboard.press('Escape'),
  );
}
