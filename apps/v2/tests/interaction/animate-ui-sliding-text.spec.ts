import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const track = (id: string) =>
    `[data-testid="${id}"] [data-slot="sliding-text-track"]`;

  async function open(page: Page) {
    await page.goto('/tests/fixtures/sliding-text', {
      waitUntil: 'networkidle',
    });
    await page.waitForFunction(() => {
      const el = document.querySelector('[data-testid="inline"]');
      return (
        !!el && Object.keys(el).some((key) => key.startsWith('__reactProps'))
      );
    });
  }

  function record(page: Page, id: string, duration: number) {
    return page.evaluate(
      ({ selector, duration }) =>
        new Promise<{ y: number; height: number }[]>((resolve) => {
          const seen: { y: number; height: number }[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = document.querySelector<HTMLElement>(selector)!;
            seen.push({
              y: new DOMMatrix(getComputedStyle(el).transform).m42,
              height: el.offsetHeight,
            });
            if (performance.now() - t0 < duration) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
      { selector: track(id), duration },
    );
  }

  async function hoverCenter(page: Page, id: string) {
    const box = (await page.getByTestId(id).boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  }

  function moving(seen: { y: number }[]) {
    return seen.map((s) => s.y).filter((y) => y !== 0);
  }

  function expectOneWay(values: number[], way: 1 | -1) {
    for (let i = 1; i < values.length; i++)
      expect((values[i]! - values[i - 1]!) * way).toBeGreaterThanOrEqual(-0.01);
  }

  test.describe(`${framework.name} sliding text`, () => {
    test.beforeEach(async ({ page }) => open(page));

    test('screen readers read the text once', async ({ page }) => {
      await expect(page.getByTestId('sentence')).toMatchAriaSnapshot(
        '- paragraph: Read the docs today',
      );
      await expect(
        page.getByTestId('inline').locator('[data-slot="sliding-text-copy"]'),
      ).toHaveAttribute('aria-hidden', 'true');
    });

    test('inside a sentence, it sits on the same baseline', async ({
      page,
    }) => {
      const baselines = await page.evaluate(() => {
        const baseline = (el: Element) => {
          const probe = document.createElement('span');
          probe.style.cssText = 'display:inline-block;width:0;height:0';
          el.appendChild(probe);
          const top = probe.getBoundingClientRect().top;
          probe.remove();
          return top;
        };
        return [
          baseline(document.querySelector('[data-testid="before"]')!),
          baseline(
            document.querySelector(
              '[data-testid="inline"] [data-slot="sliding-text-track"]',
            )!,
          ),
        ];
      });
      expect(baselines[1]).toBeCloseTo(baselines[0]!, 0);
    });

    test('hovered, the text slides down and its copy comes in from above, in 0.25s', async ({
      page,
    }) => {
      const recording = record(page, 'inline', 600);
      await hoverCenter(page, 'inline');
      const seen = await recording;
      const height = seen[0]!.height;
      const values = moving(seen);
      expect(values.length).toBeGreaterThan(5);
      expect(values.length).toBeLessThan(25);
      expect(Math.min(...values)).toBeGreaterThan(0);
      expect(Math.max(...values)).toBeGreaterThan(height * 0.9);
      expectOneWay(values, 1);
      expect(seen.at(-1)!.y).toBe(0);
    });

    test('left, it slides back the other way', async ({ page }) => {
      await hoverCenter(page, 'inline');
      await page.waitForTimeout(500);
      const recording = record(page, 'inline', 600);
      await page.mouse.move(5, 5);
      const seen = await recording;
      const values = moving(seen);
      expect(values.length).toBeGreaterThan(5);
      expect(values[0]!).toBeGreaterThan(seen[0]!.height * 0.8);
      expectOneWay(values, -1);
      expect(seen.at(-1)!.y).toBe(0);
    });

    test('left halfway, it turns back from where it is', async ({ page }) => {
      const recording = record(page, 'inline', 700);
      await hoverCenter(page, 'inline');
      await page.waitForTimeout(90);
      await page.mouse.move(5, 5);
      const seen = await recording;
      const values = moving(seen);
      const peak = values.indexOf(Math.max(...values));
      expect(Math.max(...values)).toBeLessThan(seen[0]!.height * 0.95);
      expectOneWay(values.slice(0, peak + 1), 1);
      expectOneWay(values.slice(peak), -1);
      for (let i = peak + 1; i < values.length; i++)
        expect(Math.abs(values[i]! - values[i - 1]!)).toBeLessThan(
          seen[0]!.height / 3,
        );
    });

    test('direction="up" slides up, its copy coming in from below', async ({
      page,
    }) => {
      const copy = await page
        .getByTestId('up')
        .locator('[data-slot="sliding-text-copy"]')
        .evaluate((el) => (el as HTMLElement).offsetTop);
      expect(copy).toBeGreaterThan(0);
      const recording = record(page, 'up', 600);
      await hoverCenter(page, 'up');
      const values = moving(await recording);
      expect(values.length).toBeGreaterThan(5);
      expect(Math.max(...values)).toBeLessThan(0);
      expectOneWay(values, -1);
    });

    test('trigger="click": hovering does nothing, each click slides once the same way', async ({
      page,
    }) => {
      let recording = record(page, 'click', 500);
      await hoverCenter(page, 'click');
      expect(moving(await recording)).toHaveLength(0);

      for (let i = 0; i < 2; i++) {
        recording = record(page, 'click', 500);
        await page.getByTestId('click').click();
        const seen = await recording;
        const values = moving(seen);
        expect(values.length).toBeGreaterThan(5);
        expect(Math.min(...values)).toBeGreaterThan(0);
        expectOneWay(values, 1);
        expect(seen.at(-1)!.y).toBe(0);
      }
    });

    test('clicked again mid-slide, it carries on without jumping', async ({
      page,
    }) => {
      const recording = record(page, 'click', 900);
      await page.getByTestId('click').click();
      await page.waitForTimeout(100);
      await page.getByTestId('click').click();
      const seen = await recording;
      const height = seen[0]!.height;
      for (let i = 1; i < seen.length; i++) {
        const wrapped =
          seen[i - 1]!.y > height * 0.9 &&
          seen[i]!.y < seen[i - 1]!.y - height * 0.8;
        if (!wrapped)
          expect(seen[i]!.y).toBeGreaterThanOrEqual(seen[i - 1]!.y - 0.01);
      }
      expect(
        seen.filter((s, i) => i && s.y < seen[i - 1]!.y - height / 2),
      ).toHaveLength(2);
    });

    test('at rest, descenders and tall letters show whole: the box clips a quarter em past the line, without taking room', async ({
      page,
    }) => {
      const box = await page.getByTestId('inline').evaluate((el) => {
        const track = el.querySelector('[data-slot="sliding-text-track"]')!;
        const outer = el.getBoundingClientRect();
        const inner = track.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          above: inner.top - outer.top,
          below: outer.bottom - inner.bottom,
          font: parseFloat(style.fontSize),
          room:
            outer.height +
            parseFloat(style.marginTop) +
            parseFloat(style.marginBottom),
          height: inner.height,
        };
      });
      expect(box.above).toBeGreaterThanOrEqual(box.font * 0.2);
      expect(box.below).toBeGreaterThanOrEqual(box.font * 0.2);
      expect(box.room).toBeCloseTo(box.height, 1);
    });

    test('the copy waits one full height and a gap away, so its descenders never peek in', async ({
      page,
    }) => {
      for (const id of ['inline', 'wrapped'] as const) {
        const { top, height, font } = await page
          .getByTestId(id)
          .locator('[data-slot="sliding-text-copy"]')
          .evaluate((el) => ({
            top: (el as HTMLElement).offsetTop,
            height: (el.parentElement as HTMLElement).offsetHeight,
            font: parseFloat(getComputedStyle(el).fontSize),
          }));
        expect(height).toBeGreaterThan(id === 'wrapped' ? 40 : 20);
        expect(top).toBeLessThanOrEqual(-height - font * 0.5);
      }
      const { top, height } = await page
        .getByTestId('up')
        .locator('[data-slot="sliding-text-copy"]')
        .evaluate((el) => ({
          top: (el as HTMLElement).offsetTop,
          height: (el.parentElement as HTMLElement).offsetHeight,
        }));
      expect(top).toBeGreaterThan(height);
    });

    test('reduced motion: hovering never moves the text', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const recording = record(page, 'inline', 600);
      await hoverCenter(page, 'inline');
      await page.waitForTimeout(100);
      await page.mouse.move(5, 5);
      expect(moving(await recording)).toHaveLength(0);
    });
  });
}
