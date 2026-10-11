import { expect, test, type Locator } from '@playwright/test';

// A panel whose content grows while it comes in (tests/fixtures/
// tabs-late-content.tsx): its height glides on to the content's new height,
// never ending on the stale one and jumping. Shared by the Radix UI, Base UI
// and React Aria tabs (internal/tabs).

/** The height of `target` on every frame for `ms`, once started. */
const heights = (target: Locator, ms: number) =>
  target.evaluate(
    (el, ms) =>
      new Promise<number[]>((resolve) => {
        const out: number[] = [];
        const start = performance.now();
        const tick = (now: number) => {
          // The panel shown now (a leaving one first, then the next).
          const shown = [
            ...el.querySelectorAll<HTMLElement>(
              '[role="tabpanel"], .react-aria-TabPanel',
            ),
          ].filter((panel) => panel.getClientRects().length > 0);
          out.push(shown.at(-1)?.getBoundingClientRect().height ?? 0);
          if (now - start < ms) requestAnimationFrame(tick);
          else resolve(out);
        };
        requestAnimationFrame(tick);
      }),
    ms,
  );

const CASES = [
  { id: 'radix', tab: 'Radix b' },
  { id: 'base', tab: 'Base b' },
  { id: 'aria', tab: 'Aria b' },
];

