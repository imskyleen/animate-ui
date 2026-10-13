import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import * as Hugeicons from '@hugeicons/core-free-icons';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { playWaves, track, wavesOf } from './icon-waves';

// Hugeicons' animated icons (registry/hugeicons): Hugeicons' free set, drawn
// at a stroke of 2, in the same gallery as Lucide's, installed as
// `@animate-ui/icons-hugeicons-<name>` into components/animate-ui/icons/hugeicons.

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

/** Its title in the gallery (its meta's, as CCTV). */
const label = (name: string) =>
  (
    JSON.parse(
      readFileSync(path.join(REGISTRY, name, 'meta.json'), 'utf8'),
    ) as { title: string }
  ).title.replace(/ Icon$/, '');

const tile = (page: Page, name: string) =>
  page.locator(`button[aria-pressed][title="${label(name)}"]`);

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
        // Its shape and how much of it is drawn (a stroke drawing itself),
        // against when first seen.
        const shape = `${node.getAttribute('d')} ${style.strokeDasharray}`;
        const rest = (node as HTMLElement).dataset?.restShape;
        if (rest === undefined) node.setAttribute('data-rest-shape', shape);
        return (
          !m.isIdentity ||
          Number(style.opacity) < 0.99 ||
          (rest !== undefined && rest !== shape)
        );
      }).length,
  );

