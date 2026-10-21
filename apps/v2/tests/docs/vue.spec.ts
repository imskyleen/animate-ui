import { expect, test } from '../test';

const PAGE = '/docs/vue/primitives/accordion';

test('a Vue page shows its Vue demo and .vue source', async ({ page }) => {
  await page.goto(PAGE, { waitUntil: 'networkidle' });
  await page.locator('[data-slot="vue-demo"][data-mounted]').waitFor();
  await expect(
    page.getByRole('button', { name: 'Product Information' }),
  ).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page
      .locator('pre')
      .filter({ hasText: '<script setup lang="ts">' })
      .filter({ hasText: 'Product Information' }),
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
