import { expect, test } from '@playwright/test';

// Every install command on the docs is offered in npm, pnpm, yarn and bun,
// and follows the reader's choice; installs that can be done by hand offer
// CLI or Manual.

const PAGES = [
  '/docs',
  '/docs/installation',
  '/docs/react',
  '/docs/cli',
  '/docs/skills',
  '/docs/icons/get-started',
  '/docs/icons/lucide-icons',
  '/docs/icons/hugeicons',
  '/docs/primitives/animate-ui/tooltip',
  '/docs/primitives/animate-ui/avatar-group',
  '/docs/primitives/animate-ui/code-block',
  '/docs/primitives/radix-ui/preview-link-card',
  '/docs/primitives/base-ui/preview-link-card',
  '/docs/primitives/react-aria/preview-link-card',
  '/docs/primitives/radix-ui/sidebar',
  '/docs/primitives/base-ui/pagination',
  '/docs/primitives/base-ui/questionnaire',
  '/docs/primitives/radix-ui/accordion',
  '/docs/backgrounds/bubble',
];

const COMMAND = /^\s*(npm|npx|pnpm|yarn|bun|bunx)\s/;

for (const url of PAGES)
  test(`${url}: every command offers each package manager`, async ({
    page,
  }) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    const commands = await page
      .locator('article pre')
      .evaluateAll((pres, source) => {
        const pattern = new RegExp(source);
        return pres
          .filter((pre) => pattern.test(pre.textContent ?? ''))
          .map((pre) => {
            // The tab group the block is a panel of (its closest one).
            const GROUP = '[data-slot="code-tabs"], [data-slot="tabs"]';
            const group = pre.closest(GROUP);
            const tabs = group
              ? [...group.querySelectorAll('[role="tab"]')]
                  .filter((tab) => tab.closest(GROUP) === group)
                  .map((tab) => tab.textContent?.trim())
              : [];
            return { text: pre.textContent?.trim().slice(0, 60), tabs };
          });
      }, COMMAND.source);
    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands)
      expect(command.tabs, command.text).toEqual(
        expect.arrayContaining(['npm', 'pnpm', 'yarn', 'bun']),
      );
  });

for (const url of [
  '/docs/icons/get-started',
  '/docs/icons/lucide-icons',
  '/docs/icons/hugeicons',
])
  test(`${url}: installs by CLI or by hand`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    const article = page.locator('article');
    await expect(article.getByRole('tab', { name: 'CLI' })).toBeVisible();
    await article.getByRole('tab', { name: 'Manual' }).click();
    await expect(
      article.getByText(/components\/animate-ui\/.+\.tsx/).first(),
    ).toBeVisible();
  });

test('the home command follows the chosen package manager', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const managers = page.getByRole('radiogroup', { name: 'Package manager' });
  await managers.getByRole('radio', { name: 'pnpm' }).click();
  await expect(
    page.getByText('pnpm dlx @animate-ui/cli@latest animate all'),
  ).toBeVisible();
  await managers.getByRole('radio', { name: 'bun' }).click();
  await expect(
    page.getByText('bunx --bun @animate-ui/cli@latest animate all'),
  ).toBeVisible();
  // The docs' commands follow the same choice.
  await page.goto('/docs/installation', { waitUntil: 'networkidle' });
  await expect(
    page.getByRole('tab', { name: 'bun', selected: true }).first(),
  ).toBeVisible();
});

// CLI / Manual switch on Radix's Tabs (shadcn/ui's), not Animate UI's own.
for (const url of [
  '/docs/primitives/radix-ui/accordion',
  '/docs/backgrounds/bubble',
  '/docs/icons/lucide-icons',
])
  test(`${url}: CLI and Manual are Radix tabs`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    const tabs = page.locator('[data-slot="install-tabs"]').first();
    const manual = tabs.getByRole('tab', { name: 'Manual' });
    // Radix's ids, and no Animate UI highlight.
    await expect(manual).toHaveAttribute('id', /radix-/);
    await expect(tabs.locator('[data-slot="tabs-highlight"]')).toHaveCount(0);
    await manual.click();
    await expect(manual).toHaveAttribute('data-state', 'active');
  });

// Switching CLI and Manual glides the panel's height: what's below it moves
// with the glide, without jumping as it starts or ends (a trailing margin
// trapped inside the gliding steps made it jump ~20px at both ends).
for (const url of [
  '/docs/primitives/radix-ui/accordion',
  '/docs/primitives/base-ui/accordion',
])
  test(`${url}: switching CLI and Manual moves what's below without a jump`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 1000 });
    await page.goto(url, { waitUntil: 'networkidle' });
    const tabs = page.locator('[data-slot="install-tabs"]').first();
    await tabs.scrollIntoViewIfNeeded();
    for (const tab of ['Manual', 'CLI']) {
      // The top of what follows the install tabs, on every frame.
      const frames = tabs.evaluate(
        (el) =>
          new Promise<number[]>((resolve) => {
            const next = el.nextElementSibling ?? el.parentElement!;
            const out: number[] = [];
            const start = performance.now();
            const tick = (now: number) => {
              out.push(next.getBoundingClientRect().top);
              if (now - start < 1100) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          }),
      );
      await tabs.getByRole('tab', { name: tab }).click();
      const tops = await frames;
      const steps = tops
        .slice(1)
        .map((top, i) => top - tops[i]!)
        .filter((step) => Math.abs(step) > 0.05);
      expect(steps.length, tab).toBeGreaterThan(3);
      expect(Math.abs(steps[0]!), tab).toBeLessThan(5);
      expect(Math.abs(steps.at(-1)!), tab).toBeLessThan(5);
    }
  });
