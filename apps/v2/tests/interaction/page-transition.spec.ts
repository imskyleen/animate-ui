import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '../test';

const FIXTURE = '/tests/fixtures/page-transition';

type PseudoAnimation = {
  pseudo: string;
  side: 'old' | 'new' | 'group';
  keyframes: Record<string, string>[];
};

async function open(page: Page) {
  await page.goto(FIXTURE, { waitUntil: 'networkidle' });
}

async function navigate(page: Page, effect: string, to: string) {
  await page.getByRole('radio', { name: effect }).click();
  await page.getByRole('button', { name: to, exact: true }).click();
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .some((a) =>
        (a.effect as KeyframeEffect | null)?.pseudoElement?.includes('_t_'),
      ),
  );
  return page.evaluate(() =>
    document
      .getAnimations()
      .map((a) => a.effect as KeyframeEffect | null)
      .filter((e) => e?.pseudoElement?.includes('view-transition-'))
      .map((e) => ({
        pseudo: e!.pseudoElement!,
        side: e!.pseudoElement!.includes('-old')
          ? 'old'
          : e!.pseudoElement!.includes('-new')
            ? 'new'
            : 'group',
        keyframes: e!
          .getKeyframes()
          .map((k) =>
            Object.fromEntries(
              Object.entries(k).map(([key, value]) => [key, String(value)]),
            ),
          ),
      })),
  ) as Promise<PseudoAnimation[]>;
}

const page = (list: PseudoAnimation[], side: 'old' | 'new') =>
  list.filter((a) => a.side === side && a.pseudo.includes('_t_'));

const first = (list: PseudoAnimation[], side: 'old' | 'new', key: string) =>
  page(list, side).find((a) => key in a.keyframes[0]!)?.keyframes[0]![key];

async function settle(page: Page) {
  await page.waitForFunction(
    () =>
      !document
        .getAnimations()
        .some((a) => (a.effect as KeyframeEffect | null)?.pseudoElement),
  );
}

