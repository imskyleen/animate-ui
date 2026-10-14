import { expect, test, type Page } from '../test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/spring', { waitUntil: 'networkidle' });

const handle = (page: Page) => page.getByLabel('Drag me');
const path = (page: Page) => page.locator('svg[width="100vw"] path');

const offset = (page: Page) =>
  handle(page).evaluate((el) => {
    const m = getComputedStyle(el.parentElement!).transform.match(
      /matrix\(([^)]+)\)/,
    );
    const v = m ? m[1]!.split(',').map(Number) : [1, 0, 0, 1, 0, 0];
    return Math.hypot(v[4]!, v[5]!);
  });

const drag = async (page: Page) => {
  const box = (await handle(page).boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 60, y + 40, { steps: 5 });
  await page.mouse.move(x + 150, y + 100, { steps: 10 });
};

test.describe('animate-ui spring', () => {
  test('at rest, no coil is drawn', async ({ page }) => {
    await open(page);
    await expect(path(page)).toHaveAttribute('d', /^M[\d.]+,[\d.]+$/);
  });

  test('dragging stretches a coil, release springs back', async ({ page }) => {
    await open(page);
    await drag(page);
    await expect.poll(() => offset(page)).toBeGreaterThan(30);
    await expect(path(page)).toHaveAttribute('d', /C/);
    await expect(page.locator('body')).toHaveCSS('cursor', 'grabbing');
    await page.mouse.up();
    await page.waitForTimeout(50);
    expect(await offset(page)).toBeGreaterThan(1);
    await expect.poll(() => offset(page), { timeout: 5000 }).toBeLessThan(0.5);
    await expect(page.locator('body')).not.toHaveCSS('cursor', 'grabbing');
  });

  test('reduced motion: back in place at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await drag(page);
    await expect.poll(() => offset(page)).toBeGreaterThan(30);
    await page.mouse.up();
    await page.waitForTimeout(50);
    expect(await offset(page)).toBeLessThan(0.5);
  });
});
