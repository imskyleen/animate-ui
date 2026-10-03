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

export type HeightSample = { t: number; h: number; o: number };

/**
 * Records the rendered height and opacity of the first element matching
 * `selector` (and containing `text`) on every frame for `durationMs` (0 when
 * absent or hidden). Sampled in the page, so it holds up on a busy machine. Start it, trigger
 * the change, then await `samples()`.
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
        const samples: { t: number; h: number; o: number }[] = [];
        const start = performance.now();
        const tick = () => {
          const el = [...document.querySelectorAll<HTMLElement>(sel)].find(
            (candidate) => candidate.textContent?.includes(text),
          );
          const shown = el && !el.hasAttribute('hidden');
          samples.push({
            t: performance.now() - start,
            h: shown ? el.getBoundingClientRect().height : 0,
            o: shown ? Number(getComputedStyle(el).opacity) : 0,
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

/** The interaction tests every disclosure demo passes. */
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

    test('opens by growing its height and fading in, then settles', async ({
      page,
    }) => {
      const timeline = await recordHeights(page, panel, 1200, closed.text);
      await trigger(page, closed.trigger).click();
      const samples = await timeline.samples();
      const entrance = transitionTime(samples);

      expect(entrance.from).toBe(0);
      expect(entrance.to).toBeGreaterThan(20);
      // Frames in between: it grows, and fades in with it.
      expect(entrance.steps).toBeGreaterThan(2);
      expect(samples.some((s) => s.h > 0 && s.o > 0 && s.o < 1)).toBe(true);
      expect(entrance.duration).toBeLessThan(650);
      await expect(panelOf(page, closed.text)).toHaveCSS('opacity', '1');
    });

    test('closes faster than it opens, then goes away', async ({ page }) => {
      let timeline = await recordHeights(page, panel, 1200, closed.text);
      await trigger(page, closed.trigger).click();
      const entrance = transitionTime(await timeline.samples());

      timeline = await recordHeights(page, panel, 1200, closed.text);
      await trigger(page, closed.trigger).click();
      const exit = transitionTime(await timeline.samples());

      expect(exit.to).toBe(0);
      expect(exit.steps).toBeGreaterThan(1);
      expect(exit.duration).toBeLessThan(400);
      expect(exit.duration).toBeLessThan(entrance.duration);
      await expectClosed(page, closed.text);
    });

    if (open) {
      test('a panel open by default collapses on click', async ({ page }) => {
        await expect(panelOf(page, open.text)).toBeVisible();
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
