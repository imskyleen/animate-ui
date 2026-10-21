import { expect, test, type Page } from '../test';

test.use({ viewport: { width: 1280, height: 900 } });

const tab = (page: Page, name: 'React' | 'Vue') =>
  page.getByRole('tablist', { name: 'Framework' }).getByRole('tab', { name });

const ready = (page: Page) =>
  page.waitForFunction(() =>
    Object.keys(
      document.querySelector('[role="tablist"][aria-label="Framework"] a') ??
        {},
    ).some((k) => k.startsWith('__reactProps')),
  );

test('a component switches to the same component in the other framework', async ({
  page,
}) => {
  await page.goto('/docs/primitives/base-ui/accordion', {
    waitUntil: 'networkidle',
  });
  await expect(tab(page, 'React')).toHaveAttribute('aria-selected', 'true');
  await ready(page);
  await tab(page, 'Vue').click();
  await page.waitForURL('**/docs/vue/primitives/accordion');
  await expect(tab(page, 'Vue')).toHaveAttribute('aria-selected', 'true');
  await ready(page);
  await tab(page, 'React').click();
  await page.waitForURL('**/docs/primitives/base-ui/accordion');
});

test('switching to the same component plays no page transition', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const log: string[] = [];
    (window as unknown as { __transitions: string[] }).__transitions = log;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = ((options: ViewTransitionUpdateCallback) => {
      const transition = start(options);
      transition.ready
        .then(() => new Promise(requestAnimationFrame))
        .then(() =>
          log.push(
            String(
              document
                .getAnimations()
                .filter(
                  (a) => (a.effect as KeyframeEffect | null)?.pseudoElement,
                ).length,
            ),
          ),
        )
        .catch(() => log.push('skipped'));
      return transition;
    }) as typeof document.startViewTransition;
  });
  await page.goto('/docs/primitives/radix-ui/switch', {
    waitUntil: 'networkidle',
  });
  await ready(page);
  await tab(page, 'Vue').click();
  await page.waitForURL('**/docs/vue/primitives/switch');
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __transitions: string[] }).__transitions,
      ),
    )
    .toEqual(['0']);
});

test('a page without a counterpart goes to the introduction', async ({
  page,
}) => {
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  await ready(page);
  await tab(page, 'Vue').click();
  await page.waitForURL(/\/docs\/vue$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Introduction',
  );
});

test('each framework has its own sidebar', async ({ page }) => {
  const sidebar = page.locator('#nd-sidebar');
  await page.goto('/docs/vue/primitives/switch', { waitUntil: 'networkidle' });
  await expect(sidebar.getByRole('link', { name: 'Checkbox' })).toHaveAttribute(
    'href',
    '/docs/vue/primitives/checkbox',
  );
  await expect(sidebar.getByRole('link', { name: 'Backgrounds' })).toHaveCount(
    0,
  );
  await page.goto('/docs/cli', { waitUntil: 'networkidle' });
  await expect(sidebar.getByRole('link', { name: 'Backgrounds' })).toHaveCount(
    1,
  );
  await expect(
    sidebar.locator('a[href^="/docs/vue"]:not([role="tab"])'),
  ).toHaveCount(0);
});
