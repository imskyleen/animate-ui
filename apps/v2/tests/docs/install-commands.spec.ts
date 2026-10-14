import { expect, test } from '../test';

const PAGES = [
  '/docs',
  '/docs/installation',
  '/docs/react',
  '/docs/cli',
  '/docs/skills',
  '/docs/mcp',
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
    page.getByText('bun x @animate-ui/cli@latest animate all'),
  ).toBeVisible();
  await page.goto('/docs/installation', { waitUntil: 'networkidle' });
  await expect(
    page.getByRole('tab', { name: 'bun', selected: true }).first(),
  ).toBeVisible();
});

for (const url of [
  '/docs/primitives/radix-ui/accordion',
  '/docs/backgrounds/bubble',
  '/docs/icons/lucide-icons',
])
  test(`${url}: CLI and Manual are Radix tabs`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    const tabs = page.locator('[data-slot="install-tabs"]').first();
    const manual = tabs.getByRole('tab', { name: 'Manual' });
    await expect(manual).toHaveAttribute('id', /radix-/);
    await expect(tabs.locator('[data-slot="tabs-highlight"]')).toHaveCount(0);
    await manual.click();
    await expect(manual).toHaveAttribute('data-state', 'active');
  });

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

test('bun runs packages the same way in every command', async ({ page }) => {
  for (const url of [
    '/docs/installation',
    '/docs/primitives/radix-ui/accordion',
  ]) {
    await page.goto(url, { waitUntil: 'networkidle' });
    const commands = (await page.locator('pre').allTextContents()).filter(
      (text) => text.startsWith('bun'),
    );
    expect(
      commands.some((text) => text.startsWith('bun x')),
      url,
    ).toBe(true);
    expect(
      commands.filter((text) => text.startsWith('bunx')),
      url,
    ).toEqual([]);
  }
});
