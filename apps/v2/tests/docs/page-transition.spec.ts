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
