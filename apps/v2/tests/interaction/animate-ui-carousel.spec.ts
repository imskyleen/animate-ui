import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page, query = '') => {
    await page.goto(framework.demo('carousel') + query, {
      waitUntil: 'networkidle',
    });
    await ready(page, '[data-slot="carousel-next"]');
  };

  // Each slide's content: its box and its scale.
  const slides = (page: Page) =>
    page.locator('[data-slot="carousel-item"]').evaluateAll((items) =>
      items.map((item) => {
        const content = item.firstElementChild as HTMLElement;
        const box = (
          item.querySelector('[data-slot="card"]') ?? content
        ).getBoundingClientRect();
        return {
          left: box.left,
          right: box.right,
          scale: Number(content.style.scale || 1),
          z: Number((item as HTMLElement).style.zIndex || 0),
        };
      }),
    );

  // What shows of each card: its width once clipped by the viewport and the
  // cards above it, the part of it away from the edges, and whether its
  // ring is whole.
  const visible = (page: Page) =>
    page.evaluate(() => {
      const view = document
        .querySelector('[data-slot="carousel-content"]')!
        .getBoundingClientRect();
      const cards = [
        ...document.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]'),
      ]
        .filter(
          (slide) =>
            (slide.firstElementChild as HTMLElement).style.opacity !== '0',
        )
        .map((slide) => {
          const card = slide.querySelector('[data-slot="card"]')!;
          const box = card.getBoundingClientRect();
          // A ring drawn outside the card needs the room too.
          const shadow = getComputedStyle(card).boxShadow;
          const ring = /0px 0px 0px 1px/.test(shadow) && !/inset/.test(shadow) ? 1 : 0;
          return {
            z: Number(slide.style.zIndex),
            left: box.left - ring,
            right: box.right + ring,
            top: box.top - ring,
            bottom: box.bottom + ring,
          };
        });
      return cards.map((card) => {
        let parts = [
          [Math.max(card.left, view.left), Math.min(card.right, view.right)],
        ].filter(([a, b]) => b! > a!);
        for (const other of cards) {
          if (
            other === card ||
            other.z <= card.z ||
            other.top > card.top ||
            other.bottom < card.bottom
          )
            continue;
          parts = parts.flatMap(([a, b]) =>
            [
              [a!, Math.min(b!, other.left)],
              [Math.max(a!, other.right), b!],
            ].filter(([c, d]) => d! > c!),
          );
        }
        const size = (part: number[]) => part[1]! - part[0]!;
        return {
          share:
            parts.reduce((sum, part) => sum + size(part), 0) /
            (card.right - card.left),
          width: parts.reduce((sum, part) => sum + size(part), 0),
          inner: parts
            .filter(
              ([a, b]) => a! > view.left + 0.5 && b! < view.right - 0.5,
            )
            .reduce((sum, part) => sum + size(part), 0),
          whole:
            card.left >= view.left &&
            card.right <= view.right &&
            card.top >= view.top &&
            card.bottom <= view.bottom,
        };
      });
    });

  const settle = (page: Page) =>
    expect
      .poll(async () => (await slides(page)).some((slide) => slide.scale > 0.999))
      .toBe(true);

  const drag = async (page: Page, by: number) => {
    const box = (await page
      .locator('[data-slot="carousel-content"]')
      .boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + by, y, { steps: 8 });
  };

  test.describe(`${framework.name} carousel`, () => {
    test('away from the center, slides shrink, and the ones past the neighbours tuck behind them', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const [center, right, far, , left] = await slides(page);
      expect(center!.scale).toBeCloseTo(1, 3);
      expect(right!.scale).toBeCloseTo(0.8, 2);
      expect(left!.scale).toBeCloseTo(0.8, 2);
      expect(far!.scale).toBeLessThan(0.8);
      expect(center!.z).toBeGreaterThan(right!.z);
      expect(right!.z).toBeGreaterThan(far!.z);
      // Tucked: the far slide starts before its neighbour ends.
      expect(far!.left).toBeLessThan(right!.right);
    });

    // Bug: the `scale` property also shrank the transform Embla gives a
    // looped slide, so the slide before the first one slid under it.
    test('in a loop, the slide before the first one keeps its distance like the one after', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const [center, right, , , left] = await slides(page);
      const before = center!.left - left!.right;
      const after = right!.left - center!.right;
      expect(before).toBeGreaterThan(0);
      expect(Math.abs(before - after)).toBeLessThan(2);
    });

    // Bug: each slide shrank around its own center, leaving a wide gap next
    // to the selected one.
    test('the neighbours keep the same small gap to the selected slide, at rest and dragged', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const [center, right, , , left] = await slides(page);
      expect(center!.left - left!.right).toBeCloseTo(4, 0);
      expect(right!.left - center!.right).toBeCloseTo(4, 0);
      await drag(page, 40);
      const [first, , , , fifth] = await slides(page);
      expect(first!.left - fifth!.right).toBeCloseTo(4, 0);
      await page.mouse.up();
    });

    // Bug: the cards' 1px ring was cut by the viewport, and the slide waiting
    // behind a neighbour showed a sliver past it.
    test('at rest, three whole slides show and nothing peeks out behind them', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const parts = await visible(page);
      expect(parts.filter((part) => part.width > 0)).toHaveLength(3);
      for (const part of parts.filter((part) => part.width > 0))
        expect(part.whole).toBe(true);
    });

    // Bug: while dragged, the slide hidden past the far ones showed through
    // the gaps between the others.
    test('dragged, no slide shows as a sliver inside the viewport', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const view = (await page
        .locator('[data-slot="carousel-content"]')
        .boundingBox())!;
      const step = (await page
        .locator('[data-slot="carousel-item"]')
        .first()
        .boundingBox())!.width;
      const x = view.x + view.width / 2;
      const y = view.y + view.height / 2;
      for (const direction of [-1, 1]) {
        await page.mouse.move(x, y);
        await page.mouse.down();
        for (let part = 1; part <= 20; part++) {
          await page.mouse.move(x + (direction * part * step) / 20, y);
          const slivers = (await visible(page)).filter(
            (part) => part.inner > 0.05 && part.inner < 6,
          );
          expect(slivers).toEqual([]);
        }
        await page.mouse.up();
        await settle(page);
      }
    });

    // Bug: with five slides, Embla keeps the spare one on a single side, so
    // the slide coming in on the other side went missing, then popped back.
    test('in a loop, dragged across a whole slide, no slide leaves a hole at the edges', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const view = (await page
        .locator('[data-slot="carousel-content"]')
        .boundingBox())!;
      const step = (await page
        .locator('[data-slot="carousel-item"]')
        .first()
        .boundingBox())!.width;
      const holes = async () => {
        const spans = (await slides(page))
          .map((slide) => [
            Math.max(slide.left, view.x),
            Math.min(slide.right, view.x + view.width),
          ])
          .filter(([a, b]) => b! > a!)
          .sort((a, b) => a[0]! - b[0]!);
        let reached = view.x;
        let widest = 0;
        for (const [a, b] of spans) {
          widest = Math.max(widest, a! - reached);
          reached = Math.max(reached, b!);
        }
        return Math.max(widest, view.x + view.width - reached);
      };
      for (const direction of [-1, 1]) {
        const box = view;
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        for (let part = 1; part <= 10; part++) {
          await page.mouse.move(x + (direction * part * step) / 10, y);
          expect(await holes()).toBeLessThan(10);
        }
        await page.mouse.up();
        await settle(page);
      }
    });

    test('the neighbours take the scale set, and three whole slides still show', async ({
      page,
    }) => {
      await open(page, '?scale=0.6');
      await settle(page);
      const [center, right, , , left] = await slides(page);
      expect(center!.scale).toBeCloseTo(1, 2);
      expect(right!.scale).toBeCloseTo(0.6, 2);
      expect(left!.scale).toBeCloseTo(0.6, 2);
      const parts = (await visible(page)).filter((part) => part.width > 0);
      expect(parts).toHaveLength(3);
      for (const part of parts) expect(part.whole).toBe(true);
    });

    test('without a loop, each slide comes to the center in turn, whole, with whole neighbours', async ({
      page,
    }) => {
      await open(page, '?loop=false');
      const counter = page.locator('[data-slot="carousel-counter"]');
      for (let slide = 1; slide <= 5; slide++) {
        if (slide > 1) await page.locator('[data-slot="carousel-next"]').click();
        await expect
          .poll(() => counter.ariaSnapshot())
          .toContain(`Slide ${slide} of 5`);
        await page.waitForTimeout(900);
        const all = await slides(page);
        expect(all[slide - 1]!.scale).toBeCloseTo(1, 2);
        const parts = (await visible(page)).filter((part) => part.width > 0.5);
        expect(parts).toHaveLength(slide === 1 || slide === 5 ? 2 : 3);
        for (const part of parts) expect(part.whole).toBe(true);
      }
    });

    // Bug: without a loop, Embla trims the end snaps into one, and the
    // slides sharing it were stacked in the same place.
    test('with the end snaps trimmed, the slide nearest the center is the big one and none are stacked, at every stop', async ({
      page,
    }) => {
      await page.goto(framework.fixture('carousel-trimmed'), {
        waitUntil: 'networkidle',
      });
      await ready(page, '[data-slot="carousel-next"]');
      const counter = page.locator('[data-slot="carousel-counter"]');
      const check = async () => {
        await page.waitForTimeout(900);
        const view = (await page
          .locator('[data-slot="carousel-content"]')
          .boundingBox())!;
        const middle = view.x + view.width / 2;
        const all = await slides(page);
        const atCenter = all.find(
          (slide) => slide.left < middle && slide.right > middle,
        );
        expect(atCenter?.scale).toBe(Math.max(...all.map((s) => s.scale)));
        const parts = (await visible(page)).filter((part) => part.width > 0.5);
        expect(parts.length).toBeGreaterThanOrEqual(2);
        for (const part of parts) expect(part.width).toBeGreaterThan(20);
      };
      await check();
      for (let slide = 2; slide <= 5; slide++) {
        await page.locator('[data-slot="carousel-next"]').click();
        await expect
          .poll(() => counter.ariaSnapshot())
          .toContain(`Slide ${slide} of`);
        await check();
      }
    });

    // Bug: the arrows were centered on the whole carousel, dots and counter
    // included, so they sat below the slides.
    test('the arrows sit at the middle of the slides, the dots and counter under them', async ({
      page,
    }) => {
      await open(page);
      const view = (await page
        .locator('[data-slot="carousel-content"]')
        .boundingBox())!;
      for (const arrow of ['previous', 'next']) {
        const box = (await page
          .locator(`[data-slot="carousel-${arrow}"]`)
          .boundingBox())!;
        expect(
          Math.abs(box.y + box.height / 2 - (view.y + view.height / 2)),
        ).toBeLessThan(0.5);
      }
    });

    for (const shown of [1, 2, 3, 4, 5])
      test(`with ${shown} visible, ${shown % 2 ? `${shown} whole slides show` : `${shown - 1} whole slides and two halves show`}, and dragged, no sliver or hole`, async ({
        page,
      }) => {
        await open(page, `?visible=${shown}`);
        await settle(page);
        const rest = (await visible(page)).filter((part) => part.width > 0.5);
        const whole = rest.filter((part) => part.whole && part.share > 0.99);
        const halves = rest.filter(
          (part) => !part.whole && Math.abs(part.share - 0.5) < 0.03,
        );
        expect(whole).toHaveLength(shown % 2 ? shown : shown - 1);
        expect(halves).toHaveLength(shown % 2 ? 0 : 2);
        expect(rest).toHaveLength(whole.length + halves.length);

        const view = (await page
          .locator('[data-slot="carousel-content"]')
          .boundingBox())!;
        const step = (await page
          .locator('[data-slot="carousel-item"]')
          .first()
          .boundingBox())!.width;
        const x = view.x + view.width / 2;
        const y = view.y + view.height / 2;
        for (const direction of [-1, 1]) {
          await page.mouse.move(x, y);
          await page.mouse.down();
          for (let part = 1; part <= 10; part++) {
            await page.mouse.move(x + (direction * part * step) / 10, y);
            const parts = await visible(page);
            expect(
              parts.filter((part) => part.inner > 0.05 && part.inner < 6),
            ).toEqual([]);
            const covered = parts.reduce((sum, part) => sum + part.width, 0);
            expect(covered).toBeGreaterThan(view.width * 0.9);
          }
          await page.mouse.up();
          await settle(page);
        }
      });

    test('standing up, three whole slides show, the arrows sit on the slides, and dragged, no sliver or hole', async ({
      page,
    }) => {
      await page.goto(framework.fixture('carousel-vertical'), {
        waitUntil: 'networkidle',
      });
      await ready(page, '[data-slot="carousel-next"]');
      await settle(page);
      // What shows of each card, along the height this time.
      const shown = () =>
        page.evaluate(() => {
          const view = document
            .querySelector('[data-slot="carousel-content"]')!
            .getBoundingClientRect();
          const cards = [
            ...document.querySelectorAll<HTMLElement>('[data-slot="carousel-item"]'),
          ]
            .filter(
              (slide) =>
                (slide.firstElementChild as HTMLElement).style.opacity !== '0',
            )
            .map((slide) => ({
              z: Number(slide.style.zIndex),
              box: slide.querySelector('[data-slot="card"]')!.getBoundingClientRect(),
            }));
          return cards.map(({ z, box }) => {
            let parts = [
              [Math.max(box.top, view.top), Math.min(box.bottom, view.bottom)],
            ].filter(([a, b]) => b! > a!);
            for (const other of cards) {
              if (
                other.z <= z ||
                other.box.left > box.left ||
                other.box.right < box.right
              )
                continue;
              parts = parts.flatMap(([a, b]) =>
                [
                  [a!, Math.min(b!, other.box.top)],
                  [Math.max(a!, other.box.bottom), b!],
                ].filter(([c, d]) => d! > c!),
              );
            }
            const height = parts.reduce((sum, [a, b]) => sum + b! - a!, 0);
            return {
              height,
              inner: parts
                .filter(([a, b]) => a! > view.top + 0.5 && b! < view.bottom - 0.5)
                .reduce((sum, [a, b]) => sum + b! - a!, 0),
              whole: box.top >= view.top && box.bottom <= view.bottom,
            };
          });
        });
      const rest = (await shown()).filter((part) => part.height > 0.5);
      expect(rest).toHaveLength(3);
      for (const part of rest) expect(part.whole).toBe(true);

      const view = (await page
        .locator('[data-slot="carousel-content"]')
        .boundingBox())!;
      const next = (await page
        .locator('[data-slot="carousel-next"]')
        .boundingBox())!;
      const dots = (await page
        .locator('[data-slot="carousel-dots"]')
        .boundingBox())!;
      expect(next.y).toBeGreaterThan(view.y + view.height);
      expect(next.y + next.height).toBeLessThan(dots.y);

      const step = (await page
        .locator('[data-slot="carousel-item"]')
        .first()
        .boundingBox())!.height;
      const x = view.x + view.width / 2;
      const y = view.y + view.height / 2;
      for (const direction of [-1, 1]) {
        await page.mouse.move(x, y);
        await page.mouse.down();
        for (let part = 1; part <= 10; part++) {
          await page.mouse.move(x, y + (direction * part * step) / 10);
          const parts = await shown();
          expect(parts.filter((p) => p.inner > 0.05 && p.inner < 6)).toEqual([]);
          expect(parts.reduce((sum, p) => sum + p.height, 0)).toBeGreaterThan(
            view.height * 0.9,
          );
        }
        await page.mouse.up();
        await settle(page);
      }
    });

    // Bug: the slides hidden behind the others or past the edges could still
    // be reached with Tab and were read out.
    test('the slides out of sight are out of reach, and come back as they show', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      const reach = () =>
        page.locator('[data-slot="carousel-item"]').evaluateAll((items) =>
          items.map((item) => ({
            text: item.textContent?.trim(),
            hidden:
              (item as HTMLElement).inert &&
              item.getAttribute('aria-hidden') === 'true',
          })),
        );
      const shown = async () =>
        (await reach()).filter((item) => !item.hidden).map((item) => item.text);
      expect(await shown()).toEqual(['1', '2', '5']);
      await page.locator('[data-slot="carousel-next"]').click();
      await expect.poll(shown).toEqual(['1', '2', '3']);
    });

    test('dragged, the slides grow and shrink with the scroll', async ({
      page,
    }) => {
      await open(page);
      await settle(page);
      await drag(page, -110);
      const scales = (await slides(page)).map((slide) => slide.scale);
      expect(scales.some((scale) => scale > 0.86 && scale < 0.99)).toBe(true);
      await page.mouse.up();
    });

    test('at a scale of 1, the slides keep their size', async ({ page }) => {
      await open(page, '?scale=1');
      await page.waitForTimeout(400);
      await drag(page, -60);
      expect((await slides(page)).every((slide) => slide.scale === 1)).toBe(
        true,
      );
      await page.mouse.up();
    });

    test('the current dot stretches toward the next one, then lands on it; a dot goes to its slide', async ({
      page,
    }) => {
      await open(page);
      const pill = page.locator('[data-slot="carousel-dots-indicator"]');
      const dot = await page
        .locator('[data-slot="carousel-dots"] button')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width);
      await drag(page, -140);
      await expect
        .poll(() => pill.evaluate((el) => el.getBoundingClientRect().width))
        .toBeGreaterThan(dot + 2);
      await page.mouse.up();
      await expect(
        page.locator('[data-slot="carousel-dots"] button').nth(1),
      ).toHaveAttribute('aria-current', 'true');
      await expect
        .poll(() => pill.evaluate((el) => el.getBoundingClientRect().width))
        .toBeLessThan(dot + 0.5);

      await page.getByRole('button', { name: 'Go to slide 4' }).click();
      await expect
        .poll(() =>
          page.locator('[data-slot="carousel-counter"]').ariaSnapshot(),
        )
        .toContain('Slide 4 of 5');
      const third = page.locator('[data-slot="carousel-dots"] button').nth(3);
      await expect
        .poll(async () => {
          const [a, b] = await Promise.all([
            pill.boundingBox(),
            third.boundingBox(),
          ]);
          return Math.abs(a!.x - b!.x);
        })
        .toBeLessThan(1);
    });

    // Bug: from the last slide to the first, the pill hopped over instead of
    // stretching back like it does between neighbours.
    test('from the last slide to the first, the pill stretches back across the dots', async ({
      page,
    }) => {
      await open(page);
      await page.getByRole('button', { name: 'Go to slide 5' }).click();
      await expect(
        page.locator('[data-slot="carousel-dots"] button').nth(4),
      ).toHaveAttribute('aria-current', 'true');
      await page.waitForTimeout(900);
      const dots = page.locator('[data-slot="carousel-dots"] button');
      const step =
        (await dots.nth(1).boundingBox())!.x -
        (await dots.nth(0).boundingBox())!.x;
      const pill = page.locator('[data-slot="carousel-dots-indicator"]');
      await page.locator('[data-slot="carousel-next"]').click();
      let widest = 0;
      for (let frame = 0; frame < 20; frame++) {
        widest = Math.max(
          widest,
          await pill.evaluate((el) => el.getBoundingClientRect().width),
        );
        await page.waitForTimeout(16);
      }
      expect(widest).toBeGreaterThan(step * 3);
    });

    // Bug: back on the first slide after going round, Embla's progress
    // reads 0.999 and the pill stayed on the last dot.
    test('going round the loop, the pill comes back to the first dot', async ({
      page,
    }) => {
      await open(page);
      const counter = page.locator('[data-slot="carousel-counter"]');
      for (let slide = 2; slide <= 6; slide++) {
        await page.locator('[data-slot="carousel-next"]').click();
        await expect
          .poll(() => counter.ariaSnapshot())
          .toContain(`Slide ${slide > 5 ? 1 : slide} of 5`);
      }
      const pill = page.locator('[data-slot="carousel-dots-indicator"]');
      const first = page.locator('[data-slot="carousel-dots"] button').first();
      await expect
        .poll(async () => {
          const [a, b] = await Promise.all([
            pill.boundingBox(),
            first.boundingBox(),
          ]);
          return Math.abs(a!.x - b!.x);
        })
        .toBeLessThan(1);
    });

    test('the counter reads the slide, its number sliding to the next', async ({
      page,
    }) => {
      await open(page);
      const counter = page.locator('[data-slot="carousel-counter"]');
      await expect(counter).toHaveAttribute('aria-live', 'polite');
      expect(await counter.ariaSnapshot()).toContain('Slide 1 of 5');
      await page.locator('[data-slot="carousel-next"]').click();
      await expect.poll(() => counter.ariaSnapshot()).toContain('Slide 2 of 5');
    });

    test('clicked, the arrows\' icon stays still', async ({ page }) => {
      await open(page);
      const next = page.locator('[data-slot="carousel-next"]');
      await next.click();
      const icon = next.locator('svg');
      const before = (await icon.boundingBox())!.x;
      for (let frame = 0; frame < 6; frame++) {
        await page.waitForTimeout(40);
        expect(Math.abs((await icon.boundingBox())!.x - before)).toBeLessThan(0.5);
      }
    });

    test('reduced motion: the slides keep their size', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await page.waitForTimeout(400);
      expect((await slides(page)).every((slide) => slide.scale === 1)).toBe(
        true,
      );
    });

    test('the arrow keys go from slide to slide', async ({ page }) => {
      await open(page);
      // The keys work from anywhere in the carousel.
      await page.getByRole('button', { name: 'Go to slide 1' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect
        .poll(() =>
          page.locator('[data-slot="carousel-counter"]').ariaSnapshot(),
        )
        .toContain('Slide 2 of 5');
    });
  });
}
