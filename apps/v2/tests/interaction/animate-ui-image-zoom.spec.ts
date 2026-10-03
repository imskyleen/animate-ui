import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/image-zoom', { waitUntil: 'networkidle' });

const container = (page: Page) =>
  page.getByRole('img', { name: 'Black porcelain mug, zoomable' });

const scale = (page: Page) =>
  container(page).evaluate((el) => {
    const t = getComputedStyle(el.firstElementChild!).transform;
    const m = t.match(/matrix\(([^,]+)/);
    return m ? Number(m[1]) : 1;
  });

test.describe('animate-ui image zoom', () => {
  test('hovering zooms in from the pointer, leaving zooms out', async ({
    page,
  }) => {
    await open(page);
    const box = (await container(page).boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + 50);
    await page.mouse.move(box.x + 50, box.y + 60);
    await expect.poll(() => scale(page)).toBeGreaterThan(2.9);
    const origin = await container(page).evaluate(
      (el) => (el.firstElementChild as HTMLElement).style.transformOrigin,
    );
    expect(origin).toBe('50px 60px');
    await page.mouse.move(box.x - 40, box.y - 40);
    await expect.poll(() => scale(page)).toBe(1);
  });

  test('the cursor tells whether a click zooms in or out', async ({ page }) => {
    await open(page);
    await expect(container(page)).toHaveCSS('cursor', 'zoom-in');
    const box = (await container(page).boundingBox())!;
    await page.mouse.move(box.x + 20, box.y + 20);
    await expect(container(page)).toHaveCSS('cursor', 'zoom-out');
  });

  test('reduced motion: the zoom jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await container(page).boundingBox())!;
    await page.mouse.move(box.x + 40, box.y + 50);
    await page.waitForTimeout(60);
    expect(await scale(page)).toBe(3);
  });
});