test.describe('hugeicons', () => {
  test('the registry draws Hugeicons’ own icons at rest, at a stroke of 2 (split into pieces to animate, never reshaped)', async ({
    page,
  }) => {
    test.setTimeout(240_000);
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
            /<(?:motion\.)?circle\s+cx=\{([\d.]+)\}\s+cy=\{([\d.]+)\}\s+r=\{([\d.]+)\}/g,
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
          // Each subpath on its own: sampled as one path, a tiny one (a
          // dot) could fall between two samples.
          const make = (elements: typeof theirs) =>
            elements
              .flatMap(([tag, attrs]) =>
                tag === 'path'
                  ? attrs
                      .d!.split(/(?=M)/)
                      .map((d) => [tag, { ...attrs, d }] as const)
                  : [[tag, attrs] as const],
              )
              .map(([tag, attrs]) => {
                const el = document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  tag,
                ) as SVGGeometryElement;
                for (const [k, v] of Object.entries(attrs))
                  if (['d', 'cx', 'cy', 'r', 'transform'].includes(k))
                    el.setAttribute(k, v);
                svg.append(el);
                return el;
              });
          const points = (els: SVGGeometryElement[], step: number) =>
            els.flatMap((el) => {
              const out: DOMPoint[] = [];
              const length = el.getTotalLength();
              // (Where its own transform puts it, if it has one.)
              const m = el.transform.baseVal.consolidate()?.matrix;
              const at = (l: number) => {
                const p = el.getPointAtLength(l);
                return m ? p.matrixTransform(m) : p;
              };
              for (let l = 0; l <= length; l += step) out.push(at(l));
              out.push(at(length));
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
        await request.get(`/r/icons-hugeicons-${name}.json`)
      ).json();
      expect(item.name).toBe(`icons-hugeicons-${name}`);
      expect(item.dependencies).toEqual(['@animate-ui/react', 'motion']);
      expect(item.files[0].target).toBe(
        `components/animate-ui/icons/hugeicons/${name}.tsx`,
      );
      expect(item.files[0].content).toContain(
        `${title(name).replace(/ /g, '')} as ${title(name).replace(/ /g, '')}Icon`,
      );
    }
  });

  test("the gallery lists every icon, searchable by keyword and filtered by Lucide's category tags, each new one dotted at its top left (New filters them)", async ({
    page,
  }) => {
    await gotoGallery(page);
    const tiles = page.locator('button[aria-pressed][title]');
    await expect(tiles).toHaveCount(NAMES.length);
    await expect(
      page.getByPlaceholder(`Search ${NAMES.length} icons…`),
    ).toBeVisible();
    // Every one new to Animate UI: a dot at its top left, as on Hugeicons'
    // site.
    await expect(tiles.locator('[data-slot=new]')).toHaveCount(NAMES.length);
    const dot = await tiles.first().evaluate((tile) => {
      const box = tile.getBoundingClientRect();
      const dot = tile
        .querySelector('[data-slot=new]')!
        .getBoundingClientRect();
      return {
        left: dot.left - box.left,
        top: dot.top - box.top,
        size: dot.width,
      };
    });
    expect(dot.left).toBeLessThan(16);
    expect(dot.top).toBeLessThan(16);
    expect(dot.size).toBe(8);
    await page.getByRole('button', { name: 'New', exact: true }).click();
    await expect(tiles).toHaveCount(NAMES.length);
    // The same tags as Lucide's: the time one keeps the clocks, not the
    // bell.
    await page.getByRole('button', { name: 'Time', exact: true }).click();
    await expect(tile(page, 'clock-01')).toBeVisible();
    await expect(tile(page, 'notification-01')).toHaveCount(0);
    expect(await tiles.count()).toBeLessThan(NAMES.length);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByPlaceholder(/Search/).fill('bell');
    await expect(tile(page, 'notification-01')).toBeVisible();
  });

  test('a picked icon installs from its drawer as @animate-ui/icons-hugeicons-<name>, and imports from icons/hugeicons', async ({
    page,
  }) => {
    await gotoGallery(page);
    await tile(page, 'notification-01').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await expect(drawer).toContainText(
      'shadcn@latest add @animate-ui/icons-hugeicons-notification-01',
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

  test("every clock (the calendar's, file's and folder's too): the minute hand goes round once, the hour hand a step on and back (as Lucide's), both pinned at the clock's center", async ({
    page,
  }) => {
    await gotoGallery(page);
    // Every icon with clock hands (the alarm clock shakes, its hands still,
    // as Lucide's).
    const clocks = NAMES.filter((name) =>
      readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8').includes(
        'variants.minute',
      ),
    );
    expect(clocks.length).toBeGreaterThanOrEqual(26);
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

  test('Gift: the lid and its bow lift off and the box opens below them, 4 apart (not 1), never past the grid', async ({
    page,
  }) => {
    await gotoGallery(page);
    const button = tile(page, 'gift');
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'default', exact: true }).click();
    const run = await drawer
      .locator('svg')
      .first()
      .evaluate(
        (svg) =>
          new Promise<{ gap: number; top: number; bottom: number }>(
            (resolve) => {
              const frame = svg.getBoundingClientRect();
              const unit = frame.height / 24;
              // In the icon's grid, its stroke (2) included.
              const box = (el: Element) => {
                const r = el.getBoundingClientRect();
                return {
                  top: (r.top - frame.top) / unit - 1,
                  bottom: (r.bottom - frame.top) / unit + 1,
                };
              };
              const paths = [...svg.querySelectorAll('path')];
              const [body, , lid] = paths;
              const lidGroup = svg.querySelector('g')!;
              let top = Infinity;
              let bottom = -Infinity;
              const start = performance.now();
              const tick = () => {
                top = Math.min(top, box(lidGroup).top);
                bottom = Math.max(bottom, box(body!).bottom);
                if (performance.now() - start < 800)
                  requestAnimationFrame(tick);
                else
                  resolve({
                    // Between the lid's bottom edge and the box's top one
                    // (their strokes' centers).
                    gap: box(body!).top + 1 - (box(lid!).bottom - 1),
                    top,
                    bottom,
                  });
              };
              requestAnimationFrame(tick);
            },
          ),
      );
    expect(run.gap).toBeGreaterThan(3.9);
    expect(run.top).toBeGreaterThanOrEqual(-0.05);
    expect(run.bottom).toBeLessThanOrEqual(24.05);
  });

  test('Gift open: it opens on one side only, the lid hinged on its left corner, never past the grid', async ({
    page,
  }) => {
    await gotoGallery(page);
    const button = tile(page, 'gift');
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'open', exact: true }).click();
    await page.waitForTimeout(700);
    const run = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const root = (svg as SVGSVGElement).getScreenCTM()!.inverse();
        const at = (el: SVGGraphicsElement, x: number, y: number) =>
          new DOMPoint(x, y).matrixTransform(root.multiply(el.getScreenCTM()!));
        const [box, , lid] = [
          ...svg.querySelectorAll('path'),
        ] as SVGPathElement[];
        // The box's top corners: its path's ends.
        const boxLeft = box!
          .getPointAtLength(0)
          .matrixTransform(root.multiply(box!.getScreenCTM()!));
        const boxRight = box!
          .getPointAtLength(box!.getTotalLength())
          .matrixTransform(root.multiply(box!.getScreenCTM()!));
        // The lid and bow's highest point drawn (their stroke, 1, above).
        let top = Infinity;
        for (const path of svg.querySelectorAll(
          'g path',
        ) as NodeListOf<SVGPathElement>) {
          const m = root.multiply(path.getScreenCTM()!);
          for (let l = 0; l <= path.getTotalLength(); l += 0.05)
            top = Math.min(
              top,
              path.getPointAtLength(l).matrixTransform(m).y - 1,
            );
        }
        return {
          left: boxLeft.y - at(lid!, 3, 11).y,
          right: boxRight.y - at(lid!, 21, 11).y,
          top,
        };
      });
    expect(run.left, 'the hinge, on the box').toBeLessThan(0.6);
    expect(run.right, 'opened on the right').toBeGreaterThan(3);
    expect(run.top).toBeGreaterThanOrEqual(-0.05);
  });

  test("Square Lock 02 unlock: the shackle's right leg comes out of the body, open (Hugeicons' unlocked lock)", async ({
    page,
  }) => {
    await gotoGallery(page);
    const button = tile(page, 'square-lock-02');
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'unlock', exact: true }).click();
    await page.waitForTimeout(600);
    const end = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const shackle = [...svg.querySelectorAll('path')].at(-1)!;
        const p = shackle.getPointAtLength(shackle.getTotalLength());
        return { x: p.x, y: p.y };
      });
    // Out of the body (its top at 9), as Hugeicons draws it unlocked.
    expect(end.x).toBeCloseTo(16.5, 1);
    expect(end.y).toBeCloseTo(5, 1);
  });

  for (const [title, count] of [
    ['Wifi 01', 4],
    ['Volume High', 2],
  ] as const)
    test(`${title} blink: Lucide's, its waves gone and back one after the other`, async ({
      page,
    }) => {
      const dips = await playWaves(page, URL, title, 'blink');
      const waves = wavesOf(dips, 0.05);
      expect(waves).toHaveLength(count);
      for (let i = 1; i < waves.length; i++)
        expect(waves[i]!.at - waves[i - 1]!.at).toBeGreaterThan(100);
    });

  for (const [title, count] of [
    ['Wifi 01', 4],
    ['Volume High', 2],
  ] as const)
    test(`${title} by default: its waves pulse one after the other, never gone`, async ({
      page,
    }) => {
      const dips = await playWaves(page, URL, title, 'default');
      for (const dip of dips) expect(dip.min).toBeGreaterThan(0.2);
      expect(wavesOf(dips)).toHaveLength(count);
    });

  test("Square Unlock 02 lock: its shackle's right leg goes back into the body (Hugeicons' locked lock)", async ({
    page,
  }) => {
    await gotoGallery(page);
    const button = tile(page, 'square-unlock-02');
    await button.scrollIntoViewIfNeeded();
    await button.click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'lock', exact: true }).click();
    await page.waitForTimeout(600);
    const end = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const shackle = [...svg.querySelectorAll('path')].at(-1)!;
        const p = shackle.getPointAtLength(shackle.getTotalLength());
        return { x: p.x, y: p.y };
      });
    // Into the body (its top at 9), as Hugeicons draws it locked.
    expect(end.x).toBeCloseTo(16.5, 1);
    expect(end.y).toBeCloseTo(9, 1);
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

