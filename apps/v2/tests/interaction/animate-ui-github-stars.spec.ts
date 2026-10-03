import { expect, test, type Page } from '@playwright/test';

// The GitHub API is mocked: tests never depend on the network.
const mockStars = (page: Page, stars: number, delay = 0) =>
  page.route(
    'https://api.github.com/repos/imskyleen/animate-ui',
    async (route) => {
      if (delay) await new Promise((r) => setTimeout(r, delay));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ stargazers_count: stars }),
      });
    },
  );

const open = (page: Page) =>
  page.goto('/tests/fixtures/animate-ui-github-stars', {
    waitUntil: 'networkidle',
  });

const srNumber = (page: Page) =>
  page.locator('[data-slot="sliding-number"] .sr-only');

test.describe('animate-ui github stars', () => {
  test('fetches the stars and counts up to them', async ({ page }) => {
    await mockStars(page, 1234);
    await open(page);
    await expect(page.getByRole('img', { name: 'GitHub' })).toBeVisible();
    await expect(srNumber(page)).toHaveText(/1,?234/);
  });

  test('empty while loading', async ({ page }) => {
    await mockStars(page, 1234, 1500);
    await page.goto('/tests/fixtures/animate-ui-github-stars');
    const root = page.locator('[aria-busy="true"]');
    await expect(root).toHaveCount(1);
    await expect(page.getByRole('img', { name: 'GitHub' })).toHaveCount(0);
    await expect(page.getByRole('img', { name: 'GitHub' })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
  });

  test('the star fills as the count climbs', async ({ page }) => {
    await mockStars(page, 1234);
    await open(page);
    // The filled copy of the icon is clipped from the top until complete.
    const filled = page.locator('svg[style*="clip-path"]');
    await expect
      .poll(() => filled.evaluate((el) => getComputedStyle(el).clipPath))
      .toMatch(/inset\(0(px|%)?( 0(px|%)?)*\)/);
  });
});
