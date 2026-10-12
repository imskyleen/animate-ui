import { expect, test, type Locator, type Page } from '@playwright/test';

import { playWaves, wavesOf } from './icon-waves';

// The icon core (@animate-ui/react/icons) on the Bell icon
// (tests/fixtures/icons.tsx), whose group swings through
// [0, 20, -10, 10, -5, 3, 0]° in 0.9s. Its triggers work as in v1: hover and
// tap animate while active, and a stopped animation returns to rest with
// Motion's default transition (a spring for rotations).

type Sample = [time: number, degrees: number];
type Recorder = { samples: Sample[]; reachedAt: number };

async function open(page: Page) {
  await page.goto('/tests/fixtures/icons', { waitUntil: 'networkidle' });
}

/**
 * Records the element's rotation on every frame, and the time it first goes
 * above `threshold` degrees.
 */
function record(svg: Locator, threshold: number) {
  return svg.evaluate((el, threshold) => {
    const recorder: Recorder = { samples: [], reachedAt: 0 };
    (window as unknown as { __recorder: Recorder }).__recorder = recorder;
    const tick = (now: number) => {
      const { a, b } = new DOMMatrix(getComputedStyle(el).transform);
      const degrees = (Math.atan2(b, a) * 180) / Math.PI;
      recorder.samples.push([now, degrees]);
      if (!recorder.reachedAt && degrees > threshold) recorder.reachedAt = now;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, threshold);
}

function waitForThreshold(page: Page) {
  return page.waitForFunction(
    () => (window as unknown as { __recorder: Recorder }).__recorder.reachedAt,
    null,
    { polling: 'raf' },
  );
}

const now = (page: Page) => page.evaluate(() => performance.now());

/** Rotations recorded between `from` and `to` (ms, page clock). */
function between(page: Page, from: number, to = Infinity) {
  return page.evaluate(
    ([from, to]) =>
      (window as unknown as { __recorder: Recorder }).__recorder.samples
        .filter(([time]) => time >= from && time <= to)
        .map(([, degrees]) => degrees),
    [from, to] as const,
  );
}

const rotation = (svg: Locator) =>
  svg.evaluate((el) => {
    const { a, b } = new DOMMatrix(getComputedStyle(el).transform);
    return (Math.atan2(b, a) * 180) / Math.PI;
  });

const maxAbs = (values: number[]) => Math.max(...values.map(Math.abs));

test.describe('icons', () => {
  test('hover plays the animation, leaving returns to rest on a spring', async ({
    page,
  }) => {
    await open(page);
    const svg = page.getByTestId('hover').locator('svg');
    await record(svg, 15);
    await svg.hover();
    await waitForThreshold(page);
    await page.mouse.move(600, 600);
    const left = await now(page);
    await page.waitForTimeout(900);
    const after = await between(page, left);
    // A spring: it swings past 0 on the way back (an ease-out would not)...
    expect(Math.max(...after)).toBeGreaterThan(0.3);
    expect(Math.min(...after)).toBeLessThan(-0.3);
    // ...and settles instead of playing the rest of the swing.
    expect(maxAbs(await between(page, left + 300))).toBeLessThan(3);
    await expect.poll(() => rotation(svg)).toBeCloseTo(0, 1);
  });

  test('tap: animates while pressed, returns to rest on release', async ({
    page,
  }) => {
    await open(page);
    const svg = page.getByTestId('tap').locator('svg');
    await record(svg, 5);
    await svg.hover();
    await page.mouse.down();
    await waitForThreshold(page);
    await page.mouse.up();
    const released = await now(page);
    await page.waitForTimeout(900);
    expect(maxAbs(await between(page, released + 300))).toBeLessThan(3);
    await expect.poll(() => rotation(svg)).toBeCloseTo(0, 1);
  });

  test('tap with completeOnStop: the animation finishes after release', async ({
    page,
  }) => {
    await open(page);
    const svg = page.getByTestId('tap-complete').locator('svg');
    await record(svg, 5);
    await svg.hover();
    await page.mouse.down();
    await waitForThreshold(page);
    await page.mouse.up();
    const released = await now(page);
    await page.waitForTimeout(900);
    // The swing goes on (through its -10° and 10° keyframes).
    expect(
      maxAbs(await between(page, released + 200, released + 450)),
    ).toBeGreaterThan(5);
  });

  test('speed 2 plays twice as fast, speed 1 as authored', async ({ page }) => {
    await open(page);
    const section = page.getByTestId('speed');
    // Time of the last frame each bell is rotated, from the first one.
    const done = section.evaluate((root) => {
      const bells = [...root.querySelectorAll('svg')];
      return new Promise<number[]>((resolve) => {
        const last = bells.map(() => 0);
        let start = 0;
        const tick = (now: number) => {
          bells.forEach((bell, i) => {
            if (getComputedStyle(bell).transform !== 'none') {
              if (!start) start = now;
              last[i] = now;
            }
          });
          if (start && now - start > 1600)
            resolve(last.map((time) => time - start));
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    });
    await section.getByRole('button', { name: 'Play' }).click();
    const [normal, fast] = await done;
    // The 0.9s swing (a few frames of slack).
    expect(normal).toBeGreaterThan(800);
    expect(normal).toBeLessThan(1000);
    expect(fast! / normal!).toBeGreaterThan(0.4);
    expect(fast! / normal!).toBeLessThan(0.6);
  });

  test('a grouped icon with a prop of its own follows its group', async ({
    page,
  }) => {
    await open(page);
    const group = page.getByTestId('group-override');
    const svg = group.locator('svg');
    await record(svg, 5);
    await group.hover();
    // It swings with the group's hover, at its own speed...
    await waitForThreshold(page);
    await page.mouse.move(600, 10);
    // ...and returns to rest when the pointer leaves the group.
    await expect.poll(() => rotation(svg)).toBeCloseTo(0, 1);
  });

  test("a grouped icon with a prop of its own waits the group's delay once", async ({
    page,
  }) => {
    await open(page);
    const section = page.getByTestId('group-delay');
    const svg = section.locator('svg');
    await record(svg, 1);
    const clicked = await now(page);
    await section.getByRole('button', { name: 'Play delayed' }).click();
    await waitForThreshold(page);
    const started = await page.evaluate(
      () =>
        (window as unknown as { __recorder: Recorder }).__recorder.reachedAt,
    );
    // 400ms, not 800ms (the group's delay, then the same delay again).
    expect(started - clicked).toBeGreaterThan(350);
    expect(started - clicked).toBeLessThan(650);
  });

  test('tap: a cancelled touch stops the animation', async ({ page }) => {
    await open(page);
    const svg = page.getByTestId('tap-loop').locator('svg');
    await svg.dispatchEvent('pointerdown', { pointerType: 'touch' });
    await page.waitForTimeout(200);
    // The browser takes the touch over to scroll: no pointerup ever comes.
    await svg.dispatchEvent('pointercancel', { pointerType: 'touch' });
    await page.waitForTimeout(1200);
    await record(svg, 1);
    await page.waitForTimeout(1200);
    expect(maxAbs(await between(page, 0))).toBeLessThan(1);
  });

  test('animateOnView plays even when the AnimateIcon is given a ref', async ({
    page,
  }) => {
    await open(page);
    const view = page.getByTestId('view-ref');
    const svg = view.locator('svg');
    await record(svg, 5);
    await view.scrollIntoViewIfNeeded();
    await waitForThreshold(page);
  });

  test('fully drawn paths rest solid, without Tailwind generating any class', async ({
    page,
  }) => {
    await open(page);
    const section = page.getByTestId('path');
    await section.getByRole('button', { name: 'Draw' }).click();
    await page.waitForTimeout(1200);
    const dashes = await section.evaluate((root) => {
      // Only the icons' own rule applies: the app's stylesheets (Tailwind's)
      // are switched off.
      for (const sheet of document.styleSheets)
        if (!sheet.ownerNode?.textContent?.includes('animate-ui-icon-path'))
          sheet.disabled = true;
      return [...root.querySelectorAll('svg [stroke-dasharray]')].map((el) => [
        el.getAttribute('stroke-dasharray'),
        getComputedStyle(el).strokeDasharray,
      ]);
    });
    // The drawn circle-plus (3 paths) and the fingerprint at rest (9).
    expect(dashes.length).toBeGreaterThanOrEqual(12);
    for (const [attribute, computed] of dashes) {
      expect(attribute).toBe('1 1');
      expect(computed).toBe('1px, 0px');
    }
  });

  test('the rule behind pathClassName is server-rendered once, in the head', async ({
    page,
  }) => {
    const html = await (await page.request.get('/tests/fixtures/icons')).text();
    const head = html.slice(0, html.indexOf('</head>'));
    expect(
      head.match(/<style[^>]*>[^<]*\.animate-ui-icon-path /g),
    ).toHaveLength(1);
    await open(page);
    expect(
      await page.evaluate(
        () =>
          [...document.querySelectorAll('style')].filter((el) =>
            el.textContent?.includes('animate-ui-icon-path'),
          ).length,
      ),
    ).toBe(1);
  });

  test('a static icon renders its svg alone; a drawing one adds the rule', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/icons-markup', {
      waitUntil: 'networkidle',
    });
    for (const i of [0, 1]) {
      const html = await page.getByTestId(`markup-${i}`).textContent();
      expect(html).toMatch(/^<svg[^]*<\/svg>$/);
    }
    expect(await page.getByTestId('markup-2').textContent()).toContain(
      '.animate-ui-icon-path [stroke-dasharray',
    );
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('icons stay at rest', async ({ page }) => {
      await open(page);
      const svg = page.getByTestId('hover').locator('svg');
      await svg.hover();
      await page.waitForTimeout(500);
      expect(await svg.evaluate((el) => getComputedStyle(el).transform)).toBe(
        'none',
      );
    });
  });
});

test.describe('icons gallery', () => {
  test('a tile clicked far down the grid opens its detail in view', async ({
    page,
  }) => {
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    const tile = page.locator('button[aria-pressed]').nth(200);
    await tile.scrollIntoViewIfNeeded();
    await tile.click();
    const close = page.getByRole('button', { name: 'Close', exact: true });
    await expect(close).toBeInViewport();
  });

  test('category tags filter the icons, each showing its number of animations', async ({
    page,
  }) => {
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    const tiles = page.locator('button[title]');
    const all = await tiles.count();
    const weather = page.getByRole('button', { name: 'Weather', exact: true });
    await weather.click();
    await expect(weather).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('button', { name: 'Cloud Rain', exact: true }),
    ).toBeVisible();
    await expect(page.locator('button[title="Bell"]')).toHaveCount(0);
    expect(await tiles.count()).toBeLessThan(all);
    // A row of tags, not every category.
    expect(
      await page
        .locator('.not-prose button[aria-pressed]:not([title])')
        .count(),
    ).toBeLessThanOrEqual(11);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    // Icons load once in view.
    await page.locator('button[title="Bell"]').scrollIntoViewIfNeeded();
    // Bell's own default animation plus path and path-loop.
    await expect(
      page
        .locator('button[title="Bell"]')
        .locator('[data-slot=animation-count]'),
    ).toHaveText('3');
  });

  test('a picked icon opens in a drawer sliding up from the bottom, swapping in place', async ({
    page,
  }) => {
    // Tall enough for the drawer to leave the first rows uncovered.
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    const drawer = page.locator('[data-slot=icon-drawer]');
    // Records the drawer's vertical offset on every frame once it mounts.
    await page.evaluate(() => {
      const w = window as unknown as { __ys: number[] };
      w.__ys = [];
      const tick = () => {
        const el = document.querySelector('[data-slot=icon-drawer]');
        if (el) w.__ys.push(new DOMMatrix(getComputedStyle(el).transform).m42);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.locator('button[title="Bell"]').click();
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(600);
    const ys = await page.evaluate(
      () => (window as unknown as { __ys: number[] }).__ys,
    );
    expect(Math.max(...ys)).toBeGreaterThan(100);
    expect(ys.at(-1)).toBeCloseTo(0, 0);
    // Pinned to the bottom of the screen.
    const box = (await drawer.boundingBox())!;
    expect(box.y + box.height).toBeCloseTo(page.viewportSize()!.height, 0);
    await expect(drawer.getByText('bell', { exact: true })).toBeVisible();
    await expect(drawer.locator('[data-slot=category]')).toHaveText([
      'Accounts & access',
      'Notifications',
    ]);

    // Installation: the CLI command, or Manual with the icon's source.
    await expect(
      // In every package manager; npm's shows first.
      drawer.getByText('npx shadcn@latest add @animate-ui/icons-bell').first(),
    ).toBeVisible();
    await drawer.getByRole('tab', { name: 'Manual' }).click();
    await expect(
      drawer.getByText('components/animate-ui/icons/bell.tsx'),
    ).toBeVisible();
    await expect(
      drawer.getByText('npm install @animate-ui/react motion').first(),
    ).toBeVisible();

    await drawer.getByRole('tab', { name: 'CLI' }).click();

    // Another icon swaps the content; the drawer stays put.
    const handle = await drawer.elementHandle();
    await page.locator('button[title="Axe"]').click();
    await expect(drawer.getByText('axe', { exact: true })).toBeVisible();
    expect(await handle!.evaluate((el) => el.isConnected)).toBe(true);

    // Escape closes it, sliding back down.
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveCount(0);
    await page.locator('button[title="Bell"]').click();
    await drawer.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(drawer).toHaveCount(0);
  });

  test('icons draw in an opaque color, so their crossing strokes read as one', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    await page.locator('button[title="Arrow Up"]').click();
    const colors = await page.evaluate(() =>
      [
        document.querySelector('button[title="Arrow Up"] svg')!,
        document.querySelector('[data-slot=icon-drawer] svg')!,
      ].map((el) => getComputedStyle(el).color),
    );
    // The docs' prose text is 90% opaque: no alpha may reach the icons.
    for (const color of colors) expect(color).not.toMatch(/\/\s*0?\.\d+\)/);
  });

  test('the preview loops its animation when asked', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    await page.locator('button[title="Bell"]').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    const loop = drawer.getByRole('button', { name: 'Loop', exact: true });
    await loop.click();
    await expect(loop).toHaveAttribute('aria-pressed', 'true');
    // Bell swings for 0.9s: looping, it still swings well after.
    await page.waitForTimeout(2200);
    const turns = await drawer
      .locator('svg')
      .first()
      .evaluate(
        (el) =>
          new Promise<number>((resolve) => {
            let max = 0;
            const start = performance.now();
            const tick = (now: number) => {
              const { a, b } = new DOMMatrix(getComputedStyle(el).transform);
              max = Math.max(max, Math.abs((Math.atan2(b, a) * 180) / Math.PI));
              if (now - start < 1200) requestAnimationFrame(tick);
              else resolve(max);
            };
            requestAnimationFrame(tick);
          }),
      );
    expect(turns).toBeGreaterThan(5);
    // The choice carries over to the next icon.
    await page.locator('button[title="Axe"]').click();
    await expect(
      drawer.getByRole('button', { name: 'Loop', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('CLI and Manual open the same gap under their tabs', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1100 });
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    await page.locator('button[title="Accessibility"]').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    // From the CLI / Manual row to the first block of the open tab.
    const gap = () =>
      drawer.evaluate((el) => {
        const row = el
          .querySelector('[aria-label="Installation"]')!
          .getBoundingClientRect();
        const block = el
          .querySelector(
            '[data-slot=tabs-content][data-state=active] [data-slot=code-tabs]',
          )!
          .getBoundingClientRect();
        return Math.round(block.top - row.bottom);
      });
    await page.waitForTimeout(600);
    const cli = await gap();
    await drawer.getByRole('tab', { name: 'Manual' }).click();
    await page.waitForTimeout(600);
    expect(await gap()).toBe(cli);
  });

  test('switching CLI and Manual glides, never clipping the commands', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1100 });
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    await page.locator('button[title="Bell"]').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await page.waitForTimeout(800);
    // The open install panel's height, and its commands', on every frame.
    const record = () =>
      drawer.evaluate(
        (el) =>
          new Promise<{ panel: number; content: number }[]>((resolve) => {
            const out: { panel: number; content: number }[] = [];
            const start = performance.now();
            const tick = (now: number) => {
              const panel = [
                ...el.querySelectorAll<HTMLElement>(
                  '[data-slot=install-tabs] > [role=tabpanel]',
                ),
              ].find((p) => p.getClientRects().length > 0);
              const block = panel?.querySelector('[data-slot=code-tabs]');
              out.push({
                panel: panel?.getBoundingClientRect().height ?? 0,
                content: block?.getBoundingClientRect().height ?? 0,
              });
              if (now - start < 1100) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          }),
      );
    for (const tab of ['Manual', 'CLI']) {
      const frames = record();
      await drawer.getByRole('tab', { name: tab }).click();
      const hs = await frames;
      const shown = hs.filter((f) => f.panel > 0);
      // No jump at the end (a glide to a stale height snapped ~50px)...
      const steps = shown
        .slice(1)
        .map((f, i) => Math.abs(f.panel - shown[i]!.panel));
      expect(Math.max(...steps), tab).toBeLessThan(40);
      // ...and the commands never grow in from nothing inside it.
      for (const f of shown.filter((f) => f.content > 0))
        expect(f.content, tab).toBeGreaterThan(90);
    }
  });

  test('pinned, the drawer sits on the screen edge; off it, it is drawn whole', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    await page.locator('button[title="Bell"]').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await page.waitForTimeout(800);
    const corners = () =>
      drawer.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          radius: parseFloat(style.borderBottomLeftRadius),
          border: style.borderBottomColor,
        };
      });
    // Pinned to the bottom of the screen: no bottom corners or border.
    expect((await corners()).radius).toBe(0);
    expect((await corners()).border).toMatch(/rgba\(.*, 0\)|transparent/);
    // Scrolled past the gallery's end, it comes off the edge: drawn whole.
    await page
      .getByRole('heading', { name: 'Installation' })
      .scrollIntoViewIfNeeded();
    await expect(drawer).toHaveAttribute('data-detached', '');
    await expect.poll(async () => (await corners()).radius).toBeGreaterThan(10);
    expect((await corners()).border).not.toMatch(/rgba\(.*, 0\)|transparent/);
    // Nothing paints over its bottom border (the bleed starts below it).
    const edge = await drawer.evaluate((el) => ({
      bottom: el.getBoundingClientRect().bottom,
      bleedTop: el.lastElementChild!.getBoundingClientRect().top,
    }));
    expect(edge.bleedTop).toBeGreaterThanOrEqual(edge.bottom - 0.01);
  });

  test.describe('the drawer at the gallery end', () => {
    test.use({ viewport: { width: 1400, height: 1000 } });
    const DRAWER = '[data-slot=icon-drawer]';

    const radius = (page: Page) =>
      page
        .locator(DRAWER)
        .evaluate((el) =>
          parseFloat(getComputedStyle(el).borderBottomLeftRadius),
        );

    /**
     * Every frame for `ms`: the drawer's bottom, its holder's (the clip), its
     * opacity, whether it's there, and the page's bottom.
     */
    const recordDrawer = (page: Page, ms: number) =>
      page.evaluate(
        (ms) =>
          new Promise<
            {
              t: number;
              there: boolean;
              bottom: number;
              clip: number;
              opacity: number;
              y: number;
              bleed: number;
            }[]
          >((resolve) => {
            const out: {
              t: number;
              there: boolean;
              bottom: number;
              clip: number;
              opacity: number;
              y: number;
              bleed: number;
            }[] = [];
            const start = performance.now();
            const tick = (now: number) => {
              const el = document.querySelector<HTMLElement>(
                '[data-slot=icon-drawer]',
              );
              const holder = el?.parentElement;
              out.push({
                t: now - start,
                there: !!el,
                bottom: el?.getBoundingClientRect().bottom ?? 0,
                clip: holder?.getBoundingClientRect().bottom ?? 0,
                opacity: el ? Number(getComputedStyle(el).opacity) : 0,
                y: el ? new DOMMatrix(getComputedStyle(el).transform).m42 : 0,
                bleed:
                  el?.lastElementChild?.getBoundingClientRect().bottom ?? 0,
              });
              if (now - start < ms) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          }),
        ms,
      );

    const toEnd = async (page: Page) => {
      await page
        .getByRole('heading', { name: 'Installation' })
        .scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
    };

    test('a search moving the gallery end detaches it without a scroll', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      await page.locator('button[title="Bell"]').click();
      await page.waitForTimeout(800);
      expect(await radius(page)).toBe(0);
      await page.getByPlaceholder(/Search/).fill('bell');
      await expect(page.locator(DRAWER)).toHaveAttribute('data-detached', '');
      await expect.poll(() => radius(page)).toBeGreaterThan(10);
    });

    test('opened at the end, it fades in place, never cut', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      await toEnd(page);
      const frames = recordDrawer(page, 700);
      await page.locator('button[title="X"]').click();
      const shown = (await frames).filter((f) => f.there && f.opacity > 0.05);
      expect(shown.length).toBeGreaterThan(5);
      for (const f of shown.slice(1)) {
        // Off the edge: inside its holder, not through its clip.
        expect(f.bottom).toBeLessThanOrEqual(f.clip + 2);
        expect(Math.abs(f.y)).toBeLessThan(2);
      }
      await expect(page.locator(DRAWER)).toHaveAttribute('data-detached', '');
    });

    test('closed at the end, it fades out in place and goes at once', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      await page.locator('button[title="Bell"]').click();
      await page.waitForTimeout(800);
      await toEnd(page);
      await expect(page.locator(DRAWER)).toHaveAttribute('data-detached', '');
      const frames = recordDrawer(page, 900);
      await page.keyboard.press('Escape');
      const all = await frames;
      for (const f of all.filter((f) => f.there && f.opacity > 0.05))
        expect(f.bottom).toBeLessThanOrEqual(f.clip + 2);
      // Removed within a few frames of its fade's end: nested exits (the
      // install tabs' panels) don't hold it there.
      const faded = all.find((f) => f.there && f.opacity < 0.01)?.t;
      const gone = all.find((f) => !f.there)?.t;
      expect(gone).toBeDefined();
      if (faded !== undefined) expect(gone! - faded).toBeLessThan(80);
    });

    test('pinned, its entrance overshoot uncovers nothing below it', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      // Long enough for a slow first mount frame on the dev server.
      const frames = recordDrawer(page, 1400);
      await page.locator('button[title="Bell"]').click();
      const height = page.viewportSize()!.height;
      const shown = (await frames).filter((f) => f.there);
      // It rose past its place for a moment (the drawer curve's overshoot)...
      expect(Math.min(...shown.map((f) => f.y))).toBeLessThan(-1);
      // ...and what's below its edge always covers down to the screen's.
      for (const f of shown)
        expect(f.bleed).toBeGreaterThanOrEqual(height - 0.5);
    });

    test('switching CLI and Manual near the end follows the gallery end', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      await page.locator('button[title="Bell"]').click();
      const drawer = page.locator(DRAWER);
      await page.waitForTimeout(800);
      await drawer.getByRole('tab', { name: 'Manual' }).click();
      await page.waitForTimeout(800);
      // The gallery's end 120px below the screen: pinned.
      await page.evaluate(() => {
        const gallery = document.querySelector('[data-slot=icon-drawer]')!
          .parentElement!.parentElement!;
        window.scrollBy(
          0,
          gallery.getBoundingClientRect().bottom - window.innerHeight - 120,
        );
      });
      await page.waitForTimeout(400);
      await expect(drawer).not.toHaveAttribute('data-detached', '');
      // CLI is shorter: the gallery's end comes up off the screen's edge.
      await drawer.getByRole('tab', { name: 'CLI' }).click();
      await expect(drawer).toHaveAttribute('data-detached', '');
      await expect.poll(() => radius(page)).toBeGreaterThan(10);
    });

    test('opened again as it fades out, it comes back without a blink', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      await toEnd(page);
      await page.locator('button[title="X"]').click();
      await page.waitForTimeout(800);
      const frames = recordDrawer(page, 700);
      // Escape, then another tile 40ms into its fade out.
      await page.evaluate(() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
        );
        setTimeout(
          () =>
            document
              .querySelector<HTMLElement>('button[title="Wifi Zero"]')!
              .click(),
          40,
        );
      });
      const all = await frames;
      const after = all.filter((f) => f.there && f.t > 20);
      // Back up from where its fade had it (a little way down), never down
      // to nothing first (the blink started its fade in over, from 0).
      expect(Math.min(...after.map((f) => f.opacity))).toBeGreaterThan(0.2);
      expect(after.at(-1)!.opacity).toBe(1);
    });

    test('closed with the focus inside it, the focus goes back to its tile', async ({
      page,
    }) => {
      await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
      await page.locator('button[title="Bell"]').click();
      const drawer = page.locator(DRAWER);
      await drawer.getByRole('tab', { name: 'Manual' }).focus();
      await page.keyboard.press('Escape');
      await expect(drawer).toHaveCount(0);
      await expect(page.locator('button[title="Bell"]')).toBeFocused();
    });
  });
});

