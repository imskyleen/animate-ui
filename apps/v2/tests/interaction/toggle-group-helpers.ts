import { expect, test, type Locator, type Page } from '@playwright/test';

import { pressScale, type Lib } from './controls-helpers';

// The toggle groups' motion (Radix UI, Base UI, React Aria): the selected
// surfaces (grown in like a fill, joined between neighbours, one sliding
// surface for a single selection), the hover highlight, and the demo's icons.
// The surfaces are drawn in the group's shadow root (internal/controls/
// highlight.tsx); every test reads them there, frame by frame.

const GROUP = '[data-slot="toggle-group"]';
const ITEM = '[data-slot="toggle-group-item"]';
const FIXTURE = '/tests/fixtures/toggle-group-surfaces';

/** A surface drawn on one frame, in the group's pixels. */
export type Drawn = {
  slot: string;
  /** The item it belongs to (multiple selection), or -1 (the single one). */
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  opacity: number;
  /** Corners: top left, top right, bottom right, bottom left. */
  radii: number[];
};

export type Frame = { t: number; surfaces: Drawn[] };

/** The surfaces drawn right now (visible ones only). */
function readSurfaces(root: Element): Drawn[] {
  const shadow = root.shadowRoot;
  if (!shadow) return [];
  return Array.from(shadow.querySelectorAll<HTMLElement>('[data-slot]'))
    .filter(
      (el) =>
        el.dataset.slot !== 'toggle-group-surfaces' &&
        el.style.visibility !== 'hidden' &&
        el.style.width !== '',
    )
    .map((el) => {
      const move = el.style.transform.match(
        /translate\(([-\d.e]+)px, ([-\d.e]+)px\)/,
      );
      return {
        slot: el.dataset.slot!,
        index: el.dataset.index === undefined ? -1 : Number(el.dataset.index),
        x: move ? Number(move[1]) : 0,
        y: move ? Number(move[2]) : 0,
        w: parseFloat(el.style.width),
        h: parseFloat(el.style.height),
        opacity: Number(el.style.opacity || 1),
        radii: (() => {
          // The shorthand, 1 to 4 values, as the browser serialises it.
          const r = el.style.borderRadius.split(' ').map((v) => parseFloat(v));
          const [a = 0, b = a, c = a, d = b] = r;
          return [a, b, c, d];
        })(),
      };
    });
}

/** Records the group's surfaces on each animation frame. */
export async function sample(group: Locator, frames = 60) {
  await group.evaluate(
    (root, [n, read]) => {
      const readFn = new Function(`return (${read})`)() as (
        el: Element,
      ) => Drawn[];
      const w = window as unknown as { __surfaces: Frame[] };
      const out: Frame[] = (w.__surfaces = []);
      const t0 = performance.now();
      let count = 0;
      const tick = () => {
        out.push({ t: performance.now() - t0, surfaces: readFn(root) });
        if (++count < (n as number)) requestAnimationFrame(tick);
      };
      tick();
    },
    [frames, readSurfaces.toString()] as const,
  );
  return async () => {
    await group
      .page()
      .waitForFunction(
        (n) =>
          (window as unknown as { __surfaces: Frame[] }).__surfaces.length >= n,
        frames,
      );
    return group
      .page()
      .evaluate(
        () => (window as unknown as { __surfaces: Frame[] }).__surfaces,
      );
  };
}

export async function surfacesNow(group: Locator) {
  return group.evaluate(
    (root, read) =>
      (new Function(`return (${read})`)() as (el: Element) => Drawn[])(root),
    readSurfaces.toString(),
  );
}

/** An item's box in the group's pixels. */
export async function boxOf(group: Locator, index: number) {
  return group
    .locator(ITEM)
    .nth(index)
    .evaluate((el) => {
      const root = el.closest('[data-slot="toggle-group"]')!;
      const r = root.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      return {
        x: b.left - r.left - root.clientLeft,
        y: b.top - r.top - root.clientTop,
        w: b.width,
        h: b.height,
        background: getComputedStyle(el).backgroundColor,
      };
    });
}

const selection = (f: Frame, index: number) =>
  f.surfaces.find(
    (s) => s.slot === 'toggle-group-selection' && s.index === index,
  );
