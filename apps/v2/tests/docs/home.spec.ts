import { expect, test } from '../test';

test.use({ viewport: { width: 1440, height: 900 } });

test('the intro draws the logo, then gives the page and its scroll back', async ({
  page,
}) => {
  await page.goto('/');
  const intro = page.locator('[data-slot="home-intro"]');
  await expect(intro).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe('hidden');
  await expect(intro).toHaveCount(0, { timeout: 5000 });
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe('');
  await expect(
    page.getByRole('heading', {
      name: 'Animate your shadcn/ui components in one command',
    }),
  ).toHaveCSS('opacity', '1');
});

test('scrolling through the orbit settles the cards in a playable 3-column grid', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const orbit = page.locator('[data-slot="home-orbit"]');
  const cards = page.locator('[data-slot="orbit-card"]');
  await expect(cards).toHaveCount(9);
  await orbit.evaluate((section) =>
    window.scrollTo(
      0,
      section.offsetTop + section.offsetHeight - window.innerHeight - 10,
    ),
  );
  await expect
    .poll(async () => {
      const boxes = await cards.evaluateAll((els) =>
        els.map((el) => {
          const box = el.getBoundingClientRect();
          return Math.round(box.left);
        }),
      );
      return new Set(boxes).size;
    })
    .toBe(3);
  const switches = cards.first().getByRole('switch');
  const before = await switches.first().getAttribute('aria-checked');
  await cards.first().hover();
  await switches.first().click();
  await expect(switches.first()).not.toHaveAttribute(
    'aria-checked',
    before ?? '',
  );
});

test('a hovered card stops playing by itself', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const orbit = page.locator('[data-slot="home-orbit"]');
  await orbit.evaluate((section) =>
    window.scrollTo(
      0,
      section.offsetTop + section.offsetHeight - window.innerHeight - 10,
    ),
  );
  const tabs = page
    .locator('[data-slot="orbit-card"]')
    .filter({ hasText: 'Tabs' });
  await page.waitForTimeout(800);
  await tabs.hover();
  const selected = () =>
    tabs.getByRole('tab', { selected: true }).textContent();
  const first = await selected();
  await page.waitForTimeout(3000);
  expect(await selected()).toBe(first);
  await page.mouse.move(5, 5);
  await expect.poll(selected, { timeout: 4000 }).not.toBe(first);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no intro, and the components sit still in a plain grid', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0);
    const orbit = page.locator('[data-slot="home-orbit"]');
    expect(
      await orbit.evaluate((section) => section.offsetHeight),
    ).toBeLessThan(1400);
    const tabs = page
      .locator('[data-slot="orbit-card"]')
      .filter({ hasText: 'Tabs' });
    const first = await tabs.getByRole('tab', { selected: true }).textContent();
    await page.waitForTimeout(2500);
    expect(await tabs.getByRole('tab', { selected: true }).textContent()).toBe(
      first,
    );
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('the components sit in a plain grid that fits the screen', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
      timeout: 5000,
    });
    const cards = page.locator('[data-slot="orbit-card"]');
    await expect(cards).toHaveCount(9);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await cards.nth(4).scrollIntoViewIfNeeded();
    await expect(cards.nth(4)).toBeInViewport();
  });
});
