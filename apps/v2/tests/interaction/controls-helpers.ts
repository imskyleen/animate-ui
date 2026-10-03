import { expect, test, type Locator, type Page } from '@playwright/test';

// Shared suites for the toggles and choice controls (Checkbox, Radio Group,
// Switch, Toggle, Toggle Group) across Radix UI, Base UI and React Aria.

export type Lib = 'radix-ui' | 'base-ui' | 'react-aria';

export type Sample = {
  t: number;
  /** The control's state on that frame: "true" / "false" (aria-checked, aria-pressed or the input). */
  state: string | null;
  opacity: number;
  scale: number;
  /** Left offset from the control's root, in px (switch thumbs). */
  x: number;
  /** CSS width (never tweened). */
  width: number;
} | null;

/**
 * Records, on every animation frame, the state of the `index`-th `root` and
 * the computed style of `content` inside it (or the root itself). Start it
 * before the interaction, then read it with `readSamples`.
 */
export async function startSampling(
  page: Page,
  root: string,
  index: number,
  content: string | null,
  frames = 60,
  key = 'default',
) {
  await page.evaluate(
    ([rootSelector, i, contentSelector, n, k]) => {
      const w = window as unknown as {
        __samples: Record<string, Sample[]>;
      };
      w.__samples ??= {};
      const out: Sample[] = (w.__samples[k as string] = []);
      const t0 = performance.now();
      let count = 0;
      const stateOf = (el: Element) => {
        for (const attr of ['aria-checked', 'aria-pressed'])
          if (el.hasAttribute(attr)) return el.getAttribute(attr);
        const input = el.querySelector('input');
        return input ? String(input.checked) : null;
      };
      const tick = () => {
        const rootEl = document.querySelectorAll(rootSelector as string)[
          i as number
        ];
        const el =
          rootEl && contentSelector
            ? rootEl.querySelector(contentSelector as string)
            : rootEl;
        if (rootEl && el) {
          const style = getComputedStyle(el);
          const matrix = style.transform.match(/matrix\(([^,]+)/);
          out.push({
            t: performance.now() - t0,
            state: stateOf(rootEl),
            opacity: Number(style.opacity),
            scale: matrix ? Number(matrix[1]) : 1,
            x:
              el.getBoundingClientRect().left -
              rootEl.getBoundingClientRect().left,
            width: (el as HTMLElement).offsetWidth,
          });
        } else {
          out.push(
            rootEl
              ? {
                  t: performance.now() - t0,
                  state: stateOf(rootEl),
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  width: 0,
                }
              : null,
          );
          // Marks "content absent" for the frame.
          const last = out[out.length - 1];
          if (last) last.width = -1;
        }
        if (++count < (n as number)) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    [root, index, content, frames, key] as const,
  );
}

export async function readSamples(page: Page, key = 'default') {
  return (await page.evaluate(
    (k) =>
      (window as unknown as { __samples: Record<string, Sample[]> }).__samples[
        k
      ],
    key,
  )) as NonNullable<Sample>[];
}

/**
 * Content leaves: still in the DOM, fading and shrinking, after the state
 * flipped, then removed within the 400ms exit.
 */
function expectExit(samples: NonNullable<Sample>[]) {
  const flipped = samples.filter((s) => s.state === 'false');
  expect(flipped.length).toBeGreaterThan(3);
  const leaving = present(flipped);
  expect(
    leaving.some((s) => s.opacity > 0.05 && s.opacity < 0.95 && s.scale < 1),
  ).toBe(true);
  const gone = flipped.find((s) => s.width === -1);
  expect(gone).toBeDefined();
  expect(gone!.t - flipped[0]!.t).toBeLessThan(500);
}

/** Frames where the content is in the DOM. */
export const present = (samples: NonNullable<Sample>[]) =>
  samples.filter((s) => s.width !== -1);

export async function scaleOf(locator: Locator) {
  return locator.evaluate((el) => {
    const matrix = getComputedStyle(el).transform.match(/matrix\(([^,]+)/);
    return matrix ? Number(matrix[1]) : 1;
  });
}

export async function opacityOf(locator: Locator) {
  return locator.evaluate((el) => Number(getComputedStyle(el).opacity));
}

/** Holds the pointer on `locator`, returns its scale while held and after. */
export async function pressScale(page: Page, locator: Locator) {
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const held = await scaleOf(locator);
  await page.mouse.up();
  await page.waitForTimeout(350);
  const released = await scaleOf(locator);
  return { held, released };
}

/** The element that takes keyboard focus for a control. */
function focusTarget(lib: Lib, root: Locator) {
  // React Aria focuses the hidden input inside its label.
  return lib === 'react-aria' ? root.locator('input') : root;
}

async function stateOf(root: Locator) {
  return root.evaluate((el) => {
    for (const attr of ['aria-checked', 'aria-pressed'])
      if (el.hasAttribute(attr)) return el.getAttribute(attr);
    const input = el.querySelector('input');
    return input ? String(input.checked) : null;
  });
}

async function gotoDemo(page: Page, lib: Lib, name: string) {
  await page.goto(`/tests/demos/${lib}/${name}`, { waitUntil: 'networkidle' });
}

/** Content scales in from half size and fades in, then settles at rest. */
function expectEntrance(samples: NonNullable<Sample>[]) {
  const shown = present(samples).filter((s) => s.state === 'true');
  expect(shown.length).toBeGreaterThan(3);
  const first = shown[0]!;
  expect(first.scale).toBeLessThan(0.8);
  expect(first.scale).toBeGreaterThanOrEqual(0.5);
  expect(first.opacity).toBeLessThan(0.6);
  const settled = shown.find((s) => s.opacity > 0.99 && s.scale > 0.99);
  expect(settled).toBeDefined();
  // 600ms entrance (plus a frame or two of start-up).
  expect(settled!.t - first.t).toBeLessThan(650);
}

// ---------------------------------------------------------------------------

const CHECKBOX = '[data-slot="checkbox"]';
const CHECK = '[data-slot="checkbox-indicator"] svg';

export function describeCheckboxDemo(lib: Lib) {
  test.describe(`${lib} checkbox demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'checkbox'));

    test('a checked box loads at rest, without an entrance', async ({
      page,
    }) => {
      const check = page.locator(CHECKBOX).nth(0).locator(CHECK);
      expect(await opacityOf(check)).toBe(1);
      expect(await scaleOf(check)).toBe(1);
    });

    test('the check scales in, then settles', async ({ page }) => {
      await startSampling(page, CHECKBOX, 1, CHECK);
      await page.locator(CHECKBOX).nth(1).click();
      await page.waitForTimeout(800);
      expectEntrance(await readSamples(page));
    });

    test('unchecking scales the check out faster, then removes it', async ({
      page,
    }) => {
      await startSampling(page, CHECKBOX, 0, CHECK);
      await page.locator(CHECKBOX).nth(0).click();
      await page.waitForTimeout(800);
      expectExit(await readSamples(page));
    });

    test('press feedback', async ({ page }) => {
      const { held, released } = await pressScale(
        page,
        page.locator(CHECKBOX).nth(1),
      );
      expect(held).toBeCloseTo(0.96, 2);
      expect(released).toBe(1);
    });

    test('Space toggles at once, and the check still animates', async ({
      page,
    }) => {
      const root = page.locator(CHECKBOX).nth(1);
      await focusTarget(lib, root).focus();
      await startSampling(page, CHECKBOX, 1, CHECK);
      await page.keyboard.press('Space');
      expect(await stateOf(root)).toBe('true');
      await page.waitForTimeout(800);
      expectEntrance(await readSamples(page));
    });

    test('reduced motion: the check fades in place', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await startSampling(page, CHECKBOX, 1, CHECK);
      const root = page.locator(CHECKBOX).nth(1);
      await root.click();
      await page.waitForTimeout(700);
      const shown = present(await readSamples(page)).filter(
        (s) => s.state === 'true',
      );
      expect(shown[0]!.opacity).toBeLessThan(0.6);
      for (const s of shown) expect(s.scale).toBe(1);
      // No press scale either.
      const { held } = await pressScale(page, root);
      expect(held).toBe(1);
    });
  });
}

// ---------------------------------------------------------------------------

const RADIO = '[data-slot="radio-group-item"]';
const DOT = '[data-slot="radio-group-indicator"] span';

export function describeRadioGroupDemo(lib: Lib) {
  test.describe(`${lib} radio group demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'radio-group'));

    test('the selected dot loads at rest', async ({ page }) => {
      const dot = page.locator(RADIO).nth(1).locator(DOT);
      expect(await opacityOf(dot)).toBe(1);
      expect(await scaleOf(dot)).toBe(1);
    });

    test('a click scales the new dot in and the old one out', async ({
      page,
    }) => {
      await startSampling(page, RADIO, 0, DOT, 60, 'new');
      await startSampling(page, RADIO, 1, DOT, 60, 'old');
      await page.locator(RADIO).nth(0).click();
      await page.waitForTimeout(900);
      expectEntrance(await readSamples(page, 'new'));
      expectExit(await readSamples(page, 'old'));
    });

    test('arrow keys select at once (keyboard navigation)', async ({
      page,
    }) => {
      await focusTarget(lib, page.locator(RADIO).nth(1)).focus();
      await startSampling(page, RADIO, 2, DOT, 40, 'new');
      await startSampling(page, RADIO, 1, DOT, 40, 'old');
      // Held like a real key press: Radix selects on the focus that follows
      // the keydown, only while the arrow key is down.
      await page.keyboard.down('ArrowDown');
      await page.waitForTimeout(50);
      await page.keyboard.up('ArrowDown');
      await expect.poll(() => stateOf(page.locator(RADIO).nth(2))).toBe('true');
      await page.waitForTimeout(500);
      // A frame to apply it at most, then at rest: no scale-in.
      const shown = present(await readSamples(page, 'new')).filter(
        (s) => s.state === 'true',
      );
      expect(shown.length).toBeGreaterThan(3);
      for (const s of shown.slice(2)) {
        expect(s.opacity).toBe(1);
        expect(s.scale).toBe(1);
      }
      // The old dot goes at once: no exit.
      const old = (await readSamples(page, 'old')).filter(
        (s) => s.state === 'false',
      );
      expect(present(old).length).toBeLessThanOrEqual(2);
    });

    test('press feedback', async ({ page }) => {
      const { held, released } = await pressScale(
        page,
        page.locator(RADIO).nth(0),
      );
      expect(held).toBeCloseTo(0.96, 2);
      expect(released).toBe(1);
    });

    test('reduced motion: the dot fades in place', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await startSampling(page, RADIO, 0, DOT);
      await page.locator(RADIO).nth(0).click();
      await page.waitForTimeout(700);
      const shown = present(await readSamples(page)).filter(
        (s) => s.state === 'true',
      );
      expect(shown[0]!.opacity).toBeLessThan(0.6);
      for (const s of shown) expect(s.scale).toBe(1);
    });
  });
}

