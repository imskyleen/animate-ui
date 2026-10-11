import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame } from './motion-probe';
import { overshootOf } from './spring-curves';

const CONTENT = '[data-slot="tooltip-content"]';

/** The library tooltips' and popovers' spring, Animate UI's Tooltip's too. */
// Animate UI's own Tooltip: a touch calmer than the library tooltips' 400/29.
const TOOLTIP_SPRING = { stiffness: 400, damping: 31 };

/** `shift.tooltip`, `blur.tooltip` (px) and the incoming slide and fade, `transition.tooltipIn` (s). */
const SHIFT = 40;
const BLUR = 6;
const SWAP = 0.4;
/** The leaving content's fade, `transition.panelOut` (s). */
const OUT = 0.15;

type Layer = {
  text: string;
  x: number;
  y: number;
  opacity: number;
  blur: number;
  /** Its text as drawn over its size: 1 is undistorted. */
  textScaleX: number;
};

type SwapFrame = {
  t: number;
  layer: Layer & { clip: string };
  copies: Layer[];
  /** The popup as drawn over its size (its layout animation). */
  popupScaleX: number;
  arrows: { count: number; opacity: number; filter: string; inLayer: boolean };
};

/**
 * Every frame for `ms` of the popup's content: its layer, its leaving
 * copies, the popup's resizing and the arrow. Start it, then move.
 */
const sampleSwap = (page: Page, ms = 700) =>
  page.evaluate(
    (ms) =>
      new Promise<SwapFrame[]>((resolve) => {
        const read = (el: HTMLElement): Layer => {
          const translate = /translate\(([-\d.e]+)px, ([-\d.e]+)px\)/.exec(
            el.style.transform,
          );
          const blur = /blur\(([\d.e]+)px\)/.exec(el.style.filter);
          const text = el.firstElementChild as HTMLElement | null;
          return {
            text: el.textContent ?? '',
            x: translate ? Number(translate[1]) : 0,
            y: translate ? Number(translate[2]) : 0,
            opacity: Number(getComputedStyle(el).opacity),
            blur: blur ? Number(blur[1]) : 0,
            textScaleX: text
              ? text.getBoundingClientRect().width /
                Number.parseFloat(getComputedStyle(text).width)
              : 1,
          };
        };
        const frames: SwapFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const popup = document.querySelector<HTMLElement>(
            '[data-slot="tooltip-content"]',
          );
          const layer = document.querySelector<HTMLElement>(
            '[data-slot="tooltip-content-layer"]',
          );
          if (popup && layer) {
            const arrows = document.querySelectorAll<SVGElement>(
              '[data-slot="tooltip-arrow"]',
            );
            const arrow = arrows[0];
            frames.push({
              t: performance.now() - t0,
              layer: { ...read(layer), clip: layer.style.clipPath },
              copies: [
                ...document.querySelectorAll<HTMLElement>(
                  '[data-tooltip-leaving]',
                ),
              ].map(read),
              popupScaleX:
                popup.getBoundingClientRect().width / popup.offsetWidth,
              arrows: {
                count: arrows.length,
                opacity: arrow ? Number(getComputedStyle(arrow).opacity) : 0,
                filter: arrow ? getComputedStyle(arrow).filter : '',
                inLayer: !!arrow && layer.contains(arrow),
              },
            });
          }
          if (performance.now() - t0 < ms) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    ms,
  );

/** Hovers `name`, and waits for the popup to rest there. */
const rest = async (page: Page, name: string) => {
  await trigger(page, name).hover();
  await expect(page.getByRole('tooltip')).toContainText(name);
  await expect(page.locator(CONTENT)).toHaveCSS('transform', 'none');
  await page.waitForTimeout(300);
};

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/tooltip', { waitUntil: 'networkidle' });

const trigger = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

/** Horizontal center of the popup as drawn (its layout animation included). */
const contentX = (page: Page) =>
  page.locator(CONTENT).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.left + rect.width / 2;
  });