// Drawn whole: no animation takes a piece past the icon's 24-unit grid (its
// stroke, 1, included), where the icon would be cut. (Sent and the arrows'
// out fly off and back in, on purpose, as Lucide's.)
test.describe('hugeicons within the grid', () => {
  for (const name of NAMES)
    test(`${name}: every animation stays within the grid`, async ({ page }) => {
      await gotoGallery(page);
      await page.getByPlaceholder(/Search/).fill(label(name).toLowerCase());
      await tile(page, name).click();
      const drawer = page.locator('[data-slot=icon-drawer]');
      const buttons = drawer
        .getByRole('button')
        .filter({ hasNotText: /^(path|path-loop)$/ })
        .filter({ hasText: /^[a-z-]+$/ });
      await expect(buttons.first()).toBeVisible();
      for (const animation of await buttons.allInnerTexts()) {
        // Off the grid and back, on purpose (as Lucide's Send and arrows).
        if (
          (['sent', 'send-horizontal'].includes(name) &&
            animation === 'default') ||
          animation === 'out'
        )
          continue;
        await drawer
          .getByRole('button', { name: animation, exact: true })
          .click();
        const out = await drawer
          .locator('svg')
          .first()
          .evaluate(
            (svg) =>
              new Promise<number>((resolve) => {
                // In the icon's own grid, where it's cut: what moves the
                // whole icon (its svg) moves its grid with it.
                const shapes = [
                  ...svg.querySelectorAll('path, circle'),
                ] as SVGGeometryElement[];
                let worst = 0;
                const start = performance.now();
                const tick = () => {
                  for (const shape of shapes) {
                    if (Number(getComputedStyle(shape).opacity) < 0.05)
                      continue;
                    // (To the svg's own pixels: back to its 24 units.)
                    const m = new DOMMatrix()
                      .scale(24 / (svg as SVGSVGElement).width.baseVal.value)
                      .multiply(shape.getCTM()!);
                    const length = shape.getTotalLength();
                    for (let at = 0; at <= length; at += 0.5) {
                      const q = shape.getPointAtLength(at);
                      const p = new DOMPoint(q.x, q.y).matrixTransform(m);
                      worst = Math.max(
                        worst,
                        1 - p.x,
                        1 - p.y,
                        p.x + 1 - 24,
                        p.y + 1 - 24,
                      );
                    }
                  }
                  if (performance.now() - start < 2000)
                    requestAnimationFrame(tick);
                  else resolve(worst);
                };
                requestAnimationFrame(tick);
              }),
          );
        expect(out, `${name} ${animation}: past the grid by`).toBeLessThan(0.1);
      }
    });
});

// Waves (wifi, volume): they pulse one after the other by default, never
// gone, and blink as Lucide's (gone and back).
test.describe('hugeicons waves', () => {
  const waved = NAMES.filter((name) =>
    readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8').includes(
      'variants.wave1',
    ),
  );
  test('every wifi and volume icon with waves has them', () => {
    expect(waved.length).toBeGreaterThanOrEqual(20);
  });
  for (const name of waved) {
    const count = (
      readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8').match(
        /variants=\{variants\.wave\d+\}/g,
      ) ?? []
    ).length;
    test(`${name}: its ${count} waves pulse one after the other, never gone; blink takes them and brings them back`, async ({
      page,
    }) => {
      const pulsed = await playWaves(page, URL, label(name), 'default');
      // (Its waves; a badge moves its own way.)
      for (const dip of pulsed.filter((dip) => dip.wave))
        expect(dip.min).toBeGreaterThan(0.2);
      const waves = wavesOf(pulsed);
      expect(waves).toHaveLength(count);
      for (let i = 1; i < waves.length; i++)
        expect(waves[i]!.at - waves[i - 1]!.at).toBeGreaterThan(60);
      const blinked = wavesOf(
        await playWaves(page, URL, label(name), 'blink'),
        0.05,
      );
      expect(blinked).toHaveLength(count);
    });
  }
});

