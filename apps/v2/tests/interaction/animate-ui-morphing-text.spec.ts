import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = async (page: Page) => {
    await page.goto(framework.demo('morphing-text'), {
      waitUntil: 'networkidle',
    });
    await ready(page, '[data-slot="morphing-text"]');
  };

  const root = (page: Page) => page.locator('[data-slot="morphing-text"]');
  const srText = (page: Page) => root(page).locator('.sr-only');

  const hideTab = (page: Page) =>
    page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

  const LETTERS = '[aria-hidden="true"] > span:not([style*="hidden"])';

  const letters = (page: Page) =>
    root(page)
      .locator(LETTERS)
      .evaluateAll((els) =>
        els.map((el) => {
          const cs = getComputedStyle(el);
          const m = cs.transform.match(/matrix\(([^,]+)/);
          const shift = new DOMMatrix(cs.transform).f;
          const blur = cs.filter.match(/blur\(([\d.]+)px\)/);
          return {
            scale: m ? Number(m[1]) : 1,
            shift,
            blur: blur ? Number(blur[1]) : 0,
            opacity: Number(cs.opacity),
          };
        }),
      );

  const TEXTS = [
    'MorphingText Primitive',
    'Animate your text 🚀',
    'Handles emojis 🚀✨',
    'Built with Motion ✨',
  ];

  const recordTexts = (page: Page) =>
    page.addInitScript(() => {
      const log: [number, string][] = [];
      (window as unknown as { __texts: typeof log }).__texts = log;
      const tick = () => {
        const text =
          document.querySelector('[data-slot="morphing-text"] .sr-only')
            ?.textContent ?? '';
        if (text && log.at(-1)?.[1] !== text)
          log.push([performance.now(), text]);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

  const textsOf = (page: Page) =>
    page.evaluate(
      () => (window as unknown as { __texts: [number, string][] }).__texts,
    );

  async function nextText(page: Page, timeout = 4000) {
    const current = await srText(page).textContent();
    await expect(srText(page)).not.toHaveText(current!, { timeout });
  }

  test.describe(`${framework.name} morphing text`, () => {
    test('screen readers read the current text whole', async ({ page }) => {
      await open(page);
      expect(TEXTS).toContain(await srText(page).textContent());
      await expect(root(page).locator('> [aria-hidden="true"]')).toHaveCount(1);
    });

    test('the spaces between words take room', async ({ page }) => {
      await open(page);
      const widths = await root(page)
        .locator('[aria-hidden="true"] > span')
        .evaluateAll((spans) =>
          spans
            .filter((span) => /^\s$/.test(span.textContent ?? ''))
            .map((span) => span.getBoundingClientRect().width),
        );
      expect(widths.length).toBeGreaterThan(0);
      for (const width of widths) expect(width).toBeGreaterThan(2);
    });

    test('emoji stay whole', async ({ page }) => {
      await open(page);
      await expect(srText(page)).toHaveText('Animate your text 🚀', {
        timeout: 12_000,
      });
      const pieces = await root(page)
        .locator('[aria-hidden="true"] > span')
        .allTextContents();
      expect(pieces).toContain('🚀');
    });

    test('holds each text for 2.5s, then morphs to the next', async ({
      page,
    }) => {
      await recordTexts(page);
      await open(page);
      await expect
        .poll(async () => (await textsOf(page)).length, { timeout: 10_000 })
        .toBeGreaterThanOrEqual(3);
      const [first, second, third] = await textsOf(page);
      expect([first![1], second![1], third![1]]).toEqual(TEXTS.slice(0, 3));
      expect(second![0] - first![0]).toBeGreaterThan(2200);
      expect(third![0] - second![0]).toBeGreaterThan(2200);
      expect(third![0] - second![0]).toBeLessThan(3500);
    });

    test('new letters rise in from a blur, then settle', async ({ page }) => {
      await open(page);
      const rising = root(page).evaluate(async (el, selector) => {
        const first = el.querySelector('.sr-only')!.textContent;
        while (el.querySelector('.sr-only')!.textContent === first)
          await new Promise((r) => requestAnimationFrame(r));
        let seen = false;
        const start = performance.now();
        while (performance.now() - start < 600) {
          await new Promise((r) => requestAnimationFrame(r));
          for (const span of el.querySelectorAll<HTMLElement>(selector)) {
            const cs = getComputedStyle(span);
            const blur = Number(
              cs.filter.match(/blur\(([\d.e-]+)px\)/)?.[1] ?? 0,
            );
            if (blur > 0.5 && new DOMMatrix(cs.transform).f > 0.5) seen = true;
          }
        }
        return seen;
      }, LETTERS);
      expect(await rising).toBe(true);
      await expect
        .poll(
          async () =>
            (await letters(page)).every(
              (l) =>
                l.blur === 0 &&
                l.scale === 1 &&
                l.shift === 0 &&
                l.opacity === 1,
            ),
          { timeout: 2400 },
        )
        .toBe(true);
    });

    // Bug: letters were matched by character alone, so they crossed the whole text as it changed.
    test('the letters both texts share slide in their order, never crossing', async ({
      page,
    }) => {
      await open(page);
      const crossings = root(page).evaluate(async (el, selector) => {
        let crossed = 0;
        const start = performance.now();
        while (performance.now() - start < 3600) {
          await new Promise((r) => requestAnimationFrame(r));
          const lefts = [...el.querySelectorAll<HTMLElement>(selector)]
            .filter((span) => {
              const cs = getComputedStyle(span);
              return (
                cs.position !== 'absolute' &&
                Number(cs.opacity) > 0.99 &&
                !/blur\((?!0px)/.test(cs.filter)
              );
            })
            .map((span) => span.getBoundingClientRect().left);
          if (lefts.some((left, i) => i > 0 && left < lefts[i - 1]! - 1))
            crossed++;
        }
        return crossed;
      }, LETTERS);
      await nextText(page);
      expect(await crossings).toBe(0);
    });

    // Bug: each letter in its own box lost the font's kerning, leaving gaps.
    test('at rest, the letters sit where the font sets them', async ({
      page,
    }) => {
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      const { drawn, natural } = await root(page).evaluate((el, selector) => {
        const spans = [...el.querySelectorAll<HTMLElement>(selector)];
        const first = spans[0]!.getBoundingClientRect();
        const last = spans.at(-1)!.getBoundingClientRect();
        const probe = document.createElement('span');
        const cs = getComputedStyle(spans[0]!);
        probe.style.font = cs.font;
        probe.style.letterSpacing = cs.letterSpacing;
        probe.style.whiteSpace = 'pre';
        probe.style.position = 'absolute';
        probe.textContent = spans.map((span) => span.textContent).join('');
        document.body.append(probe);
        const natural = probe.getBoundingClientRect().width;
        probe.remove();
        return { drawn: last.right - first.left, natural };
      }, LETTERS);
      expect(Math.abs(drawn - natural)).toBeLessThan(0.75);
    });

    test('pauses while the tab is hidden', async ({ page }) => {
      await open(page);
      await hideTab(page);
      await page.waitForTimeout(800);
      const shown = await srText(page).textContent();
      await page.waitForTimeout(3500);
      await expect(srText(page)).toHaveText(shown!);
    });

    test('reduced motion: keeps cycling as a crossfade', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await nextText(page);
      await page.waitForTimeout(800);
      const styles = await root(page)
        .locator('[aria-hidden="true"] > span')
        .evaluateAll((els) =>
          els.map((el) => {
            const cs = getComputedStyle(el);
            return { transform: cs.transform, filter: cs.filter };
          }),
        );
      for (const s of styles) {
        expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(s.transform);
        expect(['none', 'blur(0px)']).toContain(s.filter);
      }
    });
  });
}
