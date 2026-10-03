import { expect, test, type Page } from '@playwright/test';

import { probeFirstFrame, sample } from './motion-probe';

type Variant = {
  name: string;
  demo: string;
  input: string;
  slot: string;
  char: string;
  caret: string;
  /** Selector of the element that shows the active ring. */
  active: string;
};

const VARIANTS: Variant[] = [
  {
    name: 'animate input-otp',
    demo: 'demo-components-animate-input-otp',
    input: 'input[data-input-otp]',
    slot: '[data-slot="input-otp-slot"]',
    char: '[data-slot="input-otp-char"]',
    caret: '[data-slot="input-otp-caret"]',
    active: '[data-slot="input-otp-slot"][data-active="true"]',
  },
  {
    name: 'base otp-field',
    demo: 'demo-components-base-otp-field',
    input: '[data-slot="otp-field-input"]',
    slot: '[data-slot="otp-field-slot"]',
    char: '[data-slot="otp-field-char"]',
    caret: '[data-slot="otp-field-caret"]',
    active: '[data-slot="otp-field-slot"]:focus-within',
  },
];

const charOpacities = (page: Page, selector: string) =>
  page.evaluate(
    (sel) =>
      new Promise<number[]>((resolve) =>
        requestAnimationFrame(() =>
          resolve(
            Array.from(document.querySelectorAll(sel)).map((el) =>
              Number(getComputedStyle(el).opacity),
            ),
          ),
        ),
      ),
    selector,
  );

for (const v of VARIANTS) {
  test.describe(v.name, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/smoke/${v.demo}`, {
        waitUntil: 'networkidle',
      });
    });

    test('a typed character pops in quickly and settles', async ({ page }) => {
      await page.locator(v.input).first().click();
      const probe = await probeFirstFrame(page, v.char);
      await page.keyboard.type('4');
      const first = await probe.firstFrame();
      expect(first.opacity).toBeLessThan(1);
      expect(first.scale).toBeLessThan(1);
      expect(first.scale).toBeGreaterThanOrEqual(0.95);

      // transition.press: 0.15s.
      await page.waitForTimeout(250);
      const settled = await sample(page, v.char);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBe(1);
      await expect(page.locator(v.char).first()).toHaveText('4');
    });

    test('deleting is instant', async ({ page }) => {
      await page.locator(v.input).first().click();
      await page.keyboard.type('12');
      await page.waitForTimeout(250);
      await expect(page.locator(v.char)).toHaveCount(2);

      await page.keyboard.press('Backspace');
      await page.waitForTimeout(30);
      const count = await page.locator(v.char).count();
      expect(count).toBe(1);
      // The remaining character did not replay its entrance.
      expect((await sample(page, v.char)).opacity).toBe(1);
    });

    test('the active ring moves instantly with typing', async ({ page }) => {
      await page.locator(v.input).first().click();
      await page.keyboard.type('7');
      await page.waitForTimeout(20);
      const early = await page
        .locator(v.active)
        .first()
        .evaluate((el) => getComputedStyle(el).boxShadow);
      await page.waitForTimeout(300);
      const late = await page
        .locator(v.active)
        .first()
        .evaluate((el) => getComputedStyle(el).boxShadow);
      expect(early).toBe(late);
      // The ring now sits on the second slot.
      const activeIndex = await page.evaluate(
        ({ slot, active }) =>
          Array.from(document.querySelectorAll(slot)).indexOf(
            document.querySelector(active) as Element,
          ),
        { slot: v.slot, active: v.active },
      );
      expect(activeIndex).toBe(1);
    });

    test('a pasted code staggers in and settles', async ({ page }) => {
      await page.locator(v.input).first().click();
      await page.keyboard.insertText('123456');
      const first = await charOpacities(page, v.char);
      expect(first).toHaveLength(6);
      // Later characters start later, so they are never ahead of earlier ones.
      expect(first[5]).toBeLessThanOrEqual(first[0]);
      expect(first[5]).toBeLessThan(1);

      // 5 × 25ms stagger + 0.15s.
      await page.waitForTimeout(450);
      const settled = await charOpacities(page, v.char);
      expect(settled.every((o) => o === 1)).toBe(true);
    });

    test('the caret blinks in the focused empty slot', async ({ page }) => {
      await page.locator(v.input).first().click();
      const caret = page.locator(v.caret).first();
      await expect(caret).toBeVisible();
      const name = await caret.evaluate(
        (el) => getComputedStyle(el).animationName,
      );
      expect(name).toBe('animate-ui-caret-blink');
    });

    test('reduced motion: characters only fade, the caret stops', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.reload({ waitUntil: 'networkidle' });

      await page.locator(v.input).first().click();
      const caret = page.locator(v.caret).first();
      await expect(caret).toBeVisible();
      expect(
        await caret.evaluate((el) => getComputedStyle(el).animationName),
      ).toBe('none');

      const probe = await probeFirstFrame(page, v.char);
      await page.keyboard.type('9');
      const first = await probe.firstFrame();
      expect(first.scale).toBe(1);

      await page.waitForTimeout(250);
      expect((await sample(page, v.char)).opacity).toBe(1);
    });
  });
}
