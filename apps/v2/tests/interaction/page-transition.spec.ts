import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '../test';

const PAGE_TRANSITIONS = [
  { name: 'react', fixture: '/tests/fixtures/page-transition', layer: '_t_' },
  {
    // motion-v names its layers itself, where React generates them.
    name: 'vue',
    fixture: '/tests/vue-demos/fixtures/page-transition',
    layer: 'motion-view-',
  },
];

type PseudoAnimation = {
  pseudo: string;
  side: 'old' | 'new' | 'group';
  keyframes: Record<string, string>[];
};

async function open(page: Page, fixture: string) {
  await page.goto(fixture, { waitUntil: 'networkidle' });
}

async function navigate(page: Page, effect: string, to: string, layer: string) {
  await page.getByRole('radio', { name: effect }).click();
  await page.getByRole('button', { name: to, exact: true }).click();
  await page.waitForFunction(
    (layer) =>
      document
        .getAnimations()
        .some((a) =>
          (a.effect as KeyframeEffect | null)?.pseudoElement?.includes(layer),
        ),
    layer,
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

const page = (list: PseudoAnimation[], side: 'old' | 'new', layer: string) =>
  list.filter((a) => a.side === side && a.pseudo.includes(layer));

const first = (
  list: PseudoAnimation[],
  side: 'old' | 'new',
  key: string,
  layer: string,
) =>
  page(list, side, layer).find((a) => key in a.keyframes[0]!)?.keyframes[0]![
    key
  ];

async function settle(page: Page) {
  await page.waitForFunction(
    () =>
      !document
        .getAnimations()
        .some((a) => (a.effect as KeyframeEffect | null)?.pseudoElement),
  );
}

for (const fw of PAGE_TRANSITIONS) {
  test.describe(`${fw.name} page transition`, () => {
    const EXPECTED: Record<string, { old: string[]; new: string[] }> = {
      fade: { old: ['opacity', 'filter'], new: ['opacity', 'filter'] },
      slide: { old: ['opacity', 'transform'], new: ['opacity', 'transform'] },
      push: { old: ['transform'], new: ['transform'] },
      zoom: {
        old: ['opacity', 'transform', 'transformOrigin'],
        new: ['opacity', 'transform', 'transformOrigin'],
      },
      iris: { old: ['transform'], new: ['clipPath'] },
      wipe: { old: ['transform'], new: ['clipPath'] },
      bands: { old: ['transform'], new: ['clipPath'] },
      stack: {
        old: ['opacity', 'transform', 'transformOrigin'],
        new: ['transform'],
      },
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
        await open(browser, fw.fixture);
        const animations = await navigate(browser, effect, 'Blog', fw.layer);
        for (const side of ['old', 'new'] as const) {
          const keys = page(animations, side, fw.layer).flatMap((a) =>
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

    test('random picks one effect per navigation, never the same twice in a row', async ({
      page: browser,
    }) => {
      await open(browser, fw.fixture);
      const signature = (list: PseudoAnimation[], side: 'old' | 'new') =>
        page(list, side, fw.layer)
          .flatMap((a) => Object.keys(a.keyframes[0]!))
          .filter(
            (key) =>
              !['offset', 'easing', 'composite', 'computedOffset'].includes(
                key,
              ),
          )
          .sort()
          .join('+');
      const known = Object.entries(EXPECTED).map(([effect, sides]) => ({
        effect,
        old: [...sides.old].sort().join('+'),
        new: [...sides.new].sort().join('+'),
      }));
      const seen: string[] = [];
      for (const to of ['Docs', 'Blog', 'Home', 'Docs', 'Blog', 'Home']) {
        const animations = await navigate(browser, 'random', to, fw.layer);
        const pair = {
          old: signature(animations, 'old'),
          new: signature(animations, 'new'),
        };
        const matches = known.filter(
          (k) => k.old === pair.old && k.new === pair.new,
        );
        expect(matches.length, JSON.stringify(pair)).toBeGreaterThan(0);
        seen.push(matches.map((m) => m.effect).join('|'));
        await settle(browser);
      }
      for (let i = 1; i < seen.length; i++)
        if (!seen[i]!.includes('|') && !seen[i - 1]!.includes('|'))
          expect(seen[i]).not.toBe(seen[i - 1]);
    });

    test('slide follows the direction: forward from the right, back from the left', async ({
      page: browser,
    }) => {
      await open(browser, fw.fixture);
      const forward = await navigate(browser, 'slide', 'Docs', fw.layer);
      expect(first(forward, 'new', 'transform', fw.layer)).toBe(
        'translateX(60px)',
      );
      await settle(browser);
      const back = await navigate(browser, 'slide', 'Home', fw.layer);
      expect(first(back, 'new', 'transform', fw.layer)).toBe(
        'translateX(-60px)',
      );
    });

    test('bands reveal the page in staggered bands', async ({
      page: browser,
    }) => {
      await open(browser, fw.fixture);
      const animations = await navigate(browser, 'bands', 'Docs', fw.layer);
      const frames = page(animations, 'new', fw.layer).find(
        (a) => 'clipPath' in a.keyframes[0]!,
      )!.keyframes;
      expect(frames.length).toBeGreaterThan(10);
      const middle = frames[Math.floor(frames.length / 2)]!.clipPath!;
      const reaches = [
        ...middle.matchAll(/([\d.]+)% [\d.]+px, ([\d.]+)% [\d.]+px/g),
      ]
        .map((m) => Number(m[2]))
        .filter((_, i) => i % 2 === 0);
      expect(new Set(reaches.map((r) => r.toFixed(1))).size).toBeGreaterThan(1);
    });

    test('both snapshots stay inside the page box, rounded like the frame that clips it', async ({
      page: browser,
    }) => {
      await open(browser, fw.fixture);
      await navigate(browser, 'push', 'Docs', fw.layer);
      const { overflow, radius } = await browser.evaluate((layer) => {
        const name = document
          .getAnimations()
          .map((a) => (a.effect as KeyframeEffect).pseudoElement ?? '')
          .find((p) => p.includes(layer))!
          .match(/\((.*)\)/)![1];
        const style = getComputedStyle(
          document.documentElement,
          `::view-transition-image-pair(${name})`,
        );
        return { overflow: style.overflow, radius: style.borderRadius };
      }, fw.layer);
      expect(overflow).toBe('clip');
      const [topLeft, topRight, bottomRight, bottomLeft] = radius
        .split(' ')
        .map(parseFloat);
      expect([topLeft, topRight]).toEqual([0, 0]);
      expect(bottomRight).toBeGreaterThan(0);
      expect(bottomLeft).toBe(bottomRight);
    });

    test('a shared element morphs above the pages', async ({
      page: browser,
    }) => {
      await open(browser, fw.fixture);
      const animations = await navigate(browser, 'zoom', 'Docs', fw.layer);
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

    test('a shared element keeps its shape: cropped, not stretched, its radius morphing', async ({
      page: browser,
    }) => {
      await open(browser, fw.fixture);
      const animations = await navigate(browser, 'fade', 'Docs', fw.layer);
      const radius = animations.find(
        (a) =>
          a.pseudo === '::view-transition-group(cover)' &&
          'borderRadius' in a.keyframes[0]!,
      );
      const target = await browser
        .locator('[data-slot="page-transition-shared"]')
        .evaluate((element) => getComputedStyle(element).borderRadius);
      expect(radius?.keyframes.map((k) => k.borderRadius)).toEqual([
        '16px',
        target,
      ]);
      expect(target).not.toBe('16px');
      const [overflow, fit] = await browser.evaluate(() => [
        getComputedStyle(
          document.documentElement,
          '::view-transition-group(cover)',
        ).overflow,
        getComputedStyle(
          document.documentElement,
          '::view-transition-old(cover)',
        ).objectFit,
      ]);
      expect(overflow).toBe('clip');
      expect(fit).toBe('cover');
    });

    test.describe('reduced motion', () => {
      test.use({ reducedMotion: 'reduce' });

      test('every effect becomes the crossfade, without movement', async ({
        page: browser,
      }) => {
        await open(browser, fw.fixture);
        const animations = await navigate(browser, 'push', 'Docs', fw.layer);
        for (const side of ['old', 'new'] as const) {
          const keys = page(animations, side, fw.layer).flatMap((a) =>
            Object.keys(a.keyframes[0]!),
          );
          expect(keys).toContain('opacity');
          expect(keys).not.toContain('transform');
          expect(keys).not.toContain('clipPath');
        }
      });
    });
  });
}

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

test('vue: routeTransitions animates a vue-router change, forward then back', async ({
  page: browser,
}) => {
  await browser.goto('/tests/vue-demos/fixtures/page-transition-router', {
    waitUntil: 'networkidle',
  });
  await expect(browser.getByRole('heading', { name: 'Home' })).toBeVisible();
  const enterFrom = async (button: string) => {
    await browser.getByRole('button', { name: button }).click();
    await browser.waitForFunction(() =>
      document
        .getAnimations()
        .some((a) =>
          (a.effect as KeyframeEffect | null)?.pseudoElement?.includes(
            'view-transition-new(motion-view-',
          ),
        ),
    );
    const from = await browser.evaluate(
      () =>
        document
          .getAnimations()
          .map((a) => a.effect as KeyframeEffect)
          .filter((e) =>
            e.pseudoElement?.includes('view-transition-new(motion-view-'),
          )
          .flatMap((e) => e.getKeyframes())
          .find((k) => 'transform' in k)?.transform as string | undefined,
    );
    await settle(browser);
    return from;
  };
  expect(await enterFrom('Go to docs')).toBe('translateX(60px)');
  await expect(browser.getByRole('heading', { name: 'Docs' })).toBeVisible();
  expect(await enterFrom('Go back')).toBe('translateX(-60px)');
  await expect(browser.getByRole('heading', { name: 'Home' })).toBeVisible();
});
