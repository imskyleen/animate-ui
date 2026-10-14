import { expect, test, type Page } from '../test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/shine', { waitUntil: 'networkidle' });

const button = (page: Page) =>
  page.getByRole('button', { name: 'Get started' });
const overlay = (page: Page) =>
  button(page).locator('div[style*="linear-gradient"]');

const position = (page: Page) =>
  overlay(page).evaluate((el) => {
    const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
    const tx = m ? Number(m[1]!.split(',')[4]) : 0;
    return (tx / el.getBoundingClientRect().width) * 100;
  });

test.describe('animate-ui shine', () => {
  test('the shine sweeps across, clipped to the button', async ({ page }) => {
    await open(page);
    await expect(overlay(page)).toHaveCount(1);
    await expect(button(page)).toHaveCSS('overflow', 'hidden');
    await expect(overlay(page)).toHaveCSS('pointer-events', 'none');
    const samples = new Set<number>();
    for (let i = 0; i < 8; i++) {
      samples.add(Math.round(await position(page)));
      await page.waitForTimeout(120);
    }
    expect(samples.size).toBeGreaterThan(2);
  });

  test('with loop, it sweeps again', async ({ page }) => {
    await open(page);
    await expect
      .poll(() => position(page), { timeout: 4000 })
      .toBeLessThan(-80);
    await expect
      .poll(() => position(page), { timeout: 4000 })
      .toBeGreaterThan(-50);
  });

  test('reduced motion: no shine', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await expect(button(page)).toBeVisible();
    await expect(overlay(page)).toHaveCount(0);
  });
});
