import { expect, type Page } from '@playwright/test';

// Choosing an item closes a single-selection list (selects, comboboxes, a
// menu's radio items) after a hold: the list stays as it is while the check
// glides to the chosen item (150ms), then fades out. Closing any other way
// doesn't wait.

type PickFrame = {
  t: number;
  /** The list's opacity, null once it's gone. */
  opacity: number | null;
  /** The top of the chosen item's check, null while it has none. */
  checkTop: number | null;
  /** Where that check rests, without its glide's transform. */
  restTop: number | null;
};

type PickCase = {
  /** The list's popup. */
  popup: string;
  /** The text of the item about to be chosen. */
  item: string;
  /** Its check, inside the item (`:scope > div`…). */
  check: string;
  /** Chooses the item. */
  pick: () => Promise<void>;
};

type Recorder<T> = { __recording?: Promise<T> };

/**
 * Arms a frame-by-frame recording in the page, which runs until the list is
 * gone after the pick (or for 3s at most: a loaded machine can deliver the
 * click late). Resolves once it's armed; collect it with `collect`.
 */
async function armPickRecording(
  page: Page,
  { popup, item, check }: Omit<PickCase, 'pick'>,
) {
  await page.evaluate(
    ({ popup, item, check }) => {
      (window as Recorder<PickFrame[]>).__recording = new Promise((resolve) => {
        const frames: PickFrame[] = [];
        const t0 = performance.now();
        let picked = false;
        const tick = () => {
          const t = performance.now() - t0;
          const list = document.querySelector<HTMLElement>(popup);
          const option = [
            ...document.querySelectorAll<HTMLElement>(
              '[role="option"], [role^="menuitem"]',
            ),
          ].find((el) => el.textContent?.includes(item));
          const mark = option?.querySelector<HTMLElement>(check);
          const shown = mark && getComputedStyle(mark).visibility !== 'hidden';
          const parent = shown
            ? (mark.offsetParent as HTMLElement | null)
            : null;
          frames.push({
            t,
            opacity: list ? Number(getComputedStyle(list).opacity) : null,
            checkTop: shown ? mark.getBoundingClientRect().top : null,
            restTop: parent
              ? parent.getBoundingClientRect().top + mark!.offsetTop
              : null,
          });
          if (shown) picked = true;
          if ((picked && !list) || t > 3000) resolve(frames);
          else requestAnimationFrame(tick);
        };
        tick();
      });
    },
    { popup, item, check },
  );
}

function collect<T>(page: Page) {
  return page.evaluate(() => (window as Recorder<T>).__recording!);
}

/**
 * Chooses an item in an open list that already has another one chosen: its
 * check glides there while the list holds still, then the list closes.
 */
export async function expectPickHold(page: Page, c: PickCase) {
  await armPickRecording(page, c);
  await c.pick();
  const recorded = await collect<PickFrame[]>(page);

  // The first frame the check is in the chosen item: the pick.
  const picked = recorded.findIndex((f) => f.checkTop !== null);
  expect(picked).toBeGreaterThanOrEqual(0);
  const fading = recorded.findIndex(
    (f, i) => i > picked && (f.opacity === null || f.opacity < 0.98),
  );
  expect(fading).toBeGreaterThan(picked);
  // The list held still (150ms) while the check glided from the previous
  // item: when it starts fading, the check is most of the way there (~95% at
  // 60fps; a loaded headless machine starts the glide a frame or two late, so
  // only 60% is required).
  expect(recorded[fading]!.t - recorded[picked]!.t).toBeGreaterThan(100);
  const first = recorded[picked]!;
  const held = recorded[fading - 1]!;
  const travel = Math.abs(first.checkTop! - first.restTop!);
  expect(travel).toBeGreaterThan(10);
  expect(Math.abs(held.checkTop! - held.restTop!)).toBeLessThan(travel * 0.4);
  // Then it closed.
  const last = recorded.at(-1)!;
  expect(last.opacity === null || last.opacity === 0).toBe(true);
}

type CloseRecording = {
  acted: number | null;
  frames: { t: number; opacity: number | null }[];
};

/**
 * `close` (Escape, or choosing an item while no check is shown) starts the
 * list's exit at once: measured from its first key or pointer press.
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
  // It starts fading on the next frames, not 150ms later.
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
