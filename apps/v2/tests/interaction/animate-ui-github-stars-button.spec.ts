import { expect, test, type Page } from '@playwright/test';

import { sample } from './motion-probe';

const SELECTOR = '[data-slot="github-stars-button"]';

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

const open = async (page: Page) => {
  await page.goto('/tests/fixtures/animate-ui-github-stars-button', {
    waitUntil: 'networkidle',
  });
  await hydrated(page, SELECTOR);
};

/** Resolves once React has hydrated `selector`: its handlers and effects are live. */
async function hydrated(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return (
      !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
    );
  }, selector);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

const button = (page: Page) => page.locator(SELECTOR);
const srNumber = (page: Page) =>
  button(page).locator('[data-slot="sliding-number"] .sr-only');
const filledStar = (page: Page) =>
  button(page).locator('svg[style*="clip-path"]');

test.describe('animate-ui github stars button', () => {
  test("the demo's star has no outline of its own: stroked like it's filled", async ({
    page,
  }) => {
    // Hugeicons strokes its paths in currentColor: left alone, the star had
    // a black (or white) border around its gray or yellow fill.
    await page.goto('/tests/demos/animate-ui/github-stars-button', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3500);
    const paths = await page.evaluate(() =>
      [...document.querySelectorAll('svg path[stroke="currentColor"]')]
        .filter((p) => getComputedStyle(p).fill !== 'none')
        .map((p) => {
          const cs = getComputedStyle(p);
          return { stroke: cs.stroke, fill: cs.fill };
        }),
    );
    expect(paths.length).toBeGreaterThan(1);
    for (const p of paths) expect(p.stroke).toBe(p.fill);
  });
  test('shows up once the stars are loaded, as a link to the repository', async ({
    page,
  }) => {
    await mockStars(page, 1234, 1200);
    await page.goto('/tests/fixtures/animate-ui-github-stars-button');
    await page.waitForTimeout(400);
    await expect(button(page)).toHaveCount(0);
    await expect(button(page)).toBeVisible({ timeout: 5000 });
    await expect(button(page)).toHaveAttribute(
      'href',
      'https://github.com/imskyleen/animate-ui',
    );
    await expect(
      button(page).getByRole('img', { name: 'GitHub' }),
    ).toBeVisible();
  });

  test('counts up to the stars, fills the star, then bursts', async ({
    page,
  }) => {
    await mockStars(page, 1234);
    await open(page);
    await expect(srNumber(page)).toHaveText(/1,?234/);
    // The filled copy of the star is clipped from the top until complete.
    await expect
      .poll(() =>
        filledStar(page).evaluate((el) => getComputedStyle(el).clipPath),
      )
      .toMatch(/inset\(0(px|%)?( 0(px|%)?)*\)/);
    // Completed: the particles burst around the star.
    await expect
      .poll(() =>
        button(page)
          .locator('div.text-yellow-500[style*="border-radius"]')
          .count(),
      )
      .toBe(6);
  });

  test('with a fixed value, counts up to it without a request', async ({
    page,
  }) => {
    let requests = 0;
    await page.route('https://api.github.com/**', (route) => {
      requests++;
      return route.abort();
    });
    await page.goto('/tests/demos/animate-ui/github-stars-button', {
      waitUntil: 'networkidle',
    });
    await expect(srNumber(page)).toHaveText(/3,?200/);
    expect(requests).toBe(0);
  });

  test('stays put on hover, shrinks while pressed', async ({ page }) => {
    await mockStars(page, 1234);
    await open(page);
    // Let the count settle first.
    await expect
      .poll(() =>
        filledStar(page).evaluate((el) => getComputedStyle(el).clipPath),
      )
      .toMatch(/inset\(0(px|%)?( 0(px|%)?)*\)/);
    // Don't follow the link when released.
    await button(page).evaluate((el) =>
      el.addEventListener('click', (e) => e.preventDefault()),
    );
    await button(page).hover();
    await page.waitForTimeout(300);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.down();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(0.97, 3);
    await page.mouse.up();
    await expect
      .poll(async () => (await sample(page, SELECTOR)).scale)
      .toBeCloseTo(1, 3);
  });

  test('reduced motion: no burst, no scale', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockStars(page, 1234);
    await open(page);
    await expect(srNumber(page)).toHaveText(/1,?234/);
    await expect
      .poll(() =>
        filledStar(page).evaluate((el) => getComputedStyle(el).clipPath),
      )
      .toMatch(/inset\(0(px|%)?( 0(px|%)?)*\)/);
    await page.waitForTimeout(200);
    await expect(
      button(page).locator('div.text-yellow-500[style*="border-radius"]'),
    ).toHaveCount(0);
    await button(page).evaluate((el) =>
      el.addEventListener('click', (e) => e.preventDefault()),
    );
    await button(page).hover();
    await page.mouse.down();
    await page.waitForTimeout(200);
    expect((await sample(page, SELECTOR)).scale).toBe(1);
    await page.mouse.up();
  });
});
