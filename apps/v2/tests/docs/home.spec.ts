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
              const frame = el
                .closest('[data-slot="home-orbit"] > div')!
                .getBoundingClientRect();
              return (
                box.left < frame.left - 1 ||
                box.right > frame.right + 1 ||
                box.top < frame.top - 1 ||
                box.bottom > frame.bottom + 1 ||
                (section.top <= header + 1 &&
                  box.top < header - 1 &&
                  box.bottom > header + 1)
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

test('scrolling from the hero through the orbit never shows an empty screen, and the grid does not hold the scroll for long', async ({
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
  const empty: number[] = [];
  for (let y = 0; y <= top + height - viewport; y += viewport / 5) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(300);
    const shown = await page.evaluate(() => {
      const header = document
        .querySelector('[data-slot="home-header"]')!
        .getBoundingClientRect().bottom;
      const opacity = (el: Element) => {
        let value = 1;
        for (let node: Element | null = el; node; node = node.parentElement)
          value *= Number(getComputedStyle(node).opacity);
        return value;
      };
      return [
        ...document.querySelectorAll(
          'main h1, [data-slot="home-orbit"] h2, [data-slot="home-orbit"] svg, [data-slot="orbit-card"]',
        ),
      ].some((el) => {
        const box = el.getBoundingClientRect();
        return (
          opacity(el) > 0.5 &&
          box.bottom > header + 40 &&
          box.top < innerHeight - 40
        );
      });
    });
    if (!shown) empty.push(Math.round(y));
  }
  expect(empty).toEqual([]);

  const end = top + height - viewport;
  const layout = () =>
    page.locator('[data-slot="orbit-card"]').evaluateAll((els) =>
      els.map((el) => {
        const frame = el
          .closest('[data-slot="home-orbit"] > div')!
          .getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return [
          Math.round(box.left - frame.left),
          Math.round(box.top - frame.top),
          Math.round(box.width),
        ];
      }),
    );
  await page.evaluate((to) => window.scrollTo(0, to), end);
  await page.waitForTimeout(800);
  const final = JSON.stringify(await layout());
  let firstSettled = end;
  for (let y = end - 30; y > top; y -= 30) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(500);
    if (JSON.stringify(await layout()) !== final) break;
    firstSettled = y;
  }
  expect(end - firstSettled).toBeLessThan(viewport * 0.12);
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

  const active = hero.locator(
    '[data-slot="tabs-contents"] [data-slot="tabs-content"][data-state="active"]',
  );
  await expect(active).toHaveCount(1);
  await expect(active).toContainText(
    'bun x @animate-ui/cli@latest animate all',
  );
  const copy = hero.locator('[data-slot="copy-button"]');
  expect(
    await copy.evaluate((el) => !!el.closest('[data-slot="tabs-content"]')),
  ).toBe(false);
  const edges = await copy.evaluate((button) => {
    const wrapper = button.parentElement!;
    const frame = wrapper.querySelector('[data-slot="tabs-contents"]')!;
    const cover = wrapper
      .querySelector('[data-slot="command-cover"]')!
      .getBoundingClientRect();
    const box = frame.getBoundingClientRect();
    const style = getComputedStyle(frame);
    return {
      right: box.right - parseFloat(style.borderRightWidth) - cover.right,
      top: cover.top - (box.top + parseFloat(style.borderTopWidth)),
      bottom: box.bottom - parseFloat(style.borderBottomWidth) - cover.bottom,
      under: button.getBoundingClientRect().left - 8 - cover.left,
    };
  });
  for (const gap of Object.values(edges))
    expect(gap).toBeGreaterThanOrEqual(-0.01);
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

test('the library name enters out of a blur like the rest of the title, without sliding in', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const samples: { blur: number; slide: number }[] = [];
    (window as unknown as { samples: typeof samples }).samples = samples;
    const start = performance.now();
    const tick = () => {
      const wrapper = document.querySelector('[data-slot="hero-library"]');
      const word = document.querySelector(
        '[data-slot="hero-library"] [data-slot="rotating-text"]',
      );
      if (wrapper && word) {
        const style = getComputedStyle(wrapper);
        const opacity = Number(style.opacity);
        if (opacity > 0.02 && opacity < 0.98)
          samples.push({
            blur: Number(style.filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? 0),
            slide: Math.abs(
              new DOMMatrix(getComputedStyle(word).transform).m42,
            ),
          });
      }
      if (performance.now() - start < 6000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto('/');
  await page.waitForTimeout(6500);
  const samples = await page.evaluate(
    () =>
      (window as unknown as { samples: { blur: number; slide: number }[] })
        .samples,
  );
  expect(samples.length).toBeGreaterThan(5);
  expect(Math.max(...samples.map((s) => s.blur))).toBeGreaterThan(4);
  expect(Math.max(...samples.map((s) => s.slide))).toBeLessThan(1);
});

test('nothing covers the logo while it glides into the header', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const covered: string[] = [];
    let seen = 0;
    (window as unknown as { glide: unknown }).glide = {
      covered,
      seen: () => seen,
    };
    const start = performance.now();
    const tick = () => {
      const logo = document.querySelector(
        '[data-slot="home-header"] a[aria-label="Animate UI"] > div',
      );
      if (logo) {
        seen++;
        const box = logo.getBoundingClientRect();
        const top = document.elementFromPoint(
          box.left + box.width * 0.08,
          box.top + box.height / 2,
        );
        if (top && !logo.contains(top))
          covered.push(top.getAttribute('data-slot') ?? top.tagName);
      }
      if (performance.now() - start < 5000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto('/');
  await page.waitForTimeout(5500);
  const { covered, seen } = await page.evaluate(() => {
    const glide = (
      window as unknown as {
        glide: { covered: string[]; seen: () => number };
      }
    ).glide;
    return { covered: glide.covered, seen: glide.seen() };
  });
  expect(seen).toBeGreaterThan(10);
  expect(covered).toEqual([]);
});

for (const { width, ownLine } of [
  { width: 1440, ownLine: false },
  { width: 390, ownLine: true },
])
  test(`at ${width}px the library name is ${ownLine ? 'centered on its own line' : 'inline and starts right after "your"'}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
      timeout: 5000,
    });
    await page.waitForTimeout(900);
    const library = page.locator('[data-slot="hero-library"]');
    if (ownLine) await expect(library).toHaveAttribute('data-own-line', '');
    else await expect(library).not.toHaveAttribute('data-own-line');
    const offset = await library.evaluate((el) => {
      const container = el
        .querySelector('[data-slot="rotating-text-container"]')!
        .getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(
        el.querySelector('[data-slot="rotating-text"]')!,
      );
      const word = range.getBoundingClientRect();
      return {
        start: Math.round(word.left - container.left),
        center: Math.round(
          word.left + word.width / 2 - (container.left + container.width / 2),
        ),
      };
    });
    if (ownLine) expect(Math.abs(offset.center)).toBeLessThan(3);
    else expect(Math.abs(offset.start)).toBeLessThan(2);
  });

test('the header shows the GitHub stars button with a count fetched on the server, or the GitHub link when GitHub is unreachable', async ({
  page,
}) => {
  const browserCalls: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('api.github.com'))
      browserCalls.push(request.url());
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
    timeout: 5000,
  });
  const link = page
    .locator('[data-slot="home-header"]')
    .getByRole('link', { name: /^GitHub(, \d+ stars)?$/ });
  await expect(link).toBeVisible();
  const name = await link.getAttribute('aria-label');
  if (name !== 'GitHub') {
    await expect(link).toHaveAttribute(
      'href',
      'https://github.com/imskyleen/animate-ui',
    );
    await expect(link).not.toHaveAttribute('aria-busy', 'true');
  }
  expect(browserCalls).toEqual([]);
});

test('the cards head straight to their grid places, without one more turn', async ({
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
  const centers = () =>
    page.locator('[data-slot="orbit-card"]').evaluateAll((els) =>
      els.map((el) => {
        const frame = el
          .closest('[data-slot="home-orbit"] > div')!
          .getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return [
          box.left + box.width / 2 - frame.left,
          box.top + box.height / 2 - frame.top,
        ];
      }),
    );
  const end = top + height - viewport;
  await page.evaluate((to) => window.scrollTo(0, to), end);
  await page.waitForTimeout(800);
  const final = await centers();
  const start = top - viewport + height * 0.86;
  const distances: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    await page.evaluate(
      (to) => window.scrollTo(0, to),
      start + ((end - start) * i) / 10,
    );
    await page.waitForTimeout(450);
    distances.push(
      (await centers()).map(([x, y], card) =>
        Math.hypot(x! - final[card]![0]!, y! - final[card]![1]!),
      ),
    );
  }
  const away = distances
    .slice(1)
    .flatMap((step, i) =>
      step
        .map((distance, card) => distance - distances[i]![card]!)
        .filter((growth) => growth > 4),
    );
  expect(away).toEqual([]);
});

test('the cards reach the grid within a third of a screen of scroll', async ({
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
  const centers = () =>
    page.locator('[data-slot="orbit-card"]').evaluateAll((els) =>
      els.map((el) => {
        const frame = el
          .closest('[data-slot="home-orbit"] > div')!
          .getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return [
          box.left + box.width / 2 - frame.left,
          box.top + box.height / 2 - frame.top,
        ];
      }),
    );
  const end = top + height - viewport;
  await page.evaluate((to) => window.scrollTo(0, to), end);
  await page.waitForTimeout(800);
  const final = await centers();
  let inOrbit = top;
  for (let y = end - 40; y > top; y -= 40) {
    await page.evaluate((to) => window.scrollTo(0, to), y);
    await page.waitForTimeout(400);
    const now = await centers();
    const mean =
      now.reduce(
        (sum, [x, cy], card) =>
          sum + Math.hypot(x! - final[card]![0]!, cy! - final[card]![1]!),
        0,
      ) / now.length;
    if (mean > 150) {
      inOrbit = y;
      break;
    }
  }
  expect(end - inOrbit).toBeLessThan(viewport * 0.33);
});

for (const height of [900, 760])
  test(`in the orbit grid, the tabs highlight glides along its list, at 1440×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-slot="home-intro"]')).toHaveCount(0, {
      timeout: 5000,
    });
    await page
      .locator('[data-slot="home-orbit"]')
      .evaluate((section: HTMLElement) =>
        window.scrollTo(
          0,
          section.offsetTop + section.offsetHeight - window.innerHeight - 5,
        ),
      );
    await page.waitForTimeout(1500);
    const card = page
      .locator('[data-slot="orbit-card"]')
      .filter({ hasText: 'Tabs' });
    await card.hover();
    let worst = 0;
    for (const name of ['Reports', 'Overview', 'Analytics', 'Overview']) {
      await page.evaluate(() => {
        const samples: number[] = [];
        (window as unknown as { samples: number[] }).samples = samples;
        const root = [
          ...document.querySelectorAll('[data-slot="orbit-card"]'),
        ].find((element) => element.textContent!.includes('Tabs'))!;
        const start = performance.now();
        const tick = () => {
          const highlight = root
            .querySelector('[data-slot="motion-highlight"]')!
            .getBoundingClientRect();
          const list = root
            .querySelector('[data-slot="tabs-list"]')!
            .getBoundingClientRect();
          samples.push(highlight.top - list.top);
          if (performance.now() - start < 700) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await card.getByRole('tab', { name }).click();
      await page.waitForTimeout(900);
      const samples = await page.evaluate(
        () => (window as unknown as { samples: number[] }).samples,
      );
      const rest = samples.at(-1)!;
      worst = Math.max(
        worst,
        ...samples.map((value) => Math.abs(value - rest)),
      );
    }
    expect(worst).toBeLessThanOrEqual(2);
  });