test.describe('animate-ui tooltip', () => {
  test.describe.configure({ timeout: 180_000 });
  test('opens on hover after the delay, described by the trigger', async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator(CONTENT)).toHaveCount(0);
    await trigger(page, 'Bold').hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Bold');
    const id = await tooltip.getAttribute('id');
    expect(id).toBeTruthy();
    await expect(trigger(page, 'Bold')).toHaveAttribute(
      'aria-describedby',
      id!,
    );
    await expect(trigger(page, 'Bold')).toHaveAttribute('data-state', 'open');
  });

  test('grows from 0.7 out of its trigger, then settles', async ({ page }) => {
    await open(page);
    const frames = page.evaluate(
      (selector) =>
        new Promise<{ scale: number; y: number; opacity: number }[]>(
          (resolve) => {
            const seen: { scale: number; y: number; opacity: number }[] = [];
            const t0 = performance.now();
            const tick = () => {
              const el = document.querySelector(selector);
              if (el) {
                const m = new DOMMatrix(getComputedStyle(el).transform);
                seen.push({
                  scale: m.a,
                  y: m.f,
                  opacity: Number(getComputedStyle(el).opacity),
                });
              }
              if (performance.now() - t0 < 1200) requestAnimationFrame(tick);
              else resolve(seen);
            };
            tick();
          },
        ),
      CONTENT,
    );
    await trigger(page, 'Bold').hover();
    const seen = await frames;
    // From 0.7, in place (like the library tooltips: no slide).
    expect(seen[0]!.scale).toBeGreaterThanOrEqual(0.69);
    expect(seen[0]!.scale).toBeLessThan(0.85);
    expect(seen[0]!.y).toBe(0);
    expect(seen[0]!.opacity).toBeLessThan(1);
    // On its spring (400/31): past full size by its overshoot over that
    // 0.3 travel (frames may miss the very peak), then back.
    const overshoot = overshootOf(TOOLTIP_SPRING);
    const peak = Math.max(...seen.map((f) => f.scale));
    expect(peak).toBeGreaterThan(1 + 0.3 * overshoot * 0.7);
    expect(peak).toBeLessThan(1 + 0.3 * overshoot + 0.003);
    expect(seen.every((f) => f.y === 0)).toBe(true);
    const last = seen.at(-1)!;
    expect(last.opacity).toBe(1);
    expect(last.scale).toBeCloseTo(1, 2);
  });

  test('the arrow stays under the popup from its first frame', async ({
    page,
  }) => {
    await open(page);
    // Popup and arrow centers on every frame of the entrance: the arrow
    // never flies in from where Floating UI first renders the popup.
    const frames = page.evaluate(
      () =>
        new Promise<{ dx: number; gap: number; opacity: number }[]>(
          (resolve) => {
            const seen: { dx: number; gap: number; opacity: number }[] = [];
            const t0 = performance.now();
            const tick = () => {
              const content = document.querySelector(
                '[data-slot="tooltip-content"]',
              );
              const arrow = document.querySelector(
                '[data-slot="tooltip-arrow"]',
              );
              if (content && arrow) {
                const c = content.getBoundingClientRect();
                const a = arrow.getBoundingClientRect();
                seen.push({
                  dx: a.left + a.width / 2 - (c.left + c.width / 2),
                  gap: a.top - c.bottom,
                  opacity: Number(getComputedStyle(content).opacity),
                });
              }
              if (performance.now() - t0 < 900) requestAnimationFrame(tick);
              else resolve(seen);
            };
            tick();
          },
        ),
    );
    await trigger(page, 'Bold').hover();
    const visible = (await frames).filter((f) => f.opacity > 0.02);
    expect(visible.length).toBeGreaterThan(5);
    for (const frame of visible) {
      expect(Math.abs(frame.dx)).toBeLessThan(2);
      expect(Math.abs(frame.gap)).toBeLessThan(3);
    }
  });

  test('grows from the point facing its trigger', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.locator(CONTENT)).toBeVisible();
    // Side "top", centered: its bottom center, towards the trigger.
    const origin = await page.locator(CONTENT).evaluate((el) => {
      const [x = 0, y = 0] = getComputedStyle(el)
        .transformOrigin.split(' ')
        .map((v) => Number.parseFloat(v));
      const { offsetWidth: w, offsetHeight: h } = el as HTMLElement;
      return { x: x / w, y: y / h };
    });
    expect(origin.x).toBeCloseTo(0.5, 1);
    expect(origin.y).toBeCloseTo(1, 1);
  });

  test('closes back into its trigger the same way', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.waitForTimeout(900);
    const frames = page.evaluate(
      (selector) =>
        new Promise<{ scale: number; y: number }[]>((resolve) => {
          const seen: { scale: number; y: number }[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = document.querySelector(selector);
            if (el) {
              const m = new DOMMatrix(getComputedStyle(el).transform);
              seen.push({ scale: m.a, y: m.f });
            }
            if (el && performance.now() - t0 < 2000)
              requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
      CONTENT,
    );
    await page.mouse.move(5, 5);
    const seen = await frames;
    // Shrinks back to 0.7 towards its trigger before it unmounts.
    expect(Math.min(...seen.map((f) => f.scale))).toBeLessThan(0.75);
    await expect(page.locator(CONTENT)).toHaveCount(0);
  });

  test('moving to the next trigger glides the same popup', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.getByRole('tooltip')).toContainText('Bold');
    // Settled: Motion drops the transform once the spring rests.
    await expect(page.locator(CONTENT)).toHaveCSS('transform', 'none');
    const from = await contentX(page);

    // Its center on every frame of the glide.
    const glide = page.evaluate(
      (selector) =>
        new Promise<number[]>((resolve) => {
          const centers: number[] = [];
          const t0 = performance.now();
          const tick = () => {
            const rect = document
              .querySelector(selector)!
              .getBoundingClientRect();
            centers.push(rect.left + rect.width / 2);
            if (performance.now() - t0 < 1000) requestAnimationFrame(tick);
            else resolve(centers);
          };
          tick();
        }),
      CONTENT,
    );
    await trigger(page, 'Insert link').hover();
    await expect(page.getByRole('tooltip')).toContainText('Insert link');
    // One popup all along: it moved instead of closing and reopening.
    await expect(page.locator(CONTENT)).toHaveCount(1);
    await expect(page.locator(CONTENT)).toHaveAttribute('data-state', 'open');
    const centers = await glide;
    await expect(page.locator(CONTENT)).toHaveCSS('transform', 'none');
    const to = await contentX(page);
    expect(to - from).toBeGreaterThan(100);
    // On the same spring: a little past the new trigger, by the spring's
    // overshoot of the distance, then back.
    const expected = overshootOf(TOOLTIP_SPRING) * (to - from);
    const past = Math.max(...centers) - to;
    expect(past).toBeGreaterThan(expected * 0.7);
    expect(past).toBeLessThan(expected + 1);
  });

  test('closes after the pointer leaves, and with Escape', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(page.locator(CONTENT)).toHaveCount(0);
    await expect(trigger(page, 'Bold')).toHaveAttribute('data-state', 'closed');

    await trigger(page, 'Italic').hover();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(CONTENT)).toHaveCount(0);
  });

  test('opens on keyboard focus', async ({ page }) => {
    await open(page);
    await trigger(page, 'Underline').focus();
    await expect(page.getByRole('tooltip')).toContainText('Underline');
  });

  test('reduced motion: no scaling, still fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const probe = await probeFirstFrame(page, CONTENT);
    await trigger(page, 'Bold').hover();
    const first = await probe.firstFrame();
    expect(first.scale).toBeCloseTo(1, 3);
    expect(first.opacity).toBeLessThan(1);
  });

  test.describe('content swap', () => {
    test('the previous content leaves to the left, the next comes from the right', async ({
      page,
    }) => {
      await open(page);
      await rest(page, 'Bold');
      const sampling = sampleSwap(page);
      await trigger(page, 'Italic').hover();
      const frames = await sampling;
      const swapping = frames.filter((f) => f.layer.text.includes('Italic'));
      expect(swapping.length).toBeGreaterThan(5);
      const first = swapping[0]!;

      // The next one, from the right (the way the popup goes), out of the
      // blur, faded out: on its first frame it has barely moved.
      expect(first.layer.x).toBeGreaterThan(SHIFT * 0.5);
      expect(first.layer.x).toBeLessThanOrEqual(SHIFT + 0.01);
      expect(first.layer.y).toBe(0);
      expect(first.layer.blur).toBeGreaterThan(BLUR * 0.5);
      expect(first.layer.opacity).toBeLessThan(0.5);
      // The previous one, copied as it showed, leaving to the left into the
      // blur as it fades out.
      expect(first.copies).toHaveLength(1);
      expect(first.copies[0]!.text).toContain('Bold');
      expect(first.copies[0]!.opacity).toBeGreaterThan(0.5);
      const copies = swapping.flatMap((f) => f.copies);
      expect(Math.min(...copies.map((c) => c.x))).toBeLessThan(-SHIFT * 0.6);
      expect(Math.min(...copies.map((c) => c.x))).toBeGreaterThanOrEqual(
        -SHIFT - 0.01,
      );
      expect(Math.max(...copies.map((c) => c.blur))).toBeGreaterThan(
        BLUR * 0.6,
      );
      // Every frame, the next one moves toward rest, never back.
      for (let i = 1; i < swapping.length; i++) {
        expect(swapping[i]!.layer.x).toBeLessThanOrEqual(
          swapping[i - 1]!.layer.x + 0.01,
        );
        expect(swapping[i]!.layer.opacity).toBeGreaterThanOrEqual(
          swapping[i - 1]!.layer.opacity - 0.01,
        );
      }
      // On the tab panels' timings: the copy is gone after its 0.15s, and
      // the next one rests (its styles dropped) after its 0.4s.
      const gone = swapping.find((f) => f.copies.length === 0)!;
      expect(gone.t - first.t).toBeGreaterThan(OUT * 1000 * 0.7);
      expect(gone.t - first.t).toBeLessThan(OUT * 1000 + 120);
      const last = frames.at(-1)!;
      expect(last.layer).toMatchObject({ x: 0, y: 0, opacity: 1, blur: 0 });
      expect(last.layer.clip).toBe('');
    });

    test('going to a trigger on the left, it comes from the left', async ({
      page,
    }) => {
      await open(page);
      await rest(page, 'Insert link');
      const sampling = sampleSwap(page);
      await trigger(page, 'Strikethrough').hover();
      const frames = (await sampling).filter((f) => f.copies.length);
      expect(frames[0]!.layer.x).toBeLessThan(-SHIFT * 0.5);
      expect(
        Math.max(...frames.flatMap((f) => f.copies.map((c) => c.x))),
      ).toBeGreaterThan(SHIFT * 0.6);
    });

    test('no text is stretched while the popup resizes, and it is clipped by it', async ({
      page,
    }) => {
      await open(page);
      await rest(page, 'Bold');
      const sampling = sampleSwap(page);
      await trigger(page, 'Strikethrough').hover();
      const frames = await sampling;
      // The popup does resize, by its layout animation's scale…
      const resizing = frames.filter((f) => Math.abs(f.popupScaleX - 1) > 0.05);
      expect(resizing.length).toBeGreaterThan(3);
      expect(resizing.some((f) => f.copies.length > 0)).toBe(true);
      // …and neither content is ever stretched by it.
      for (const frame of frames) {
        expect(frame.layer.textScaleX).toBeCloseTo(1, 2);
        for (const copy of frame.copies)
          expect(copy.textScaleX).toBeCloseTo(1, 2);
      }
      // The wider label, shown at its size in a popup still narrower, is
      // clipped by it.
      expect(resizing.every((f) => f.layer.clip.startsWith('inset('))).toBe(
        true,
      );
    });

    test('the arrow glides with the popup, never with the content', async ({
      page,
    }) => {
      await open(page);
      await rest(page, 'Bold');
      const sampling = sampleSwap(page);
      await trigger(page, 'Underline').hover();
      const frames = await sampling;
      expect(frames.some((f) => f.copies.length > 0)).toBe(true);
      for (const { arrows } of frames) {
        expect(arrows).toEqual({
          count: 1,
          opacity: 1,
          filter: 'none',
          inLayer: false,
        });
      }
    });

    test('back and forth: a content coming back resumes from where it is', async ({
      page,
    }) => {
      await open(page);
      await rest(page, 'Bold');
      const center = async (name: string) => {
        const box = (await trigger(page, name).boundingBox())!;
        return [box.x + box.width / 2, box.y + box.height / 2] as const;
      };
      const bold = await center('Bold');
      const italic = await center('Italic');
      const sampling = sampleSwap(page, 900);
      await page.mouse.move(...italic);
      await page.waitForTimeout(50);
      await page.mouse.move(...bold);
      const frames = await sampling;
      const away = frames.findIndex((f) => f.layer.text.includes('Italic'));
      const back = frames.findIndex(
        (f, i) => i > away && f.layer.text.includes('Bold'),
      );
      expect(away).toBeGreaterThan(-1);
      expect(back).toBeGreaterThan(away);
      // Never two of the same content, never the shown one leaving too.
      for (const frame of frames) {
        expect(frame.copies.length).toBeLessThanOrEqual(1);
        for (const copy of frame.copies)
          expect(copy.text).not.toBe(frame.layer.text);
      }
      // "Bold" takes over from its copy as it showed, a frame later: it
      // doesn't start over (faded out, from the right), it goes on from the
      // left, partly faded, by no more than a frame of its swap.
      const leaving = frames[back - 1]!.copies.find((c) =>
        c.text.includes('Bold'),
      )!;
      expect(leaving).toBeTruthy();
      expect(leaving.opacity).toBeGreaterThan(0.02);
      expect(leaving.opacity).toBeLessThan(0.95);
      const resumed = frames[back]!.layer;
      expect(Math.abs(resumed.opacity - leaving.opacity)).toBeLessThan(0.25);
      expect(resumed.x).toBeLessThan(0);
      expect(Math.abs(resumed.x - leaving.x)).toBeLessThan(SHIFT * 0.3);
      // And what was coming in leaves from where it was: one copy, "Italic".
      expect(frames[back]!.copies.map((c) => c.text)).toEqual([
        expect.stringContaining('Italic'),
      ]);
      const last = frames.at(-1)!;
      expect(last.layer.text).toContain('Bold');
      expect(last.layer).toMatchObject({ x: 0, opacity: 1, blur: 0 });
      expect(last.copies).toHaveLength(0);
    });

    test('not on the first open, nor on the close', async ({ page }) => {
      await open(page);
      const opening = sampleSwap(page, 600);
      await trigger(page, 'Bold').hover();
      const opened = await opening;
      expect(opened.length).toBeGreaterThan(10);
      for (const frame of opened) {
        expect(frame.copies).toHaveLength(0);
        expect(frame.layer).toMatchObject({ x: 0, y: 0, blur: 0 });
        expect(frame.layer.clip).toBe('');
      }
      await page.waitForTimeout(300);
      const closing = sampleSwap(page, 600);
      await page.mouse.move(5, 5);
      const closed = await closing;
      expect(closed.length).toBeGreaterThan(3);
      for (const frame of closed) {
        expect(frame.copies).toHaveLength(0);
        expect(frame.layer).toMatchObject({ x: 0, y: 0, blur: 0 });
      }
    });

    test('stacked triggers: the content comes from below or above', async ({
      page,
    }) => {
      await page.goto('/tests/fixtures/animate-ui-tooltip', {
        waitUntil: 'networkidle',
      });
      await rest(page, 'First');
      let sampling = sampleSwap(page);
      await trigger(page, 'Third').hover();
      let frames = (await sampling).filter((f) => f.copies.length);
      expect(frames[0]!.layer.x).toBe(0);
      expect(frames[0]!.layer.y).toBeGreaterThan(SHIFT * 0.5);
      expect(
        Math.min(...frames.flatMap((f) => f.copies.map((c) => c.y))),
      ).toBeLessThan(-SHIFT * 0.6);

      await page.waitForTimeout(500);
      sampling = sampleSwap(page);
      await trigger(page, 'Second').hover();
      frames = (await sampling).filter((f) => f.copies.length);
      expect(frames[0]!.layer.y).toBeLessThan(-SHIFT * 0.5);
    });

    test('asChild: the content swaps inside the child', async ({ page }) => {
      await page.goto('/tests/fixtures/animate-ui-tooltip', {
        waitUntil: 'networkidle',
      });
      await rest(page, 'Alpha');
      const popup = page.getByTestId('as-child');
      await expect(popup).toHaveAttribute('role', 'tooltip');
      // The child is the popup; the layer, the arrow and the copies' box are
      // its children.
      await expect(
        popup.locator('> [data-slot="tooltip-content-layer"]'),
      ).toHaveText('Alpha as child');
      await expect(popup.locator('> [data-slot="tooltip-arrow"]')).toHaveCount(
        1,
      );
      const sampling = sampleSwap(page);
      await trigger(page, 'Beta').hover();
      const frames = (await sampling).filter((f) => f.copies.length);
      expect(frames.length).toBeGreaterThan(2);
      expect(frames[0]!.copies[0]!.text).toBe('Alpha as child');
      expect(frames[0]!.layer.x).toBeGreaterThan(SHIFT * 0.5);
    });

    test('reduced motion: the content changes at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await rest(page, 'Bold');
      const sampling = sampleSwap(page, 500);
      await trigger(page, 'Italic').hover();
      const frames = await sampling;
      expect(frames.length).toBeGreaterThan(10);
      expect(frames.some((f) => f.layer.text.includes('Italic'))).toBe(true);
      for (const frame of frames) {
        expect(frame.copies).toHaveLength(0);
        expect(frame.layer).toMatchObject({ x: 0, y: 0, opacity: 1, blur: 0 });
      }
    });
  });
});
