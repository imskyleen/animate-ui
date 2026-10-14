import { expect, type Page } from '../test';

import type { CheckAnimation } from './item-checks';

type CheckState = {
  opacity: number;
  dash: number;
  scale: number;
};

type PickFrame = {
  t: number;
  opacity: number | null;
  chosen: CheckState | null;
  checkTop: number | null;
  restTop: number | null;
  previous: CheckState | null;
};

type PickCase = {
  popup: string;
  item: string;
  from: string | null;
  check: string;
  pick: () => Promise<void>;
  animation: CheckAnimation;
};

type Recorder<T> = { __recording?: Promise<T> };

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

export async function expectPickHold(page: Page, c: PickCase) {
  await armPickRecording(page, c);
  await c.pick();
  const recorded = await collect<PickFrame[]>(page);

  const picked = recorded.findIndex(
    (f) => f.chosen !== null && f.chosen.opacity > 0.02,
  );
  expect(picked).toBeGreaterThanOrEqual(0);
  const fading = recorded.findIndex(
    (f, i) => i > picked && (f.opacity === null || f.opacity < 0.98),
  );
  expect(fading).toBeGreaterThan(picked);
  expect(recorded[fading]!.t - recorded[picked]!.t).toBeGreaterThan(
    c.animation === 'draw' ? 200 : 100,
  );
  const first = recorded[picked]!;
  const held = recorded[fading - 1]!;

  const inPlace = () => {
    for (const f of recorded.slice(picked, fading))
      if (f.checkTop !== null && f.restTop !== null)
        expect(Math.abs(f.checkTop - f.restTop)).toBeLessThan(0.5);
  };
  if (c.animation === 'pop' && c.from !== null) {
    expect(first.chosen!.opacity).toBeGreaterThan(0.9);
    expect(first.previous?.opacity ?? 0).toBeLessThan(0.02);
    const travel = Math.abs(first.checkTop! - first.restTop!);
    expect(travel).toBeGreaterThan(10);
    expect(Math.abs(held.checkTop! - held.restTop!)).toBeLessThan(travel * 0.4);
  } else if (c.animation === 'pop') {
    inPlace();
    expect(first.chosen!.scale).toBeLessThan(0.9);
    expect(held.chosen!.opacity).toBeGreaterThan(0.5);
    for (const f of recorded) expect(f.chosen?.dash ?? 1).toBe(1);
  } else {
    inPlace();
    expect(first.chosen!.dash).toBeLessThan(0.5);
    expect(held.chosen!.dash).toBeGreaterThan(0.85);
    for (const f of recorded) expect(f.chosen?.scale ?? 1).toBeCloseTo(1, 2);
    if (c.from !== null) expect(held.previous!.dash).toBeLessThan(0.15);
  }
  const last = recorded.at(-1)!;
  expect(last.opacity === null || last.opacity === 0).toBe(true);
}

type CloseRecording = {
  acted: number | null;
  frames: { t: number; opacity: number | null }[];
};

export async function expectCloseWithoutHold(
  page: Page,
  popup: string,
  close: () => Promise<void>,
) {
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
  const fading = frames.find(
    (f) => f.t >= acted! && (f.opacity === null || f.opacity < 0.98),
  );
  expect(fading).toBeDefined();
  expect(fading!.t - acted!).toBeLessThan(120);
}

export function expectEscapeWithoutHold(page: Page, popup: string) {
  return expectCloseWithoutHold(page, popup, () =>
    page.keyboard.press('Escape'),
  );
}
