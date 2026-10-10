import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame } from './motion-probe';
import { overshootOf } from './spring-curves';

const CONTENT = '[data-slot="tooltip-content"]';

/** The library tooltips' and popovers' spring, Animate UI's Tooltip's too. */
const POP_SPRING = { stiffness: 400, damping: 29 };

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
    // On the pop spring: past full size by the spring's overshoot over that
    // 0.3 travel (frames may miss the very peak), then back.
    const overshoot = overshootOf(POP_SPRING);
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
    const expected = overshootOf(POP_SPRING) * (to - from);
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
});
