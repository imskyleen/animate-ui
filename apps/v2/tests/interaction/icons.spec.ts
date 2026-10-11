import { expect, test, type Locator, type Page } from '@playwright/test';

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
    await expect(drawer.getByText('@animate-ui/icons-bell')).toBeVisible();
    await drawer.getByRole('tab', { name: 'Manual' }).click();
    await expect(
      drawer.getByText('components/animate-ui/icons/bell.tsx'),
    ).toBeVisible();
    await expect(
      drawer.getByText('pnpm add @animate-ui/react motion'),
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
});
