import { expect, test, type Page } from '../test';

test.use({ viewport: { width: 1440, height: 900 } });

const tabs = (page: Page) =>
  page.locator('main').getByRole('tablist', { name: 'Framework' });

const introDone = (page: Page) =>
  expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });

const hydrated = (page: Page) =>
  page.waitForFunction(() =>
    Object.keys(document.querySelector('main [role="tablist"] a') ?? {}).some(
      (k) => k.startsWith('__reactProps'),
    ),
  );

test('the Vue home is the home adapted to Vue', async ({ page }) => {
  await page.goto('/vue', { waitUntil: 'networkidle' });
  await introDone(page);
  await expect(page).toHaveTitle('Animate UI - Animated primitives for Vue');
  await expect(tabs(page).getByRole('tab', { name: 'Vue' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'shadcn-vue',
  );
  await expect(page.locator('main section p').first()).toHaveText(
    /^Drop-in animated primitives for Reka UI\./,
  );
  const main = page.locator('main');
  await expect(main.getByRole('link', { name: 'Get started' })).toHaveAttribute(
    'href',
    '/docs/vue',
  );
  await expect(
    main.getByRole('link', { name: 'Browse primitives' }),
  ).toHaveAttribute('href', '/docs/vue/primitives');
  const header = page.locator('[data-slot="home-header"]');
  await expect(header.getByRole('link', { name: 'Docs' })).toHaveAttribute(
    'href',
    '/docs/vue',
  );
  await expect(header.getByRole('link', { name: 'Icons' })).toHaveAttribute(
    'href',
    '/docs/vue/icons',
  );
  await expect(
    header.getByRole('link', { name: 'Animate UI' }),
  ).toHaveAttribute('href', '/vue');
  await expect(
    page.locator('footer').getByRole('link', { name: 'Docs' }),
  ).toHaveAttribute('href', '/docs/vue');
  await expect(page.locator('[data-slot="orbit-card"]')).toHaveCount(9);
  await expect(page.locator('[data-slot="home-ai"]')).toHaveCount(1);
});

test('on the Vue home the logo mark is Vue green and the wordmark keeps the text color', async ({
  page,
}) => {
  const colors = () =>
    page
      .locator('[data-slot="home-header"]')
      .getByRole('link', { name: 'Animate UI' })
      .locator('svg path')
      .evaluateAll((paths) => [
        ...paths.map((p) => getComputedStyle(p).color),
        getComputedStyle(document.body).color,
      ]);
  await page.goto('/vue', { waitUntil: 'networkidle' });
  await introDone(page);
  await expect
    .poll(colors)
    .toEqual(['rgb(64, 184, 131)', expect.any(String), expect.any(String)]);
  const [, wordmark, text] = await colors();
  expect(wordmark).toBe(text);
});

test('neither home shows the v2 badge', async ({ page }) => {
  for (const url of ['/', '/vue']) {
    await page.goto(url, { waitUntil: 'networkidle' });
    await expect(page.getByText('Animate UI is now a package')).toHaveCount(0);
  }
});

test('the home switch changes framework in place: the hero stays, the page keeps its scroll', async ({
  page,
}) => {
  // On a phone the orbit starts below the fold, where Next would scroll to.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await introDone(page);
  await hydrated(page);
  await page.evaluate(() => {
    (
      document.querySelector('main section') as HTMLElement & {
        kept?: boolean;
      }
    ).kept = true;
  });
  await tabs(page).getByRole('tab', { name: 'Vue' }).click();
  await page.waitForURL('**/vue');
  await expect(page.locator('main section p').first()).toHaveText(/Reka UI\./);
  await expect(page.locator('[data-slot="orbit-card"]')).toHaveCount(9);
  expect(
    await page.evaluate(() => ({
      kept: (document.querySelector('main section') as { kept?: boolean }).kept,
      y: window.scrollY,
    })),
  ).toEqual({ kept: true, y: 0 });
  await tabs(page).getByRole('tab', { name: 'React' }).click();
  await page.waitForURL((url) => url.pathname === '/');
  await expect(page.locator('[data-slot="home-ai"]')).toHaveCount(1);
});

test('the home switch is a pill with the code block gray behind it', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/vue', { waitUntil: 'networkidle' });
  const list = tabs(page);
  const style = await list.evaluate((el) => ({
    bg: getComputedStyle(el).backgroundColor,
    radius: parseFloat(getComputedStyle(el).borderTopLeftRadius),
    height: el.getBoundingClientRect().height,
  }));
  const block = await page
    .locator('[data-slot="command-cover"]')
    .first()
    .evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor);
  expect(style.bg).toBe(block);
  expect(style.radius).toBeGreaterThanOrEqual(style.height / 2);
});

test('on the Vue docs, the header logo goes back to the Vue home', async ({
  page,
}) => {
  await page.goto('/docs/vue/primitives/reka-ui/switch');
  await expect(
    page.locator('header').getByRole('link', { name: 'Animate UI' }).first(),
  ).toHaveAttribute('href', '/vue');
  await page.goto('/docs/primitives/radix-ui/switch');
  await expect(
    page.locator('header').getByRole('link', { name: 'Animate UI' }).first(),
  ).toHaveAttribute('href', '/');
});

test('the favicon has the Vue green logo on Vue pages, and goes back on React ones', async ({
  page,
}) => {
  const icons = () =>
    page
      .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
      .evaluateAll((links) => links.map((l) => l.getAttribute('href')));
  const vue = [
    '/favicon-vue-32x32.png',
    '/favicon-vue-16x16.png',
    '/apple-touch-icon-vue.png',
  ];
  await page.goto('/vue');
  expect(await icons()).toEqual(vue);
  await page.goto('/docs/primitives/radix-ui/switch', {
    waitUntil: 'networkidle',
  });
  expect(await icons()).toEqual(vue.map((url) => url.replace('-vue', '')));
  await page
    .getByRole('tablist', { name: 'Framework' })
    .getByRole('tab', { name: 'Vue' })
    .click();
  await page.waitForURL('**/docs/vue/primitives/reka-ui/switch');
  await expect.poll(icons).toEqual(vue);
});

for (const reduced of [false, true])
  test(`the full grid of cards sits in centered rows, like React's${reduced ? ', under reduced motion' : ''}`, async ({
    page,
  }) => {
    if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/vue', { waitUntil: 'networkidle' });
    await introDone(page);
    const cards = page.locator('[data-slot="orbit-card"]');
    await page.evaluate(() => {
      const orbit = document.querySelector<HTMLElement>(
        '[data-slot="home-orbit"]',
      )!;
      window.scrollTo(
        0,
        orbit.getBoundingClientRect().top +
          window.scrollY +
          orbit.offsetHeight -
          window.innerHeight,
      );
    });
    const centers = async () => {
      const boxes = await cards.evaluateAll((all) =>
        all.map((c) => {
          const r = c.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: Math.round(r.top) };
        }),
      );
      const rows = Object.values(Object.groupBy(boxes, (b) => String(b.y))).map(
        (row) => row!.reduce((sum, b) => sum + b.x, 0) / row!.length,
      );
      return {
        rows: rows.length,
        spread: Math.max(...rows) - Math.min(...rows),
      };
    };
    await expect.poll(async () => (await centers()).rows).toBe(3);
    await expect.poll(async () => (await centers()).spread).toBeLessThan(1);
  });
