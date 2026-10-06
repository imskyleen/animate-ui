import { expect, test, type Locator, type Page } from '@playwright/test';

/**
 * Waits until React has hydrated the page's buttons: in dev, `networkidle`
 * can come before hydration, and a click then does nothing.
 */
export async function gotoHydrated(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    const buttons = [...document.querySelectorAll('button')];
    return (
      buttons.length > 0 &&
      buttons.every((button) =>
        Object.keys(button).some((key) => key.startsWith('__reactProps')),
      )
    );
  });
}

export type HeightSample = {
  t: number;
  /** Rendered height. */
  h: number;
  /** Opacity. */
  o: number;
  /** Blur radius, in px (0 without a blur). */
  b: number;
  /** The content's height the faded edge uses, in px (NaN when unset). */
  e: number;
};

/**
 * Records the rendered height, opacity and blur of the first element matching
 * `selector` (and containing `text`) on every frame for
 * `durationMs` (height and opacity 0 when absent or hidden). Sampled in the
 * page, so it holds up on a busy machine. Start it, trigger the change, then
 * await `samples()`.
 */
export async function recordHeights(
  page: Page,
  selector: string,
  durationMs = 1200,
  text = '',
) {
  await page.evaluate(
    ({ sel, duration, text }) => {
      const w = window as unknown as { __heights?: Promise<unknown> };
      w.__heights = new Promise((resolve) => {
        const samples: {
          t: number;
          h: number;
          o: number;
          b: number;
          e: number;
        }[] = [];
        const start = performance.now();
        const tick = () => {
          const el = [...document.querySelectorAll<HTMLElement>(sel)].find(
            (candidate) => candidate.textContent?.includes(text),
          );
          const shown = el && !el.hasAttribute('hidden');
          const style = el ? getComputedStyle(el) : null;
          const blur = style?.filter.match(/blur\(([\d.e-]+)px\)/);
          samples.push({
            t: performance.now() - start,
            h: shown ? el.getBoundingClientRect().height : 0,
            o: shown ? Number(style!.opacity) : 0,
            b: blur ? Number(blur[1]) : 0,
            e: parseFloat(
              style?.getPropertyValue('--animate-ui-panel-content') ?? '',
            ),
          });
          if (performance.now() - start < duration) requestAnimationFrame(tick);
          else resolve(samples);
        };
        requestAnimationFrame(tick);
      });
    },
    { sel: selector, duration: durationMs, text },
  );

  return {
    samples: async () =>
      (await page.evaluate(
        () => (window as unknown as { __heights: Promise<unknown> }).__heights,
      )) as HeightSample[],
  };
}

/**
 * How long the height took to go from its first value to its last one: from
 * the first frame that differs from the start to the first frame at the end.
 */
export function transitionTime(samples: HeightSample[]) {
  const from = samples[0]!.h;
  const to = samples[samples.length - 1]!.h;
  const start = samples.findIndex((s) => Math.abs(s.h - from) > 0.5);
  if (start === -1) return { from, to, duration: 0, steps: 0 };
  const end = samples.findIndex(
    (s, i) => i >= start && Math.abs(s.h - to) < 0.5,
  );
  // The frame before the first change is when the change was triggered.
  const begin = samples[Math.max(start - 1, 0)]!.t;
  return {
    from,
    to,
    duration: samples[end]!.t - begin,
    // Intermediate frames: 0 or 1 means the height jumped.
    steps: end - start,
  };
}

/**
 * Clicks the button labelled `label` from inside the page, waits two frames
 * and returns the state of `panel`: a mid-transition check that doesn't
 * depend on round trips to the test runner.
 */
export async function clickAndInspect(
  page: Page,
  label: string,
  panel: Locator,
) {
  await page.evaluate((name) => {
    const button = [...document.querySelectorAll('button')].find(
      (b) =>
        b.getAttribute('aria-label') === name || b.textContent?.trim() === name,
    );
    if (!button) throw new Error(`No button ${name}`);
    button.click();
  }, label);
  return panel.evaluate(async (el) => {
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
    return {
      hidden: el.hasAttribute('hidden'),
      inert: (el as HTMLElement).inert,
      height: el.getBoundingClientRect().height,
      opacity: Number(getComputedStyle(el).opacity),
    };
  });
}

