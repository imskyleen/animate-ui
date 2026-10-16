import { expect, test } from '../test';

test.use({ viewport: { width: 1440, height: 900 } });

test('the intro draws the logo, then gives the page and its scroll back', async ({
  page,
}) => {
  await page.goto('/');
  const intro = page.locator('[data-slot="home-intro"]');
  await expect(intro).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe('hidden');
  await expect(intro).toHaveCount(0, { timeout: 5000 });
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe('');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'components in one command',
  );
});

test('scrolling through the orbit settles the cards in a playable 3-column grid', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const orbit = page.locator('[data-slot="home-orbit"]');
  const cards = page.locator('[data-slot="orbit-card"]');
  await expect(cards).toHaveCount(9);
  await orbit.evaluate((section: HTMLElement) =>
    window.scrollTo(
      0,
      section.offsetTop + section.offsetHeight - window.innerHeight - 10,
    ),
  );
  await expect
    .poll(async () => {
      const boxes = await cards.evaluateAll((els) =>
        els.map((el) => {
          const box = el.getBoundingClientRect();
          return Math.round(box.left);
        }),
      );
      return new Set(boxes).size;
    })
    .toBe(3);
  const switches = cards.first().getByRole('switch');
  const before = await switches.first().getAttribute('aria-checked');
  await cards.first().hover();
  await switches.first().click();
  await expect(switches.first()).not.toHaveAttribute(
    'aria-checked',
    before ?? '',
  );
});

