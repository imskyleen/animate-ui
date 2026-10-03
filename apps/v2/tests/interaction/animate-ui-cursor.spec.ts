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
    await page.mouse.move(box.x + 160, box.y + 120, { steps: 2 });
    const c = await center(page, '[data-slot="cursor"]');
    expect(Math.abs(c.x - (box.x + 160))).toBeLessThan(1.5);
    expect(Math.abs(c.y - (box.y + 120))).toBeLessThan(1.5);
    // The label settles below and to the right of the pointer.
    await expect
      .poll(async () => (await center(page, '[data-slot="cursor-follow"]')).y)
      .toBeGreaterThan(box.y + 120);
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
    // Mid-way: it has started but not caught up with the 200px move.
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
