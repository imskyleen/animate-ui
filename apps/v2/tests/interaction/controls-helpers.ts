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
  /** The content's blur, in px. */
  blur: number;
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
          const blur = style.filter.match(/blur\(([\d.]+)px\)/);
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
            blur: blur ? Number(blur[1]) : 0,
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
                  blur: 0,
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

async function gotoDemo(page: Page, lib: Lib, name: string, query = '') {
  await page.goto(`/tests/demos/${lib}/${name}${query}`, {
    waitUntil: 'networkidle',
  });
}

/**
 * Marks `locator` invalid (the demos style `aria-invalid`, and React Aria's
 * `data-invalid`), clicks it, and reads its border color frame by frame for
 * 400ms, sampled in the page.
 */
async function invalidBorders(locator: Locator) {
  return locator.evaluate(async (el) => {
    el.setAttribute('aria-invalid', 'true');
    el.setAttribute('data-invalid', 'true');
    // Its border turning to the invalid color first (a checkbox fades its
    // colors over 300ms).
    await new Promise((r) => setTimeout(r, 500));
    const read = () => getComputedStyle(el).borderTopColor;
    const out = [read()];
    // React Aria's control is a label: its input takes the click.
    const target = el.tagName === 'LABEL' ? el.querySelector('input')! : el;
    (target as HTMLElement).click();
    const start = performance.now();
    while (performance.now() - start < 400) {
      await new Promise((r) => requestAnimationFrame(r));
      out.push(read());
    }
    return out;
  });
}

// ---------------------------------------------------------------------------

const CHECKBOX = '[data-slot="checkbox"]';
const CHECK = '[data-slot="checkbox-indicator"] svg path';
/** The check's icon: what pops (`checkAnimation="pop"`). */
const ICON = '[data-slot="checkbox-indicator"] svg';
/** shadcn's demo: its second box, the `checked` control's, checked on load. */
const CHECKED = 1;
/** shadcn's demo: its first box, unchecked on load. */
const UNCHECKED = 0;

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

/**
 * A popped check, partway: its scale, blur and opacity follow one progress
 * (from half its size, 2px of blur and transparent, to rest), whatever the
 * frames a busy machine skips.
 */
function expectPopShape(s: NonNullable<Sample>) {
  expect(Math.abs(s.scale - (0.5 + 0.5 * s.opacity))).toBeLessThan(0.06);
  expect(Math.abs(s.blur - 2 * (1 - s.opacity))).toBeLessThan(0.3);
}

/**
 * A check popping in (`pop`): hidden for 0.2s after the state flips, like a
 * drawn one, then springing from half its size out of a blur, a little past
 * its size, to rest. Its stroke stays whole. Under reduced motion it only
 * fades.
 */
function expectCheckPops(samples: NonNullable<Sample>[], reduce = false) {
  const shown = present(samples).filter((s) => s.state === 'true');
  expect(shown.length).toBeGreaterThan(3);
  const flip = samples.findIndex((s) => s.state === 'true');
  const before = samples[Math.max(flip - 1, 0)]!;
  for (const s of shown.filter((s) => s.t - before.t < 150))
    expect(s.opacity).toBeLessThan(0.05);
  const appearing = shown.filter((s) => s.opacity > 0.05);
  expect(appearing.length).toBeGreaterThan(2);
  for (const s of appearing) {
    expect(s.t - before.t).toBeGreaterThan(150);
    expect(s.dash).toBe(1);
  }
  const partway = appearing.filter((s) => s.opacity < 0.98);
  expect(partway.length).toBeGreaterThan(0);
  if (reduce) {
    for (const s of shown) expect(s.scale).toBe(1);
  } else {
    for (const s of partway) expectPopShape(s);
    expect(Math.max(...appearing.map((s) => s.scale))).toBeGreaterThan(1.02);
  }
  const last = shown.at(-1)!;
  expect(last.scale).toBeCloseTo(1, 2);
  expect(last.opacity).toBe(1);
  expect(last.blur).toBe(0);
}

