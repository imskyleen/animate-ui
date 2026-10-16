import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '../test';

const docs = path.join(process.cwd(), 'content', 'docs');
const previews = path.join(process.cwd(), 'public', 'previews');

const PRIMITIVES = [
  ...new Set(
    ['base-ui', 'radix-ui', 'react-aria', 'animate-ui'].flatMap((library) =>
      readdirSync(path.join(docs, 'primitives', library))
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => file.slice(0, -4)),
    ),
  ),
];
const BACKGROUNDS = readdirSync(path.join(docs, 'backgrounds'))
  .filter((file) => file.endsWith('.mdx') && file !== 'index.mdx')
  .map((file) => file.slice(0, -4));

test('every card has its clip and first frame, in both themes', () => {
  const ids = [
    ...PRIMITIVES.map((slug) => `primitives/${slug}`),
    ...BACKGROUNDS.map((slug) => `backgrounds/${slug}`),
  ];
  const missing = ids.flatMap((id) =>
    ['light', 'dark'].flatMap((theme) =>
      ['webm', 'jpg']
        .map((ext) => `${id}-${theme}.${ext}`)
        .filter((file) => !existsSync(path.join(previews, file))),
    ),
  );
  expect(missing).toEqual([]);
});

test('the Primitives page is one card per primitive, opening its page', async ({
  page,
}) => {
  await page.goto('/docs/primitives', { waitUntil: 'networkidle' });
  const cards = page.locator('[data-slot="preview-card"]');
  await expect(cards).toHaveCount(PRIMITIVES.length);
  for (const title of [
    'Components',
    'Animate UI',
    'Buttons',
    'Texts',
    'Effects',
  ])
    await expect(
      page.getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
  const accordion = cards.filter({ hasText: /^Accordion/ });
  await expect(accordion).toHaveAttribute(
    'href',
    '/docs/primitives/base-ui/accordion',
  );
});

test('hovered, a card plays its clip; left, it is back at its first frame', async ({
  page,
}) => {
  await page.goto('/docs/primitives', { waitUntil: 'networkidle' });
  const card = page.locator('[data-slot="preview-card"]').first();
  const video = card.locator('video');
  await card.hover();
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0.2);
  expect(await video.evaluate((el: HTMLVideoElement) => el.paused)).toBe(false);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      video.evaluate((el: HTMLVideoElement) => [el.paused, el.currentTime]),
    )
    .toEqual([true, 0]);
  await expect(video).toHaveClass(/invisible/);
});

test('hovered, a card shows a stop button; stopped, it is back at its first frame, and play resumes it', async ({
  page,
}) => {
  await page.goto('/docs/primitives', { waitUntil: 'networkidle' });
  const root = page.locator('[data-slot="preview-card-root"]').first();
  const video = root.locator('video');
  const button = root.locator('[data-slot="preview-card-play"]');
  await expect(button).toHaveCSS('opacity', '0');
  await root.hover();
  await expect(button).toHaveCSS('opacity', '1');
  await expect(button).toHaveAccessibleName('Stop preview');
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime))
    .toBeGreaterThan(0.2);
  await button.click();
  await expect(button).toHaveAccessibleName('Play preview');
  await expect
    .poll(() =>
      video.evaluate((el: HTMLVideoElement) => [el.paused, el.currentTime]),
    )
    .toEqual([true, 0]);
  await expect(page).toHaveURL(/\/docs\/primitives$/);
  await button.click();
  await expect(button).toHaveAccessibleName('Stop preview');
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.paused))
    .toBe(false);
  await page.mouse.move(0, 0);
  await expect
    .poll(() =>
      video.evaluate((el: HTMLVideoElement) => [el.paused, el.currentTime]),
    )
    .toEqual([true, 0]);
  await expect(button).toHaveCSS('opacity', '0');
});

test('every video card has one play button, outside its link', async ({
  page,
}) => {
  await page.goto('/docs/primitives', { waitUntil: 'networkidle' });
  const cards = await page.locator('[data-slot="preview-card"]').count();
  await expect(page.locator('[data-slot="preview-card-play"]')).toHaveCount(
    cards,
  );
  await expect(page.locator('[data-slot="preview-card"] button')).toHaveCount(
    0,
  );
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('hovered, a card stays still', async ({ page }) => {
    await page.goto('/docs/backgrounds', { waitUntil: 'networkidle' });
    const card = page.locator('[data-slot="preview-card"]').first();
    await card.hover();
    await page.waitForTimeout(500);
    expect(
      await card.locator('video').evaluate((el: HTMLVideoElement) => el.paused),
    ).toBe(true);
  });
  test('the play button still plays it', async ({ page }) => {
    await page.goto('/docs/backgrounds', { waitUntil: 'networkidle' });
    const root = page.locator('[data-slot="preview-card-root"]').first();
    const button = root.locator('[data-slot="preview-card-play"]');
    await root.hover();
    await expect(button).toHaveAccessibleName('Play preview');
    await button.click();
    await expect
      .poll(() =>
        root.locator('video').evaluate((el: HTMLVideoElement) => el.paused),
      )
      .toBe(false);
  });
});

test('the Backgrounds page is one card per background', async ({ page }) => {
  await page.goto('/docs/backgrounds', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="preview-card"]')).toHaveCount(
    BACKGROUNDS.length,
  );
});

for (const [title, href] of [
  ['Lucide Icons', '/docs/icons/lucide-icons'],
  ['Hugeicons', '/docs/icons/hugeicons'],
])
  test(`the Icons page shows its libraries, their icons playing when hovered: ${title}`, async ({
    page,
  }) => {
    await page.goto('/docs/icons', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="preview-card"]')).toHaveCount(2);
    const card = page.locator('[data-slot="preview-card"]', {
      hasText: title,
    });
    await expect(card).toHaveAttribute('href', href);
    await expect(card.locator('svg')).not.toHaveCount(0);
    const moving = () =>
      card.evaluate(
        (el) =>
          [...el.querySelectorAll('svg, svg *')].filter((node) => {
            const style = getComputedStyle(node);
            return style.transform !== 'none' || Number(style.opacity) < 1;
          }).length,
      );
    expect(await moving()).toBe(0);
    await card.hover();
    await expect.poll(moving).toBeGreaterThan(0);
  });

test("cards carry their page's badge, like the sidebar", async ({ page }) => {
  await page.goto('/docs/primitives', { waitUntil: 'networkidle' });
  const marked = (selector: string) =>
    page.locator(selector).evaluateAll((links) =>
      links
        .filter((link) => link.querySelector('[data-slot="badge"]'))
        .map((link) => link.getAttribute('href')!.split('/').pop()!)
        .sort(),
    );
  const cards = await marked('[data-slot="preview-card"]');
  expect(cards.length).toBeGreaterThan(0);
  expect(cards).toEqual(
    [...new Set(await marked('aside a[href^="/docs/primitives/"]'))].sort(),
  );
});
