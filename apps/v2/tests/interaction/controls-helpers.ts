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
  /** Width on screen, in px (-1: the content isn't in the DOM). */
  width: number;
  /** The root's background colour. */
  bg: string;
  /**
   * How much of the check's stroke is drawn (0 to 1; 1 when not dashed), when
   * the content is (or holds) an SVG shape.
   */
  dash: number | null;
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
          const box = el.getBoundingClientRect();
          const shapes = 'path, line, polyline';
          const path = el.matches(shapes) ? el : el.querySelector(shapes);
          const dashArray = path ? getComputedStyle(path).strokeDasharray : '';
          out.push({
            t: performance.now() - t0,
            state: stateOf(rootEl),
            opacity: Number(style.opacity),
            scale: matrix ? Number(matrix[1]) : 1,
            x: box.left - rootEl.getBoundingClientRect().left,
            width: box.width,
            bg: getComputedStyle(rootEl).backgroundColor,
            dash: path
              ? dashArray === 'none'
                ? 1
                : parseFloat(dashArray)
              : null,
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
                  bg: getComputedStyle(rootEl).backgroundColor,
                  dash: null,
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

/**
 * Hovers `locator`, presses it, releases it and moves away: its scale at
 * rest under the pointer, held, released (still hovered) and left.
 */
export async function pressScale(page: Page, locator: Locator) {
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(350);
  const hovered = await scaleOf(locator);
  await page.mouse.down();
  await page.waitForTimeout(350);
  const held = await scaleOf(locator);
  await page.mouse.up();
  await page.waitForTimeout(450);
  const released = await scaleOf(locator);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(450);
  const left = await scaleOf(locator);
  return { hovered, held, released, left };
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

// ---------------------------------------------------------------------------

const CHECKBOX = '[data-slot="checkbox"]';
const CHECK = '[data-slot="checkbox-indicator"] svg path';

/**
 * v1's check drawing itself: hidden for 0.2s after the state flips, then its
 * stroke and its opacity going to 1 together in 0.3s, on Motion's easeOut.
 */
function expectCheckDraws(samples: NonNullable<Sample>[], reduce = false) {
  const shown = present(samples).filter((s) => s.state === 'true');
  expect(shown.length).toBeGreaterThan(3);
  const first = shown[0]!;
  // The state flipped after the last unchecked frame: on a busy machine, a
  // long frame can show the flip well after it happened.
  const flip = samples.findIndex((s) => s.state === 'true');
  const before = samples[Math.max(flip - 1, 0)]!;
  // Still hidden 150ms later: the 0.2s delay.
  const waiting = shown.filter((s) => s.t - before.t < 150);
  for (const s of waiting) expect(s.opacity).toBeLessThan(0.05);
  const drawing = shown.filter((s) => s.opacity > 0.1 && s.opacity < 0.9);
  expect(drawing.length).toBeGreaterThan(0);
  for (const s of drawing) {
    expect(s.t - before.t).toBeGreaterThan(150);
    // The stroke and the opacity move together (one transition); under
    // reduced motion the stroke stays whole and only the opacity fades.
    if (reduce) expect(s.dash).toBe(1);
    else expect(Math.abs(s.dash! - s.opacity)).toBeLessThan(0.12);
  }
  const settled = shown.find((s) => s.opacity === 1 && s.dash === 1);
  expect(settled).toBeDefined();
  expect(settled!.t - first.t).toBeLessThan(650);
  for (const s of shown) expect(s.scale).toBe(1);
}

/**
 * v1's check erasing itself in 0.3s, no delay, on Motion's easeOut; then the
 * indicator goes.
 */
function expectCheckErases(samples: NonNullable<Sample>[]) {
  const flipped = samples.filter((s) => s.state === 'false');
  expect(flipped.length).toBeGreaterThan(3);
  const leaving = present(flipped);
  const erasing = leaving.filter((s) => s.opacity > 0.05 && s.opacity < 0.95);
  expect(erasing.length).toBeGreaterThan(0);
  for (const s of erasing) {
    expect(s.t - flipped[0]!.t).toBeLessThan(350);
    expect(Math.abs(s.dash! - s.opacity)).toBeLessThan(0.12);
  }
  const gone = flipped.find((s) => s.width === -1);
  expect(gone).toBeDefined();
  expect(gone!.t - flipped[0]!.t).toBeLessThan(550);
}

export function describeCheckboxDemo(lib: Lib) {
  test.describe(`${lib} checkbox demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'checkbox'));

    test('a checked box shows its check at rest once loaded', async ({
      page,
    }) => {
      const check = page.locator(CHECKBOX).nth(0).locator(CHECK);
      await expect.poll(() => opacityOf(check)).toBe(1);
      expect(await scaleOf(check)).toBe(1);
      expect(await check.getAttribute('stroke-dasharray')).toBeNull();
    });

    test('the check draws itself after 0.2s, in 0.3s', async ({ page }) => {
      await startSampling(page, CHECKBOX, 1, CHECK);
      await page.locator(CHECKBOX).nth(1).click();
      await page.waitForTimeout(900);
      expectCheckDraws(await readSamples(page));
    });

    test('unchecking erases the check in 0.3s, then removes it', async ({
      page,
    }) => {
      await startSampling(page, CHECKBOX, 0, CHECK);
      await page.locator(CHECKBOX).nth(0).click();
      await page.waitForTimeout(900);
      expectCheckErases(await readSamples(page));
    });

    test('the box fills with a layer growing from 70% as it fades in', async ({
      page,
    }) => {
      const box = page.locator(CHECKBOX).nth(1);
      // Sampled in the page from the click: the layer (the box's ::before)
      // grows and fades in together, while the box's own background stays.
      const frames = await box.evaluate(async (el) => {
        const read = () => {
          const layer = getComputedStyle(el, '::before');
          return {
            scale: Number(layer.scale === 'none' ? 1 : layer.scale),
            opacity: Number(layer.opacity),
            bg: getComputedStyle(el).backgroundColor,
          };
        };
        const out = [read()];
        // React Aria's box is a label: its input takes the click.
        const target = el.tagName === 'LABEL' ? el.querySelector('input')! : el;
        (target as HTMLElement).click();
        const start = performance.now();
        while (performance.now() - start < 500) {
          await new Promise((r) => requestAnimationFrame(r));
          out.push(read());
        }
        return out;
      });
      expect(frames[0]!.scale).toBeCloseTo(0.7, 2);
      expect(frames[0]!.opacity).toBe(0);
      expect(
        frames.some((f) => f.scale > 0.75 && f.scale < 0.95 && f.opacity > 0.1),
      ).toBe(true);
      expect(frames.at(-1)!.scale).toBe(1);
      expect(frames.at(-1)!.opacity).toBe(1);
      for (const f of frames) expect(f.bg).toBe(frames[0]!.bg);
    });

    test('the box scales on press, not on hover', async ({ page }) => {
      expectPressOnly(await pressScale(page, page.locator(CHECKBOX).nth(1)));
    });

    test('Space toggles at once, and the check still draws', async ({
      page,
    }) => {
      const root = page.locator(CHECKBOX).nth(1);
      await focusTarget(lib, root).focus();
      await startSampling(page, CHECKBOX, 1, CHECK);
      await page.keyboard.press('Space');
      expect(await stateOf(root)).toBe('true');
      await page.waitForTimeout(900);
      expectCheckDraws(await readSamples(page));
    });

    test('reduced motion: the check fades in place, no scale', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await startSampling(page, CHECKBOX, 1, CHECK);
      const root = page.locator(CHECKBOX).nth(1);
      await root.click();
      await page.waitForTimeout(900);
      expectCheckDraws(await readSamples(page), true);
      await page.mouse.move(0, 0);
      const { hovered, held } = await pressScale(page, root);
      expect(hovered).toBe(1);
      expect(held).toBe(1);
    });
  });
}

// ---------------------------------------------------------------------------

const RADIO = '[data-slot="radio-group-item"]';
const DOT = '[data-slot="radio-group-indicator"] span';

/**
 * v1's dot popping in: scale and opacity from 0 on a spring (stiffness 200,
 * damping 16) that overshoots 1, then at rest.
 */
function expectDotPops(samples: NonNullable<Sample>[]) {
  const shown = present(samples).filter((s) => s.state === 'true');
  expect(shown.length).toBeGreaterThan(3);
  expect(shown[0]!.scale).toBeLessThan(0.2);
  expect(shown[0]!.opacity).toBeLessThan(0.3);
  expect(Math.max(...shown.map((s) => s.scale))).toBeGreaterThan(1.06);
  const settled = shown.find(
    (s, i) => i > 0 && s.scale === 1 && s.opacity === 1,
  );
  expect(settled).toBeDefined();
  expect(settled!.t - shown[0]!.t).toBeLessThan(1100);
}

/** The old dot springs out the mirror way (past 0), then goes. */
function expectDotLeaves(samples: NonNullable<Sample>[]) {
  const flipped = samples.filter((s) => s.state === 'false');
  expect(flipped.length).toBeGreaterThan(3);
  const leaving = present(flipped);
  expect(leaving.some((s) => s.scale > 0.1 && s.scale < 0.9)).toBe(true);
  expect(Math.min(...leaving.map((s) => s.scale))).toBeLessThan(-0.05);
  const gone = flipped.find((s) => s.width === -1);
  expect(gone).toBeDefined();
  expect(gone!.t - flipped[0]!.t).toBeLessThan(1300);
}

export function describeRadioGroupDemo(lib: Lib) {
  test.describe(`${lib} radio group demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'radio-group'));

    test('the selected dot is at rest once loaded', async ({ page }) => {
      const dot = page.locator(RADIO).nth(1).locator(DOT);
      await expect.poll(() => opacityOf(dot)).toBe(1);
      await expect.poll(() => scaleOf(dot)).toBe(1);
    });

    test('a click pops the new dot in and the old one out', async ({
      page,
    }) => {
      await startSampling(page, RADIO, 0, DOT, 90, 'new');
      await startSampling(page, RADIO, 1, DOT, 90, 'old');
      await page.locator(RADIO).nth(0).click();
      await page.waitForTimeout(1500);
      expectDotPops(await readSamples(page, 'new'));
      expectDotLeaves(await readSamples(page, 'old'));
    });

    test('arrow keys select, and the dots move as with a click', async ({
      page,
    }) => {
      await focusTarget(lib, page.locator(RADIO).nth(1)).focus();
      await startSampling(page, RADIO, 2, DOT, 90, 'new');
      await startSampling(page, RADIO, 1, DOT, 90, 'old');
      // Held like a real key press: Radix selects on the focus that follows
      // the keydown, only while the arrow key is down.
      await page.keyboard.down('ArrowDown');
      await page.waitForTimeout(50);
      await page.keyboard.up('ArrowDown');
      await expect.poll(() => stateOf(page.locator(RADIO).nth(2))).toBe('true');
      await page.waitForTimeout(1500);
      expectDotPops(await readSamples(page, 'new'));
      expectDotLeaves(await readSamples(page, 'old'));
    });

    test('the radio scales on press, not on hover', async ({ page }) => {
      expectPressOnly(await pressScale(page, page.locator(RADIO).nth(0)));
    });

    test('reduced motion: the dot fades in place', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await startSampling(page, RADIO, 0, DOT);
      await page.locator(RADIO).nth(0).click();
      await page.waitForTimeout(900);
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
  // A jump would be the thumb landing on the other side at once (14px). Like
  // v1, a spring starts on the current frame's clock, so after a slow frame
  // (a loaded machine) its first painted step catches up a few pixels.
  for (let i = 1; i < samples.length; i++) {
    const step = Math.abs(samples[i]!.x - samples[i - 1]!.x);
    const dt = samples[i]!.t - samples[i - 1]!.t;
    expect(step).toBeLessThan(Math.max(7, dt * 0.3));
  }
}

/** Presses the pointer on the middle of `locator` (and keeps it down). */
async function pointerDown(page: Page, locator: Locator) {
  const box = (await locator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
}

/** v1's styled switch stretched its 16px thumb to 19px while pressed. */
const STRETCH = 19 / 16;

export function describeSwitchDemo(lib: Lib) {
  test.describe(`${lib} switch demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'switch'));

    test('pressed, the thumb stretches toward the middle; the switch stays still', async ({
      page,
    }) => {
      const root = page.locator(SWITCH).nth(0);
      await startSampling(page, SWITCH, 0, THUMB, 45);
      await pointerDown(page, root);
      await page.waitForTimeout(600);
      const held = await readSamples(page);
      const first = held[0]!;
      const last = held[held.length - 1]!;
      // Its width (not a scale), 16px → 19px, the left edge in place.
      expect(last.width).toBeCloseTo(first.width * STRETCH, 0);
      expect(last.scale).toBe(1);
      for (const s of held) expect(Math.abs(s.x - first.x)).toBeLessThan(0.5);
      // A spring: seen on its way, and overshooting 19px a little.
      expect(
        held.some(
          (s) => s.width > first.width + 0.5 && s.width < last.width - 0.5,
        ),
      ).toBe(true);
      expect(Math.max(...held.map((s) => s.width))).toBeGreaterThan(
        first.width * STRETCH + 0.03,
      );
      // No press feedback on the switch itself.
      expect(await scaleOf(root)).toBe(1);
      await page.mouse.up();
    });

    test('pressed while on, it stretches toward the start, its right edge in place', async ({
      page,
    }) => {
      const root = page.locator(SWITCH).nth(1);
      expect(await stateOf(root)).toBe('true');
      await startSampling(page, SWITCH, 1, THUMB, 45);
      await pointerDown(page, root);
      await page.waitForTimeout(600);
      const held = await readSamples(page);
      const first = held[0]!;
      const last = held[held.length - 1]!;
      expect(last.width).toBeCloseTo(first.width * STRETCH, 0);
      expect(last.x).toBeCloseTo(first.x - first.width * (STRETCH - 1), 0);
      for (const s of held)
        expect(Math.abs(s.x + s.width - (first.x + first.width))).toBeLessThan(
          0.5,
        );
      await page.mouse.up();
    });

    test('released, the thumb springs to its side as its width springs back; the track colour changes at once', async ({
      page,
    }) => {
      const root = page.locator(SWITCH).nth(0);
      await pointerDown(page, root);
      await page.waitForTimeout(400);
      await startSampling(page, SWITCH, 0, THUMB, 100);
      await page.waitForTimeout(100);
      await page.mouse.up();
      await page.waitForTimeout(1400);
      const samples = await readSamples(page);
      expectContinuous(samples);
      const flip = samples.findIndex((s) => s.state === 'true');
      expect(flip).toBeGreaterThan(0);
      const before = samples[flip - 1]!;
      const changed = samples[flip]!;
      const last = samples[samples.length - 1]!;
      // The track: its new colour on the frame the state changes.
      expect(changed.bg).toBe(last.bg);
      expect(changed.bg).not.toBe(before.bg);
      // The thumb: from where it was, still travelling 100ms later, past its
      // end a little (stiffness 300, damping 25), then at rest.
      const end = last.x;
      expect(Math.abs(changed.x - before.x)).toBeLessThan(0.5);
      const later = samples.find((s) => s.t >= changed.t + 100)!;
      expect(end - later.x).toBeGreaterThan(2);
      expect(samples.some((s) => s.x > end + 0.2)).toBe(true);
      const settled = samples.findLast((s) => Math.abs(s.x - end) >= 0.3)!;
      expect(settled.t - changed.t).toBeLessThan(650);
      // Its width back to its own.
      expect(last.width).toBeCloseTo(samples[0]!.width / STRETCH, 0);
    });

    test('toggling again mid-glide turns back from where it is', async ({
      page,
    }) => {
      await startSampling(page, SWITCH, 0, THUMB, 150);
      const root = page.locator(SWITCH).nth(0);
      await root.click();
      await page.waitForTimeout(150);
      await root.click();
      await page.waitForTimeout(1200);
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
      expect(end).toBeGreaterThan(start + 8);
      expect(samples.some((s) => s.x > start + 1 && s.x < end - 1)).toBe(true);
    });

    test('reduced motion: no stretch, and the thumb jumps', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const root = page.locator(SWITCH).nth(0);
      await startSampling(page, SWITCH, 0, THUMB, 150);
      await pointerDown(page, root);
      await page.waitForTimeout(300);
      await page.mouse.up();
      await page.waitForTimeout(500);
      const samples = await readSamples(page);
      for (const s of samples) expect(s.width).toBe(samples[0]!.width);
      const after = samples.filter((s) => s.state === 'true');
      const end = samples[samples.length - 1]!.x;
      expect(end).toBeGreaterThan(samples[0]!.x + 8);
      for (const s of after) expect(Math.abs(s.x - end)).toBeLessThan(0.5);
    });
  });
}

// ---------------------------------------------------------------------------

const TOGGLE = '[data-slot="toggle"]';

/** Every pressable control: 0.95 while pressed, no hover scale. */
function expectPressOnly(scales: Awaited<ReturnType<typeof pressScale>>) {
  expect(scales.hovered).toBe(1);
  expect(scales.held).toBeCloseTo(0.95, 2);
  expect(scales.released).toBeCloseTo(1, 2);
  expect(scales.left).toBeCloseTo(1, 2);
}

export function describeToggleDemo(lib: Lib) {
  test.describe(`${lib} toggle demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'toggle'));

    test('press scale (no hover scale), and a click toggles it', async ({
      page,
    }) => {
      const toggle = page.locator(TOGGLE).nth(1);
      expect(await stateOf(toggle)).toBe('false');
      expectPressOnly(await pressScale(page, toggle));
      expect(await stateOf(toggle)).toBe('true');
    });

    test('the press scale is a spring, not a tween', async ({ page }) => {
      const toggle = page.locator(TOGGLE).nth(1);
      const box = (await toggle.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await startSampling(page, TOGGLE, 1, null, 30);
      await page.mouse.down();
      await page.waitForTimeout(500);
      const held = await readSamples(page);
      await page.mouse.up();
      // On its way, then at 0.95 (Motion's scale spring, stiffness 550,
      // damping 30), within ~200ms.
      expect(held.some((s) => s.scale < 0.995 && s.scale > 0.955)).toBe(true);
      const reached = held.find((s) => s.scale < 0.952);
      expect(reached).toBeDefined();
      expect(reached!.t - held.find((s) => s.scale < 0.999)!.t).toBeLessThan(
        250,
      );
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

const GROUP = '[data-slot="toggle-group"]';
const ITEM = '[data-slot="toggle-group-item"]';

type Highlight = {
  t: number;
  /** Left edge of the highlight, in the group's pixels. */
  x: number;
  width: number;
  /** Opacities of the leaving (::before) and arriving (::after) surfaces. */
  from: number;
  to: number;
  drawn: boolean;
};

/** Records the group's highlight (its ::before and ::after) on each frame. */
async function sampleHighlight(page: Page, frames = 60) {
  await page.evaluate(
    ([selector, n]) => {
      const root = document.querySelector(selector as string)!;
      const w = window as unknown as { __highlight: Highlight[] };
      const out: Highlight[] = (w.__highlight = []);
      const t0 = performance.now();
      let count = 0;
      const tick = () => {
        const before = getComputedStyle(root, '::before');
        const after = getComputedStyle(root, '::after');
        out.push({
          t: performance.now() - t0,
          x: parseFloat(before.left),
          width: parseFloat(before.width),
          from: Number(before.opacity),
          to: Number(after.opacity),
          drawn: root.hasAttribute('data-animate-ui-highlight'),
        });
        if (++count < (n as number)) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
    [GROUP, frames] as const,
  );
}

async function readHighlight(page: Page) {
  return page.evaluate(
    () => (window as unknown as { __highlight: Highlight[] }).__highlight,
  );
}

/** An item's left edge and background, in the group's pixels. */
async function itemBox(page: Page, index: number) {
  return page
    .locator(ITEM)
    .nth(index)
    .evaluate((el) => {
      const group = el.parentElement!.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left - group.left - el.parentElement!.clientLeft,
        width: rect.width,
        background: getComputedStyle(el).backgroundColor,
      };
    });
}

export function describeToggleGroupDemo(lib: Lib, single: boolean) {
  test.describe(`${lib} toggle group demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'toggle-group'));

    test('items scale while pressed, and a click selects', async ({ page }) => {
      const item = page.locator(ITEM).nth(2);
      expectPressOnly(await pressScale(page, item));
      expect(await stateOf(item)).toBe('true');
    });

    if (single) {
      test('the selected surface slides to the newly selected item', async ({
        page,
      }) => {
        const from = await itemBox(page, 0);
        const to = await itemBox(page, 2);
        await sampleHighlight(page, 90);
        await page.locator(ITEM).nth(2).click();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(1300);
        const frames = (await readHighlight(page)).filter((f) => f.drawn);
        // Drawn behind the items, with the selected item's own background
        // cleared (it isn't hovered any more).
        expect(frames.length).toBeGreaterThan(10);
        expect((await itemBox(page, 2)).background).toBe('rgba(0, 0, 0, 0)');
        // From the previous item to the new one, through the middle, past
        // its end a little (stiffness 200, damping 25), the new surface
        // fading in as the previous one fades out.
        const moving = frames.filter((f) => f.x > from.x + 5 && f.x < to.x - 5);
        expect(moving.length).toBeGreaterThan(2);
        for (const f of moving) {
          expect(f.from + f.to).toBeCloseTo(1, 1);
          expect(f.to).toBeGreaterThan(0);
        }
        const last = frames[frames.length - 1]!;
        expect(last.x).toBeCloseTo(to.x, 0);
        expect(last.to).toBe(1);
        expect(last.from).toBe(0);
        expect(Math.max(...frames.map((f) => f.x))).toBeGreaterThan(to.x);
      });

      test('clearing the selection fades the surface out', async ({ page }) => {
        const item = page.locator(ITEM).nth(0);
        await sampleHighlight(page, 60);
        await item.click();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(1000);
        expect(await stateOf(item)).toBe('false');
        const frames = await readHighlight(page);
        expect(
          frames.some((f) => f.drawn && f.from > 0.1 && f.from < 0.9),
        ).toBe(true);
        expect(frames[frames.length - 1]!.drawn).toBe(false);
        // The item's own (unselected) style is back.
        expect((await itemBox(page, 0)).background).toBe('rgba(0, 0, 0, 0)');
      });
    } else {
      test('multiple selection: no sliding surface, items keep their own', async ({
        page,
      }) => {
        await page.locator(ITEM).nth(2).click();
        await page.mouse.move(0, 0);
        await page.waitForTimeout(400);
        expect(
          await page
            .locator(GROUP)
            .evaluate((el) => el.hasAttribute('data-animate-ui-highlight')),
        ).toBe(false);
        expect((await itemBox(page, 2)).background).not.toBe(
          'rgba(0, 0, 0, 0)',
        );
      });
    }

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
