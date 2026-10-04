import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/pinned-list', {
    waitUntil: 'networkidle',
  });

const group = (page: Page, slot: 'pinned' | 'unpinned') =>
  page.locator(`[data-slot="pinned-list-${slot}"]`);
const item = (page: Page, name: string) =>
  page.locator('[data-slot="pinned-list-item"]', { hasText: name });

test.describe('animate-ui pinned list', () => {
  test('pinning moves the item to the pinned group, animated', async ({
    page,
  }) => {
    await open(page);
    const before = (await item(page, 'Inbox').boundingBox())!;
    // Click and sample on the next frames, in the page: no round-trip delay.
    const mid = await page.evaluate(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Pin Inbox"]')!
        .click();
      await new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(r)),
      );
      const el = [
        ...document.querySelectorAll('[data-slot="pinned-list-item"]'),
      ].find((e) => e.textContent?.includes('Inbox'))!;
      return el.getBoundingClientRect().y;
    });
    await expect(group(page, 'pinned').getByText('Inbox')).toBeVisible();
    await expect
      .poll(async () => (await item(page, 'Inbox').boundingBox())!.y)
      .toBeLessThan(before.y - 50);
    // Settled at the top.
    await page.waitForTimeout(800);
    const end = (await item(page, 'Inbox').boundingBox())!;
    // Mid-flight it was still travelling from its old place.
    expect(mid).toBeGreaterThan(end.y + 5);
    await expect(
      page.getByRole('button', { name: 'Unpin Inbox' }),
    ).toBeVisible();
  });

  test('the trigger stays put on hover and shrinks on press', async ({
    page,
  }) => {
    await open(page);
    const trigger = page.getByRole('button', { name: 'Pin Inbox' });
    const scale = () =>
      trigger.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    await trigger.hover();
    await page.waitForTimeout(300);
    expect(await scale()).toBe(1);
    await page.mouse.down();
    await expect.poll(scale).toBeCloseTo(0.95, 2);
    await page.mouse.up();
  });

  test('the move springs past its place, then settles', async ({ page }) => {
    await open(page);
    const before = (await item(page, 'Inbox').boundingBox())!;
    // The item's offset from its new place, on every frame.
    const offsets = await page.evaluate(async () => {
      document
        .querySelector<HTMLButtonElement>('[aria-label="Pin Inbox"]')!
        .click();
      const values: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 1200) {
        await new Promise((r) => requestAnimationFrame(r));
        const el = [
          ...document.querySelectorAll('[data-slot="pinned-list-item"]'),
        ].find((e) => e.textContent?.includes('Inbox'))!;
        values.push(new DOMMatrix(getComputedStyle(el).transform).m42);
      }
      return values;
    });
    const after = (await item(page, 'Inbox').boundingBox())!;
    // It starts from its old place...
    expect(Math.max(...offsets)).toBeGreaterThan(before.y - after.y - 60);
    // ...and the v1 spring (stiffness 320, damping 25, mass 0.8) overshoots.
    expect(Math.min(...offsets)).toBeLessThan(-1);
    expect(offsets.at(-1)).toBeCloseTo(0, 0);
  });

  test('unpinning every item hides the pinned label', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Unpin Drafts' }).click();
    await page.getByRole('button', { name: 'Unpin Projects' }).click();
    await expect(group(page, 'pinned').getByText('Pinned')).toHaveCount(0);
    await expect(
      group(page, 'unpinned').locator('[data-slot="pinned-list-item"]'),
    ).toHaveCount(4);
  });

  test('reduced motion: the item jumps to its new place', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.getByRole('button', { name: 'Pin Inbox' }).click();
    await page.waitForTimeout(50);
    const transform = await item(page, 'Inbox').evaluate(
      (el) => getComputedStyle(el).transform,
    );
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });
});
