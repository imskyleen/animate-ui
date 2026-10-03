import { expect, test, type Page } from '@playwright/test';

const POPUP = '[data-slot="drawer-popup"]';
const OVERLAY = '[data-slot="drawer-overlay"]';

/** Vertical/horizontal offset in px and as a share of the size, and opacity. */
const state = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      const m = new DOMMatrix(cs.transform);
      const box = el as HTMLElement;
      return {
        x: m.m41,
        y: m.m42,
        shareX: m.m41 / box.offsetWidth,
        shareY: m.m42 / box.offsetHeight,
        opacity: Number(cs.opacity),
      };
    });

const opacity = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

test.describe('base-ui drawer demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/drawer', {
      waitUntil: 'networkidle',
    });
  });

  const open = async (page: Page) => {
    await page.getByRole('button', { name: 'Daily goals' }).click();
    await page.locator(POPUP).waitFor();
  };

  test('slides up from the bottom edge, then settles', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(60);
    const early = await state(page, POPUP);
    expect(early.shareY).toBeGreaterThan(0.05);
    expect(await opacity(page, OVERLAY)).toBeLessThan(1);

    await page.waitForTimeout(650);
    expect(Math.abs((await state(page, POPUP)).y)).toBeLessThan(1);
    expect(await opacity(page, OVERLAY)).toBe(1);
  });

  test('closes faster than it opens, sliding back down', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    expect((await state(page, POPUP)).shareY).toBeGreaterThan(0.05);
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 500 });
  });

  test('a drag follows the finger at once; a slow release springs back', async ({
    page,
  }) => {
    await open(page);
    await page.waitForTimeout(700);
    const box = (await page.locator(POPUP).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 12;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(x, y + i * 8);
      await page.waitForTimeout(32);
    }
    // No lag: the popup sits where the finger is, on the same frame.
    const dragged = await state(page, POPUP);
    expect(dragged.y).toBeGreaterThan(60);
    expect(dragged.y).toBeLessThan(100);
    // The backdrop follows the swipe progress without lag too.
    expect(await opacity(page, OVERLAY)).toBeLessThan(1);

    // Hold still, then let go: not a flick, so it animates back up.
    await page.waitForTimeout(150);
    await page.mouse.up();
    await page.waitForTimeout(50);
    const released = await state(page, POPUP);
    expect(released.y).toBeGreaterThan(5);
    expect(released.y).toBeLessThan(dragged.y);
    await page.waitForTimeout(700);
    expect(Math.abs((await state(page, POPUP)).y)).toBeLessThan(1);
    await expect(page.locator(POPUP)).toHaveCount(1);
  });

  test('a flick dismisses it, continuing the swipe', async ({ page }) => {
    await open(page);
    await page.waitForTimeout(700);
    const box = (await page.locator(POPUP).boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + 12;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      await page.mouse.move(x, y + i * 25);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 800 });
  });

  test('reduced motion: fades in place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.waitForTimeout(60);
    const early = await state(page, POPUP);
    expect(Math.abs(early.y)).toBeLessThan(1);
    expect(early.opacity).toBeLessThan(1);
    await page.waitForTimeout(650);
    expect((await state(page, POPUP)).opacity).toBe(1);
  });
});

test.describe('base-ui drawer API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-drawer', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled open and onOpenChange; animates unstyled', async ({
    page,
  }) => {
    const popup = '[data-testid="bottom-popup"]';
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await page.locator(popup).waitFor();
    await page.waitForTimeout(60);
    expect((await state(page, popup)).shareY).toBeGreaterThan(0.05);
    await page.waitForTimeout(650);
    expect(Math.abs((await state(page, popup)).y)).toBeLessThan(1);
    await expect(page.getByTestId('controlled-state')).toHaveText('open');

    await page.getByRole('button', { name: 'Close bottom' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-changes')).toHaveText(
      'false:close-press',
    );
    await expect(page.locator(popup)).toHaveCount(0, { timeout: 500 });
  });

  test('swipeDirection right, with custom transitions', async ({ page }) => {
    const popup = '[data-testid="right-popup"]';
    await page.getByRole('button', { name: 'Open right drawer' }).click();
    await page.locator(popup).waitFor();
    await page.waitForTimeout(40);
    expect((await state(page, popup)).shareX).toBeGreaterThan(0.05);
    // 200ms instead of 600ms.
    await page.waitForTimeout(260);
    expect(Math.abs((await state(page, popup)).x)).toBeLessThan(1);

    await page.keyboard.press('Escape');
    // 100ms instead of 400ms.
    await expect(page.locator(popup)).toHaveCount(0, { timeout: 300 });
  });
});
