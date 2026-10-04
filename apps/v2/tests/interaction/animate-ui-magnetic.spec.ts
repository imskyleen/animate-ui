import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/magnetic', { waitUntil: 'networkidle' });

const button = (page: Page) =>
  page.getByRole('button', { name: 'Come closer' });

/** The magnetic wrapper's translation. */
const offset = (page: Page) =>
  button(page).evaluate((el) => {
    const m = getComputedStyle(el.parentElement!).transform.match(
      /matrix\(([^)]+)\)/,
    );
    const v = m ? m[1]!.split(',').map(Number) : [1, 0, 0, 1, 0, 0];
    return { x: v[4]!, y: v[5]! };
  });

/** The wrapper's x offset on every frame for `ms`. */
const timeline = (page: Page, ms: number) =>
  button(page).evaluate(async (el, ms) => {
    const xs: number[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      await new Promise((r) => requestAnimationFrame(r));
      xs.push(new DOMMatrix(getComputedStyle(el.parentElement!).transform).m41);
    }
    return xs;
  }, ms);

test.describe('animate-ui magnetic', () => {
  test('pulls toward a nearby pointer, then lets go', async ({ page }) => {
    await open(page);
    const box = (await button(page).boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // Within range, to the right of and below the center.
    await page.mouse.move(cx + 60, cy + 30, { steps: 4 });
    // On a spring: it takes a moment to get there.
    await page.waitForTimeout(30);
    const early = (await offset(page)).x;
    await page.waitForTimeout(700);
    const settled = (await offset(page)).x;
    expect(settled).toBeGreaterThan(5);
    expect(early).toBeLessThan(settled - 1);
    expect((await offset(page)).y).toBeGreaterThan(0);
    // Out of range: back to rest.
    await page.mouse.move(cx + 400, cy + 300, { steps: 4 });
    await expect
      .poll(async () => {
        const { x, y } = await offset(page);
        return Math.abs(x) + Math.abs(y);
      })
      .toBeLessThan(0.5);
  });

  test('the pull: strength 0.5 within 120px, on a light bouncy spring', async ({
    page,
  }) => {
    await open(page);
    const box = (await button(page).boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const sampling = timeline(page, 900);
    await page.mouse.move(cx + 60, cy + 30);
    const xs = await sampling;
    // Pulled by (1 - distance / range) * strength of the offset: 13.2px.
    const settled = xs.at(-1)!;
    expect(settled).toBeGreaterThan(12.5);
    expect(settled).toBeLessThan(14);
    // The v1 spring (stiffness 100, damping 10, mass 0.5) overshoots a little.
    expect(Math.max(...xs)).toBeGreaterThan(settled + 0.3);
  });

  test('reduced motion: stays in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await button(page).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 10, {
      steps: 4,
    });
    await page.waitForTimeout(300);
    expect(await offset(page)).toEqual({ x: 0, y: 0 });
  });
});