type DemoOptions = {
  url: string;
  /** Selector of the panels. */
  panel: string;
  /** A closed panel: its trigger's name and a text inside it. */
  closed: { trigger: string; text: string };
  /** A panel open by default, if any: its trigger's name and a text inside. */
  open?: { trigger: string; text: string };
  /** How a closed panel ends up: removed, or kept with `hidden`. */
  closedState: 'unmounted' | 'hidden';
};

/**
 * The interaction tests every disclosure demo passes: the panel unfolds, its
 * height growing from 0 while the content fades in from a 2px blur, over
 * 350ms on a soft ease-out both ways.
 */
export function disclosureDemoTests(name: string, options: DemoOptions) {
  const { url, panel, closed, open, closedState } = options;

  test.describe(name, () => {
    test.beforeEach(async ({ page }) => {
      await gotoHydrated(page, url);
    });

    const trigger = (page: Page, label: string) =>
      page.getByRole('button', { name: label, exact: true });
    const panelOf = (page: Page, text: string) =>
      page.locator(panel).filter({ hasText: text });
    const expectClosed = async (page: Page, text: string) => {
      if (closedState === 'unmounted')
        await expect(panelOf(page, text)).toHaveCount(0, { timeout: 600 });
      else await expect(panelOf(page, text)).toBeHidden({ timeout: 600 });
    };

    test('unfolds: its height grows while the content fades in from a blur, then settles', async ({
      page,
    }) => {
      const timeline = await recordHeights(page, panel, 1200, closed.text);
      await trigger(page, closed.trigger).click();
      const samples = await timeline.samples();
      const entrance = transitionTime(samples);

      expect(entrance.from).toBe(0);
      expect(entrance.to).toBeGreaterThan(20);
      // Frames in between: it grows while the content fades in and clears.
      expect(entrance.steps).toBeGreaterThan(2);
      const moving = samples.filter((s) => s.h > 0.5 && s.o < 0.99);
      expect(moving.some((s) => s.o > 0 && s.o < 1)).toBe(true);
      expect(moving.some((s) => s.b > 0.1 && s.b < 2)).toBe(true);
      // A soft ease-out, not a snap: four fifths of the height take ~140ms
      // (~90ms on the menus' strong ease-out). A busy machine only delays it.
      const first = samples.findIndex((s) => s.h > 0.5);
      const begin = samples[Math.max(first - 1, 0)]!.t;
      const fourFifths = samples.find((s) => s.h >= entrance.to * 0.8)!;
      expect(fourFifths.t - begin).toBeGreaterThan(110);
      // 350ms on a soft ease-out: the last half pixel lands near the end (a
      // frame or two of slack on a busy machine).
      expect(entrance.duration).toBeGreaterThan(200);
      expect(entrance.duration).toBeLessThan(550);
      await expect(panelOf(page, closed.text)).toHaveCSS('opacity', '1');
      // At rest, no filter is left on the panel.
      await expect(panelOf(page, closed.text)).toHaveCSS('filter', 'none');
      expect(samples.at(-1)!.b).toBe(0);
      // Its bottom edge fades while it moves (over 16px, or the part still
      // hidden): it knows the content's height then, and forgets it at rest,
      // where nothing fades.
      await expect(panelOf(page, closed.text)).toHaveCSS(
        'mask-image',
        /linear-gradient/,
      );
      expect(moving.some((s) => Math.abs(s.e - entrance.to) < 1)).toBe(true);
      expect(samples.at(-1)!.e).toBeNaN();
    });

    test('closes the same way, in reverse, then goes away', async ({
      page,
    }) => {
      let timeline = await recordHeights(page, panel, 1200, closed.text);
      await trigger(page, closed.trigger).click();
      const entrance = transitionTime(await timeline.samples());

      timeline = await recordHeights(page, panel, 1200, closed.text);
      await trigger(page, closed.trigger).click();
      const samples = await timeline.samples();
      const exit = transitionTime(samples);

      expect(exit.to).toBe(0);
      expect(exit.steps).toBeGreaterThan(2);
      // As long as the opening (one 350ms transition, both ways).
      expect(exit.duration).toBeGreaterThan(200);
      expect(exit.duration).toBeLessThan(550);
      expect(Math.abs(exit.duration - entrance.duration)).toBeLessThan(150);
      // The content fades out into the blur.
      const moving = samples.filter((s) => s.h > 0.5 && s.o < 0.99);
      expect(moving.some((s) => s.b > 0.1 && s.b < 2)).toBe(true);
      await expectClosed(page, closed.text);
    });

    if (open) {
      test('page load: the panel open by default animates open, as in v1', async ({
        page,
      }) => {
        // Sampled from the first frames: it mounts collapsed, then opens
        // (for up to a minute: a busy dev server can hydrate late).
        await page.addInitScript(
          ({ selector, text }) => {
            const w = window as unknown as { __mount: number[][] };
            w.__mount = [];
            const tick = () => {
              const el = [
                ...document.querySelectorAll<HTMLElement>(selector),
              ].find((candidate) => candidate.textContent?.includes(text));
              if (el) {
                const style = getComputedStyle(el);
                const blur = style.filter.match(/blur\(([\d.e-]+)px\)/);
                w.__mount.push([
                  el.getBoundingClientRect().height,
                  Number(style.opacity),
                  blur ? Number(blur[1]) : 0,
                ]);
              }
              if (w.__mount.length < 3600) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          },
          { selector: panel, text: open.text },
        );
        await gotoHydrated(page, url);
        await expect(panelOf(page, open.text)).toHaveCSS('opacity', '1');
        const full = await panelOf(page, open.text).evaluate(
          (el) => el.getBoundingClientRect().height,
        );
        const frames = await page.evaluate(
          () => (window as unknown as { __mount: number[][] }).__mount,
        );
        expect(full).toBeGreaterThan(20);
        expect(frames[0]![0]).toBeLessThan(1);
        expect(
          frames.some(
            ([h, o, b]) => h! > 1 && h! < full - 1 && o! < 1 && b! > 0.1,
          ),
        ).toBe(true);
      });

      test('a panel open by default collapses on click', async ({ page }) => {
        await expect(panelOf(page, open.text)).toBeVisible();
        // Its own entrance (on mount) is over.
        await expect(panelOf(page, open.text)).toHaveCSS('opacity', '1');
        const timeline = await recordHeights(page, panel, 1000, open.text);
        await trigger(page, open.trigger).click();
        const exit = transitionTime(await timeline.samples());
        expect(exit.from).toBeGreaterThan(20);
        expect(exit.to).toBe(0);
        expect(exit.steps).toBeGreaterThan(1);
        await expectClosed(page, open.text);
      });
    }

    test('the keyboard toggles it', async ({ page }) => {
      await trigger(page, closed.trigger).focus();
      await page.keyboard.press('Enter');
      await expect(trigger(page, closed.trigger)).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      await expect(panelOf(page, closed.text)).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(trigger(page, closed.trigger)).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      await expectClosed(page, closed.text);
    });

    test('reopening during the exit retargets', async ({ page }) => {
      await trigger(page, closed.trigger).click();
      await expect(panelOf(page, closed.text)).toHaveCSS('opacity', '1');
      await page.waitForTimeout(300);
      // In the page: close, reopen 120ms later, then watch the height.
      const result = await page.evaluate(
        async ({ selector, text, label }) => {
          const frame = () => new Promise((r) => requestAnimationFrame(r));
          const height = () =>
            [...document.querySelectorAll<HTMLElement>(selector)]
              .find((el) => el.textContent?.includes(text))
              ?.getBoundingClientRect().height ?? 0;
          const button = [...document.querySelectorAll('button')].find(
            (b) =>
              b.getAttribute('aria-label') === label ||
              b.textContent?.trim() === label,
          )!;
          const full = height();
          button.click();
          const start = performance.now();
          while (performance.now() - start < 120) await frame();
          const closing = height();
          button.click();
          const after: number[] = [];
          const reopened = performance.now();
          while (performance.now() - reopened < 900) {
            await frame();
            after.push(height());
          }
          return { full, closing, after };
        },
        { selector: panel, text: closed.text, label: closed.trigger },
      );
      expect(result.closing).toBeGreaterThan(0);
      expect(result.closing).toBeLessThan(result.full);
      // It grows back from where it was, never from zero.
      expect(Math.min(...result.after)).toBeGreaterThan(0);
      expect(result.after.at(-1)).toBeCloseTo(result.full, 0);
    });

    test('reduced motion: the height jumps', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const timeline = await recordHeights(page, panel, 1000, closed.text);
      await trigger(page, closed.trigger).click();
      const entrance = transitionTime(await timeline.samples());
      expect(entrance.to).toBeGreaterThan(20);
      expect(entrance.steps).toBeLessThanOrEqual(1);
    });
  });
}