test('a hovered card stops playing by itself', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const orbit = page.locator('[data-slot="home-orbit"]');
  await orbit.evaluate((section: HTMLElement) =>
    window.scrollTo(
      0,
      section.offsetTop + section.offsetHeight - window.innerHeight - 10,
    ),
  );
  const tabs = page
    .locator('[data-slot="orbit-card"]')
    .filter({ hasText: 'Tabs' });
  await page.waitForTimeout(800);
  await tabs.hover();
  const selected = () =>
    tabs.getByRole('tab', { selected: true }).textContent();
  const first = await selected();
  await page.waitForTimeout(3000);
  expect(await selected()).toBe(first);
  await page.mouse.move(5, 5);
  await expect.poll(selected, { timeout: 4000 }).not.toBe(first);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no intro, and the components sit still in a plain grid', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0);
    const orbit = page.locator('[data-slot="home-orbit"]');
    expect(
      await orbit.evaluate((section: HTMLElement) => section.offsetHeight),
    ).toBeLessThan(1400);
    const tabs = page
      .locator('[data-slot="orbit-card"]')
      .filter({ hasText: 'Tabs' });
    const first = await tabs.getByRole('tab', { selected: true }).textContent();
    await page.waitForTimeout(2500);
    expect(await tabs.getByRole('tab', { selected: true }).textContent()).toBe(
      first,
    );
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('the components sit in a plain grid that fits the screen', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
      timeout: 5000,
    });
    const cards = page.locator('[data-slot="orbit-card"]');
    await expect(cards).toHaveCount(9);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await cards.nth(4).scrollIntoViewIfNeeded();
    await expect(cards.nth(4)).toBeInViewport();
  });
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 640 },
])
  test(`nothing in the orbit is ever cut off, at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
      timeout: 5000,
    });
    const orbit = page.locator('[data-slot="home-orbit"]');
    const { top, height } = await orbit.evaluate((section: HTMLElement) => ({
      top: section.offsetTop,
      height: section.offsetHeight,
    }));
    const cut: string[] = [];
    for (let step = 0; step <= 24; step++) {
      const y =
        top - viewport.height + ((height + viewport.height) * step) / 24;
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(250);
      cut.push(
        ...(await page.evaluate(() => {
          const header = document
            .querySelector('[data-slot="home-header"]')!
            .getBoundingClientRect().bottom;
          const section = document
            .querySelector('[data-slot="home-orbit"]')!
            .getBoundingClientRect();
          if (section.bottom < innerHeight - 1) return [];
          const opacity = (el: Element) => {
            let value = 1;
            for (let node: Element | null = el; node; node = node.parentElement)
              value *= Number(getComputedStyle(node).opacity);
            return value;
          };
          return [
            ...document.querySelectorAll(
              '[data-slot="orbit-card"], [data-slot="home-orbit"] h2',
            ),
          ]
            .filter((el) => opacity(el) > 0.02)
            .filter((el) => {
              const box = el.getBoundingClientRect();
              return (
                box.left < -1 ||
                box.right > innerWidth + 1 ||
                box.bottom > innerHeight + 1 ||
                (box.top < header - 1 && box.bottom > header + 1)
              );
            })
            .map(
              (el) => `${Math.round(scrollY)}: ${el.textContent!.slice(0, 20)}`,
            );
        })),
      );
    }
    expect(cut).toEqual([]);
  });

test('the hero cycles the library name inline with Rotating Text while the rest of the title stays still', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toContainText('Animate your');
  await expect(heading).toContainText('components in one command');
  const library = heading.locator('[data-slot="rotating-text-container"]');
  await expect(library).toHaveCount(1);
  const shown = () =>
    heading
      .locator('[data-slot="rotating-text"]')
      .first()
      .textContent({ timeout: 4000 });
  const measure = () =>
    heading.evaluate((el) => {
      const range = document.createRange();
      const box = (node: Node) => {
        range.selectNodeContents(node);
        const rect = range.getBoundingClientRect();
        return [Math.round(rect.left), Math.round(rect.bottom)];
      };
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const words: Record<string, number[]> = {};
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const text = node.textContent!.trim();
        if (['your', 'command'].includes(text)) words[text] = box(node);
      }
      return words;
    });
  await page.waitForTimeout(1500);
  const first = await shown();
  const layout = await measure();
  const rotating = await heading
    .locator('[data-slot="rotating-text"]')
    .first()
    .evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return Math.round(range.getBoundingClientRect().bottom);
    });
  expect(rotating).toBe(layout.your![1]);
  await expect.poll(shown, { timeout: 6000 }).not.toBe(first);
  for (let i = 0; i < 8; i++) {
    expect(await measure()).toEqual(layout);
    await page.waitForTimeout(60);
  }
});

test('the orbit headline waits for the logo, and the grid does not hold the scroll for long', async ({
  page,
}) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const orbit = page.locator('[data-slot="home-orbit"]');
  const { top, height, viewport } = await orbit.evaluate(
    (section: HTMLElement) => ({
      top: section.offsetTop,
      height: section.offsetHeight,
      viewport: window.innerHeight,
    }),
  );
  const headline = orbit.getByRole('heading', {
    name: 'Every primitive, alive.',
  });
  await page.evaluate((y) => window.scrollTo(0, y), top - 80 + viewport * 0.2);
  await page.waitForTimeout(600);
  expect(
    Number(await headline.evaluate((el) => getComputedStyle(el).opacity)),
  ).toBeLessThan(0.2);

  const end = top + height - viewport;
  const settled = async () =>
    page.locator('[data-slot="orbit-card"]').evaluateAll((els) =>
      els.every((el) => {
        const wrapper = el.parentElement!;
        return (
          getComputedStyle(wrapper).transform === 'none' ||
          /matrix\(1, 0, 0, 1,/.test(getComputedStyle(wrapper).transform)
        );
      }),
    );
  let firstSettled = end;
  for (let y = end; y > top; y -= 40) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(200);
    if (!(await settled())) break;
    firstSettled = y;
  }
  expect(end - firstSettled).toBeLessThan(viewport * 0.35);
});

test('the command block is built from Animate UI tabs, copy button and buttons', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const hero = page.locator('section').first();
  const managers = hero.locator('[data-slot="tabs-list"]');
  await expect(managers).toHaveAttribute('aria-label', 'Package manager');
  const highlight = () =>
    hero
      .locator('[data-slot="motion-highlight"]')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().left));
  await managers.getByRole('tab', { name: 'npm', exact: true }).click();
  await page.waitForTimeout(500);
  const before = await highlight();
  await managers.getByRole('tab', { name: 'bun' }).click();
  await expect.poll(highlight).toBeGreaterThan(before + 20);

  const copy = hero.locator('[data-slot="copy-button"]');
  await copy.click();
  await expect(copy).toHaveAttribute('data-copied', '');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'bun x @animate-ui/cli@latest animate all',
  );

  for (const name of ['Get started', 'Browse primitives'])
    await expect(hero.getByRole('link', { name })).toHaveAttribute(
      'data-slot',
      'button',
    );
});