// Icons marked off, disconnected or in error move as Lucide's (they shake,
// what marks them moving its own way), and badges animate after or along
// their waves.
test.describe('hugeicons wifi and volume states', () => {
  const shaken = (tracks: { tag: string; dx: [number, number] }[]) => {
    const group = tracks.find((t) => t.tag === 'g')!;
    // (Sampled frame by frame: a little under its ±0.6.)
    expect(group.dx[0], 'shakes left').toBeLessThan(-0.35);
    expect(group.dx[1], 'and right').toBeGreaterThan(0.35);
  };

  for (const name of ['volume-off', 'wifi-off-01', 'wifi-off-02'])
    test(`${name}: it shakes (its waves never pulse); off draws its slash again`, async ({
      page,
    }) => {
      const tracks = await track(page, URL, label(name), 'default');
      shaken(tracks);
      for (const t of tracks) expect(t.minOpacity).toBeGreaterThan(0.9);
      const off = await track(page, URL, label(name), 'off');
      // The slash: the last piece of the shaken group.
      expect(off.filter((t) => t.dashed)).toHaveLength(1);
      expect(off.findLast((t) => t.tag !== 'g')!.dashed).toBe(true);
    });

  for (const name of [
    'wifi-disconnected-01',
    'wifi-disconnected-02',
    'wifi-disconnected-03',
    'wifi-disconnected-04',
  ])
    test(`${name}: it shakes as its x turns`, async ({ page }) => {
      const tracks = await track(page, URL, label(name), 'default');
      shaken(tracks);
      const turned = tracks.filter((t) => t.turn > 25);
      expect(turned, 'both strokes of its x').toHaveLength(2);
    });

  for (const name of ['wifi-error-01', 'wifi-error-02'])
    test(`${name}: it shakes as its ! bounces`, async ({ page }) => {
      const tracks = await track(page, URL, label(name), 'default');
      shaken(tracks);
      const bounced = tracks.filter((t) => t.tag !== 'g' && t.dy[1] > 0.6);
      expect(bounced, 'its !').toHaveLength(1);
    });

  for (const name of [
    'wifi-connected-01',
    'wifi-connected-02',
    'wifi-connected-03',
  ])
    test(`${name}: its waves pulse, then its check draws itself`, async ({
      page,
    }) => {
      const tracks = await track(page, URL, label(name), 'default');
      const check = tracks.filter((t) => t.dashed);
      expect(check, 'its check').toHaveLength(1);
      const waves = tracks.filter((t) => !t.dashed && t.minOpacity < 0.6);
      expect(waves.length).toBeGreaterThanOrEqual(2);
      // It starts once they have.
      expect(check[0]!.delay).toBeGreaterThan(
        Math.min(...waves.map((w) => w.delay)),
      );
    });

  for (const [name, check] of [
    ['wifi-sync', (t: { turn: number }) => t.turn > 100],
    ['wifi-cog', (t: { turn: number }) => t.turn > 100],
    ['wifi-lock', (t: { turn: number }) => t.turn > 3 && t.turn < 20],
    ['wifi-unlock', (t: { dy: [number, number] }) => t.dy[0] < -0.6],
    ['wifi-pen', (t: { dx: [number, number] }) => t.dx[0] < -0.6],
  ] as const)
    test(`${name}: its badge moves its own way as its waves pulse`, async ({
      page,
    }) => {
      const tracks = await track(page, URL, label(name), 'default');
      expect(tracks.filter((t) => check(t as never))).toHaveLength(1);
      expect(
        tracks.filter((t) => t.minOpacity < 0.6).length,
      ).toBeGreaterThanOrEqual(2);
    });
});

// Each icon on its own page: hovered, it plays; left, it goes back to rest.
test.describe('hugeicons on hover', () => {
  for (const name of NAMES)
    test(`${name} plays on hover and goes back to rest when left`, async ({
      page,
    }) => {
      await gotoGallery(page);
      await page.getByPlaceholder(/Search/).fill(label(name).toLowerCase());
      const button = tile(page, name);
      const svg = button.locator('svg').first();
      await expect(svg).toBeVisible();
      await page.mouse.move(0, 0);
      await expect.poll(() => moving(svg), { message: 'at rest' }).toBe(0);
      await button.hover();
      await expect
        .poll(() => moving(svg), { message: 'plays', intervals: [16] })
        .toBeGreaterThan(0);
      await page.mouse.move(0, 0);
      await expect
        .poll(() => moving(svg), { message: 'back to rest', timeout: 6000 })
        .toBe(0);
    });
});

