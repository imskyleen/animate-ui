import { expect, test, type Page } from '../test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/tilt', { waitUntil: 'networkidle' });

const card = (page: Page) =>
  page.getByText('Matt Mug').locator('xpath=ancestor::div[2]');

const rotated = (page: Page) =>
  card(page).evaluate((el) => {
    const t = getComputedStyle(el).transform;
    return t.startsWith('matrix3d');
  });

test.describe('animate-ui tilt', () => {
  test('tilts toward the pointer, flattens when it leaves', async ({
    page,
  }) => {
    await open(page);
    const box = (await card(page).boundingBox())!;
    await page.mouse.move(box.x + box.width - 10, box.y + 10, { steps: 3 });
    await expect.poll(() => rotated(page)).toBe(true);
    await page.mouse.move(box.x - 200, box.y - 100, { steps: 3 });
    await expect.poll(() => rotated(page), { timeout: 5000 }).toBe(false);
  });

  test('reduced motion: stays flat', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const box = (await card(page).boundingBox())!;
    await page.mouse.move(box.x + box.width - 10, box.y + 10, { steps: 3 });
    await page.waitForTimeout(200);
    expect(await rotated(page)).toBe(false);
  });
});
