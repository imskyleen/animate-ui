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
  ['pagination', "ui/pagination' </script>"],
  ['tooltip', 'variant="outline"'],
  ['toast', 'Show Toast'],
  ['drawer', 'Pick a delivery time'],
  ['questionnaire', 'What should the agent build next?'],
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
  ['input-otp', "from './input-otp'"],
  ['tabs', 'Bounce rate'],
  ['tooltip', 'Strikethrough'],
  ['avatar-group', 'Guillermo Rauch'],
  ['cursor', 'on(enableCursorFollow)'],
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
  ['flip-button', 'Back Button'],
  ['liquid-button', ':fill-height='],
  ['github-stars-button', 'starVariants'],
  ['theme-toggler-button', 'Moon02Icon'],
  ['code-block', 'scroll-class='],
  ['page-transition', 'startTransition'],
] as const;

for (const [library, pages] of [
  ['reka-ui', PAGES],
  ['animate-ui', OWN_PAGES],
] as const)
  for (const [name, text] of pages)
    test(`the Vue ${library} ${name} page shows its Vue demo and .vue source`, async ({
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
        page.locator('[data-slot="vue-demo"] > :not(noscript)').first(),
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
  await expect(cards).toHaveCount(74);
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

test('the Vue icon galleries animate the Vue icons and install them with shadcn-vue', async ({
  page,
}) => {
  for (const [library, title, file] of [
    ['lucide-icons', 'Bell', 'icons/Bell.vue'],
    ['hugeicons', 'Notification 01', 'icons/hugeicons/Notification01.vue'],
  ] as const) {
    await page.goto(`/docs/vue/icons/${library}`, { waitUntil: 'networkidle' });
    const tile = page.locator(`button[aria-pressed][title="${title}"]`);
    await tile.scrollIntoViewIfNeeded();
    const svg = tile.locator('[data-slot="vue-demo"] svg');
    await expect(svg).toBeVisible();
    await tile.hover();
    await expect
      .poll(() => svg.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe('none');
    await tile.click();
    const drawer = page.locator('[data-slot="icon-drawer"]');
    await expect(drawer).toContainText(
      'shadcn-vue@latest add https://animate-ui.com/r/vue/',
    );
    await expect(drawer).toContainText(`@/components/animate-ui/${file}`);
  }
});

test('the Vue icons page links to the Vue icon libraries, shown with Vue icons', async ({
  page,
}) => {
  await page.goto('/docs/vue/icons', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="vue-demo"] svg')).toHaveCount(16);
  for (const library of ['lucide-icons', 'hugeicons'])
    await expect(
      page.locator(
        `[data-slot="preview-card-root"][href="/docs/vue/icons/${library}"], [data-slot="preview-card-root"] a[href="/docs/vue/icons/${library}"]`,
      ),
    ).toHaveCount(1);
});

const BACKGROUNDS = [
  'bubble',
  'fireworks',
  'glyph',
  'gradient',
  'gravity-stars',
  'hexagon',
  'hole',
  'stars',
  'topography',
];

for (const name of BACKGROUNDS)
  test(`the Vue ${name} background page fills its preview with the Vue demo and installs with shadcn-vue`, async ({
    page,
  }) => {
    await page.goto(`/docs/vue/backgrounds/${name}`, {
      waitUntil: 'networkidle',
    });
    const demo = page.locator('[data-slot="vue-demo"][data-mounted]').first();
    await demo.waitFor();
    const background = demo.locator('[data-slot$="-background"]').first();
    await expect(background).toBeVisible();
    const stage = async () =>
      page
        .locator('[data-slot="preview"]')
        .first()
        .evaluate((el) => ({
          overflow: getComputedStyle(el).overflow,
          height: el
            .querySelector('[data-slot="preview-stage"]')!
            .getBoundingClientRect().height,
        }));
    const vue = await stage();
    const box = (await background.boundingBox())!;
    expect(box.height).toBeCloseTo(vue.height, 0);
    await expect(
      page
        .locator('pre')
        .filter({ hasText: '<script setup lang="ts">' })
        .filter({ hasText: '@/components/animate-ui/backgrounds/' }),
    ).not.toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('../v2/registry');
    await expect(page.locator('body')).toContainText(
      `https://animate-ui.com/r/vue/backgrounds-${name}.json`,
    );
    await page.goto(`/docs/backgrounds/${name}`);
    await page.locator('[data-slot$="-background"]').first().waitFor();
    expect(vue).toEqual(await stage());
  });

test('the Vue backgrounds grid links to the Vue pages, with their own recordings', async ({
  page,
}) => {
  await page.goto('/docs/vue/backgrounds');
  const cards = page.locator('[data-slot="preview-card-root"]');
  await expect(cards).toHaveCount(BACKGROUNDS.length);
  for (const src of await cards
    .locator('img')
    .evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src'))))
    expect(src).toMatch(/^\/previews\/vue\/backgrounds\//);
  for (const card of await cards.all())
    expect(
      (await card.getAttribute('href')) ??
        (await card.locator('a').first().getAttribute('href')),
    ).toMatch(/^\/docs\/vue\/backgrounds\/[a-z-]+$/);
});