// Twins: a Hugeicons icon and its Lucide counterpart offer the same
// animations, each playing.
const TWINS: Record<string, string> = {
  // Ported from Lucide's, under Lucide's name.
  ...Object.fromEntries(
    NAMES.filter((name) =>
      existsSync(path.join(process.cwd(), 'registry/icons', name)),
    ).map((name) => [name, name]),
  ),
  'notification-01': 'bell',
  favourite: 'heart',
  'settings-02': 'settings',
  sent: 'send',
  'search-01': 'search',
  refresh: 'refresh-cw',
  'checkmark-circle-02': 'circle-check',
  'delete-02': 'trash-2',
  'copy-01': 'copy',
  'arrow-right-01': 'chevron-right',
  sparkles: 'sparkles',
  star: 'star',
  'download-04': 'download',
  // Animated first as Hugeicons', then on Lucide's.
  flash: 'zap',
  'mail-01': 'mail',
  'minus-sign': 'minus',
  'pencil-edit-02': 'pencil',
  'redo-02': 'redo',
  'undo-02': 'undo',
  'rocket-01': 'rocket',
  'share-08': 'share-2',
  view: 'eye',
  'wifi-off-01': 'wifi-off',
  'home-03': 'house',
  'share-03': 'share',
  'music-3': 'music',
  temperature: 'thermometer',
  'coffee-02': 'coffee',
  'globe-02': 'globe',
  'upload-04': 'upload',
  user: 'user',
  'message-01': 'message-square',
  'moon-02': 'moon',
  'sun-03': 'sun',
  'link-01': 'link',
  'add-01': 'plus',
  'cancel-01': 'x',
  'menu-01': 'menu',
  'thumbs-up': 'thumbs-up',
  'thumbs-down': 'thumbs-down',
  'alarm-clock': 'alarm-clock',
  'volume-high': 'volume-2',
  'volume-01': 'volume-1',
  'volume-off': 'volume-off',
  'wifi-01': 'wifi',
  'wifi-high': 'wifi-high',
  'wifi-low': 'wifi-low',
  'wifi-zero': 'wifi-zero',
  'location-01': 'map-pin',
  'logout-01': 'log-out',
  'login-01': 'log-in',
  'clock-01': 'clock',
  'attachment-01': 'paperclip',
  'square-lock-02': 'lock',
  'square-unlock-02': 'lock-open',
  'loading-02': 'loader-circle',
  'loading-01': 'loader-pinwheel',
  'loading-03': 'loader',
  'arrow-down-01': 'chevron-down',
  'arrow-up-01': 'chevron-up',
  'arrow-left-01': 'chevron-left',
  'arrow-down-02': 'arrow-down',
  'arrow-up-02': 'arrow-up',
  'arrow-left-02': 'arrow-left',
  'arrow-right-02': 'arrow-right',
  'plus-sign': 'plus',
  'maximize-01': 'maximize',
  'minimize-01': 'minimize',
  play: 'play',
  pause: 'pause',
  'rotate-clockwise': 'rotate-cw',
  'more-horizontal': 'ellipsis',
  'more-vertical': 'ellipsis-vertical',
  'link-square-02': 'external-link',
  'layers-01': 'layers',
  'computer-terminal-01': 'terminal',
  'key-01': 'key',
  pin: 'pin',
  'battery-full': 'battery-full',
  'battery-medium-01': 'battery-medium',
  'battery-low': 'battery-low',
  'battery-charging': 'battery-charging',
  'signal-full-01': 'signal',
  'finger-print': 'fingerprint',
  'download-01': 'download',
  'upload-01': 'upload',
  'activity-01': 'activity',
  ...Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => [
      `clock-hour-${i + 1}`,
      `clock-${i + 1}`,
    ]),
  ),
};

/** An icon file's animation names. */
const animationsOf = (file: string) => {
  const source = readFileSync(file, 'utf8');
  const block = source.slice(
    source.indexOf('const animations'),
    source.indexOf('} as const'),
  );
  return [...block.matchAll(/^ {2}'?([a-z][a-z0-9-]*)'?: /gm)].map(
    (m) => m[1]!,
  );
};

test.describe('hugeicons and their lucide twins', () => {
  test("every Hugeicons twin offers each of its Lucide twin's animations", () => {
    for (const [hugeicon, lucide] of Object.entries(TWINS)) {
      const ours = animationsOf(path.join(REGISTRY, hugeicon, 'index.tsx'));
      const theirs = animationsOf(
        path.join(process.cwd(), 'registry/icons', lucide, 'index.tsx'),
      );
      for (const name of theirs)
        expect(ours, `${hugeicon} (${lucide}): ${name}`).toContain(name);
    }
  });

  // Each of the animations brought over plays.
  for (const [name, animations] of [
    ['sparkles', ['blink']],
    ['link-01', ['join', 'join-loop']],
    ['add-01', ['x']],
    ['cancel-01', ['plus']],
    ['alarm-clock', ['default-loop']],
    ['location-01', ['rotate']],
    ['square-lock-02', ['lock']],
    ['square-unlock-02', ['unlock']],
    ['loading-03', ['spin']],
    ['arrow-down-02', ['pointing', 'pointing-loop', 'out']],
    ['arrow-right-02', ['pointing', 'pointing-loop', 'out']],
    ['plus-sign', ['x']],
    ['rotate-clockwise', ['tilt', 'rotate']],
    ['more-horizontal', ['vertical', 'jump', 'pulse']],
    ['more-vertical', ['horizontal', 'pulse']],
    ['pin', ['bounce', 'wiggle', 'rotate']],
    ['signal-full-01', ['draw']],
    ['finger-print', ['default-2']],
    ['activity-01', ['default-return', 'default-loop']],
  ] as const)
    test(`${name}: ${animations.join(', ')} play`, async ({ page }) => {
      for (const animation of animations) {
        const tracks = await track(page, URL, label(name), animation);
        const moved = tracks.some(
          (t) =>
            t.dashed ||
            t.minOpacity < 0.9 ||
            t.turn > 3 ||
            t.scaled > 0.05 ||
            Math.max(-t.dx[0], t.dx[1], -t.dy[0], t.dy[1]) > 0.3,
        );
        expect(moved, `${name} ${animation}`).toBe(true);
      }
    });
});

