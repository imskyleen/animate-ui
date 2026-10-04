import { expect, test, type Page } from '@playwright/test';

// The demo is shadcn/ui's InputOTP after `animate-ui animate`: its slots
// render the character as plain text, and Animate UI's input-otp animates
// the slot's `color` and `font-size` with the Web Animations API.

const INPUT = 'input[data-input-otp]';
const SLOT = '[data-slot="input-otp-slot"]';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/input-otp', { waitUntil: 'networkidle' });

type SlotAnimation = {
  index: number;
  delay: number;
  duration: number;
  easing: string;
  from: Record<string, string>;
};

/** The slots' script animations (Animate UI's), read right away. */
const slotAnimations = (page: Page) =>
  page.evaluate((selector) => {
    const slots = Array.from(document.querySelectorAll(selector));
    return slots.flatMap((slot, index) =>
      slot
        .getAnimations()
        // Not the slot's own CSS transitions (shadcn/ui's transition-all).
        .filter(
          (animation) =>
            !(animation instanceof CSSTransition) &&
            !(animation instanceof CSSAnimation),
        )
        .map((animation) => {
          const effect = animation.effect as KeyframeEffect;
          const { offset, color, fontSize } = effect.getKeyframes()[0]!;
          return {
            index,
            delay: Math.round(Number(effect.getTiming().delay)),
            duration: Number(effect.getTiming().duration),
            easing: String(effect.getTiming().easing),
            from: { offset: String(offset), color, fontSize } as Record<
              string,
              string
            >,
          };
        }),
    );
  }, SLOT) as Promise<SlotAnimation[]>;

/** The slots' script animations once `count` of them have started. */
const startedAnimations = async (page: Page, count: number) => {
  await expect
    .poll(async () => (await slotAnimations(page)).length)
    .toBe(count);
  return slotAnimations(page);
};

const slotStyle = (page: Page, index: number) =>
  page
    .locator(SLOT)
    .nth(index)
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return { color: cs.color, fontSize: parseFloat(cs.fontSize) };
    });

test.describe('animate-ui input-otp', () => {
  test('a drop-in for input-otp: one input holds the value', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('12a3');
    // REGEXP_ONLY_DIGITS, re-exported.
    await expect(page.locator(INPUT)).toHaveValue('123');
    await expect(page.locator(INPUT)).toHaveAttribute(
      'autocomplete',
      'one-time-code',
    );
    await expect(page.locator(SLOT).nth(2)).toHaveText('3');
    await expect(page.locator(SLOT).nth(3)).toHaveAttribute(
      'data-active',
      'true',
    );
  });

  test('a typed character pops in on a spring and settles', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    const settledSize = (await slotStyle(page, 0)).fontSize;
    // The first slot's font size on every frame, from just before typing.
    const sizes = page
      .locator(SLOT)
      .first()
      .evaluate(async (el) => {
        const values: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 1200) {
          await new Promise((r) => requestAnimationFrame(r));
          values.push(parseFloat(getComputedStyle(el).fontSize));
        }
        return values;
      });
    await page.keyboard.type('4');
    const [animation, ...others] = await startedAnimations(page, 1);
    expect(others).toEqual([]);
    expect(animation!.index).toBe(0);
    // v1's radio indicator: from transparent and from 0, on a 200/16 spring
    // (a linear() easing that overshoots, ~800ms).
    expect(animation!.easing).toMatch(/^linear\(/);
    expect(animation!.duration).toBeGreaterThan(500);
    expect(animation!.duration).toBeLessThan(1100);
    expect(animation!.delay).toBe(0);
    expect(animation!.from.offset).toBe('0');
    expect(animation!.from.color).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
    expect(animation!.from.fontSize).toBe('0px');

    // The glyph grows past its size (~11%) before it settles.
    expect(Math.max(...(await sizes))).toBeGreaterThan(settledSize * 1.05);
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    expect((await slotStyle(page, 0)).fontSize).toBe(settledSize);
    await expect(page.locator(SLOT).first()).toHaveText('4');
  });

  test('deleting is instant, shifted characters stay still', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('123');
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await page.keyboard.press('Backspace');
    expect(await slotAnimations(page)).toEqual([]);
    await expect(page.locator(INPUT)).toHaveValue('12');
  });

  test('a pasted code staggers in and settles', async ({ page }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.insertText('123456');
    const animations = await startedAnimations(page, 6);
    expect(animations.map((a) => a.index)).toEqual([0, 1, 2, 3, 4, 5]);
    // 50ms apart, like v1's split text.
    expect(animations.map((a) => a.delay)).toEqual([0, 50, 100, 150, 200, 250]);
    // Waiting characters are hidden until their turn.
    // (Computed mid-interpolation in oklab: alpha 0.)
    expect((await slotStyle(page, 5)).color).toMatch(
      /rgba\(0, 0, 0, 0\)|\/ 0\)$/,
    );

    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await expect(page.locator(INPUT)).toHaveValue('123456');
  });

  test('reduced motion: characters only fade, without stagger', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('9');
    const [typed] = await startedAnimations(page, 1);
    expect(typed!.from.color).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
    expect(typed!.from.fontSize).toBeUndefined();

    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await page.keyboard.insertText('12345');
    const pasted = await startedAnimations(page, 5);
    expect(pasted.map((a) => a.delay)).toEqual([0, 0, 0, 0, 0]);
  });

  test('the caret blinks, and stops under reduced motion', async ({ page }) => {
    // The blink is the app's CSS (shadcn/ui's animate-caret-blink).
    const blink = `@keyframes test-blink { 50% { opacity: 0 } } .animate-caret-blink { animation: test-blink 1s infinite }`;
    await open(page);
    await page.addStyleTag({ content: blink });
    await page.locator(INPUT).click();
    const caret = page.locator(`${SLOT} .animate-caret-blink`);
    await expect(caret).toBeVisible();
    expect(
      await caret.evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('test-blink');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect
      .poll(() => caret.evaluate((el) => getComputedStyle(el).animationName))
      .toBe('none');
    await expect(caret).toBeVisible();
  });
});
