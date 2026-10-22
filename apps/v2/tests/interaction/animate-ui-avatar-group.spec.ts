import { expect, test, type Page } from '../test';

import { overshootOf } from './spring-curves';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const POP_SPRING = { stiffness: 400, damping: 29 };

  const open = (page: Page) =>
    page.goto(framework.demo('avatar-group'), {
      waitUntil: 'networkidle',
    });

  const avatar = (page: Page, name: string) =>
    page.getByRole('img', { name, exact: true });

  const riseOf = (page: Page, name: string) =>
    avatar(page, name)
      .locator('..')
      .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);

  test.describe(`${framework.name} avatar-group`, () => {
    test('the hovered avatar rises on a spring and shows its tooltip', async ({
      page,
    }) => {
      await open(page);
      expect(await riseOf(page, 'Adam Wathan')).toBe(0);
      await avatar(page, 'Adam Wathan').hover();
      await expect.poll(() => riseOf(page, 'Adam Wathan')).toBeLessThan(0);
      await expect(page.getByRole('tooltip')).toContainText('Adam Wathan');
      await expect
        .poll(() => riseOf(page, 'Adam Wathan'))
        .toBeCloseTo(-14.4, 0);
    });

    test('the rise overshoots on a bouncy spring', async ({ page }) => {
      await open(page);
      const wrapper = avatar(page, 'Adam Wathan').locator('..');
      const sampling = wrapper.evaluate(async (el) => {
        const values: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 1500) {
          await new Promise((r) => requestAnimationFrame(r));
          values.push(new DOMMatrix(getComputedStyle(el).transform).m42);
        }
        return values;
      });
      await avatar(page, 'Adam Wathan').hover();
      const values = await sampling;
      expect(Math.min(...values)).toBeLessThan(-16);
      expect(Math.min(...values)).toBeGreaterThan(-18);
      await expect
        .poll(() => riseOf(page, 'Adam Wathan'))
        .toBeCloseTo(-14.4, 0);
    });

    test("the tooltip pops in on the Tooltip's spring, a little past full size", async ({
      page,
    }) => {
      await open(page);
      const sampling = page.evaluate(
        () =>
          new Promise<number[]>((resolve) => {
            const scales: number[] = [];
            const t0 = performance.now();
            const tick = () => {
              const el = document.querySelector(
                '[data-slot="tooltip-content"]',
              );
              if (el)
                scales.push(new DOMMatrix(getComputedStyle(el).transform).a);
              if (performance.now() - t0 < 1200) requestAnimationFrame(tick);
              else resolve(scales);
            };
            tick();
          }),
      );
      await avatar(page, 'Adam Wathan').hover();
      const scales = await sampling;
      expect(scales[0]!).toBeGreaterThanOrEqual(0.69);
      expect(scales[0]!).toBeLessThan(0.85);
      const overshoot = overshootOf(POP_SPRING);
      const peak = Math.max(...scales);
      expect(peak).toBeGreaterThan(1 + 0.3 * overshoot * 0.7);
      expect(peak).toBeLessThan(1 + 0.3 * overshoot + 0.003);
      expect(scales.at(-1)!).toBeCloseTo(1, 2);
    });

    test('one tooltip glides between avatars; leaving lowers them', async ({
      page,
    }) => {
      await open(page);
      await avatar(page, 'Skyleen').hover();
      await expect(page.getByRole('tooltip')).toContainText('Skyleen');
      await avatar(page, 'Jhey').hover();
      await expect(page.getByRole('tooltip')).toContainText('Jhey');
      await expect(page.locator('[data-slot="tooltip-content"]')).toHaveCount(
        1,
      );
      await expect.poll(() => riseOf(page, 'Skyleen')).toBeCloseTo(0, 0);

      await page.mouse.move(5, 5);
      await expect(page.locator('[data-slot="tooltip-content"]')).toHaveCount(
        0,
      );
      await expect.poll(() => riseOf(page, 'Jhey')).toBeCloseTo(0, 0);
    });

    test('focusing an avatar shows its tooltip', async ({ page }) => {
      await open(page);
      await avatar(page, 'Shadcn').focus();
      await expect(page.getByRole('tooltip')).toContainText('Shadcn');
    });

    test('reduced motion: the avatar rises at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await avatar(page, 'Jhey').hover();
      await page.waitForTimeout(60);
      expect(await riseOf(page, 'Jhey')).toBeCloseTo(-14.4, 0);
    });
  });
}
