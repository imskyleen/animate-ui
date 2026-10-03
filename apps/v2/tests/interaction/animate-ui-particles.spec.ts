import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/particles', { waitUntil: 'networkidle' });

const particles = (page: Page) =>
  page.locator('.size-1.rounded-full.bg-red-500');

test.describe('animate-ui particles', () => {
  test('nothing bursts until triggered', async ({ page }) => {
    await open(page);
    await expect(particles(page)).toHaveCount(0);
  });

  test('a like bursts the particles, which fade out', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Like' }).click();
    await expect(particles(page)).toHaveCount(6);
    await expect
      .poll(() =>
        particles(page).evaluateAll((els) =>
          els.map((el) => Number(getComputedStyle(el).opacity)),
        ),
      )
      .toEqual([0, 0, 0, 0, 0, 0]);
    // The button reports its pressed state.
    await expect(page.getByRole('button', { name: 'Liked' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('reduced motion: no burst', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Like' }).click();
    await page.waitForTimeout(100);
    await expect(particles(page)).toHaveCount(0);
  });
});