test("each Hugeicons icon has its Lucide twin's categories (or its family's), shown in its drawer", async ({
  page,
}) => {
  for (const name of NAMES) {
    const meta = JSON.parse(
      readFileSync(path.join(REGISTRY, name, 'meta.json'), 'utf8'),
    ) as { categories: string[] };
    expect(meta.categories.length, name).toBeGreaterThan(0);
  }
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/Search/).fill('clock 01');
  await tile(page, 'clock-01').click();
  await expect(
    page.locator('[data-slot=icon-drawer] [data-slot=category]'),
  ).toHaveText(['Time & calendar']);
});

// Pieces ported from Lucide's run its way, keep Hugeicons' look, and land
// where Hugeicons' drawing needs them.
test.describe('hugeicons ported from lucide', () => {
  const pathsOf = (name: string) =>
    [
      ...readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8').matchAll(
        /\sd="([^"]+)"/g,
      ),
    ].map((m) => m[1]!);
  const ends = (d: string) => {
    const n = (d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    return { start: [n[0]!, n[1]!], end: [n.at(-2)!, n.at(-1)!] };
  };

  test("Check Check: its second check drawn from its left end, as Lucide's", () => {
    const { start, end } = ends(pathsOf('check-check')[1]!);
    expect(start[0]).toBeLessThan(end[0]);
  });

  test("Crop: its corner drawn from its top, in Lucide's order", () => {
    expect(pathsOf('crop')[0]!.startsWith('M4 2V4M4 7.5')).toBe(true);
  });

  test('filled Hugeicons pieces stay filled, as wide as the strokes beside them (Clipboard, Wifi Lock, Square Arrow Out…)', () => {
    for (const name of NAMES) {
      // Every subpath of a filled piece, wherever it went.
      const filled = new Set(
        source(name)
          .filter(([, attrs]) => attrs.fill && attrs.fill !== 'none')
          .flatMap(([, attrs]) => attrs.d!.split(/(?=M)/)),
      );
      const file = readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8');
      for (const [element] of file.matchAll(/<motion\.path\b[\s\S]*?\/>/g)) {
        const d = element.match(/\sd="([^"]+)"/)?.[1];
        if (!d || !d.split(/(?=M)/).some((piece) => filled.has(piece)))
          continue;
        // (Hugeicons fills them as strokes 1.5 wide: 0.5 more, as wide as
        // the strokes beside them at 2.)
        expect(element, name).toMatch(
          /fill="currentColor"\s+strokeWidth=\{0\.5\}/,
        );
      }
    }
  });

  test("every piece keeps Hugeicons' own caps and joins (Clapperboard's square ends stay inside its board)", () => {
    for (const name of NAMES) {
      // Each subpath's caps and joins, as Hugeicons draws them.
      const theirs = new Map<string, string>();
      for (const [tag, attrs] of source(name))
        if (tag === 'path' && (!attrs.fill || attrs.fill === 'none'))
          for (const d of attrs.d!.split(/(?=M)/))
            theirs.set(
              d.replace(/\s/g, ''),
              `${attrs.strokeLinecap ?? 'butt'} ${attrs.strokeLinejoin ?? 'miter'}`,
            );
      const file = readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8');
      for (const [element] of file.matchAll(/<(?:motion\.)?path\b[^>]*?\/>/g)) {
        const d = element.match(/\sd="([^"]+)"/)?.[1];
        if (!d) continue;
        const caps = `${element.match(/strokeLinecap="(\w+)"/)?.[1] ?? 'butt'} ${element.match(/strokeLinejoin="(\w+)"/)?.[1] ?? 'miter'}`;
        for (const sub of d.split(/(?=M)/)) {
          const expected = theirs.get(sub.replace(/\s/g, ''));
          if (expected)
            expect(caps, `${name}: ${sub.slice(0, 30)}`).toBe(expected);
        }
      }
    }
  });

  for (const [name, travel] of [
    ['toggle-left', 8],
    ['toggle-right', -8],
  ] as const)
    test(`${name}: its thumb goes to the track's end`, async ({ page }) => {
      const tracks = (await track(page, URL, label(name), 'default')).filter(
        (t) => t.tag === 'path',
      );
      const thumb = tracks.find((t) => Math.max(-t.dx[0], t.dx[1]) > 1)!;
      expect(travel > 0 ? thumb.dx[1] : -thumb.dx[0]).toBeGreaterThan(
        Math.abs(travel) - 0.2,
      );
    });

  test('Lock Keyhole Open lock: its shackle closes into the body', async ({
    page,
  }) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.getByPlaceholder(/Search/).fill('lock keyhole open');
    await tile(page, 'lock-keyhole-open').click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: 'lock', exact: true }).click();
    await page.waitForTimeout(700);
    const end = await drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const shackle = [...svg.querySelectorAll('path')].at(-1)!;
        const p = shackle.getPointAtLength(shackle.getTotalLength());
        return { x: p.x, y: p.y };
      });
    expect(end.x).toBeCloseTo(16.5, 1);
    expect(end.y).toBeCloseTo(9, 1);
  });
});