test.describe('tabs: content growing as its panel comes in', () => {
  for (const { id, tab } of CASES)
    test(`${id}: the height follows it, without a jump`, async ({ page }) => {
      await page.goto('/tests/fixtures/tabs-late-content', {
        waitUntil: 'networkidle',
      });
      const section = page.getByTestId(id);
      const frames = heights(section, 1300);
      await section.getByRole('tab', { name: tab }).click();
      const hs = await frames;
      const end = hs.at(-1)!;
      // It ends at the content's full height (the long panel: > 200px)...
      expect(end).toBeGreaterThan(200);
      // ...gliding there: no frame jumps more than a glide's step (the stale
      // glide ended ~180px short, then jumped).
      const steps = hs.slice(1).map((h, i) => Math.abs(h - hs[i]!));
      expect(Math.max(...steps)).toBeLessThan(40);
    });

  test('a frame gliding follows its content too', async ({ page }) => {
    await page.goto('/tests/fixtures/tabs-late-content', {
      waitUntil: 'networkidle',
    });
    const section = page.getByTestId('radix-frame');
    const frames = section.evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const out: number[] = [];
          const start = performance.now();
          const tick = (now: number) => {
            const frame = [
              ...el.querySelectorAll<HTMLElement>('[data-testid^="frame-"]'),
            ].filter((box) => box.getClientRects().length > 0);
            out.push(frame.at(-1)?.getBoundingClientRect().height ?? 0);
            if (now - start < 1300) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    await section.getByRole('tab', { name: 'Framed b' }).click();
    const hs = await frames;
    expect(hs.at(-1)!).toBeGreaterThan(200);
    const steps = hs.slice(1).map((h, i) => Math.abs(h - hs[i]!));
    expect(Math.max(...steps)).toBeLessThan(40);
  });

  /** What's below the tabs, every frame: its top, from the click on. */
  const below = (page: import('@playwright/test').Page, id: string) =>
    page.getByTestId(`${id}-below`).evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const out: number[] = [];
          const start = performance.now();
          const tick = (now: number) => {
            out.push(el.getBoundingClientRect().top);
            if (now - start < 1300) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );

  test('a margin escaping the panel glides along: nothing below jumps', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/tabs-late-content', {
      waitUntil: 'networkidle',
    });
    const section = page.getByTestId('margin');
    for (const tab of ['margin b', 'margin a']) {
      const frames = below(page, 'margin');
      await section.getByRole('tab', { name: tab, exact: true }).click();
      const tops = await frames;
      const steps = tops
        .slice(1)
        .map((top, i) => top - tops[i]!)
        .filter((step) => Math.abs(step) > 0.05);
      // The glide's first and last steps are small (the trapped margin made
      // them ~20px jumps), and none jumps.
      expect(Math.abs(steps[0]!), tab).toBeLessThan(5);
      expect(Math.abs(steps.at(-1)!), tab).toBeLessThan(5);
      expect(Math.max(...steps.map(Math.abs)), tab).toBeLessThan(40);
    }
  });

  for (const id of ['added', 'text'])
    test(`${id}: content arriving mid-glide is followed`, async ({ page }) => {
      await page.goto('/tests/fixtures/tabs-late-content', {
        waitUntil: 'networkidle',
      });
      const section = page.getByTestId(id);
      const frames = heights(section, 1300);
      await section.getByRole('tab', { name: `${id} b`, exact: true }).click();
      const hs = await frames;
      expect(hs.at(-1)!).toBeGreaterThan(150);
      // Glided there: no frame covers more than a quarter of the way (a jump
      // covers all of it at once).
      const steps = hs.slice(1).map((h, i) => Math.abs(h - hs[i]!));
      const way = Math.abs(hs.at(-1)! - hs[0]!);
      expect(Math.max(...steps)).toBeLessThan(Math.max(40, way / 4));
    });

  test('content that never stops resizing is let go once the switch settles', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/tabs-late-content', {
      waitUntil: 'networkidle',
    });
    const section = page.getByTestId('endless');
    await section.getByRole('tab', { name: 'endless b', exact: true }).click();
    await page.waitForTimeout(2000);
    const panel = section
      .locator('[role="tabpanel"]')
      .filter({ visible: true });
    // No glide left, nothing clipped: the panel takes its content's height.
    expect(
      await panel.evaluate(
        (el) =>
          el
            .getAnimations()
            .filter((a) => (a as CSSAnimation).animationName === undefined)
            .length,
      ),
    ).toBe(0);
    expect(await panel.evaluate((el) => getComputedStyle(el).overflowY)).toBe(
      'visible',
    );
  });

  for (const id of ['inline', 'negative'])
    test(`${id}: what's below moves without a jump`, async ({ page }) => {
      await page.goto('/tests/fixtures/tabs-late-content', {
        waitUntil: 'networkidle',
      });
      const section = page.getByTestId(id);
      // On screen first: a click would scroll it there mid-recording.
      await section.scrollIntoViewIfNeeded();
      for (const tab of [`${id} b`, `${id} a`]) {
        const frames = below(page, id);
        await section.getByRole('tab', { name: tab, exact: true }).click();
        const tops = await frames;
        const steps = tops
          .slice(1)
          .map((top, i) => top - tops[i]!)
          .filter((step) => Math.abs(step) > 0.05);
        expect(Math.abs(steps[0]!), tab).toBeLessThan(5);
        expect(Math.abs(steps.at(-1)!), tab).toBeLessThan(5);
      }
    });

  test('measuring a panel leaves its own inline style as it was', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/tabs-late-content', {
      waitUntil: 'networkidle',
    });
    const section = page.getByTestId('inline');
    const panel = () =>
      section.locator('[role="tabpanel"]').filter({ visible: true });
    await section.getByRole('tab', { name: 'inline b', exact: true }).click();
    await page.waitForTimeout(1200);
    const style = await panel().getAttribute('style');
    // React's own style, untouched (padding: var(--pad) kept whole).
    expect(style?.replace(/\s/g, '')).toBe(
      'padding:var(--pad);transition:all300ms',
    );
  });

  test('content animating its own height after it shows is not chased', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/tabs-late-content', {
      waitUntil: 'networkidle',
    });
    const section = page.getByTestId('animated');
    await section.scrollIntoViewIfNeeded();
    // How far the panel's bottom is above its content's, every frame.
    const frames = section.evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const out: number[] = [];
          const start = performance.now();
          const tick = (now: number) => {
            const child = el.querySelector('[data-testid="animates"]');
            const panel = child?.closest('[role="tabpanel"]');
            if (child && panel)
              out.push(
                child.getBoundingClientRect().bottom -
                  panel.getBoundingClientRect().bottom,
              );
            if (now - start < 1100) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    await section.getByRole('tab', { name: 'animated b', exact: true }).click();
    const gaps = await frames;
    // At most a frame behind it (it grows ~8px a frame), never clipping it.
    expect(Math.max(...gaps)).toBeLessThan(20);
    expect(gaps.at(-1)!).toBeLessThan(0.5);
  });

  test('content sizing itself as it shows glides, without a flash', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/tabs-late-content', {
      waitUntil: 'networkidle',
    });
    const section = page.getByTestId('self-sized');
    const frames = heights(section, 1300);
    await section
      .getByRole('tab', { name: 'self-sized b', exact: true })
      .click();
    const hs = (await frames).filter((h) => h > 0);
    const steps = hs.slice(1).map((h, i) => Math.abs(h - hs[i]!));
    const way = Math.abs(hs.at(-1)! - hs[0]!);
    expect(hs.at(-1)!).toBeGreaterThan(150);
    expect(Math.max(...steps)).toBeLessThan(Math.max(40, way / 4));
  });
});