const single = (f: Frame) =>
  f.surfaces.find((s) => s.slot === 'toggle-group-selection' && s.index < 0);
const hover = (f: Frame) =>
  f.surfaces.find((s) => s.slot === 'toggle-group-highlight');

async function toggle(group: Locator, index: number) {
  // From the keyboard: no hover highlight on the way.
  await group.locator(ITEM).nth(index).focus();
  await group.page().keyboard.press('Space');
}

async function settle(page: Page) {
  await page.mouse.move(0, 0);
  await page.waitForTimeout(700);
}

export function describeToggleGroup(lib: Lib) {
  const groupOf = (page: Page, id: string) => page.getByTestId(`${lib}-${id}`);

  test.describe(`${lib} toggle group surfaces`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(FIXTURE, { waitUntil: 'networkidle' });
    });

    test('a selected surface grows in from 70% as it fades in, and shrinks out', async ({
      page,
    }) => {
      const group = groupOf(page, 'outline-2-horizontal');
      const item = await boxOf(group, 1);
      let frames = await sample(group, 30);
      await toggle(group, 1);
      const on = (await frames()).map((f) => selection(f, 1)).filter(Boolean);
      expect(on.length).toBeGreaterThan(8);
      // From ~70% (and nearly transparent), from the item's center.
      const first = on[0]!;
      expect(first.w / item.w).toBeLessThan(0.8);
      expect(first.w / item.w).toBeGreaterThanOrEqual(0.69);
      expect(first.opacity).toBeLessThan(0.35);
      expect(first.x + first.w / 2).toBeCloseTo(item.x + item.w / 2, 0);
      expect(on.some((s) => s!.opacity > 0.3 && s!.opacity < 0.9)).toBe(true);
      const last = on.at(-1)!;
      expect(last.w).toBeCloseTo(item.w, 1);
      expect(last.opacity).toBe(1);
      // The item's own background is cleared: the surface stands for it.
      expect((await boxOf(group, 1)).background).toBe('rgba(0, 0, 0, 0)');

      frames = await sample(group, 30);
      await toggle(group, 1);
      const off = (await frames()).map((f) => selection(f, 1));
      const shown = off.filter(Boolean);
      expect(shown.some((s) => s!.w < item.w * 0.9 && s!.opacity > 0.1)).toBe(
        true,
      );
      expect(off.at(-1)).toBeUndefined();
    });

    for (const [id, axis] of [
      ['default-0-horizontal', 'x'],
      ['outline-0-horizontal', 'x'],
      ['default-2-horizontal', 'x'],
      ['default-0-vertical', 'y'],
      ['default-2-vertical', 'y'],
      ['default-0-horizontal-rtl', 'x'],
    ] as const)
      test(`neighbours join into one surface, and split (${id})`, async ({
        page,
      }) => {
        const group = groupOf(page, id);
        const rtl = id.endsWith('rtl');
        const [a, b] = [await boxOf(group, 0), await boxOf(group, 1)];
        const size = axis === 'x' ? 'w' : 'h';
        // The gap's middle, between the first item and the second.
        const end = (box: typeof a) => (axis === 'x' ? box.x : box.y);
        const middle = rtl
          ? (end(b) + b[size] + end(a)) / 2
          : (end(a) + a[size] + end(b)) / 2;
        await toggle(group, 0);
        await settle(page);
        const frames = await sample(group, 40);
        await toggle(group, 1);
        const joining = await frames();
        const reach = (f: Frame) => {
          const s = selection(f, 0);
          if (!s) return null;
          return rtl
            ? axis === 'x'
              ? s.x
              : s.y
            : axis === 'x'
              ? s.x + s.w
              : s.y + s.h;
        };
        // The first one stretches toward the second, its inner corners
        // squaring off on the way.
        const reaches = joining
          .map(reach)
          .filter((r) => r !== null) as number[];
        const own = rtl ? end(a) : end(a) + a[size];
        if (Math.abs(middle - own) > 1)
          expect(
            reaches.some(
              (r) => Math.abs(r - own) > 1 && Math.abs(r - middle) > 1,
            ),
          ).toBe(true);
        const last = joining.at(-1)!;
        const s0 = selection(last, 0)!;
        const s1 = selection(last, 1)!;
        // Past the middle by a hair (0.5px), so no seam shows.
        expect(
          Math.abs(reach(last)! - (middle + (rtl ? -0.5 : 0.5))),
        ).toBeLessThan(0.1);
        // Inner corners square, outer ones keep the item's radius.
        const inner = axis === 'y' ? [2, 3] : rtl ? [0, 3] : [1, 2];
        for (const c of inner) expect(s0.radii[c]).toBeLessThan(0.01);
        // The second one meets it: no gap, a hair of overlap.
        const start1 = rtl ? s1.x + s1.w : axis === 'x' ? s1.x : s1.y;
        expect(Math.abs(start1 - (middle + (rtl ? 0.5 : -0.5)))).toBeLessThan(
          0.1,
        );
        // Some frames are half joined: the corners square off smoothly
        // (touching items whose inner corners are square already excepted).
        const rounded = selection(joining[0]!, 0)!.radii[inner[0]!]!;
        if (rounded > 0.5)
          expect(
            joining.some((f) => {
              const r = selection(f, 0)?.radii[inner[0]!] ?? 0;
              return r > 0.5 && r < rounded - 0.5;
            }),
          ).toBe(true);

        // Deselecting the second one splits them: the first one is its own
        // box again.
        await toggle(group, 1);
        await settle(page);
        const after = { surfaces: await surfacesNow(group), t: 0 };
        expect(selection(after, 1)).toBeUndefined();
        const back = selection(after, 0)!;
        expect(back[size]).toBeCloseTo(a[size], 1);
      });

    test('bordered items apart keep their own surfaces (outline, spacing 2)', async ({
      page,
    }) => {
      const group = groupOf(page, 'outline-2-horizontal');
      const a = await boxOf(group, 0);
      await toggle(group, 0);
      await toggle(group, 1);
      await settle(page);
      const now = { t: 0, surfaces: await surfacesNow(group) };
      const s0 = selection(now, 0)!;
      expect(s0.x + s0.w).toBeCloseTo(a.x + a.w, 1);
      expect(Math.min(...s0.radii)).toBeGreaterThan(1);
    });

    test('deselecting the middle one splits the surface in two', async ({
      page,
    }) => {
      const group = groupOf(page, 'default-2-horizontal');
      for (const i of [0, 1, 2]) await toggle(group, i);
      await settle(page);
      const [a, b, c] = [
        await boxOf(group, 0),
        await boxOf(group, 1),
        await boxOf(group, 2),
      ];
      // Joined first: the first one reaches past the gap's middle.
      const joined = selection(
        { t: 0, surfaces: await surfacesNow(group) },
        0,
      )!;
      expect(joined.x + joined.w).toBeCloseTo((a.x + a.w + b.x) / 2 + 0.5, 1);
      const frames = await sample(group, 40);
      await toggle(group, 1);
      const split = await frames();
      const last = split.at(-1)!;
      expect(selection(last, 1)).toBeUndefined();
      expect(selection(last, 0)!.x + selection(last, 0)!.w).toBeCloseTo(
        a.x + a.w,
        1,
      );
      expect(selection(last, 2)!.x).toBeCloseTo(c.x, 1);
      // The middle one shrinks while its neighbours pull back.
      expect(
        split.some((f) => {
          const s = selection(f, 1);
          return s !== undefined && s.opacity > 0.1 && s.opacity < 0.9;
        }),
      ).toBe(true);
    });

    test('quick select and deselect ends clean', async ({ page }) => {
      const group = groupOf(page, 'default-0-horizontal');
      const items = group.locator(ITEM);
      for (let i = 0; i < 3; i++) {
        await items.nth(1).click();
        await items.nth(2).click();
      }
      await settle(page);
      // Three clicks each: both selected, at rest, joined.
      const now = { t: 0, surfaces: await surfacesNow(group) };
      const [b, c] = [await boxOf(group, 1), await boxOf(group, 2)];
      expect(selection(now, 0)).toBeUndefined();
      expect(selection(now, 3)).toBeUndefined();
      expect(selection(now, 1)).toMatchObject({ x: b.x, opacity: 1 });
      expect(selection(now, 2)!.x + selection(now, 2)!.w).toBeCloseTo(
        c.x + c.w,
        1,
      );
      expect(hover(now)).toBeUndefined();
    });

    test('single selection: one surface slides, keeping its speed when picked up', async ({
      page,
    }) => {
      const group = groupOf(page, 'outline-0-horizontal-single');
      await toggle(group, 0);
      await settle(page);
      const [a, c, d] = [
        await boxOf(group, 0),
        await boxOf(group, 2),
        await boxOf(group, 3),
      ];
      const frames = await sample(group, 50);
      // Picked again 70ms in, mid-slide; the frame it happens on is noted.
      await group.evaluate(async (root) => {
        const items = root.querySelectorAll<HTMLElement>(
          '[data-slot="toggle-group-item"]',
        );
        items[2]!.click();
        await new Promise((r) => setTimeout(r, 70));
        const w = window as unknown as { __surfaces: Frame[]; __at: number };
        w.__at = w.__surfaces.length;
        items[3]!.click();
      });
      const at = await page.evaluate(
        () => (window as unknown as { __at: number }).__at,
      );
      const run = await frames();
      // Never two surfaces.
      for (const f of run)
        expect(
          f.surfaces.filter((s) => s.slot === 'toggle-group-selection').length,
        ).toBeLessThanOrEqual(1);
      const xs = run.map((f) => single(f)?.x ?? NaN);
      expect(xs.every(Number.isFinite)).toBe(true);
      // Through the middle, then on to the last one.
      expect(xs.some((x) => x > a.x + 5 && x < c.x - 5)).toBe(true);
      expect(xs.at(-1)).toBeCloseTo(d.x, 0);
      // Picked up on the way, it keeps its speed: the frames right after
      // move about as far as the ones right before (from rest, a spring's
      // first frames barely move).
      const steps = xs.slice(1).map((x, i) => x - xs[i]!);
      const before = steps[at - 2]!;
      expect(before).toBeGreaterThan(1);
      for (const step of steps.slice(at, at + 2))
        expect(step).toBeGreaterThan(before * 0.6);
    });

    test('single selection: the first one grows in, clearing shrinks it out', async ({
      page,
    }) => {
      const group = groupOf(page, 'default-2-horizontal-single');
      const item = await boxOf(group, 1);
      let frames = await sample(group, 30);
      await toggle(group, 1);
      const on = (await frames()).map(single).filter(Boolean);
      expect(on[0]!.w / item.w).toBeLessThan(0.8);
      expect(on.at(-1)!.w).toBeCloseTo(item.w, 1);
      frames = await sample(group, 30);
      await toggle(group, 1);
      const off = (await frames()).map(single);
      expect(off.some((s) => s && s.w < item.w * 0.9)).toBe(true);
      expect(off.at(-1)).toBeUndefined();
    });

    test('the hover highlight fades in, glides between items, and fades out', async ({
      page,
    }) => {
      const group = groupOf(page, 'default-2-horizontal');
      const items = group.locator(ITEM);
      const [a, b] = [await boxOf(group, 0), await boxOf(group, 1)];
      const center = async (i: number) => {
        const box = (await items.nth(i).boundingBox())!;
        return [box.x + box.width / 2, box.y + box.height / 2] as const;
      };
      let frames = await sample(group, 25);
      await page.mouse.move(...(await center(0)));
      const lit = (await frames()).map(hover);
      // From nothing, in place.
      expect(lit.find(Boolean)!.opacity).toBeLessThan(0.5);
      expect(lit.find(Boolean)!.x).toBeCloseTo(a.x, 0);
      expect(lit.at(-1)!.opacity).toBe(1);

      frames = await sample(group, 30);
      await page.mouse.move(...(await center(1)));
      const glide = (await frames()).map(hover);
      expect(glide.some((s) => s && s.x > a.x + 3 && s.x < b.x - 3)).toBe(true);
      expect(glide.at(-1)!.x).toBeCloseTo(b.x, 0);
      // One surface, never two.
      expect(glide.every((s) => s && s.opacity > 0.5)).toBe(true);

      frames = await sample(group, 25);
      await page.mouse.move(0, 0);
      const out = (await frames()).map(hover);
      expect(out.some((s) => s && s.opacity > 0.1 && s.opacity < 0.9)).toBe(
        true,
      );
      expect(out.filter(Boolean).every((s) => Math.abs(s!.x - b.x) < 0.5)).toBe(
        true,
      );
      expect(out.at(-1)).toBeUndefined();
    });

    test('the highlight is above the selected surfaces, and a selected item hovered keeps its own', async ({
      page,
    }) => {
      const group = groupOf(page, 'default-2-horizontal');
      await toggle(group, 1);
      await settle(page);
      const order = await group.evaluate((root) =>
        Array.from(root.shadowRoot!.querySelectorAll('[data-slot]')).map((el) =>
          el.getAttribute('data-slot'),
        ),
      );
      expect(order.lastIndexOf('toggle-group-highlight')).toBeGreaterThan(
        order.lastIndexOf('toggle-group-selection'),
      );
      // Hovering the selected item: its surface already paints it.
      const box = (await group.locator(ITEM).nth(1).boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
      const now = { t: 0, surfaces: await surfacesNow(group) };
      expect(hover(now)).toBeUndefined();
      expect(selection(now, 1)!.opacity).toBe(1);
    });

    test('clicking a hovered item: the highlight covers the surface growing in, no dip', async ({
      page,
    }) => {
      const group = groupOf(page, 'default-2-horizontal');
      const item = group.locator(ITEM).nth(1);
      const box = (await item.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
      const frames = await sample(group, 40);
      await page.mouse.down();
      await page.mouse.up();
      const run = await frames();
      // Until the surface is there, the highlight stays on, then it goes.
      for (const f of run) {
        const s = selection(f, 1);
        if (s && s.opacity < 1) expect(hover(f)?.opacity).toBe(1);
      }
      expect(hover(run.at(-1)!)).toBeUndefined();
    });

    test('arrow keys move the focus only: nothing moves, Space toggles', async ({
      page,
    }) => {
      const group = groupOf(page, 'default-0-horizontal');
      await toggle(group, 0);
      await settle(page);
      const before = await surfacesNow(group);
      const frames = await sample(group, 20);
      await page.keyboard.press('ArrowRight');
      await expect(group.locator(ITEM).nth(1)).toBeFocused();
      for (const f of await frames()) expect(f.surfaces).toEqual(before);
      await page.keyboard.press('Space');
      await expect
        .poll(() =>
          group
            .locator(ITEM)
            .nth(1)
            .evaluate((el) =>
              ['aria-pressed', 'aria-checked', 'data-selected'].some(
                (attr) =>
                  el.getAttribute(attr) === 'true' ||
                  (attr === 'data-selected' && el.hasAttribute(attr)),
              ),
            ),
        )
        .toBe(true);
    });

    test('reduced motion: fades only, nothing scales or stretches', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const group = groupOf(page, 'default-2-horizontal');
      const [a, b] = [await boxOf(group, 0), await boxOf(group, 1)];
      await toggle(group, 0);
      await settle(page);
      const frames = await sample(group, 30);
      await toggle(group, 1);
      const run = await frames();
      // While the second one fades in at full size, over the gap, the
      // first one doesn't move.
      for (const f of run) {
        const s1 = selection(f, 1);
        if (!s1 || s1.opacity >= 1) continue;
        const s0 = selection(f, 0)!;
        expect(s0.x).toBeCloseTo(a.x, 1);
        expect(s0.w).toBeCloseTo(a.w, 1);
        expect(s1.h).toBeCloseTo(b.h, 1);
        expect(s1.x).toBeLessThan(a.x + a.w);
      }
      expect(
        run.some((f) => {
          const s = selection(f, 1);
          return s !== undefined && s.opacity > 0.1 && s.opacity < 0.9;
        }),
      ).toBe(true);

      // A single selection fades out on one item and in on the other.
      const one = groupOf(page, 'outline-0-horizontal-single');
      await toggle(one, 0);
      await settle(page);
      const cross = await sample(one, 30);
      await toggle(one, 2);
      const fades = await cross();
      expect(
        fades.some(
          (f) =>
            (selection(f, 0)?.opacity ?? 0) > 0.05 &&
            (selection(f, 2)?.opacity ?? 0) > 0.05,
        ),
      ).toBe(true);
      for (const f of fades)
        for (const s of f.surfaces)
          if (s.slot === 'toggle-group-selection')
            expect(s.w).toBeCloseTo((await boxOf(one, s.index)).w, 1);
    });
  });

  test.describe(`${lib} toggle group demo`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/tests/demos/${lib}/toggle-group`, {
        waitUntil: 'networkidle',
      });
    });

    test('items scale while pressed, and a click selects', async ({ page }) => {
      const item = page.locator(ITEM).nth(2);
      const { held } = await pressScale(page, item);
      expect(held).toBeCloseTo(0.97, 2);
      await expect(item).toHaveAttribute(
        lib === 'react-aria' ? 'data-selected' : 'aria-pressed',
        'true',
      );
    });

    test('reduced motion: no press scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      const { held } = await pressScale(page, page.locator(ITEM).nth(1));
      expect(held).toBe(1);
    });

    /** Records an icon's scale, rotation and drawn underline per frame. */
    const sampleIcon = async (page: Page, index: number) => {
      await page
        .locator(ITEM)
        .nth(index)
        .evaluate((item) => {
          const icon = item.querySelector('span')!;
          const out: { scale: number; rotate: number; drawn: number }[] = [];
          (window as unknown as { __icon: typeof out }).__icon = out;
          let n = 0;
          const tick = () => {
            const m = new DOMMatrix(getComputedStyle(icon).transform);
            const line = icon.querySelector('path:last-of-type')!;
            const dash = getComputedStyle(line).strokeDasharray;
            out.push({
              scale: Math.hypot(m.a, m.b),
              rotate: (Math.atan2(m.b, m.a) * 180) / Math.PI,
              drawn: dash === 'none' ? 1 : parseFloat(dash),
            });
            if (++n < 40) requestAnimationFrame(tick);
          };
          tick();
        });
      return async () => {
        await page.waitForTimeout(700);
        return page.evaluate(
          () =>
            (
              window as unknown as {
                __icon: { scale: number; rotate: number; drawn: number }[];
              }
            ).__icon,
        );
      };
    };

    test('icons answer their item turning on, and give a little turning off', async ({
      page,
    }) => {
      const items = page.locator(ITEM);
      // Bold pops.
      await items.nth(0).focus();
      let frames = await sampleIcon(page, 0);
      await page.keyboard.press('Space');
      let run = await frames();
      expect(Math.max(...run.map((f) => f.scale))).toBeGreaterThan(1.12);
      expect(run.at(-1)!.scale).toBeCloseTo(1, 2);
      // Italic tilts, then settles.
      await items.nth(1).focus();
      frames = await sampleIcon(page, 1);
      await page.keyboard.press('Space');
      run = await frames();
      expect(Math.min(...run.map((f) => f.rotate))).toBeLessThan(-8);
      expect(run.at(-1)!.rotate).toBeCloseTo(0, 1);
      // Underline draws its line from nothing.
      await items.nth(2).focus();
      frames = await sampleIcon(page, 2);
      await page.keyboard.press('Space');
      run = await frames();
      expect(run.some((f) => f.drawn > 0.05 && f.drawn < 0.95)).toBe(true);
      expect(run.at(-1)!.drawn).toBeCloseTo(1, 2);
      // Turned off: a small give.
      frames = await sampleIcon(page, 0);
      await items.nth(0).focus();
      await page.keyboard.press('Space');
      run = await frames();
      expect(Math.min(...run.map((f) => f.scale))).toBeLessThan(0.95);
      expect(run.at(-1)!.scale).toBeCloseTo(1, 2);
    });

    test('icons: nothing on mount, nothing under reduced motion', async ({
      page,
    }) => {
      let frames = await sampleIcon(page, 0);
      let run = await frames();
      for (const f of run) expect(f.scale).toBe(1);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator(ITEM).nth(0).focus();
      frames = await sampleIcon(page, 0);
      await page.keyboard.press('Space');
      run = await frames();
      for (const f of run) expect(f.scale).toBe(1);
    });
  });
}

export { GROUP };
