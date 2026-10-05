import { expect, test, type Page } from '@playwright/test';

// Animate UI v1's `followCursor`: while the pointer moves over the trigger,
// the popup leans towards it by half its offset from the trigger's center,
// on a spring, along both axes or only one.

const CASES = [
  ['Radix both', 'radix-both', 'both'],
  ['Radix x', 'radix-x', 'x'],
  ['Radix card', 'radix-card', 'both'],
  ['Base both', 'base-both', 'both'],
  ['Base card', 'base-card', 'both'],
] as const;

/** The popup's translation, from its computed transform. */
const offsetOf = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => {
    const m = new DOMMatrix(getComputedStyle(el).transform);
    return { x: m.m41, y: m.m42 };
  });

test.describe('followCursor', () => {
  test.describe.configure({ timeout: 120_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/follow-cursor', {
      waitUntil: 'networkidle',
    });
    await page.mouse.move(1, 1);
  });

  for (const [name, testId, axes] of CASES) {
    test(`${name}: the popup leans towards the pointer`, async ({ page }) => {
      const box = (await page.getByText(name, { exact: true }).boundingBox())!;
      const midY = box.y + box.height / 2;
      // In from the left at the trigger's height (crossing another trigger on
      // the way would open that one first), then to the right edge, low.
      await page.mouse.move(box.x - 40, midY);
      await page.mouse.move(box.x + box.width / 2, midY, { steps: 4 });
      await expect(page.getByTestId(testId)).toBeVisible();
      await page.mouse.move(box.x + box.width - 4, box.y + box.height - 4, {
        steps: 6,
      });
      // Half the pointer's offset from the center, once the spring settles.
      const right = box.width / 2 - 4;
      await expect
        .poll(async () => (await offsetOf(page, testId)).x, { timeout: 3000 })
        .toBeGreaterThan(right / 2 - 3);
      const low = await offsetOf(page, testId);
      if (axes === 'both') expect(low.y).toBeGreaterThan(2);
      else expect(Math.abs(low.y)).toBeLessThan(0.5);

      // Over to the left edge: it follows to the other side.
      await page.mouse.move(box.x + 4, midY, { steps: 6 });
      await expect
        .poll(async () => (await offsetOf(page, testId)).x, { timeout: 3000 })
        .toBeLessThan(-(right / 2 - 3));
    });
  }
});
