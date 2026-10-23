import { expect, test, type Page } from '../test';

type Wipe = { oldRoot: string; header: string };

const capture = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __wipes: Wipe[] };
    w.__wipes = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      if (
        typeof options === 'object' &&
        options.pseudoElement === '::view-transition-new(root)' &&
        JSON.stringify(keyframes).includes('clipPath')
      )
        w.__wipes.push({
          oldRoot: getComputedStyle(
            document.documentElement,
            '::view-transition-old(root)',
          ).display,
          header: getComputedStyle(document.querySelector('header')!)
            .viewTransitionName,
        });
      return animate.call(this, keyframes, options);
    };
  });

const wiped = async (page: Page) => {
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __wipes: Wipe[] }).__wipes.length,
      ),
    )
    .toBe(1);
  return page.evaluate(
    () => (window as unknown as { __wipes: Wipe[] }).__wipes[0]!,
  );
};

// Bug: the docs' page transition hid every transition's old page, so a theme
// wipe crossed an empty page, and the header crossfaded on its own.
test.describe('the theme wipe on a docs page', () => {
  test.use({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });

  for (const [name, url] of [
    ['React', '/docs/primitives/animate-ui/theme-toggler'],
    ['Vue', '/docs/vue/primitives/animate-ui/theme-toggler'],
  ]) {
    test(`${name}: the demo wipes over the old page, header included`, async ({
      page,
    }) => {
      await capture(page);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page
        .locator('main')
        .getByRole('button', { name: /^Theme:/ })
        .click();
      expect(await wiped(page)).toEqual({ oldRoot: 'block', header: 'none' });
    });
  }
});
