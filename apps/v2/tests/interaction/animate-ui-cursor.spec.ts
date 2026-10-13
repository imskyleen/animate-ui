import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/cursor', { waitUntil: 'networkidle' });

const area = (page: Page) =>
  page.getByText('Move your pointer over this area').locator('..');
const cursor = (page: Page) => page.locator('[data-slot="cursor"]');
const follow = (page: Page) => page.locator('[data-slot="cursor-follow"]');

const center = async (page: Page, selector: string) => {
  const box = (await page.locator(selector).boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

const scales = (page: Page, ms: number) =>
  page.evaluate(async (ms) => {
    const values: number[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < ms) {
      await new Promise((r) => requestAnimationFrame(r));
      const el = document.querySelector('[data-slot="cursor"]');
      if (el) values.push(new DOMMatrix(getComputedStyle(el).transform).a);
    }
    return values;
  }, ms);

test.describe('animate-ui cursor', () => {
  test('hidden until the pointer enters the area', async ({ page }) => {
    await open(page);
    await expect(cursor(page)).toHaveCount(0);
    await expect(follow(page)).toHaveCount(0);
  });

  test('replaces the pointer inside the area and follows it', async ({
    page,
  }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    await page.mouse.move(box.x + 100, box.y + 80, { steps: 2 });
    await expect(cursor(page)).toBeVisible();
    await expect(follow(page)).toBeVisible();
    await expect(area(page)).toHaveClass(/animate-ui-cursor-none/);
    await expect(area(page)).toHaveCSS('cursor', 'none');
    await expect
      .poll(() =>
        cursor(page).evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).a,
        ),
      )
      .toBe(1);
    await page.mouse.move(box.x + 160, box.y + 120, { steps: 2 });
    await expect
      .poll(async () => {
        const c = (await cursor(page).boundingBox())!;
        return [Math.round(c.x - box.x), Math.round(c.y - box.y)];
      })
      .toEqual([160, 120]);
    await expect
      .poll(async () => {
        const f = (await follow(page).boundingBox())!;
        return [Math.round(f.x - box.x), Math.round(f.y - box.y)];
      })
      .toEqual([160 + 5 + 12, 120 + 15 + 12]);
  });

  test('the cursor pops in on a spring', async ({ page }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    const sampling = scales(page, 600);
    await page.mouse.move(box.x + 100, box.y + 80);
    const values = await sampling;
    expect(Math.min(...values)).toBeLessThan(0.9);
    expect(Math.max(...values)).toBeGreaterThan(1.03);
    expect(values.at(-1)).toBeCloseTo(1, 2);
  });

  test('leaving the area restores the pointer', async ({ page }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    await page.mouse.move(box.x + 100, box.y + 80, { steps: 2 });
    await expect(cursor(page)).toBeVisible();
    await page.mouse.move(box.x - 50, box.y - 50, { steps: 2 });
    await expect(cursor(page)).toHaveCount(0);
    await expect(follow(page)).toHaveCount(0);
    await expect(area(page)).not.toHaveClass(/animate-ui-cursor-none/);
  });

  test('the follower lags behind on a spring', async ({ page }) => {
    await open(page);
    const box = (await area(page).boundingBox())!;
    await page.mouse.move(box.x + 60, box.y + 60, { steps: 2 });
    await expect(follow(page)).toBeVisible();
    await page.waitForTimeout(700);
    const before = await center(page, '[data-slot="cursor-follow"]');
    await page.mouse.move(box.x + 260, box.y + 60);
    await page.waitForTimeout(30);
    const during = await center(page, '[data-slot="cursor-follow"]');
    expect(during.x - before.x).toBeLessThan(190);
  });

  test('reduced motion: the follower sticks to the pointer', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await area(page).boundingBox())!;
    await page.mouse.move(box.x + 60, box.y + 60, { steps: 2 });
    await expect(follow(page)).toBeVisible();
    await page.waitForTimeout(400);
    const before = await center(page, '[data-slot="cursor-follow"]');
    await page.mouse.move(box.x + 260, box.y + 60);
    await page.waitForTimeout(30);
    const after = await center(page, '[data-slot="cursor-follow"]');
    expect(Math.abs(after.x - before.x - 200)).toBeLessThan(1.5);
  });
});
