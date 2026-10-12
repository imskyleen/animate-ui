import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import * as Hugeicons from '@hugeicons/core-free-icons';
import { expect, test, type Locator, type Page } from '@playwright/test';

// Hugeicons' animated icons (registry/hugeicons): Hugeicons' free set, drawn
// at a stroke of 2, in the same gallery as Lucide's, installed as
// `@animate-ui/hugeicons-<name>` into components/animate-ui/icons/hugeicons.

const URL = '/docs/icons/hugeicons';
const REGISTRY = path.join(process.cwd(), 'registry/hugeicons');
const NAMES = readdirSync(REGISTRY, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const title = (name: string) =>
  name
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ');

type Source = [tag: string, attrs: Record<string, string>][];
const source = (name: string) =>
  (Hugeicons as unknown as Record<string, Source>)[
    `${title(name).replace(/ /g, '')}Icon`
  ]!;

/**
 * Each run of a path (from one M to the next), as its sorted numbers: the
 * same whichever way it's drawn.
 */
const runs = (d: string) =>
  d.split(/(?=M)/).map((run) =>
    (run.match(/-?\d*\.?\d+/g) ?? [])
      .map(Number)
      .sort((a, b) => a - b)
      .join(','),
  );

async function gotoGallery(page: Page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
}

const tile = (page: Page, name: string) =>
  page.locator(`button[aria-pressed][title="${title(name)}"]`);

/**
 * Elements of the icon moved, faded or reshaped (off rest): a path's shape
 * against the one it had when first seen.
 */
const moving = (svg: Locator) =>
  svg.evaluate(
    (el) =>
      [el, ...el.querySelectorAll('*')].filter((node) => {
        const style = getComputedStyle(node);
        const m = new DOMMatrix(style.transform);
        const d = node.getAttribute('d');
        const rest = (node as HTMLElement).dataset?.restD;
        if (d !== null && rest === undefined)
          node.setAttribute('data-rest-d', d);
        return (
          !m.isIdentity ||
          Number(style.opacity) < 0.99 ||
          (rest !== undefined && rest !== d)
        );
      }).length,
  );

test.describe('hugeicons', () => {
  test('the registry draws Hugeicons’ own icons at rest, at a stroke of 2 (split into pieces to animate, never reshaped)', async ({
    page,
  }) => {
    expect(NAMES.length).toBeGreaterThanOrEqual(16);
    await page.setContent('<svg viewBox="0 0 24 24"></svg>');
    for (const name of NAMES) {
      const file = readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8');
      expect(file, name).toContain('strokeWidth={2}');
      expect(file, name).not.toMatch(/strokeWidth=\{?"?1\.5/);
      // The elements it draws at rest (their JSX attributes).
      const drawn: Source = [
        ...[...file.matchAll(/\sd="([^"]+)"/g)].map(
          (m) => ['path', { d: m[1]! }] as Source[number],
        ),
        ...[
          ...file.matchAll(
            /<motion\.circle\s+cx=\{([\d.]+)\}\s+cy=\{([\d.]+)\}\s+r=\{([\d.]+)\}/g,
          ),
        ].map(
          (m) =>
            ['circle', { cx: m[1]!, cy: m[2]!, r: m[3]! }] as Source[number],
        ),
      ];
      // Every point of Hugeicons' icon is on what's drawn, and the other
      // way round: the same icon, whatever its pieces.
      const off = await page.evaluate(
        ([theirs, ours]) => {
          const svg = document.querySelector('svg')!;
          const make = (elements: typeof theirs) =>
            elements.map(([tag, attrs]) => {
              const el = document.createElementNS(
                'http://www.w3.org/2000/svg',
                tag,
              ) as SVGGeometryElement;
              for (const [k, v] of Object.entries(attrs))
                if (['d', 'cx', 'cy', 'r'].includes(k)) el.setAttribute(k, v);
              svg.append(el);
              return el;
            });
          const points = (els: SVGGeometryElement[], step: number) =>
            els.flatMap((el) => {
              const out: DOMPoint[] = [];
              const length = el.getTotalLength();
              for (let at = 0; at <= length; at += step)
                out.push(el.getPointAtLength(at));
              out.push(el.getPointAtLength(length));
              return out;
            });
          const a = make(theirs);
          const b = make(ours);
          const far = (from: DOMPoint[], to: DOMPoint[]) =>
            Math.max(
              ...from.map((p) =>
                Math.min(...to.map((q) => Math.hypot(p.x - q.x, p.y - q.y))),
              ),
            );
          const result = Math.max(
            far(points(a, 0.25), points(b, 0.02)),
            far(points(b, 0.25), points(a, 0.02)),
          );
          svg.replaceChildren();
          return result;
        },
        [source(name), drawn] as const,
      );
      expect(off, name).toBeLessThan(0.05);
    }
  });

  test('each icon is a registry item installed into components/animate-ui/icons/hugeicons', async ({
    request,
  }) => {
    for (const name of NAMES) {
      const item = await (
        await request.get(`/r/hugeicons-${name}.json`)
      ).json();
      expect(item.name).toBe(`hugeicons-${name}`);
      expect(item.dependencies).toEqual(['@animate-ui/react', 'motion']);
      expect(item.files[0].target).toBe(
        `components/animate-ui/icons/hugeicons/${name}.tsx`,
      );
      expect(item.files[0].content).toContain(
        `${title(name).replace(/ /g, '')} as ${title(name).replace(/ /g, '')}Icon`,
      );
    }
  });

  test('the gallery lists every icon, searchable by keyword, with no empty filter row', async ({
    page,
  }) => {
    await gotoGallery(page);
    const tiles = page.locator('button[aria-pressed][title]');
    await expect(tiles).toHaveCount(NAMES.length);
    await expect(
      page.getByPlaceholder(`Search ${NAMES.length} icons…`),
    ).toBeVisible();
    // No tags, no new icons: no row of chips with "All" alone.
    await expect(
      page.getByRole('button', { name: 'All', exact: true }),
    ).toHaveCount(0);
    await page.getByPlaceholder(/Search/).fill('bell');
    await expect(tiles).toHaveCount(1);
    await expect(tile(page, 'notification-01')).toBeVisible();
  });

  test('every icon plays on hover and goes back to rest when left', async ({
    page,
  }) => {
    await gotoGallery(page);
    for (const name of NAMES) {
      const button = tile(page, name);
      const svg = button.locator('svg').first();
      await button.scrollIntoViewIfNeeded();
      await expect(svg).toBeVisible();
      await page.mouse.move(0, 0);
      await expect
        .poll(() => moving(svg), { message: `${name} at rest` })
        .toBe(0);
      await button.hover();
      await expect
        .poll(() => moving(svg), { message: `${name} plays`, intervals: [16] })
        .toBeGreaterThan(0);
      await page.mouse.move(0, 0);
      await expect
        .poll(() => moving(svg), {
          message: `${name} back to rest`,
          timeout: 3000,
        })
        .toBe(0);
    }
  });

  test('a picked icon installs from its drawer as @animate-ui/hugeicons-<name>, and imports from icons/hugeicons', async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'notification-01').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await expect(drawer).toContainText(
      'shadcn@latest add @animate-ui/hugeicons-notification-01',
    );
    await expect(drawer).toContainText(
      "import { Notification01 } from '@/components/animate-ui/icons/hugeicons/notification-01';",
    );
    // Its own animations, then the drawn ones.
    for (const animation of ['default', 'path', 'path-loop'])
      await expect(
        drawer.getByRole('button', { name: animation, exact: true }),
      ).toBeVisible();
    await drawer.getByRole('tab', { name: 'Manual' }).click();
    await expect(drawer).toContainText(
      'components/animate-ui/icons/hugeicons/notification-01.tsx',
    );
    await expect(drawer).toContainText('@animate-ui/react motion');
  });

  test('Copy 01 by default: the two pieces part, the copy down to the right, the sheet up to the left, within the grid', async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'copy-01').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'default', exact: true }).click();
    await page.waitForTimeout(700);
    const parted = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) =>
        [...svg.querySelectorAll('path')].map((path) => {
          const m = new DOMMatrix(getComputedStyle(path).transform);
          const box = path.getBBox();
          return {
            x: m.e,
            y: m.f,
            // Its stroke (2) included.
            min: Math.min(box.x + m.e, box.y + m.f) - 1,
            max:
              Math.max(box.x + box.width + m.e, box.y + box.height + m.f) + 1,
          };
        }),
      );
    // The sheet (drawn first), then the copy.
    expect(parted.map(({ x, y }) => [x, y])).toEqual([
      [-1.5, -1.5],
      [1.5, 1.5],
    ]);
    for (const piece of parted) {
      expect(piece.min).toBeGreaterThanOrEqual(-0.01);
      expect(piece.max).toBeLessThanOrEqual(24.01);
    }
  });

  test('Delete 02: the lid lifts and the bin opens below it, 4 apart (not 2), within the grid', async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'delete-02').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'default', exact: true }).click();
    await page.waitForTimeout(700);
    const { gap, top, bottom } = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        // Where an element is drawn: its box moved by its own and its
        // group's transforms.
        const drawn = (el: SVGGraphicsElement) => {
          let y = 0;
          for (
            let node: Element | null = el;
            node && node !== svg;
            node = node.parentElement
          )
            y += new DOMMatrix(getComputedStyle(node).transform).f;
          const box = el.getBBox();
          return { top: box.y + y, bottom: box.y + box.height + y };
        };
        const [lid, bin] = [...svg.querySelectorAll('path')].map(drawn) as [
          { top: number; bottom: number },
          { top: number; bottom: number },
        ];
        return {
          gap: bin.top - lid.bottom,
          top: lid.top - 1,
          bottom: bin.bottom + 1,
        };
      });
    expect(gap).toBeGreaterThan(3.9);
    expect(top).toBeGreaterThanOrEqual(-0.01);
    expect(bottom).toBeLessThanOrEqual(24.01);
  });

  test('Link 01: the links unhook along the chain, whole (never shortened), within the grid, and snap back', async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'link-01').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    const svg = drawer.locator('svg').first();
    await drawer.getByRole('button', { name: 'default', exact: true }).click();
    const frames = await svg.evaluate(
      (svg) =>
        new Promise<{ x: number; y: number; dash: string }[][]>((resolve) => {
          const out: { x: number; y: number; dash: string }[][] = [];
          const start = performance.now();
          const tick = () => {
            out.push(
              [...svg.querySelectorAll('path')].map((path) => {
                const style = getComputedStyle(path);
                const m = new DOMMatrix(style.transform);
                return { x: m.e, y: m.f, dash: style.strokeDasharray };
              }),
            );
            if (performance.now() - start < 900) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
    );
    let apart = 0;
    for (const [a, b] of frames) {
      // Whole: no dash cutting a link short.
      expect(a!.dash).toBe('none');
      expect(b!.dash).toBe('none');
      // Along the chain's axis (down-left, up-right), mirrored.
      expect(Math.abs(a!.x + a!.y)).toBeLessThan(0.01);
      expect(Math.abs(a!.x + b!.x)).toBeLessThan(0.01);
      // Never past the grid's edge (1 each way), a hair of snap aside.
      expect(Math.abs(a!.x)).toBeLessThanOrEqual(1.01);
      apart = Math.max(apart, -a!.x);
    }
    expect(apart, 'unhooked').toBeGreaterThan(0.9);
    const end = frames.at(-1)!;
    expect(end.map(({ x, y }) => [x, y])).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  test('Sparkles: both stars stay drawn, the small one twinkling (a pulse and a quarter turn) after the big one pulses', async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'sparkles').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    const svg = drawer.locator('svg').first();
    await drawer.getByRole('button', { name: 'default', exact: true }).click();
    const frames = await svg.evaluate(
      (svg) =>
        new Promise<{ opacity: number; scale: number; turn: number }[]>(
          (resolve) => {
            const small = svg.querySelectorAll('path')[1]!;
            const out: { opacity: number; scale: number; turn: number }[] = [];
            const start = performance.now();
            const tick = () => {
              const style = getComputedStyle(small);
              const m = new DOMMatrix(style.transform);
              out.push({
                opacity: Math.min(
                  Number(style.opacity),
                  Number(getComputedStyle(svg.querySelector('path')!).opacity),
                ),
                scale: Math.hypot(m.a, m.b),
                turn: (Math.atan2(m.b, m.a) * 180) / Math.PI,
              });
              if (performance.now() - start < 900) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          },
        ),
    );
    for (const f of frames) {
      expect(f.opacity, 'both stars drawn').toBe(1);
      expect(f.scale, 'never shrunk away').toBeGreaterThan(0.65);
    }
    expect(Math.max(...frames.map((f) => Math.abs(f.turn)))).toBeGreaterThan(
      30,
    );
    expect(Math.max(...frames.map((f) => f.scale))).toBeGreaterThan(1.1);
  });

  test("every clock: the minute hand goes round once, the hour hand a step on and back (as Lucide's), both pinned at the clock's center", async ({
    page,
  }) => {
    await gotoGallery(page);
    const clocks = NAMES.filter((name) => name.startsWith('clock-'));
    expect(clocks.length).toBeGreaterThanOrEqual(20);
    for (const name of clocks) {
      const button = tile(page, name);
      await button.scrollIntoViewIfNeeded();
      const svg = button.locator('svg').first();
      await expect(svg).toBeVisible();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(700);
      await button.hover();
      const run = await svg.evaluate(
        (svg) =>
          new Promise<{ minute: number; hour: number; drift: number }>(
            (resolve) => {
              const paths = [...svg.querySelectorAll('path')];
              const [minute, hour] = paths.slice(-2) as SVGPathElement[];
              const root = (svg as SVGSVGElement).getScreenCTM()!.inverse();
              // Where a hand's center end is drawn now, in the icon's grid.
              const pinned = (hand: SVGPathElement) =>
                hand
                  .getPointAtLength(hand.getTotalLength())
                  .matrixTransform(root.multiply(hand.getScreenCTM()!));
              const rest = [pinned(minute), pinned(hour)];
              const angle = (el: Element) => {
                const m = new DOMMatrix(getComputedStyle(el).transform);
                return (Math.atan2(m.b, m.a) * 180) / Math.PI;
              };
              let last = 0;
              let turned = 0;
              let hour2 = 0;
              let drift = 0;
              const start = performance.now();
              const tick = () => {
                const a = angle(minute);
                let step = a - last;
                if (step > 180) step -= 360;
                if (step < -180) step += 360;
                turned += step;
                last = a;
                hour2 = Math.max(hour2, Math.abs(angle(hour)));
                [minute, hour].forEach((hand, i) => {
                  const p = pinned(hand);
                  drift = Math.max(
                    drift,
                    Math.hypot(p.x - rest[i]!.x, p.y - rest[i]!.y),
                  );
                });
                if (performance.now() - start < 800)
                  requestAnimationFrame(tick);
                else resolve({ minute: Math.abs(turned), hour: hour2, drift });
              };
              requestAnimationFrame(tick);
            },
          ),
      );
      expect(
        run.minute,
        `${name}: the minute hand, once round`,
      ).toBeGreaterThan(300);
      expect(run.hour, `${name}: the hour hand, a step`).toBeGreaterThan(10);
      expect(run.hour).toBeLessThan(40);
      expect(run.drift, `${name}: pinned at the center`).toBeLessThan(0.05);
    }
  });

  test("Copy 01 merge: the sheet behind lands exactly on the copy, as Lucide's Copy (still drawn, not faded)", async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'copy-01').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'merge', exact: true }).click();
    await page.waitForTimeout(700);
    const fit = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const [sheet, copy] = [...svg.querySelectorAll('path')] as [
          SVGPathElement,
          SVGPathElement,
        ];
        const points = (path: SVGPathElement, step: number) => {
          const m = new DOMMatrix(getComputedStyle(path).transform);
          const out: DOMPoint[] = [];
          const length = path.getTotalLength();
          for (let at = 0; at <= length; at += step)
            out.push(m.transformPoint(path.getPointAtLength(at)));
          return out;
        };
        const outline = points(copy, 0.02);
        let worst = 0;
        for (const p of points(sheet, 0.25)) {
          let near = Infinity;
          for (const q of outline)
            near = Math.min(near, Math.hypot(p.x - q.x, p.y - q.y));
          worst = Math.max(worst, near);
        }
        return {
          worst,
          opacity: Number(getComputedStyle(sheet).opacity),
          length: sheet.getTotalLength(),
        };
      });
    expect(fit.opacity, 'the sheet still drawn').toBe(1);
    expect(fit.length, 'a sheet, not a point').toBeGreaterThan(20);
    expect(fit.worst, 'every point of the sheet on the copy').toBeLessThan(0.1);
  });

  test("Lucide's and Hugeicons' icons of the same name don't mix up, from one gallery to the other", async ({
    page,
  }) => {
    await page.goto('/docs/icons/lucide-icons', { waitUntil: 'networkidle' });
    // Lucide's Star, loaded once in view.
    const lucideStar = page.locator('button[aria-pressed][title="Star"]');
    await lucideStar.scrollIntoViewIfNeeded();
    await expect(lucideStar.locator('svg')).toBeVisible();
    // Client-side, the loaded modules kept.
    await page.locator('aside a[href="/docs/icons/hugeicons"]').click();
    await page.waitForURL(`**${URL}`);
    // (Loaded once in view.)
    await tile(page, 'star').scrollIntoViewIfNeeded();
    const star = tile(page, 'star').locator('svg path');
    await expect(star).toHaveCount(1);
    expect(runs((await star.getAttribute('d'))!)).toEqual(
      runs(source('star')[0]![1].d!),
    );
  });
});
