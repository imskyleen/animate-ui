import { existsSync } from 'node:fs';
import path from 'node:path';

import { PAGE_TRANSITION_EFFECTS } from '../../lib/page-transition-effects';
import { expect, test } from '../test';

const URL = '/docs/primitives/animate-ui/page-transition';

test('every effect has its clip and poster in both themes', () => {
  for (const [effect] of PAGE_TRANSITION_EFFECTS)
    for (const theme of ['light', 'dark'])
      for (const ext of ['webm', 'jpg'])
        expect(
          existsSync(
            path.join(
              process.cwd(),
              'public',
              'previews',
              'page-transition',
              `${effect}-${theme}.${ext}`,
            ),
          ),
          `${effect}-${theme}.${ext}`,
        ).toBe(true);
});

for (const scheme of ['light', 'dark'] as const)
  test(`the effects grid plays the clips in view, in the ${scheme} theme`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(URL, { waitUntil: 'networkidle' });
    const tiles = page.locator('[data-slot="page-transition-effect"]');
    await expect(tiles).toHaveCount(PAGE_TRANSITION_EFFECTS.length);
    const first = tiles.first().locator('video');
    await first.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        first.evaluate((video: HTMLVideoElement) =>
          video.paused ? '' : video.currentSrc.split('/').pop(),
        ),
      )
      .toBe(`fade-${scheme}.webm`);
    await expect(tiles.first()).toContainText('fade');
  });

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the clips wait for a hover', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    const tile = page.locator('[data-slot="page-transition-effect"]').first();
    const video = tile.locator('video');
    await tile.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await tile.hover();
    await expect
      .poll(() => video.evaluate((v: HTMLVideoElement) => v.paused))
      .toBe(false);
  });
});

test('the markdown export lists the effects as a table', async ({
  request,
}) => {
  const markdown = await (await request.get(`${URL}.md`)).text();
  expect(markdown).not.toContain('<PageTransitionEffects');
  for (const [effect, description] of PAGE_TRANSITION_EFFECTS)
    expect(markdown).toContain(`| \`${effect}\` | ${description} |`);
});

test('the demo has its own effect picker, in sync with the controls', async ({
  page,
}) => {
  await page.goto('/tests/demos/animate-ui/page-transition?effect=zoom', {
    waitUntil: 'networkidle',
  });
  const picker = page.getByRole('radiogroup', { name: 'Effect' });
  await expect(picker.getByRole('radio')).toHaveCount(
    PAGE_TRANSITION_EFFECTS.length + 1,
  );
  await expect(picker.getByRole('radio', { name: 'random' })).toBeVisible();
  await expect(picker.getByRole('radio', { checked: true })).toHaveText('zoom');
  await picker.getByRole('radio', { name: 'iris' }).click();
  await page.getByRole('button', { name: 'Docs', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .getAnimations()
          .some(
            (a) =>
              (a.effect as KeyframeEffect | null)?.pseudoElement?.includes(
                '-new(_t_',
              ) &&
              'clipPath' in (a.effect as KeyframeEffect).getKeyframes()[0]!,
          ),
      ),
    )
    .toBe(true);
});

