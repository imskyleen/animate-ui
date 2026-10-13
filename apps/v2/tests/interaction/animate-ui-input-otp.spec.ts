import { expect, test, type Page } from '@playwright/test';

const INPUT = 'input[data-input-otp]';
const SLOT = '[data-slot="input-otp-slot"]';
const RING = '[data-slot="input-otp-ring"]';
const GHOSTS = '[data-slot="input-otp-ghosts"]';
const WAVE = 'animate-ui-otp-wave';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/input-otp', { waitUntil: 'networkidle' });

type SlotAnimation = {
  index: number;
  delay: number;
  duration: number;
  easing: string;
  from: Record<string, string>;
};

const slotAnimations = (page: Page) =>
  page.evaluate((selector) => {
    const slots = Array.from(document.querySelectorAll(selector));
    return slots.flatMap((slot, index) =>
      slot
        .getAnimations()
        .filter(
          (animation) =>
            !(animation instanceof CSSTransition) &&
            !(animation instanceof CSSAnimation) &&
            animation.id !== 'animate-ui-otp-wave',
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

  test('a typed character grows in on a spring, as a copy scaled over it', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    const settledSize = (await slotStyle(page, 0)).fontSize;
    const sizes = page
      .locator(SLOT)
      .first()
      .evaluate(async (el) => {
        const values: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 900) {
          await new Promise((r) => requestAnimationFrame(r));
          values.push(parseFloat(getComputedStyle(el).fontSize));
        }
        return values;
      });
    await page.keyboard.type('4');
    const [animation, ...others] = await startedAnimations(page, 1);
    expect(others).toEqual([]);
    expect(animation!.index).toBe(0);
    expect(animation!.delay).toBe(0);
    expect(animation!.from.color).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
    expect(animation!.from.fontSize).toBeUndefined();

    const copy = page.locator(`${GHOSTS} > [data-glyph="enter"]`);
    await expect(copy).toHaveText('4');
    const grow = await copy.evaluate((el) => {
      const [animation] = el.getAnimations();
      const effect = animation!.effect as KeyframeEffect;
      return {
        keyframes: effect
          .getKeyframes()
          .map(({ opacity, scale }) => ({ opacity, scale })),
        easing: String(effect.getTiming().easing),
        duration: Number(effect.getTiming().duration),
      };
    });
    expect(grow.keyframes).toEqual([
      { opacity: '0', scale: '0' },
      { opacity: '1', scale: '1' },
    ]);
    expect(grow.easing).toMatch(/^linear\(/);
    expect(grow.duration).toBeGreaterThan(250);
    expect(grow.duration).toBeLessThan(700);
    const points = [...grow.easing.matchAll(/(-?[\d.]+)(?:\s+[\d.]+%)?/g)].map(
      ([, value]) => Number(value),
    );
    expect(Math.max(...points)).toBeLessThanOrEqual(1.0005);

    const placed = await page.evaluate(
      ({ slot, glyph }) => {
        for (const a of document.getAnimations()) {
          if (a instanceof CSSTransition || a instanceof CSSAnimation) continue;
          a.pause();
          a.currentTime = Number(a.effect!.getComputedTiming().endTime) - 1;
        }
        const rectOf = (el: Element) => {
          const range = document.createRange();
          range.selectNodeContents(el.firstChild!);
          return range.getBoundingClientRect();
        };
        const own = rectOf(document.querySelector(slot)!);
        const copy = rectOf(document.querySelector(glyph)!);
        return {
          dx: Math.abs(own.x - copy.x),
          dy: Math.abs(own.y - copy.y),
          dw: Math.abs(own.width - copy.width),
        };
      },
      { slot: SLOT, glyph: `${GHOSTS} > [data-glyph="enter"]` },
    );
    expect(placed.dx).toBeLessThan(0.1);
    expect(placed.dy).toBeLessThan(0.1);
    expect(placed.dw).toBeLessThan(0.1);
    await page.evaluate(() => {
      for (const a of document.getAnimations()) a.play();
    });

    for (const size of await sizes) expect(size).toBe(settledSize);
    await expect(copy).toHaveCount(0);
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await expect(page.locator(SLOT).first()).toHaveText('4');
  });

  test('a character deleted from the end shrinks out where it was', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('123');
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await page.keyboard.press('Backspace');
    await expect(page.locator(INPUT)).toHaveValue('12');
    expect(await slotAnimations(page)).toEqual([]);
    await expect(page.locator(SLOT).nth(2)).toHaveText('');
    const ghost = page.locator(`${GHOSTS} > [data-glyph="leave"]`);
    await expect(ghost).toHaveText('3');
    const [copy, slot] = await Promise.all([
      ghost.boundingBox(),
      page.locator(SLOT).nth(2).boundingBox(),
    ]);
    expect(
      Math.abs(copy!.x + copy!.width / 2 - (slot!.x + slot!.width / 2)),
    ).toBeLessThan(0.5);
    const animation = await ghost.evaluate((el) => {
      const effect = el.getAnimations()[0]!.effect as KeyframeEffect;
      return effect.getKeyframes().map(({ opacity, scale }) => ({
        opacity,
        scale,
      }));
    });
    expect(animation).toEqual([
      { opacity: '1', scale: '1' },
      { opacity: '0', scale: '0.5' },
    ]);
    await expect(ghost).toHaveCount(0);
  });

  test('deleting in the middle: the characters shift, nothing shrinks', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('123');
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await page
      .locator(INPUT)
      .evaluate((el: HTMLInputElement) => el.setSelectionRange(1, 2));
    await expect(page.locator(SLOT).nth(1)).toHaveAttribute(
      'data-active',
      'true',
    );
    await page.keyboard.press('Backspace');
    await expect(page.locator(INPUT)).toHaveValue('13');
    expect(await slotAnimations(page)).toEqual([]);
    expect(await page.locator(`${GHOSTS} > [data-glyph="leave"]`).count()).toBe(
      0,
    );
  });

  test('the ring glides from slot to slot, worn as the slot wore it', async ({
    page,
  }) => {
    await open(page);
    const ring = page.locator(RING);
    await page.locator(INPUT).click();
    await expect
      .poll(() => ring.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('1');
    const first = page.locator(SLOT).first();
    expect(await first.evaluate((el) => el.style.boxShadow)).toBe('none');
    const own = await first.evaluate((el) => {
      el.style.transition = 'none';
      el.style.removeProperty('box-shadow');
      const shadow = getComputedStyle(el).boxShadow;
      el.style.boxShadow = 'none';
      void getComputedStyle(el).boxShadow;
      el.style.removeProperty('transition');
      return shadow;
    });
    expect(own).not.toBe('none');
    expect(await ring.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(
      own,
    );
    expect((await ring.boundingBox())!.x).toBeCloseTo(
      (await first.boundingBox())!.x,
      0,
    );

    const lefts = ring.evaluate(async (el) => {
      const seen: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 600) {
        await new Promise((r) => requestAnimationFrame(r));
        seen.push(el.getBoundingClientRect().left);
      }
      return seen;
    });
    await page.keyboard.type('1');
    const from = (await first.boundingBox())!.x;
    const to = (await page.locator(SLOT).nth(1).boundingBox())!.x;
    const seen = await lefts;
    expect(seen.some((x) => x > from + 2 && x < to - 2)).toBe(true);
    expect(seen.at(-1)).toBeCloseTo(to, 0);
    expect(await first.evaluate((el) => el.style.boxShadow)).toBe('');
    expect(
      await page
        .locator(SLOT)
        .nth(1)
        .evaluate((el) => el.style.boxShadow),
    ).toBe('none');

    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await expect
      .poll(() => ring.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('0');
    expect(
      await page
        .locator(SLOT)
        .nth(1)
        .evaluate((el) => el.style.boxShadow),
    ).toBe('');
  });

  test('a completed code runs a wave through the slots', async ({ page }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('12345');
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    await page.keyboard.type('6');
    const delays = () =>
      page.evaluate(
        ({ slot, id }) =>
          Array.from(document.querySelectorAll(slot)).map((el) => {
            const wave = el.getAnimations().find((a) => a.id === id);
            return wave
              ? Math.round(
                  Number((wave.effect as KeyframeEffect).getTiming().delay),
                )
              : null;
          }),
        { slot: SLOT, id: WAVE },
      );
    await expect
      .poll(async () => (await delays()).every((delay) => delay !== null))
      .toBe(true);
    const waves = await delays();
    for (let i = 1; i < waves.length; i++)
      expect(waves[i]! - waves[i - 1]!).toBe(40);
    expect(
      await page
        .locator(RING)
        .evaluate(
          (el, id) => el.getAnimations().some((a) => a.id === id),
          WAVE,
        ),
    ).toBe(true);
    expect(
      await page
        .locator(`${GHOSTS} > [data-glyph="enter"]`)
        .evaluate(
          (el, id) => el.getAnimations().some((a) => a.id === id),
          WAVE,
        ),
    ).toBe(true);
    const tops = page
      .locator(SLOT)
      .first()
      .evaluate(async (el) => {
        const seen: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 900) {
          await new Promise((r) => requestAnimationFrame(r));
          seen.push(el.getBoundingClientRect().top);
        }
        return seen;
      });
    const seen = await tops;
    expect(Math.min(...seen)).toBeLessThan(seen.at(-1)! - 3);
    expect(Math.abs(seen.at(-1)! - seen[0]!)).toBeLessThan(0.5);
  });

  test('a pasted code staggers in and settles', async ({ page }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.insertText('123456');
    const animations = await startedAnimations(page, 6);
    expect(animations.map((a) => a.index)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(animations.map((a) => a.delay)).toEqual([0, 50, 100, 150, 200, 250]);
    const copies = await page.evaluate(
      (selector) =>
        Array.from(document.querySelectorAll(selector)).map((el) => {
          const [grow] = el.getAnimations();
          const style = getComputedStyle(el);
          return {
            delay: Math.round(
              Number((grow!.effect as KeyframeEffect).getTiming().delay),
            ),
            opacity: style.opacity,
          };
        }),
      `${GHOSTS} > [data-glyph="enter"]`,
    );
    expect(copies.map((c) => c.delay)).toEqual([0, 50, 100, 150, 200, 250]);
    expect(copies.at(-1)!.opacity).toBe('0');
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
    const waves = await page.evaluate(
      ({ slot, id }) =>
        Array.from(document.querySelectorAll(slot)).filter((el) =>
          el.getAnimations().some((a) => a.id === id),
        ).length,
      { slot: SLOT, id: WAVE },
    );
    expect(waves).toBe(0);
    expect(await page.locator(`${GHOSTS} > *`).count()).toBe(0);
    await page.keyboard.press('Backspace');
    expect(await page.locator(`${GHOSTS} > *`).count()).toBe(0);
  });

  test('reduced motion: the ring moves to the next slot at once, and still fades', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const ring = page.locator(RING);
    await page.locator(INPUT).click();
    expect(
      await ring.evaluate((el) =>
        el
          .getAnimations()
          .map((a) =>
            Number((a.effect as KeyframeEffect).getTiming().duration),
          ),
      ),
    ).toContain(200);
    await expect
      .poll(() => ring.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('1');
    const from = (await page.locator(SLOT).first().boundingBox())!.x;
    const to = (await page.locator(SLOT).nth(1).boundingBox())!.x;
    const lefts = ring.evaluate(async (el) => {
      const seen: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 400) {
        await new Promise((r) => requestAnimationFrame(r));
        seen.push(el.getBoundingClientRect().left);
      }
      return seen;
    });
    await page.keyboard.type('1');
    for (const x of await lefts)
      expect(Math.min(Math.abs(x - from), Math.abs(x - to))).toBeLessThan(0.5);
    expect((await ring.boundingBox())!.x).toBeCloseTo(to, 0);
  });

  test('the caret blinks, and stops under reduced motion', async ({ page }) => {
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

test.describe('animate-ui input-otp, edge cases', () => {
  const openFixture = (page: Page) =>
    page.goto('/tests/fixtures/animate-ui-input-otp', {
      waitUntil: 'networkidle',
    });
  const checked = (page: Page) => page.getByTestId('checked');

  test('left, reset and back: the ring goes where the caret is', async ({
    page,
  }) => {
    await openFixture(page);
    const input = page.getByRole('textbox', { name: 'Checked code' });
    const slots = checked(page).locator(SLOT);
    const ring = checked(page).locator(RING);
    const ringOn = async (index: number) =>
      Math.abs(
        (await ring.boundingBox())!.x -
          (await slots.nth(index).boundingBox())!.x,
      );
    await input.click();
    await page.keyboard.type('1');
    await expect.poll(() => ringOn(1)).toBeLessThan(0.5);
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect
      .poll(() => ring.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('0');
    await input.click();
    await expect.poll(() => ringOn(0)).toBeLessThan(0.5);
    await page.keyboard.type('1');
    await expect.poll(() => ringOn(1)).toBeLessThan(0.5);
    expect(await slots.nth(1).evaluate((el) => el.style.boxShadow)).toBe(
      'none',
    );
    expect(
      await ring.evaluate((el) => getComputedStyle(el).boxShadow),
    ).not.toBe('none');
  });

  test('refused once complete, the ring turns red with its slot', async ({
    page,
  }) => {
    await openFixture(page);
    const slots = checked(page).locator(SLOT);
    const ring = checked(page).locator(RING);
    const ownRing = (index: number) =>
      slots.nth(index).evaluate((el) => {
        const inline = el.style.boxShadow;
        el.style.transition = 'none';
        el.style.removeProperty('box-shadow');
        const shadow = getComputedStyle(el).boxShadow;
        el.style.boxShadow = inline;
        void getComputedStyle(el).boxShadow;
        el.style.removeProperty('transition');
        return shadow;
      });
    await page.getByRole('textbox', { name: 'Checked code' }).click();
    await page.keyboard.type('12345');
    await expect
      .poll(async () => ring.evaluate((el) => getComputedStyle(el).boxShadow))
      .toBe(await ownRing(5));
    const focusRing = await ownRing(5);
    await page.keyboard.type('6');
    await expect(slots.nth(5)).toHaveAttribute('aria-invalid', 'true');
    const invalidRing = await ownRing(5);
    expect(invalidRing).not.toBe(focusRing);
    await expect
      .poll(() => ring.evaluate((el) => getComputedStyle(el).boxShadow))
      .toBe(invalidRing);
  });

  test('on fractional pixels, a copy still lies exactly on its slot', async ({
    page,
  }) => {
    await openFixture(page);
    const section = page.getByTestId('fractional');
    await page.getByRole('textbox', { name: 'Fractional code' }).click();
    await page.keyboard.type('77');
    const placed = await section.evaluate((root, glyph) => {
      for (const a of document.getAnimations()) {
        if (a instanceof CSSTransition || a instanceof CSSAnimation) continue;
        a.pause();
        a.currentTime = Number(a.effect!.getComputedTiming().endTime) - 1;
      }
      const rectOf = (el: Element) => {
        const range = document.createRange();
        range.selectNodeContents(el.firstChild!);
        return range.getBoundingClientRect();
      };
      const slot = root.querySelectorAll('[data-slot="input-otp-slot"]')[1]!;
      const copy = root.querySelectorAll(glyph)[1]!;
      const own = rectOf(slot);
      const grown = rectOf(copy);
      return { dx: Math.abs(own.x - grown.x), dy: Math.abs(own.y - grown.y) };
    }, '[data-glyph="enter"]');
    expect(placed.dx).toBeLessThan(0.1);
    expect(placed.dy).toBeLessThan(0.1);
  });
});

test.describe('animate-ui input-otp, quick changes', () => {
  test('deleted while it grows in, a character shrinks out from there', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('1');
    await page.waitForTimeout(80);
    await page.keyboard.press('Backspace');
    const ghost = page.locator(`${GHOSTS} > [data-glyph="leave"]`);
    const from = await ghost.evaluate((el) => {
      const effect = el.getAnimations()[0]!.effect as KeyframeEffect;
      const [first] = effect.getKeyframes();
      return { opacity: Number(first!.opacity), scale: Number(first!.scale) };
    });
    expect(from.scale).toBeLessThan(0.98);
    expect(from.opacity).toBeLessThan(0.98);
  });

  test('completed again during its wave: one wave, not two stacked', async ({
    page,
  }) => {
    await open(page);
    await page.locator(INPUT).click();
    await page.keyboard.type('12345');
    await expect.poll(() => slotAnimations(page)).toEqual([]);
    const tops = page
      .locator(SLOT)
      .first()
      .evaluate(async (el) => {
        const seen: number[] = [];
        const t0 = performance.now();
        while (performance.now() - t0 < 1000) {
          await new Promise((r) => requestAnimationFrame(r));
          seen.push(el.getBoundingClientRect().top);
        }
        return seen;
      });
    await page.keyboard.type('6');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('6');
    const seen = await tops;
    expect(seen.at(-1)! - Math.min(...seen)).toBeLessThan(4.5);
  });
});