// Lucide's wave icons pulse by default, as Hugeicons' wifi and volume do;
// their waves going and coming back (Lucide's own) is blink.
test.describe('lucide waves', () => {
  for (const title of [
    'Wifi',
    'Wifi High',
    'Wifi Low',
    'Wifi Zero',
    'Volume 1',
    'Volume 2',
    'Cast',
    'Nfc',
    'Radio',
    'Radio Tower',
    'Router',
    'Phone Call',
    'House Wifi',
  ]) {
    test(`${title} by default: its waves dim one after the other, never gone`, async ({
      page,
    }) => {
      const dips = await playWaves(
        page,
        '/docs/icons/lucide-icons',
        title,
        'default',
      );
      for (const dip of dips)
        expect(dip.min, 'never gone').toBeGreaterThan(0.2);
      const waves = wavesOf(dips);
      expect(waves.length, 'its waves dim').toBeGreaterThanOrEqual(1);
      // One after the other.
      for (let i = 1; i < waves.length; i++)
        expect(waves[i]!.at - waves[i - 1]!.at).toBeGreaterThan(60);
    });

    test(`${title} blink: its waves gone and back, one after the other`, async ({
      page,
    }) => {
      const dips = await playWaves(
        page,
        '/docs/icons/lucide-icons',
        title,
        'blink',
      );
      const waves = wavesOf(dips, 0.05);
      expect(waves.length, 'its waves gone').toBeGreaterThanOrEqual(1);
      for (let i = 1; i < waves.length; i++)
        expect(waves[i]!.at - waves[i - 1]!.at).toBeGreaterThan(100);
    });
  }
});
