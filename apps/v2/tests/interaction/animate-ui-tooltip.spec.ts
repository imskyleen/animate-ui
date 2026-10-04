import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame } from './motion-probe';

const CONTENT = '[data-slot="tooltip-content"]';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/tooltip', { waitUntil: 'networkidle' });

const trigger = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

const contentX = (page: Page) =>
  page
    .locator(CONTENT)
    .evaluate(
      (el) =>
        el.getBoundingClientRect().left + (el as HTMLElement).offsetWidth / 2,
    );

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

  test('grows from nothing, rising out of its trigger, then settles', async ({
    page,
  }) => {
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
    // v1: from scale 0 and 15px below (side "top"), on a critically damped
    // spring (stiffness 300, damping 35): no overshoot.
    expect(seen[0]!.scale).toBeLessThan(0.3);
    expect(seen[0]!.y).toBeGreaterThan(5);
    expect(seen[0]!.opacity).toBeLessThan(1);
    expect(Math.max(...seen.map((f) => f.scale))).toBeLessThanOrEqual(1.001);
    const last = seen.at(-1)!;
    expect(last.opacity).toBe(1);
    expect(last.scale).toBeCloseTo(1, 2);
    expect(Math.abs(last.y)).toBeLessThan(0.5);
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
    // Shrinks towards nothing and sinks back down before it unmounts.
    expect(Math.min(...seen.map((f) => f.scale))).toBeLessThan(0.2);
    expect(Math.max(...seen.map((f) => f.y))).toBeGreaterThan(10);
    await expect(page.locator(CONTENT)).toHaveCount(0);
  });

  test('moving to the next trigger glides the same popup', async ({ page }) => {
    await open(page);
    await trigger(page, 'Bold').hover();
    await expect(page.getByRole('tooltip')).toContainText('Bold');
    await page.waitForTimeout(800);
    const from = await contentX(page);

    await trigger(page, 'Insert link').hover();
    await expect(page.getByRole('tooltip')).toContainText('Insert link');
    // One popup all along: it moved instead of closing and reopening.
    await expect(page.locator(CONTENT)).toHaveCount(1);
    await expect(page.locator(CONTENT)).toHaveAttribute('data-state', 'open');
    await page.waitForTimeout(800);
    const to = await contentX(page);
    expect(to - from).toBeGreaterThan(100);
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
