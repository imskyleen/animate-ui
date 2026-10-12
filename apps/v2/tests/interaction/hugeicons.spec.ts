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

/** Elements of the icon moved or faded (off rest). */
const moving = (svg: Locator) =>
  svg.evaluate(
    (el) =>
      [el, ...el.querySelectorAll('*')].filter((node) => {
        const style = getComputedStyle(node);
        const m = new DOMMatrix(style.transform);
        return !m.isIdentity || Number(style.opacity) < 0.99;
      }).length,
  );

test.describe('hugeicons', () => {
  test('the registry holds Hugeicons’ own icons, at a stroke of 2', () => {
    expect(NAMES.length).toBeGreaterThanOrEqual(16);
    for (const name of NAMES) {
      const file = readFileSync(path.join(REGISTRY, name, 'index.tsx'), 'utf8');
      expect(file, name).toContain('strokeWidth={2}');
      expect(file, name).not.toMatch(/strokeWidth=\{?"?1\.5/);
      const drawn = [...file.matchAll(/\sd="([^"]+)"/g)].flatMap((m) =>
        runs(m[1]!),
      );
      // Every run of Hugeicons' paths is drawn (some split to animate
      // apart, the sun's rays drawn outward).
      for (const [tag, attrs] of source(name)) {
        if (tag === 'circle') {
          expect(file, name).toContain(`r={${Number(attrs.r)}}`);
          continue;
        }
        for (const run of runs(attrs.d!)) expect(drawn, name).toContain(run);
      }
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
    const star = tile(page, 'star').locator('svg path');
    await expect(star).toHaveCount(1);
    expect(runs((await star.getAttribute('d'))!)).toEqual(
      runs(source('star')[0]![1].d!),
    );
  });
});