// ---------------------------------------------------------------------------

const SWITCH = '[data-slot="switch"]';
const THUMB = '[data-slot="switch-thumb"]';

/**
 * Consecutive frames never jump: the thumb moves continuously. Allows for
 * dropped frames on a busy machine (the spring peaks well under 0.3px/ms; a
 * jump is a whole thumb width in one frame).
 */
export function expectContinuous(samples: NonNullable<Sample>[]) {
  for (let i = 1; i < samples.length; i++) {
    const step = Math.abs(samples[i]!.x - samples[i - 1]!.x);
    const dt = samples[i]!.t - samples[i - 1]!.t;
    expect(step).toBeLessThan(Math.max(3, dt * 0.3));
  }
}

export function describeSwitchDemo(lib: Lib) {
  test.describe(`${lib} switch demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'switch'));

    test('the thumb glides with a transform, never a width tween', async ({
      page,
    }) => {
      await startSampling(page, SWITCH, 0, THUMB, 150);
      await page.locator(SWITCH).nth(0).click();
      await page.waitForTimeout(1500);
      const samples = await readSamples(page);
      const start = samples[0]!.x;
      const end = samples[samples.length - 1]!.x;
      expect(end).toBeGreaterThan(start + 8);
      // Seen between its two sides: it travelled, it didn't jump.
      expect(samples.some((s) => s.x > start + 1 && s.x < end - 1)).toBe(true);
      expectContinuous(samples);
      for (const s of samples) expect(s.width).toBe(samples[0]!.width);
      // Settled within the 600ms spring.
      const changed = samples.find((s) => s.state === 'true')!;
      const settled = samples.find(
        (s) => s.t > changed.t && Math.abs(s.x - end) < 0.5,
      )!;
      expect(settled.t - changed.t).toBeLessThan(650);
    });

    test('toggling again mid-glide turns back from where it is', async ({
      page,
    }) => {
      await startSampling(page, SWITCH, 0, THUMB, 150);
      const root = page.locator(SWITCH).nth(0);
      await root.click();
      await page.waitForTimeout(150);
      await root.click();
      await page.waitForTimeout(900);
      const samples = await readSamples(page);
      expectContinuous(samples);
      // Back where it started once the samples cover the turn-back.
      const rest = await page
        .locator(SWITCH)
        .nth(0)
        .locator(THUMB)
        .evaluate(
          (el) =>
            el.getBoundingClientRect().left -
            el.parentElement!.getBoundingClientRect().left,
        );
      expect(rest).toBeCloseTo(samples[0]!.x, 0);
    });

    test('press feedback', async ({ page }) => {
      const { held, released } = await pressScale(
        page,
        page.locator(SWITCH).nth(0),
      );
      expect(held).toBeCloseTo(0.96, 2);
      expect(released).toBe(1);
    });

    test('Space toggles at once, and the thumb still glides', async ({
      page,
    }) => {
      const root = page.locator(SWITCH).nth(0);
      await focusTarget(lib, root).focus();
      await startSampling(page, SWITCH, 0, THUMB, 150);
      await page.keyboard.press('Space');
      expect(await stateOf(root)).toBe('true');
      await page.waitForTimeout(800);
      const samples = await readSamples(page);
      const start = samples[0]!.x;
      const end = samples[samples.length - 1]!.x;
      expect(samples.some((s) => s.x > start + 1 && s.x < end - 1)).toBe(true);
    });

    test('reduced motion: the thumb jumps', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await startSampling(page, SWITCH, 0, THUMB, 150);
      await page.locator(SWITCH).nth(0).click();
      await page.waitForTimeout(500);
      const samples = await readSamples(page);
      const after = samples.filter((s) => s.state === 'true');
      const end = samples[samples.length - 1]!.x;
      for (const s of after) expect(Math.abs(s.x - end)).toBeLessThan(0.5);
    });
  });
}

// ---------------------------------------------------------------------------

const TOGGLE = '[data-slot="toggle"]';

export function describeToggleDemo(lib: Lib) {
  test.describe(`${lib} toggle demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'toggle'));

    test('press feedback, and a click toggles it', async ({ page }) => {
      const toggle = page.locator(TOGGLE).nth(1);
      expect(await stateOf(toggle)).toBe('false');
      const { held, released } = await pressScale(page, toggle);
      expect(held).toBeCloseTo(0.96, 2);
      expect(released).toBe(1);
      expect(await stateOf(toggle)).toBe('true');
    });

    test('Space toggles it at once', async ({ page }) => {
      const toggle = page.locator(TOGGLE).nth(0);
      await toggle.focus();
      await page.keyboard.press('Space');
      expect(await stateOf(toggle)).toBe('false');
    });

    test('reduced motion: no press scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const { held } = await pressScale(page, page.locator(TOGGLE).nth(1));
      expect(held).toBe(1);
    });
  });
}

// ---------------------------------------------------------------------------

const ITEM = '[data-slot="toggle-group-item"]';

export function describeToggleGroupDemo(lib: Lib) {
  test.describe(`${lib} toggle group demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'toggle-group'));

    test('items give press feedback, and a click selects', async ({ page }) => {
      const item = page.locator(ITEM).nth(2);
      const { held, released } = await pressScale(page, item);
      expect(held).toBeCloseTo(0.96, 2);
      expect(released).toBe(1);
      expect(await stateOf(item)).toBe('true');
    });

    test('arrow keys only move the focus: nothing animates', async ({
      page,
    }) => {
      await page.locator(ITEM).nth(0).focus();
      await startSampling(page, ITEM, 1, null, 20);
      await page.keyboard.press('ArrowRight');
      await expect(page.locator(ITEM).nth(1)).toBeFocused();
      await page.waitForTimeout(200);
      for (const s of present(await readSamples(page))) expect(s.scale).toBe(1);
    });

    test('reduced motion: no press scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const { held } = await pressScale(page, page.locator(ITEM).nth(1));
      expect(held).toBe(1);
    });
  });
}