// Lucide's icons whose Hugeicons twin draws them its own way: Lucide's
// animations, moved Hugeicons' way.
test.describe('hugeicons drawn their own way, after lucide', () => {
  /** Each drawn piece's box (in the icon's units) once `animation` ends. */
  const after = async (page: Page, name: string, animation: string) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.getByPlaceholder(/Search/).fill(label(name).toLowerCase());
    await tile(page, name).click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    await drawer.getByRole('button', { name: animation, exact: true }).click();
    await page.waitForTimeout(1200);
    return drawer
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const box = svg.getBoundingClientRect();
        const unit = 24 / box.width;
        return [...svg.querySelectorAll('path')].map((path) => {
          const r = path.getBoundingClientRect();
          return {
            x: (r.left - box.left) * unit,
            y: (r.top - box.top) * unit,
            w: r.width * unit,
            h: r.height * unit,
          };
        });
      });
  };

  test("Chart Column increasing: its bars end in Lucide's order, shortest to tallest", async ({
    page,
  }) => {
    // (Its bars, not its axes: the narrow ones.)
    const bars = (await after(page, 'chart-column', 'increasing'))
      .filter((b) => b.w < 3)
      .sort((a, b) => a.x - b.x);
    expect(bars).toHaveLength(3);
    expect(bars[0]!.h).toBeLessThan(bars[1]!.h);
    expect(bars[1]!.h).toBeLessThan(bars[2]!.h);
  });

  test('Forklift: its fork lifts up its mast, the mast staying', async ({
    page,
  }) => {
    const tracks = await track(page, URL, label('forklift'), 'default');
    const moved = tracks.filter((t) => t.dy[0] < -0.5 || t.dx[1] > 0.5);
    expect(moved).toHaveLength(1);
    expect(moved[0]!.dy[0]).toBeLessThan(-9);
  });

  for (const [name, way] of [
    ['panel-left-close', 1],
    ['panel-left-open', -1],
  ] as const)
    test(`${name}: its divider and arrow move the way its arrow points (Hugeicons' points the other way from Lucide's)`, async ({
      page,
    }) => {
      const tracks = (await track(page, URL, label(name), 'default')).filter(
        (t) => t.tag === 'path' && Math.max(-t.dx[0], t.dx[1]) > 0.5,
      );
      expect(tracks).toHaveLength(2);
      for (const t of tracks)
        expect(way > 0 ? t.dx[1] : -t.dx[0]).toBeGreaterThan(1.5);
    });

  /** Each path's highest top (in the icon's units) while `animation` plays. */
  const highest = async (page: Page, name: string, animation: string) => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.getByPlaceholder(/Search/).fill(label(name).toLowerCase());
    await tile(page, name).click();
    const drawer = page.locator('[data-slot=icon-drawer]');
    const svg = drawer.locator('svg').first();
    await drawer.getByRole('button', { name: animation, exact: true }).click();
    return svg.evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const paths = [...el.querySelectorAll('path')];
          const tops = paths.map(() => Infinity);
          const start = performance.now();
          const tick = () => {
            const box = el.getBoundingClientRect();
            paths.forEach((path, i) => {
              const r = path.getBoundingClientRect();
              tops[i] = Math.min(
                tops[i]!,
                ((r.top - box.top) * 24) / box.width,
              );
            });
            if (performance.now() - start < 1400) requestAnimationFrame(tick);
            else resolve(tops);
          };
          requestAnimationFrame(tick);
        }),
    );
  };

  test('Between Horizontal End: its left chevron moves in (right), not up with the top block', async ({
    page,
  }) => {
    const tracks = await track(
      page,
      URL,
      label('between-horizontal-end'),
      'default',
    );
    const chevron = tracks.find((t) => t.tag === 'path' && t.dx[1] > 2)!;
    expect(chevron).toBeDefined();
    expect(chevron.dy[0]).toBeGreaterThan(-0.2);
  });

  test('Between Vertical End: its arrows ride the ends of its axes as they grow', async ({
    page,
  }) => {
    const pieces = await after(page, 'between-vertical-end', 'default');
    // Its axes (the tallest piece) and its up arrow (the topmost of the rest).
    const axes = pieces.reduce((a, b) => (b.h > a.h ? b : a));
    const arrow = pieces
      .filter((p) => p !== axes)
      .reduce((a, b) => (b.y < a.y ? b : a));
    // (At rest the arrow's tip is 1 above the axis's end.)
    expect(Math.abs(axes.y - 1 - arrow.y)).toBeLessThan(0.3);
  });

  test('Gauge: its needle turns on its hub, the hub staying put', async ({
    page,
  }) => {
    const tracks = await track(page, URL, label('gauge'), 'default');
    const needle = tracks.find((t) => t.turn > 30)!;
    expect(needle).toBeDefined();
    // Turned round the hub (12, 16): moved by its own turn, not more.
    const hub = await page
      .locator('[data-slot=icon-drawer] svg')
      .first()
      .evaluate((svg) => {
        const box = svg.getBoundingClientRect();
        const c = svg.querySelectorAll('circle')[1]!.getBoundingClientRect();
        const u = 24 / box.width;
        return [
          (c.left + c.width / 2 - box.left) * u,
          (c.top + c.height / 2 - box.top) * u,
        ];
      });
    expect(Math.abs(hub[0]! - 12)).toBeLessThan(0.2);
    expect(Math.abs(hub[1]! - 16)).toBeLessThan(0.2);
  });

  test('Lightbulb: it swings whole, its glass never parting from its base', async ({
    page,
  }) => {
    const tracks = await track(page, URL, label('lightbulb'), 'default');
    expect(tracks.filter((t) => t.tag === 'path' && t.turn > 1)).toHaveLength(
      0,
    );
    expect(tracks.some((t) => t.tag === 'g' && t.turn > 5)).toBe(true);
  });

  test('Clapperboard: a real clap, its striped arm opening on its hinge and shutting', async ({
    page,
  }) => {
    const tracks = await track(page, URL, label('clapperboard'), 'default');
    // Its arm (a group) opens by more than a nudge; the rest of it doesn't
    // turn.
    expect(tracks.filter((t) => t.turn > 10)).toHaveLength(1);
    expect(tracks.find((t) => t.turn > 10)!.tag).toBe('g');
  });

  test('Blend: its square, ring and circle drawn one after the other, never moving (their gaps stay hidden)', async ({
    page,
  }) => {
    const tracks = await track(page, URL, label('blend'), 'default');
    for (const t of tracks)
      expect(
        Math.max(-t.dx[0], t.dx[1], -t.dy[0], t.dy[1], t.turn),
      ).toBeLessThan(0.1);
    const drawn = tracks.filter((t) => t.dashed).map((t) => t.delay);
    expect(drawn).toHaveLength(3);
    expect(new Set(drawn).size).toBe(3);
  });

  test('Accessibility: its wheel rocks, never turning round (the figure would seem to run)', async ({
    page,
  }) => {
    const tracks = await track(page, URL, label('accessibility'), 'default');
    const wheel = tracks.reduce((a, b) => (b.turn > a.turn ? b : a));
    expect(wheel.turn).toBeGreaterThan(10);
    expect(wheel.turn).toBeLessThan(60);
  });

  for (const [url, name] of [
    [URL, 'zoom-in'],
    [URL, 'zoom-out'],
    ['/docs/icons/lucide-icons', 'zoom-in'],
    ['/docs/icons/lucide-icons', 'zoom-out'],
  ] as const)
    test(`${name} (${url.split('/').pop()}): the whole glass pulses, its handle staying on its lens`, async ({
      page,
    }) => {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.getByPlaceholder(/Search/).fill(name.replace('-', ' '));
      await page
        .locator(`button[aria-pressed][title="${title(name)}"]`)
        .click();
      const drawer = page.locator('[data-slot=icon-drawer]');
      await drawer
        .getByRole('button', { name: 'default', exact: true })
        .click();
      // Where the handle's inner end lies across the lens (as a share of its
      // width), frame by frame: the same all along (grown apart, it poked
      // in).
      const gaps = await drawer
        .locator('svg')
        .first()
        .evaluate(
          (svg) =>
            new Promise<number[]>((resolve) => {
              const pieces = [...svg.querySelectorAll('path, circle, line')];
              const box = (el: Element) => el.getBoundingClientRect();
              const lens = pieces.reduce((a, b) =>
                box(b).width > box(a).width ? b : a,
              );
              const handle = pieces.reduce((a, b) =>
                box(b).left + box(b).top > box(a).left + box(a).top ? b : a,
              );
              const out: number[] = [];
              const start = performance.now();
              const tick = () => {
                out.push((box(handle).left - box(lens).left) / box(lens).width);
                if (performance.now() - start < 700)
                  requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            }),
        );
      expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThan(0.005);
    });

  for (const url of [URL, '/docs/icons/lucide-icons'])
    test(`Eye Off (${url.split('/').pop()}): its slash drawn across, the eye still`, async ({
      page,
    }) => {
      const tracks = await track(page, url, 'Eye Off', 'default');
      expect(
        tracks.filter(
          (t) =>
            t.scaled > 0.01 ||
            t.turn > 0.5 ||
            Math.max(-t.dx[0], t.dx[1], -t.dy[0], t.dy[1]) > 0.05,
        ),
      ).toHaveLength(0);
      expect(tracks.filter((t) => t.dashed)).toHaveLength(1);
    });

  test('Move Down pointing: its shaft shorter and its head drawn back up', async ({
    page,
  }) => {
    const pieces = await after(page, 'move-down', 'pointing');
    // Its shaft (narrow, filled) half as long, its head (the widest) up.
    const shaft = pieces.find((p) => p.w < 2 && p.h > 2)!;
    const head = pieces.reduce((a, b) => (b.w > a.w ? b : a));
    expect(shaft.h).toBeLessThan(9);
    expect(head.y + head.h).toBeLessThan(14);
  });
});