test.describe('page transition', () => {
  const EXPECTED: Record<string, { old: string[]; new: string[] }> = {
    fade: { old: ['opacity', 'filter'], new: ['opacity', 'filter'] },
    slide: { old: ['opacity', 'transform'], new: ['opacity', 'transform'] },
    push: { old: ['transform'], new: ['transform'] },
    zoom: { old: ['opacity', 'transform'], new: ['opacity', 'transform'] },
    iris: { old: ['transform'], new: ['clipPath'] },
    wipe: { old: ['transform'], new: ['clipPath'] },
    bands: { old: ['transform'], new: ['clipPath'] },
    stack: { old: ['opacity', 'transform'], new: ['transform'] },
    flow: {
      old: ['opacity', 'transform', 'filter'],
      new: ['opacity', 'transform', 'filter'],
    },
    chop: { old: ['transform'], new: ['clipPath'] },
  };

  for (const [effect, expected] of Object.entries(EXPECTED)) {
    test(`${effect}: the old page exits and the new one enters`, async ({
      page: browser,
    }) => {
      await open(browser);
      const animations = await navigate(browser, effect, 'Blog');
      for (const side of ['old', 'new'] as const) {
        const keys = page(animations, side).flatMap((a) =>
          Object.keys(a.keyframes[0]!),
        );
        for (const key of expected[side]) expect(keys, side).toContain(key);
      }
      await settle(browser);
      await expect(
        browser.getByRole('heading', { name: 'Blog' }),
      ).toBeVisible();
    });
  }

  test('slide follows the direction: forward from the right, back from the left', async ({
    page: browser,
  }) => {
    await open(browser);
    const forward = await navigate(browser, 'slide', 'Docs');
    expect(first(forward, 'new', 'transform')).toBe('translateX(60px)');
    await settle(browser);
    const back = await navigate(browser, 'slide', 'Home');
    expect(first(back, 'new', 'transform')).toBe('translateX(-60px)');
  });

  test('bands reveal the page in staggered bands', async ({
    page: browser,
  }) => {
    await open(browser);
    const animations = await navigate(browser, 'bands', 'Docs');
    const frames = page(animations, 'new').find(
      (a) => 'clipPath' in a.keyframes[0]!,
    )!.keyframes;
    expect(frames.length).toBeGreaterThan(10);
    const middle = frames[Math.floor(frames.length / 2)]!.clipPath!;
    const reaches = [
      ...middle.matchAll(/([\d.]+)% [\d.]+%, ([\d.]+)% [\d.]+%/g),
    ]
      .map((m) => Number(m[2]))
      .filter((_, i) => i % 2 === 0);
    expect(new Set(reaches.map((r) => r.toFixed(1))).size).toBeGreaterThan(1);
  });

  test('both snapshots stay inside the page box', async ({ page: browser }) => {
    await open(browser);
    await navigate(browser, 'push', 'Docs');
    const overflow = await browser.evaluate(() => {
      const name = document
        .getAnimations()
        .map((a) => (a.effect as KeyframeEffect).pseudoElement ?? '')
        .find((p) => p.includes('_t_'))!
        .match(/\((.*)\)/)![1];
      return getComputedStyle(
        document.documentElement,
        `::view-transition-image-pair(${name})`,
      ).overflow;
    });
    expect(overflow).toBe('clip');
  });

  test('a shared element morphs above the pages', async ({ page: browser }) => {
    await open(browser);
    const animations = await navigate(browser, 'zoom', 'Docs');
    const group = animations.find(
      (a) => a.pseudo === '::view-transition-group(cover)',
    );
    expect(group?.keyframes[0]?.width).toBe('80px');
    const zIndex = await browser.evaluate(
      () =>
        getComputedStyle(
          document.documentElement,
          '::view-transition-group(cover)',
        ).zIndex,
    );
    expect(zIndex).toBe('1');
    const [height, groupHeight] = await browser.evaluate(() =>
      ['::view-transition-new(cover)', '::view-transition-group(cover)'].map(
        (pseudo) => getComputedStyle(document.documentElement, pseudo).height,
      ),
    );
    expect(height).toBe(groupHeight);
  });

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('every effect becomes the crossfade, without movement', async ({
      page: browser,
    }) => {
      await open(browser);
      const animations = await navigate(browser, 'push', 'Docs');
      for (const side of ['old', 'new'] as const) {
        const keys = page(animations, side).flatMap((a) =>
          Object.keys(a.keyframes[0]!),
        );
        expect(keys).toContain('opacity');
        expect(keys).not.toContain('transform');
        expect(keys).not.toContain('clipPath');
      }
    });
  });
});

test.describe('page transition registry', () => {
  const read = (name: string) =>
    JSON.parse(
      readFileSync(
        path.join(process.cwd(), 'public', 'r', `components-${name}.json`),
        'utf8',
      ),
    ) as {
      dependencies: string[];
      files: { content: string; target: string }[];
    };
  const effects = (source: string) => {
    const start = source.indexOf('const EFFECTS');
    return source.slice(start, source.indexOf('\n};\n', start));
  };

  test('each framework gets its own file, installed at the same path', () => {
    for (const [name, router] of [
      ['page-transition', 'next'],
      ['page-transition-react-router', 'react-router'],
      ['page-transition-tanstack-router', '@tanstack/react-router'],
    ] as const) {
      const item = read(name);
      expect(item.dependencies).toContain(router);
      expect(item.files[0]!.target).toBe(
        '@components/animate-ui/components/page-transition.tsx',
      );
    }
  });

  test('the three files share the same effects', () => {
    const next = effects(read('page-transition').files[0]!.content);
    expect(next.length).toBeGreaterThan(1000);
    expect(
      effects(read('page-transition-react-router').files[0]!.content),
    ).toBe(next);
    expect(
      effects(read('page-transition-tanstack-router').files[0]!.content),
    ).toBe(next);
  });
});
