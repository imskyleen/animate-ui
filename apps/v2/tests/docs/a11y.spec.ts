import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../test';

const SCREENS = [
  '/',
  '/docs',
  '/docs/installation',
  '/docs/cli',
  '/docs/primitives/radix-ui/dialog',
  '/docs/primitives/base-ui/dropdown-menu',
  '/docs/primitives/react-aria/select',
  '/docs/primitives/animate-ui/highlight',
  '/docs/icons/lucide-icons',
  '/docs/backgrounds/bubble',
];

for (const colorScheme of ['light', 'dark'] as const)
  for (const url of SCREENS)
    test(`${url} (${colorScheme}) has no serious accessibility violation`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto(url, { waitUntil: 'networkidle' });
      const { violations } = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze();
      const serious = violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map(
          (v) =>
            `${v.id}: ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' '))
              .join(' | ')}`,
        );
      expect(serious).toEqual([]);
    });

for (const url of SCREENS)
  test(`${url} fits a 320px wide screen`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto(url, { waitUntil: 'load' });
    await expect(page.locator('h1').first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
