import { expect, test } from '../test';

const PAGE = '/docs/vue/primitives/reka-ui/accordion';

const PAGES = [
  ['accordion', 'Product Information'],
  ['alert-dialog', 'Show Dialog'],
  ['combobox', 'Search framework...'],
  ['context-menu', 'Show Full URLs'],
  ['dialog', 'Open Dialog'],
  ['dropdown-menu', 'Panel Position'],
  ['hover-card', '@nuxt'],
  ['menubar', 'Always Show Full URLs'],
  ['navigation-menu', 'Getting started'],
  ['popover', 'Set the dimensions for the layer'],
  ['preview-link-card', 'click to dive in'],
  ['checkbox', 'Enable notifications'],
  ['collapsible', '@radix-ui/primitives'],
  ['progress', 'progress.value = 66'],
  ['radio-group', 'id="r3"'],
  ['select', 'Select a fruit'],
  ['sheet', 'Save changes'],
  ['slider', 'w-[60%]'],
  ['switch', 'Airplane Mode'],
  ['toggle', 'TextBoldIcon'],
  ['toggle-group', 'TextUnderlineIcon'],
  ['tabs', 'Analytics'],
  ['tooltip', 'variant="outline"'],
] as const;

/** Animate UI's own primitives in Vue, with a text from their demo's source. */
const OWN_PAGES = [
  ['auto-height', 'Show more'],
  ['blur', ':initial-blur='],
  ['click', 'Click anywhere in this area'],
  ['effect', "zoom === 'true'"],
  ['fade', ':initial-opacity='],
  ['highlight', "{ value: 'activity', title: 'Activity' }"],
  ['image-zoom', 'Black porcelain mug, zoomable'],
  ['magnetic', "onlyOnHover === 'true'"],
  ['particles', 'ParticlesLabel'],
  ['spring', 'aria-label="Drag me"'],
  ['pinned-list', 'pinned-list-row.vue'],
  ['github-stars', 'github-stars-star.vue'],
  ['motion-grid', 'initializingFrames'],
  ['scroll-progress', 'isGlobal'],
  ['button', ':tap-scale="Number(tapScale)"'],
  ['copy-button', 'Tick02Icon'],
  ['icon-button', 'iconButtonVariants'],
  ['ripple-button', 'ripple-button-ripple-color:var(--primary-foreground)'],
  ['scroll-fade', 'Ripple on keyboard press'],
  ['shine', 'on(enableOnTap)'],
  ['slide', 'Number(offset)'],
  ['theme-toggler', 'StorageEvent'],
  ['tilt', 'Dark Grey'],
  ['zoom', ':initial-scale='],
  ['counting-number', 'tabular-nums'],
  ['gradient-text', "neon === 'true'"],
  ['highlight-text', 'dark:from-blue-500'],
  ['morphing-text', 'Handles emojis'],
  ['rolling-text', 'Replay'],
  ['rotating-text', "'Demo'"],
  ['scrolling-number', 'isVertical ? 40 : 75'],
  ['shimmering-text', "wave === 'true'"],
  ['sliding-number', 'on(fromNumber)'],
  ['sliding-text', 'cursor-pointer'],
  ['splitting-text', 'ANIMATIONS'],
  ['swapping-text', 'inline-grid'],
  ['typing-text', 'Highly customizable'],
] as const;

for (const [library, pages] of [
  ['reka-ui', PAGES],
  ['animate-ui', OWN_PAGES],
] as const)
  for (const [name, text] of pages)
    test(`the Vue ${name} page shows its Vue demo and .vue source`, async ({
      page,
    }) => {
      await page.goto(`/docs/vue/primitives/${library}/${name}`, {
        waitUntil: 'networkidle',
      });
      await page
        .locator('[data-slot="vue-demo"][data-mounted]')
        .first()
        .waitFor();
      await expect(
        page.locator('[data-slot="vue-demo"] > *').first(),
      ).toBeVisible();
      await expect(
        page
          .locator('pre')
          .filter({ hasText: '<script setup lang="ts">' })
          .filter({ hasText: text }),
      ).toHaveCount(1);
    });

for (const scheme of ['light', 'dark'] as const)
  test(`the logo is Vue green on Vue pages only, in the ${scheme} theme`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    const logoColor = () =>
      page
        .locator('header a[aria-label="Animate UI"] svg')
        .evaluate((svg) => getComputedStyle(svg).color);
    await page.goto(PAGE, { waitUntil: 'networkidle' });
    expect(await logoColor()).toBe('rgb(64, 184, 131)');
    await page.goto('/docs/primitives/radix-ui/accordion', {
      waitUntil: 'networkidle',
    });
    expect(await logoColor()).not.toBe('rgb(64, 184, 131)');
  });

test('a Vue component page has its library tab and installs like React', async ({
  page,
}) => {
  await page.goto('/docs/vue/primitives/reka-ui/switch', {
    waitUntil: 'networkidle',
  });
  const libraries = page.getByRole('tablist', { name: 'Library' });
  await expect(libraries.getByRole('tab')).toHaveText(['Reka UI']);
  await expect(libraries.getByRole('tab')).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const install = page.locator('[data-slot="install-tabs"]').first();
  await expect(install.locator('pre')).toContainText([
    'npm install @animate-ui/vue motion-v',
    'npx shadcn-vue@latest add switch',
    'npx @animate-ui/cli@latest animate switch',
  ]);
  await install.getByRole('tab', { name: 'Manual' }).click();
  await expect(install.locator('pre .diff.add').first()).toContainText(
    "from '@animate-ui/vue/primitives/reka-ui'",
  );
  const removals = install.locator('[data-slot="css-removals"] .line');
  await expect(removals).toHaveText([
    'Switch',
    '  transition-all',
    '',
    'SwitchThumb',
    '  transition-transform',
  ]);
});

test('visiting a Vue page keeps the React library you picked', async ({
  page,
}) => {
  await page.goto('/docs/primitives/react-aria/switch', {
    waitUntil: 'networkidle',
  });
  await page.goto('/docs/vue/primitives/reka-ui/switch', {
    waitUntil: 'networkidle',
  });
  expect(
    await page.evaluate(() => localStorage.getItem('animate-ui:library')),
  ).toBe('react-aria');
});

test('the Vue guide has the same pages as React, adapted to Vue', async ({
  page,
}) => {
  for (const [url, heading] of [
    ['/docs/vue', 'Introduction'],
    ['/docs/vue/installation', 'Installation'],
    ['/docs/vue/vue', '@animate-ui/vue'],
    ['/docs/vue/cli', 'CLI'],
    ['/docs/vue/accessibility', 'Accessibility'],
  ]) {
    await page.goto(url!);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading!);
  }
});

test('the Vue primitives grid shows the Vue components with their own recordings', async ({
  page,
}) => {
  await page.goto('/docs/vue/primitives');
  const cards = page.locator('[data-slot="preview-card-root"]');
  await expect(cards).toHaveCount(60);
  const posters = await cards
    .locator('img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
  expect(posters.length).toBeGreaterThan(0);
  for (const src of posters)
    expect(src).toMatch(/^\/previews\/vue\/primitives\//);
  for (const card of await cards.all())
    expect(await card.locator('a').first().getAttribute('href')).toMatch(
      /^\/docs\/vue\/primitives\/(reka-ui|animate-ui)\//,
    );
});