/** A popped check shrinking back into its blur in 0.15s; then it goes. */
function expectCheckUnpops(samples: NonNullable<Sample>[]) {
  const flipped = samples.filter((s) => s.state === 'false');
  expect(flipped.length).toBeGreaterThan(3);
  const leaving = present(flipped).filter(
    (s) => s.opacity > 0.02 && s.opacity < 0.98,
  );
  expect(leaving.length).toBeGreaterThan(0);
  for (const s of leaving) {
    expectPopShape(s);
    expect(s.t - flipped[0]!.t).toBeLessThan(250);
    expect(s.dash).toBe(1);
  }
  const gone = flipped.find((s) => s.width === -1);
  expect(gone).toBeDefined();
  expect(gone!.t - flipped[0]!.t).toBeLessThan(450);
}

export function describeCheckboxDemo(lib: Lib) {
  test.describe(`${lib} checkbox demo, checkAnimation="pop"`, () => {
    test.beforeEach(async ({ page }) =>
      gotoDemo(page, lib, 'checkbox', '?checkAnimation=pop'),
    );

    test('a checked box shows its check at rest once loaded', async ({
      page,
    }) => {
      const icon = page.locator(CHECKBOX).nth(CHECKED).locator(ICON);
      await expect.poll(() => opacityOf(icon)).toBe(1);
      await expect.poll(() => scaleOf(icon)).toBe(1);
    });

    test('the check pops in after 0.2s, from half its size', async ({
      page,
    }) => {
      await startSampling(page, CHECKBOX, UNCHECKED, ICON);
      await page.locator(CHECKBOX).nth(UNCHECKED).click();
      await page.waitForTimeout(900);
      expectCheckPops(await readSamples(page));
    });

    test('unchecking shrinks it back out in 0.15s, then removes it', async ({
      page,
    }) => {
      // At rest first: a checked box's check pops in as the page loads.
      const icon = page.locator(CHECKBOX).nth(CHECKED).locator(ICON);
      await expect.poll(() => opacityOf(icon)).toBe(1);
      await expect.poll(() => scaleOf(icon)).toBe(1);
      await startSampling(page, CHECKBOX, CHECKED, ICON);
      await page.locator(CHECKBOX).nth(CHECKED).click();
      await page.waitForTimeout(700);
      expectCheckUnpops(await readSamples(page));
    });

    test('reduced motion: the check only fades', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await startSampling(page, CHECKBOX, UNCHECKED, ICON);
      await page.locator(CHECKBOX).nth(UNCHECKED).click();
      await page.waitForTimeout(900);
      expectCheckPops(await readSamples(page), true);
    });
  });

  test.describe(`${lib} checkbox demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'checkbox'));

    test('a checked box shows its check at rest once loaded', async ({
      page,
    }) => {
      const check = page.locator(CHECKBOX).nth(CHECKED).locator(CHECK);
      await expect.poll(() => opacityOf(check)).toBe(1);
      expect(await scaleOf(check)).toBe(1);
      expect(await check.getAttribute('stroke-dasharray')).toBeNull();
    });

    test('the check draws itself after 0.2s, in 0.3s', async ({ page }) => {
      await startSampling(page, CHECKBOX, UNCHECKED, CHECK);
      await page.locator(CHECKBOX).nth(UNCHECKED).click();
      await page.waitForTimeout(900);
      expectCheckDraws(await readSamples(page));
    });

    test('unchecking erases the check in 0.3s, then removes it', async ({
      page,
    }) => {
      await startSampling(page, CHECKBOX, CHECKED, CHECK);
      await page.locator(CHECKBOX).nth(CHECKED).click();
      await page.waitForTimeout(900);
      expectCheckErases(await readSamples(page));
    });

    test('the box fills with a layer growing from 70% over its border', async ({
      page,
    }) => {
      const box = page.locator(CHECKBOX).nth(UNCHECKED);
      // Sampled in the page from the click: the layer (the box's ::before)
      // grows and fades in together over the whole box, border included,
      // while the box's own background and border keep their colors (a
      // border turning to the fill's color would ring the growing layer).
      const frames = await box.evaluate(async (el) => {
        const read = () => {
          const layer = getComputedStyle(el, '::before');
          return {
            scale: Number(layer.scale === 'none' ? 1 : layer.scale),
            opacity: Number(layer.opacity),
            bg: getComputedStyle(el).backgroundColor,
            border: getComputedStyle(el).borderTopColor,
            inset: layer.top,
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
      for (const f of frames) {
        expect(f.bg).toBe(frames[0]!.bg);
        expect(f.border).toBe(frames[0]!.border);
      }
      expect(frames[0]!.inset).toBe('-1px');
    });

    test('an invalid box keeps its border color as its fill grows', async ({
      page,
    }) => {
      // Turned to the fill's color at once, it would ring the growing layer.
      const borders = await invalidBorders(
        page.locator(CHECKBOX).nth(UNCHECKED),
      );
      expect(new Set(borders).size, borders.join(' ')).toBe(1);
    });

    test('the box never scales, on press or hover', async ({ page }) => {
      const scales = await pressScale(
        page,
        page.locator(CHECKBOX).nth(UNCHECKED),
      );
      // The check and the box's fill answer the click: the box stays put.
      expect(scales).toEqual({ hovered: 1, held: 1, released: 1, left: 1 });
    });

    test('Space toggles at once, and the check still draws', async ({
      page,
    }) => {
      const root = page.locator(CHECKBOX).nth(UNCHECKED);
      await focusTarget(lib, root).focus();
      await startSampling(page, CHECKBOX, UNCHECKED, CHECK);
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
      await startSampling(page, CHECKBOX, UNCHECKED, CHECK);
      const root = page.locator(CHECKBOX).nth(UNCHECKED);
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
  // From nothing: small on its first frame (~45ms in on a busy machine).
  expect(shown[0]!.scale).toBeLessThan(0.35);
  expect(shown[0]!.opacity).toBeLessThan(0.45);
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

type Fill = {
  scale: number;
  opacity: number;
  bg: string;
  border: string;
  inset: string;
};

/**
 * The fills of the first radio (chosen) and the second (left) frame by frame
 * for 500ms from a click on the first, sampled in the page.
 */
async function fillFrames(page: Page) {
  const radios = page.locator(RADIO);
  await expect.poll(() => stateOf(radios.nth(1))).toBe('true');
  return radios.first().evaluate(async (first, selector) => {
    const [fresh, old] = [...document.querySelectorAll(selector)];
    const read = (el: Element): Fill => {
      const layer = getComputedStyle(el, '::before');
      return {
        scale: Number(layer.scale === 'none' ? 1 : layer.scale),
        opacity: Number(layer.opacity),
        bg: getComputedStyle(el).backgroundColor,
        border: getComputedStyle(el).borderTopColor,
        inset: layer.top,
      };
    };
    const out = [[read(fresh!), read(old!)]];
    // React Aria's radio is a label: its input takes the click.
    const target =
      first.tagName === 'LABEL' ? first.querySelector('input')! : first;
    (target as HTMLElement).click();
    const start = performance.now();
    while (performance.now() - start < 500) {
      await new Promise((r) => requestAnimationFrame(r));
      out.push([read(fresh!), read(old!)]);
    }
    return out;
  }, RADIO);
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

    test('a click grows the new fill from 70% and shrinks the old one back', async ({
      page,
    }) => {
      // Like the checkbox's: the fill is a layer (the radio's ::before) that
      // grows and fades in over the whole radio, border included, while the
      // radio's own background and border keep their colors. The radio left
      // shrinks its layer back as it fades out.
      const frames = await fillFrames(page);
      const grown = frames.map(([fresh]) => fresh!);
      const shrunk = frames.map(([, old]) => old!);
      expect(grown[0]!.scale).toBeCloseTo(0.7, 2);
      expect(grown[0]!.opacity).toBe(0);
      expect(
        grown.some((f) => f.scale > 0.75 && f.scale < 0.95 && f.opacity > 0.1),
      ).toBe(true);
      expect(grown.at(-1)!.scale).toBe(1);
      expect(grown.at(-1)!.opacity).toBe(1);
      expect(shrunk[0]!.scale).toBe(1);
      expect(shrunk[0]!.opacity).toBe(1);
      expect(
        shrunk.some((f) => f.scale > 0.75 && f.scale < 0.95 && f.opacity > 0.1),
      ).toBe(true);
      expect(shrunk.at(-1)!.scale).toBeCloseTo(0.7, 2);
      expect(shrunk.at(-1)!.opacity).toBe(0);
      for (const side of [grown, shrunk])
        for (const f of side) {
          expect(f.bg).toBe(side[0]!.bg);
          expect(f.border).toBe(side[0]!.border);
          expect(f.inset).toBe('-1px');
        }
    });

    test('an invalid radio keeps its border color as its fill grows', async ({
      page,
    }) => {
      // Turned to the fill's color at once, it would ring the growing layer.
      await expect.poll(() => stateOf(page.locator(RADIO).nth(1))).toBe('true');
      const borders = await invalidBorders(page.locator(RADIO).nth(0));
      expect(new Set(borders).size, borders.join(' ')).toBe(1);
    });

    test('reduced motion: the fill only fades', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const frames = await fillFrames(page);
      const grown = frames.map(([fresh]) => fresh!);
      expect(grown.some((f) => f.opacity > 0.1 && f.opacity < 0.9)).toBe(true);
      for (const [fresh, old] of frames) {
        expect(fresh!.scale).toBe(1);
        expect(old!.scale).toBe(1);
      }
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

/**
 * The thumb's left and right edges as the browser paints them, frame by
 * frame (its compositor's frames, a screencast), while `act` runs and
 * `duration` ms after: along the switch's middle row, from each edge pixel's
 * coverage, a white thumb on a black page and track (colours only). Layout reads
 * can't show it: the browser paints a box whole device pixels wide.
 */
async function paintedThumbEdges(
  page: Page,
  root: Locator,
  act: () => Promise<void>,
  duration: number,
) {
  await page.addStyleTag({
    content: `html,body,${SWITCH}{background:#000!important;border-color:#000!important}${THUMB}{background:#fff!important}`,
  });
  const box = (await root.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  const frames: { data: string; t: number }[] = [];
  cdp.on('Page.screencastFrame', (frame) => {
    frames.push({ data: frame.data, t: frame.metadata.timestamp ?? 0 });
    cdp
      .send('Page.screencastFrameAck', { sessionId: frame.sessionId })
      .catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
  await page.waitForTimeout(300);
  const before = Math.max(0, ...frames.map((frame) => frame.t));
  await act();
  await page.waitForTimeout(duration);
  await cdp.send('Page.stopScreencast');
  // In the order they were painted (they can arrive out of it), from the
  // last one before the interaction.
  const painted = frames
    .filter((frame) => frame.t >= before)
    .sort((a, b) => a.t - b.t)
    .map((frame) => frame.data);
  return page.evaluate(
    async ({ frames, box }) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true })!;
      const edges: { left: number; right: number }[] = [];
      for (const data of frames) {
        const image = new Image();
        image.src = `data:image/png;base64,${data}`;
        await image.decode();
        // Screencast frames are in CSS pixels, the viewport's size.
        const scale = image.naturalWidth / window.innerWidth;
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);
        const x0 = Math.round(box.x * scale);
        const width = Math.round(box.width * scale);
        const y = Math.round((box.y + box.height / 2) * scale);
        const { data: pixels } = context.getImageData(x0, y, width, 1);
        const cover = Array.from({ length: width }, (_, x) => {
          const i = x * 4;
          return (pixels[i]! + pixels[i + 1]! + pixels[i + 2]!) / 765;
        });
        const first = cover.findIndex((c) => c > 0.02);
        if (first < 0) continue;
        let last = width - 1;
        while (cover[last]! <= 0.02) last--;
        edges.push({
          left: (first + 1 - cover[first]!) / scale,
          right: (last + cover[last]!) / scale,
        });
      }
      return edges;
    },
    { frames: painted, box },
  );
}

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
      // A spring, seen on its way, its width on whole device pixels (as
      // painted: its overshoot, a tenth of a pixel, never showed).
      expect(
        held.some(
          (s) => s.width > first.width + 0.5 && s.width < last.width - 0.5,
        ),
      ).toBe(true);
      const ratio = await page.evaluate(() => window.devicePixelRatio);
      for (const s of held) {
        const pixels = s.width * ratio;
        expect(Math.abs(pixels - Math.round(pixels))).toBeLessThan(0.01);
      }
      // No press feedback on the switch itself.
      expect(await scaleOf(root)).toBe(1);
      await page.mouse.up();
    });

    test('pressed while on, it stretches toward the start, its right edge in place', async ({
      page,
    }) => {
      // shadcn's demo has one switch, off: turned on first, its thumb left to
      // come to rest (the glide settles within 650ms, see below).
      const root = page.locator(SWITCH).nth(0);
      await root.click();
      await page.mouse.move(0, 0);
      expect(await stateOf(root)).toBe('true');
      await page.waitForTimeout(1000);
      await startSampling(page, SWITCH, 0, THUMB, 45);
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

    test('a quick click while on: the thumb leaves without its right edge going right', async ({
      page,
    }) => {
      // The stretch stops where it is on release: kept going, it grew the
      // thumb to the right as it left to the left (a tremble).
      const root = page.locator(SWITCH).nth(0);
      await root.click();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(1000);
      await startSampling(page, SWITCH, 0, THUMB, 45);
      await pointerDown(page, root);
      await page.waitForTimeout(60);
      await page.mouse.up();
      await page.waitForTimeout(700);
      const samples = await readSamples(page);
      const flip = samples.findIndex((s) => s.state === 'false');
      expect(flip).toBeGreaterThan(0);
      const pressedRight = Math.max(
        ...samples.slice(0, flip).map((s) => s.x + s.width),
      );
      const leftRight = samples.slice(flip).map((s) => s.x + s.width);
      expect(Math.max(...leftRight) - pressedRight).toBeLessThan(0.05);
      // It did leave.
      expect(Math.min(...leftRight)).toBeLessThan(pressedRight - 10);
    });

    for (const [on, hold] of [
      [true, 120],
      [true, 250],
      [false, 120],
      [false, 250],
    ] as const) {
      test(`a ${hold}ms click while ${on ? 'on' : 'off'}: as painted, the thumb never steps back`, async ({
        page,
      }) => {
        // Stretched while on, the thumb's right edge stays put as its offset
        // follows its width: painted whole device pixels wide, the width
        // stepped that edge out, then the offset slid it back (a tremble).
        // Each edge moves one way only, the way the thumb goes, until the
        // thumb has gone (its spring then comes back a little).
        const root = page.locator(SWITCH).nth(0);
        if (on) {
          await root.click();
          await page.mouse.move(0, 0);
          await page.waitForTimeout(1000);
        }
        const edges = await paintedThumbEdges(
          page,
          root,
          async () => {
            await pointerDown(page, root);
            // Released mid-stretch, or once stretched across a few device
            // pixels.
            await page.waitForTimeout(hold);
            await page.mouse.up();
          },
          900,
        );
        expect(edges.length).toBeGreaterThan(10);
        const way = on ? -1 : 1;
        const back = (e: { left: number; right: number }) =>
          on ? e.right : e.left;
        // It went: the back edge travelled the track.
        const gone = edges.reduce(
          (far, e, i) => (way * back(e) > way * back(edges[far]!) ? i : far),
          0,
        );
        expect(way * (back(edges[gone]!) - back(edges[0]!))).toBeGreaterThan(
          10,
        );
        for (let i = 1; i <= gone; i++)
          for (const edge of ['left', 'right'] as const) {
            const step = way * (edges[i]![edge] - edges[i - 1]![edge]);
            expect(step, `${edge} edge, frame ${i}`).toBeGreaterThan(-0.1);
          }
      });
    }

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

/** Every pressable control: 0.97 while pressed, no hover scale. */
function expectPressOnly(scales: Awaited<ReturnType<typeof pressScale>>) {
  expect(scales.hovered).toBe(1);
  expect(scales.held).toBeCloseTo(0.97, 2);
  expect(scales.released).toBeCloseTo(1, 2);
  expect(scales.left).toBeCloseTo(1, 2);
}

// shadcn's demo: a single toggle (Bookmark), off.
export function describeToggleDemo(lib: Lib) {
  test.describe(`${lib} toggle demo`, () => {
    test.beforeEach(async ({ page }) => gotoDemo(page, lib, 'toggle'));

    test('press scale (no hover scale), and a click toggles it', async ({
      page,
    }) => {
      const toggle = page.locator(TOGGLE).nth(0);
      expect(await stateOf(toggle)).toBe('false');
      expectPressOnly(await pressScale(page, toggle));
      expect(await stateOf(toggle)).toBe('true');
    });

    test('the press scale is a spring, not a tween', async ({ page }) => {
      const toggle = page.locator(TOGGLE).nth(0);
      const box = (await toggle.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await startSampling(page, TOGGLE, 0, null, 30);
      await page.mouse.down();
      await page.waitForTimeout(500);
      const held = await readSamples(page);
      await page.mouse.up();
      // On its way, then at 0.97 (Motion's scale spring, stiffness 550,
      // damping 30), within ~200ms.
      expect(held.some((s) => s.scale < 0.995 && s.scale > 0.975)).toBe(true);
      const reached = held.find((s) => s.scale < 0.972);
      expect(reached).toBeDefined();
      expect(reached!.t - held.find((s) => s.scale < 0.999)!.t).toBeLessThan(
        250,
      );
    });

    // The demo's bookmark (the user's ask): it pops as it fills, gives a
    // little as it empties, its fill fading; nothing on mount.
    const sampleBookmark = async (page: Page) => {
      await page.evaluate((selector) => {
        const toggle = document.querySelector(selector)!;
        const icon = toggle.querySelector('svg')!;
        const holder = icon.parentElement!;
        const w = window as unknown as {
          __bookmark: { scale: number; fill: number }[];
        };
        const out: { scale: number; fill: number }[] = (w.__bookmark = []);
        const t0 = performance.now();
        const tick = () => {
          const m = getComputedStyle(holder).transform.match(/matrix\(([^,]+)/);
          // The fill's alpha (transparent when empty, opaque when full), in
          // rgba() or the `/ alpha` of oklab() and other color functions.
          const fill = getComputedStyle(icon).fill;
          const slash = fill.match(/\/\s*([\d.]+)\s*\)/);
          const rgba = fill.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/);
          const alpha =
            fill === 'none'
              ? 0
              : slash
                ? Number(slash[1])
                : rgba
                  ? Number(rgba[1])
                  : 1;
          out.push({ scale: m ? Number(m[1]) : 1, fill: alpha });
          if (performance.now() - t0 < 600) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, TOGGLE);
      return () =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                __bookmark: { scale: number; fill: number }[];
              }
            ).__bookmark,
        );
    };

    test('its bookmark pops as it fills, and gives a little as it empties', async ({
      page,
    }) => {
      const toggle = page.locator(TOGGLE).nth(0);
      await toggle.focus();
      let frames = await sampleBookmark(page);
      await page.keyboard.press('Space');
      await page.waitForTimeout(650);
      const on = await frames();
      expect(Math.max(...on.map((f) => f.scale))).toBeGreaterThan(1.12);
      expect(on.at(-1)!.scale).toBeCloseTo(1, 2);
      expect(on.some((f) => f.fill > 0.05 && f.fill < 0.95)).toBe(true);
      expect(on.at(-1)!.fill).toBe(1);

      frames = await sampleBookmark(page);
      await page.keyboard.press('Space');
      await page.waitForTimeout(650);
      const off = await frames();
      expect(Math.min(...off.map((f) => f.scale))).toBeLessThan(0.95);
      expect(off.at(-1)!.scale).toBeCloseTo(1, 2);
      expect(off.some((f) => f.fill > 0.05 && f.fill < 0.95)).toBe(true);
      expect(off.at(-1)!.fill).toBe(0);
    });

    test('reduced motion: the bookmark only fills, without popping', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const toggle = page.locator(TOGGLE).nth(0);
      await toggle.focus();
      const frames = await sampleBookmark(page);
      await page.keyboard.press('Space');
      await page.waitForTimeout(650);
      const on = await frames();
      for (const f of on) expect(f.scale).toBe(1);
      expect(on.some((f) => f.fill > 0.05 && f.fill < 0.95)).toBe(true);
    });

    test('Space toggles it at once', async ({ page }) => {
      const toggle = page.locator(TOGGLE).nth(0);
      await toggle.focus();
      await page.keyboard.press('Space');
      expect(await stateOf(toggle)).toBe('true');
    });

    test('reduced motion: no press scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const { held } = await pressScale(page, page.locator(TOGGLE).nth(0));
      expect(held).toBe(1);
    });
  });
}
