import { expect, type Page } from '@playwright/test';

// The checks of list and menu items, in both animations (`checkAnimation`):
// `draw`, the default, draws a check (its stroke) and erases it; `pop`
// pops it in from half its size out of a blur, and shrinks it back out.
// Recorded frame by frame in the page.

export type CheckAnimation = 'draw' | 'pop';

export type CheckFrame = {
  t: number;
  /** The check is in the DOM. */
  present: boolean;
  /**
   * How much it shows: the opacities from its first SVG shape up to the
   * indicator, multiplied (0 when it isn't there).
   */
  opacity: number;
  /** The scale and blur (px) of its icon (or of the indicator, without one). */
  scale: number;
  blur: number;
  /** How much of its stroke is drawn (0 to 1; 1 when not dashed). */
  dash: number;
};

export type CheckTarget = {
  /** The items (`[role="option"]`, `[role^="menuitem"]`). */
  items: string;
  /** The item's text. */
  label: string;
  /** The indicator inside the item. */
  indicator: string;
};

/** In the page: the frame of a check, found from its item. */
function readCheck({ items, label, indicator }: CheckTarget, t: number) {
  const item = [...document.querySelectorAll<HTMLElement>(items)].find((el) =>
    el.textContent?.includes(label),
  );
  const mark = item?.querySelector<HTMLElement>(indicator);
  if (!mark)
    return { t, present: false, opacity: 0, scale: 1, blur: 0, dash: 1 };
  const icon = mark.querySelector<Element>('svg') ?? mark;
  const shape = icon.querySelector('path, line, polyline') ?? icon;
  let opacity = 1;
  for (let el: Element | null = shape; el; el = el.parentElement) {
    opacity *= Number(getComputedStyle(el).opacity);
    if (el === mark) break;
  }
  const style = getComputedStyle(icon);
  const matrix = style.transform.match(/matrix\(([^,]+)/);
  const blur = style.filter.match(/blur\(([\d.]+)px\)/);
  const dash = getComputedStyle(shape).strokeDasharray;
  return {
    t,
    present: true,
    opacity,
    scale: matrix ? Number(matrix[1]) : 1,
    blur: blur ? Number(blur[1]) : 0,
    dash: dash === 'none' ? 1 : parseFloat(dash),
  };
}

/**
 * Records a check for `duration` ms from now: arm it right before acting,
 * then await it.
 */
export function recordCheck(page: Page, target: CheckTarget, duration = 700) {
  return page.evaluate(
    ({ target, duration, read }) =>
      new Promise<CheckFrame[]>((resolve) => {
        const readCheck = new Function(`return ${read}`)() as (
          target: CheckTarget,
          t: number,
        ) => CheckFrame;
        const frames: CheckFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const t = performance.now() - t0;
          frames.push(readCheck(target, t));
          if (t < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { target, duration, read: readCheck.toString() },
  );
}

/** The check as it is now. */
export function checkNow(page: Page, target: CheckTarget) {
  return page.evaluate(
    ({ target, read }) =>
      (
        new Function(`return ${read}`)() as (
          target: CheckTarget,
          t: number,
        ) => CheckFrame
      )(target, 0),
    { target, read: readCheck.toString() },
  );
}

const showing = (frames: CheckFrame[]) =>
  frames.filter((f) => f.present && f.opacity > 0.02);

/**
 * Drawn in: from (nearly) nothing, its stroke drawn on the way while it
 * fades in, to the whole check. It never scales.
 */
export function expectDrawnIn(frames: CheckFrame[]) {
  const shown = frames.filter((f) => f.present);
  expect(Math.min(...shown.map((f) => f.dash))).toBeLessThan(0.3);
  expect(
    shown.some((f) => f.dash > 0.3 && f.dash < 0.9 && f.opacity > 0.2),
  ).toBe(true);
  expect(shown.some((f) => f.dash > 0.98 && f.opacity > 0.98)).toBe(true);
  for (const f of shown) expect(f.scale).toBeCloseTo(1, 2);
}

/** Erased: partly drawn on its way out, then erased (or gone). */
export function expectErased(frames: CheckFrame[]) {
  expect(
    frames.some(
      (f) => f.present && f.dash > 0.1 && f.dash < 0.9 && f.opacity > 0.05,
    ),
  ).toBe(true);
  for (const f of frames) expect(f.scale).toBeCloseTo(1, 2);
  const last = frames.at(-1)!;
  expect(!last.present || last.opacity < 0.02).toBe(true);
}

/**
 * A popped check, partway: its scale, blur and opacity follow one progress
 * (from half its size, 2px of blur and transparent, to rest), whatever the
 * frames a busy machine skips.
 */
function expectPopShape(f: CheckFrame) {
  expect(Math.abs(f.scale - (0.5 + 0.5 * f.opacity))).toBeLessThan(0.06);
  expect(Math.abs(f.blur - 2 * (1 - f.opacity))).toBeLessThan(0.3);
}

/**
 * Popped in: from half its size, blurred and transparent, a little past its
 * size, to rest. Its stroke stays whole.
 */
export function expectPoppedIn(frames: CheckFrame[]) {
  const partway = showing(frames).filter((f) => f.opacity < 0.98);
  expect(partway.length).toBeGreaterThan(0);
  for (const f of partway) expectPopShape(f);
  expect(Math.max(...showing(frames).map((f) => f.scale))).toBeGreaterThan(
    1.02,
  );
  // At rest (while the menu is there: a closing one holds, then leaves).
  expect(
    showing(frames).some(
      (f) => Math.abs(f.scale - 1) < 0.02 && f.opacity > 0.98 && f.blur < 0.05,
    ),
  ).toBe(true);
  for (const f of frames) expect(f.dash).toBe(1);
}

/**
 * Popped out: shrinking back into its blur as it fades, gone within
 * `within` ms. Its stroke stays whole.
 */
export function expectPoppedOut(frames: CheckFrame[], within = 300) {
  const partway = showing(frames).filter((f) => f.opacity < 0.98);
  expect(partway.length).toBeGreaterThan(0);
  for (const f of partway) expectPopShape(f);
  const gone = frames.find((f, i) => i > 0 && (!f.present || f.opacity < 0.02));
  expect(gone).toBeDefined();
  expect(gone!.t).toBeLessThan(within);
  for (const f of frames) expect(f.dash).toBe(1);
}

/** The path of a demo page, in an animation. */
export function withAnimation(path: string, animation: CheckAnimation) {
  if (animation === 'draw') return path;
  return `${path}${path.includes('?') ? '&' : '?'}checkAnimation=${animation}`;
}

/**
 * At rest in every frame it's there: whole, opaque, unscaled, unblurred. A
 * check only animates when it's checked or unchecked, not when its list,
 * menu or page shows it or takes it away.
 */
export function expectAtRest(frames: CheckFrame[]) {
  const shown = frames.filter((f) => f.present);
  expect(shown.length).toBeGreaterThan(0);
  for (const f of shown) {
    expect(f.dash, `${Math.round(f.t)}ms`).toBeGreaterThan(0.98);
    expect(f.opacity, `${Math.round(f.t)}ms`).toBeGreaterThan(0.98);
    expect(f.scale, `${Math.round(f.t)}ms`).toBeCloseTo(1, 2);
    expect(f.blur, `${Math.round(f.t)}ms`).toBeLessThan(0.05);
  }
}

/**
 * The check of a checked item stays at rest while its list or menu opens,
 * and while it closes: neither draws it nor erases it.
 */
export async function expectAtRestThrough(
  page: Page,
  target: CheckTarget,
  {
    open,
    close,
  }: { open: () => Promise<unknown>; close: () => Promise<unknown> },
) {
  let frames = recordCheck(page, target, 600);
  await open();
  expectAtRest(await frames);
  await page.waitForTimeout(200);
  frames = recordCheck(page, target, 600);
  await close();
  expectAtRest(await frames);
}
