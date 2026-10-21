import { expect, test } from '../test';

const PAGE = '/docs/vue/primitives/reka-ui/accordion';

const PAGES = [
  ['accordion', 'Product Information'],
  ['checkbox', 'Enable notifications'],
  ['collapsible', '@radix-ui/primitives'],
  ['progress', 'progress.value = 66'],
  ['switch', 'Airplane Mode'],
  ['toggle', 'TextBoldIcon'],
] as const;

for (const [name, text] of PAGES)
  test(`the Vue ${name} page shows its Vue demo and .vue source`, async ({
    page,
  }) => {
    await page.goto(`/docs/vue/primitives/reka-ui/${name}`, {
      waitUntil: 'networkidle',
    });
    await page.locator('[data-slot="vue-demo"][data-mounted]').waitFor();
    await expect(
      page.locator('[data-slot="vue-demo"] [data-slot]').first(),
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