test.describe('the docs site', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  const hydrated = (page: import('../test').Page, label: string) =>
    page.waitForFunction((label) => {
      const link = document.querySelector(`a[aria-label^="${label}:"]`);
      return (
        !!link && Object.keys(link).some((k) => k.startsWith('__reactProps'))
      );
    }, label);

  const layout = (page: import('../test').Page) =>
    page.evaluate(() =>
      ['main[data-layout-main]', '#nd-toc'].map((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`${selector} missing at ${innerWidth}px`);
        const rect = element.getBoundingClientRect();
        return [Math.round(rect.x), Math.round(rect.width)];
      }),
    );

  test('every page change plays a page transition, on the page background, with the layout untouched', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      (window as unknown as { __effects: string[] }).__effects = [];
      Element.prototype.animate = function (keyframes, options) {
        const pseudo =
          typeof options === 'object' ? options.pseudoElement : undefined;
        if (pseudo?.startsWith('::view-transition-new('))
          (window as unknown as { __effects: string[] }).__effects.push(
            getComputedStyle(document.documentElement, pseudo).backgroundColor,
          );
        return animate.call(this, keyframes, options);
      };
    });
    await page.goto('/docs/backgrounds/hole', { waitUntil: 'networkidle' });
    const before = await layout(page);
    await hydrated(page, 'Next');
    await page.getByRole('link', { name: /^Next:/ }).click();
    await page.waitForURL('**/docs/backgrounds/stars', { timeout: 15_000 });
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              (window as unknown as { __effects: string[] }).__effects.length,
          ),
        { timeout: 15_000 },
      )
      .toBeGreaterThan(0);
    const [snapshot, body] = await page.evaluate(() => [
      (window as unknown as { __effects: string[] }).__effects[0],
      getComputedStyle(document.body).backgroundColor,
    ]);
    expect(snapshot).toBe(body);
    expect(await layout(page)).toEqual(before);
  });

  test('the previous page arrow goes back', async ({ page }) => {
    await page.addInitScript(() => {
      const start = document.startViewTransition.bind(document);
      (window as unknown as { __types: string[] }).__types = [];
      document.startViewTransition = ((
        options: { types?: string[] } | ViewTransitionUpdateCallback,
      ) => {
        if (typeof options === 'object')
          (window as unknown as { __types: string[] }).__types.push(
            ...(options.types ?? []),
          );
        return start(options as ViewTransitionUpdateCallback);
      }) as typeof document.startViewTransition;
    });
    await page.goto('/docs/primitives', { waitUntil: 'networkidle' });
    await hydrated(page, 'Previous');
    await page.getByRole('link', { name: /^Previous:/ }).click();
    await expect
      .poll(
        () =>
          page.evaluate(
            () => (window as unknown as { __types: string[] }).__types,
          ),
        { timeout: 15_000 },
      )
      .toContain('nav-back');
  });
});

test.describe('the docs site, between libraries and components', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('library tabs push sideways, while moving between components stacks', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      (window as unknown as { __entrances: string[] }).__entrances = [];
      Element.prototype.animate = function (keyframes, options) {
        const pseudo =
          typeof options === 'object' ? options.pseudoElement : undefined;
        if (pseudo?.startsWith('::view-transition-new(_t_')) {
          const transform = (keyframes as { transform?: string[] } | null)
            ?.transform?.[0];
          if (transform)
            (window as unknown as { __entrances: string[] }).__entrances.push(
              transform,
            );
        }
        return animate.call(this, keyframes, options);
      };
    });
    const next = async (click: () => Promise<void>, url: string) => {
      const count = await page.evaluate(
        () =>
          (window as unknown as { __entrances: string[] }).__entrances.length,
      );
      await click();
      await page.waitForURL(url, { timeout: 15_000 });
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                (window as unknown as { __entrances: string[] }).__entrances,
            ),
          { timeout: 15_000 },
        )
        .toHaveLength(count + 1);
      return page.evaluate(() =>
        (window as unknown as { __entrances: string[] }).__entrances.at(-1),
      );
    };
    const tab = (name: string) =>
      page.getByRole('tablist', { name: 'Library' }).getByRole('tab', { name });
    const ready = () =>
      page.waitForFunction(() =>
        Object.keys(
          document.querySelector('[role="tablist"][aria-label="Library"] a') ??
            {},
        ).some((k) => k.startsWith('__reactProps')),
      );

    await page.goto('/docs/primitives/radix-ui/accordion', {
      waitUntil: 'networkidle',
    });
    await ready();
    expect(
      await next(
        () => tab('React Aria').click(),
        '**/docs/primitives/react-aria/accordion',
      ),
    ).toBe('translateX(100%)');
    await ready();
    expect(
      await next(
        () => tab('Radix UI').click(),
        '**/docs/primitives/radix-ui/accordion',
      ),
    ).toBe('translateX(-100%)');
    await ready();
    expect(
      await next(
        () => page.getByRole('link', { name: /^Next:/ }).click(),
        '**/docs/primitives/radix-ui/alert-dialog',
      ),
    ).toBe('translateY(100%)');
  });
});
