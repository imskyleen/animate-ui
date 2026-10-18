import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '../test';

const CONTENT = path.join(process.cwd(), 'content', 'docs');
const PAGES = readdirSync(CONTENT, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.mdx'))
  .map((file) =>
    `/docs/${file.replace(/\.mdx$/, '').replace(/(^|\/)index$/, '')}`.replace(
      /\/$/,
      '',
    ),
  )
  .sort();

const A11Y_WARNING = /aria-label|aria-labelledby|visible label|textValue/;

for (const url of ['/', ...PAGES]) {
  test(`${url} renders without errors or accessibility warnings`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
        errors.push(message.text());
      if (message.type() === 'warning' && A11Y_WARNING.test(message.text()))
        errors.push(message.text());
    });
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test.describe('motion review page', () => {
  const REVIEW = path.join(process.cwd(), 'app', '(tests)', 'tests', 'motion');

  test('every demo it lists exists', () => {
    const source = readdirSync(REVIEW)
      .filter((file) => file.endsWith('.tsx'))
      .map((file) => readFileSync(path.join(REVIEW, file), 'utf8'))
      .join('\n');
    const demos = [...source.matchAll(/demo: '([^']+)'/g)].map((m) => m[1]!);
    expect(demos.length).toBeGreaterThan(10);
    const missing = demos.filter(
      (demo) => !existsSync(path.join(process.cwd(), 'demos', `${demo}.tsx`)),
    );
    expect(missing).toEqual([]);
  });

  test('renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto('/tests/motion', {
      waitUntil: 'networkidle',
    });
    expect(response?.status()).toBe(200);
    expect(errors).toEqual([]);
  });
});

test.describe('primitive page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/primitives/radix-ui/accordion', {
      waitUntil: 'networkidle',
    });
  });

  test('library tabs show only the libraries that have it', async ({
    page,
  }) => {
    const tabs = page
      .getByRole('tablist', { name: 'Library' })
      .getByRole('tab');
    await expect(tabs).toHaveText(['Base UI', 'Radix UI', 'React Aria']);
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('installation: the CLI, or the import to swap, as a diff', async ({
    page,
  }) => {
    const tabs = page
      .getByRole('tablist', { name: 'Installation' })
      .getByRole('tab');
    await expect(tabs).toHaveText(['CLI', 'Manual']);
    await tabs.nth(1).click();
    const diff = page.locator('.has-diff').first();
    await expect(diff.locator('.line.diff.remove')).toHaveText([
      "import { Accordion as AccordionPrimitive } from 'radix-ui';",
    ]);
    await expect(diff.locator('.line.diff.add')).toHaveText([
      "import { Accordion as AccordionPrimitive } from '@animate-ui/react/primitives/radix-ui';",
    ]);
  });

  test('the code sits under the demo; View code unfolds it', async ({
    page,
  }) => {
    const code = page.locator('[data-slot="preview-code"]');
    const height = async () => (await code.boundingBox())!.height;
    const collapsed = await height();
    expect(collapsed).toBeLessThan(200);
    const preview = await page.locator('[data-slot="preview"]').boundingBox();
    expect((await code.boundingBox())!.y).toBeGreaterThan(preview!.y);
    await code.getByRole('button', { name: 'View code' }).click();
    await expect(code.getByRole('button', { name: 'View code' })).toHaveCount(
      0,
    );
    await expect.poll(height).toBeGreaterThan(collapsed + 100);
    await expect(
      page.getByText('export default function AccordionDemo'),
    ).toBeVisible();
  });

  test('the demo animates in the page', async ({ page }) => {
    await page
      .getByRole('button', { name: 'What is your return policy?' })
      .click();
    await expect(
      page
        .getByRole('region', { name: 'What is your return policy?' })
        .getByText('Returns accepted within 30 days'),
    ).toBeVisible();
  });

  test('package manager tabs stay in sync across steps', async ({ page }) => {
    await page.getByRole('tab', { name: 'npm', exact: true }).first().click();
    await expect(
      page.getByText('npm install @animate-ui/react motion'),
    ).toBeVisible();
    await expect(
      page.getByText('npx @animate-ui/cli@latest animate accordion'),
    ).toBeVisible();
  });

  test('the sidebar lists the primitive and marks it active', async ({
    page,
  }) => {
    const link = page
      .locator('#nd-sidebar')
      .getByRole('link', { name: 'Accordion' });
    await expect(link).toHaveAttribute(
      'href',
      '/docs/primitives/radix-ui/accordion',
    );
    await expect(link).toHaveAttribute('data-active', 'true');
  });
});

async function importDiff(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page
    .getByRole('tablist', { name: 'Installation' })
    .getByRole('tab', { name: 'Manual' })
    .click();
  return page
    .locator('.has-diff')
    .first()
    .locator('.line')
    .evaluateAll((lines) =>
      lines.map(
        (line) =>
          `${line.classList.contains('remove') ? '-' : line.classList.contains('add') ? '+' : ' '}${line.textContent}`,
      ),
    );
}

test('installation: a multi-line import only swaps its last line', async ({
  page,
}) => {
  const lines = await importDiff(
    page,
    '/docs/primitives/react-aria/context-menu',
  );
  expect(lines[0]).toBe(' import {');
  expect(lines.filter((line) => !line.startsWith(' '))).toEqual([
    "-} from 'react-aria-components';",
    "+} from '@animate-ui/react/primitives/react-aria';",
  ]);
});

test('installation: the imports the CLI swaps, as shadcn/ui writes them', async ({
  page,
}) => {
  expect(await importDiff(page, '/docs/primitives/radix-ui/drawer')).toEqual([
    "-import { Drawer as DrawerPrimitive } from 'vaul';",
    "+import { Drawer as DrawerPrimitive } from '@animate-ui/react/primitives/radix-ui/drawer';",
  ]);
  expect(
    await importDiff(page, '/docs/primitives/animate-ui/input-otp'),
  ).toEqual([
    "-import { OTPInput, OTPInputContext } from 'input-otp';",
    "+import { OTPInput, OTPInputContext } from '@animate-ui/react/primitives/input-otp';",
  ]);
  expect(
    await importDiff(page, '/docs/primitives/base-ui/navigation-menu'),
  ).toEqual([
    "-import { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';",
    "+import { NavigationMenu as NavigationMenuPrimitive } from '@animate-ui/react/primitives/base-ui/navigation-menu';",
  ]);
  const menu = await importDiff(
    page,
    '/docs/primitives/react-aria/dropdown-menu',
  );
  expect(menu.filter((line) => /import type/.test(line))).toEqual([]);
});

test("installation: a drop-in's library page swaps the package it stands in for", async ({
  page,
}) => {
  for (const library of ['base-ui', 'radix-ui', 'react-aria']) {
    expect(
      await importDiff(page, `/docs/primitives/${library}/questionnaire`),
    ).toEqual([
      "-import { Questionnaire as QuestionnairePrimitive } from '@shadcn/react/questionnaire';",
      "+import { Questionnaire as QuestionnairePrimitive } from '@animate-ui/react/primitives/questionnaire';",
    ]);
    await expect(
      page.getByRole('heading', { name: 'Remove the CSS animations' }),
    ).toHaveCount(0);
  }
  await importDiff(page, '/docs/primitives/radix-ui/accordion');
  await expect(
    page.getByRole('heading', { name: 'Remove the CSS animations' }),
  ).toHaveCount(1);
});

test('installation: the manual steps list the exact CSS animation classes the CLI removes, part by part', async ({
  page,
}) => {
  expect(
    execFileSync('npx', ['tsx', 'scripts/build-css-removals.mts', '--check'], {
      encoding: 'utf8',
    }),
  ).toBe('');
  await importDiff(page, '/docs/primitives/radix-ui/dialog');
  const removals = page.locator('[data-slot="css-removals"] .line');
  const lines = await removals.evaluateAll((all) =>
    all.map(
      (line) =>
        `${line.classList.contains('remove') ? '-' : line.classList.contains('add') ? '+' : ' '}${line.textContent}`,
    ),
  );
  expect(lines).toContain(' DialogOverlay');
  expect(lines).toContain(' DialogContent');
  expect(lines).toContain('-  data-open:zoom-in-95');
  expect(lines.indexOf('-  data-open:zoom-in-95')).toBeGreaterThan(
    lines.indexOf(' DialogContent'),
  );
  expect(lines.filter((line) => line.startsWith('-')).length).toBe(12);

  await importDiff(page, '/docs/primitives/base-ui/tabs');
  await expect(page.getByText(/^Nothing to remove/)).toBeVisible();

  await page.setViewportSize({ width: 320, height: 800 });
  await importDiff(page, '/docs/primitives/base-ui/toast');
  const toast = page.locator('[data-slot="css-removals"]');
  await expect(toast.locator('.line').first()).toHaveText('Toast');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(0);
});

test('the sidebar groups primitives into sections', async ({ page }) => {
  await page.goto('/docs/primitives/animate-ui/cursor');
  const section = (title: string) =>
    page.locator('#nd-sidebar > * > div').filter({
      has: page.locator('p', { hasText: new RegExp(`^${title}$`) }),
    });
  const titles = await page.locator('#nd-sidebar p').allTextContents();
  expect(titles).toEqual([
    'Guide',
    'Components',
    'Animate UI',
    'Buttons',
    'Texts',
    'Numbers',
    'Effects',
    'Backgrounds',
    'Icons',
  ]);
  await expect(
    section('Components').getByRole('link', { name: 'Tooltip' }),
  ).toBeVisible();
  await expect(
    section('Components').getByRole('link', { name: 'Input OTP' }),
  ).toBeVisible();
  await expect(
    section('Animate UI').getByRole('link', { name: 'Input OTP' }),
  ).toHaveCount(0);
  await expect(
    section('Animate UI').getByRole('link', { name: 'Cursor' }),
  ).toHaveAttribute('data-active', 'true');
  await expect(
    section('Buttons').getByRole('link', { name: /^Ripple(\s+updated)?$/ }),
  ).toBeVisible();
  await expect(
    section('Texts').getByRole('link', { name: /^Typing(\s+updated)?$/ }),
  ).toBeVisible();
  await expect(
    section('Effects').getByRole('link', { name: 'Shine' }),
  ).toBeVisible();
  await expect(
    section('Backgrounds').getByRole('link', { name: 'Bubble', exact: true }),
  ).toHaveAttribute('href', '/docs/backgrounds/bubble');
  const backgrounds = await section('Backgrounds')
    .getByRole('link')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLElement).innerText),
    );
  expect(backgrounds.length).toBeGreaterThan(5);
  for (const name of backgrounds) expect(name).not.toMatch(/Background/);
  await expect(
    section('Backgrounds').getByRole('link', { name: /^Topography/ }),
  ).toContainText('new');
  for (const [title, suffix] of [
    ['Texts', /\sText$/],
    ['Buttons', /\sButton$/],
    ['Numbers', /\sNumber$/],
  ] as const) {
    const names = await section(title)
      .getByRole('link')
      .evaluateAll((links) =>
        links.map((link) =>
          (link as HTMLElement).innerText.replace(/\s*new$/, ''),
        ),
      );
    expect(names.length).toBeGreaterThan(2);
    for (const name of names) expect(name.trim()).not.toMatch(suffix);
  }
  await expect(
    section('Texts').getByRole('link', { name: /^Typing(\s+updated)?$/ }),
  ).toHaveAttribute('href', /typing-text/);
  await expect(
    section('Numbers').getByRole('link', { name: /^Sliding(\s+updated)?$/ }),
  ).toHaveAttribute('href', /sliding-number/);
  await expect(
    section('Texts').getByRole('link', { name: /Number/ }),
  ).toHaveCount(0);
  await expect(
    section('Buttons').getByRole('link', { name: /^Button(\s+updated)?$/ }),
  ).toHaveAttribute('href', /\/button$/);
  await expect(
    section('Icons').getByRole('link', { name: 'Get Started' }),
  ).toHaveAttribute('href', '/docs/icons/get-started');
  const lucide = section('Icons').getByRole('link', { name: 'Lucide Icons' });
  await expect(lucide).toHaveAttribute('href', '/docs/icons/lucide-icons');
  await expect(lucide.locator('svg')).toBeVisible();
  const hugeicons = section('Icons').getByRole('link', { name: 'Hugeicons' });
  await expect(hugeicons).toHaveAttribute('href', '/docs/icons/hugeicons');
  await expect(hugeicons.locator('svg')).toBeVisible();
  await expect(
    page.locator('#nd-sidebar p', { hasText: /^Animate UI$/ }).locator('svg'),
  ).toBeVisible();
});

test('the TOC marks one heading, and the page ends with the footer', async ({
  page,
}) => {
  await page.goto('/docs/primitives/radix-ui/accordion');
  await expect(page.locator('#nd-toc p')).toHaveText('On this page');
  await expect(page.locator('#nd-toc .bg-primary')).toHaveCount(1);
  await expect(page.getByText('Built by')).toBeVisible();
  await expect(page.getByText('Last updated:')).toBeVisible();
});

test('the TOC bar covers every heading in view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1600 });
  await page.goto('/docs');
  const bar = page.locator('#nd-toc span.bg-primary');
  const items = page.locator('#nd-toc a[data-active="true"]');
  await expect.poll(() => items.count()).toBeGreaterThan(1);
  await expect
    .poll(async () => {
      const box = await bar.boundingBox();
      const first = await items.first().boundingBox();
      const last = await items.last().boundingBox();
      return (
        box!.y >= first!.y &&
        box!.y + box!.height <= last!.y + last!.height &&
        box!.y + box!.height > last!.y
      );
    })
    .toBe(true);
});

test('the sidebar and TOC fade only where there is more to scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/docs/primitives/radix-ui/accordion');
  const mask = (selector: string) =>
    page
      .locator(selector)
      .evaluate(
        (el) =>
          getComputedStyle(el).maskImage ||
          getComputedStyle(el).webkitMaskImage,
      );
  await expect.poll(() => mask('#nd-toc .overscroll-none')).toBe('none');
  const sidebar = '#nd-sidebar [data-slot="sidebar-scroll"]';
  await expect.poll(() => mask(sidebar)).not.toBe('none');
  const fade = (edge: 't' | 'b') =>
    page
      .locator(sidebar)
      .evaluate(
        (el, edge) =>
          getComputedStyle(el).getPropertyValue(`--scroll-fade-${edge}`),
        edge,
      );
  await expect.poll(() => fade('t')).toContain('0 *');
  await expect.poll(() => fade('b')).not.toContain('0 *');
});

test('the sidebar fades its edges without shrinking a row or a section', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/docs/primitives/radix-ui/accordion');
  const sidebar = page.locator('#nd-sidebar [data-slot="sidebar-scroll"]');
  await sidebar.evaluate((el) => (el.scrollTop = 700));
  await expect
    .poll(() =>
      sidebar.evaluate((el) =>
        getComputedStyle(el).getPropertyValue('--scroll-fade-t'),
      ),
    )
    .not.toContain('0 *');
  const scaled = await sidebar.evaluate(
    (el) =>
      [...el.querySelectorAll<HTMLElement>('*')].filter(
        (child) => getComputedStyle(child).scale !== 'none',
      ).length,
  );
  expect(scaled).toBe(0);
});

test('a page released in the last 60 days has a "new" badge', async ({
  page,
}) => {
  await page.goto('/docs/primitives/animate-ui/scroll-fade');
  await expect(
    page.locator('#nd-sidebar a', { hasText: 'Scroll Fade' }),
  ).toContainText('new');
});

test('the TOC line stays put while the page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/docs/backgrounds/hexagon');
  const scroller = page.locator('#nd-toc .overscroll-none');
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(700, 500);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    expect(await scroller.evaluate((el) => el.scrollLeft)).toBe(0);
  }
});

test('installation: switching CLI and Manual moves the steps like the tabs demo, blurred and slid', async ({
  page,
}) => {
  await page.goto('/docs/primitives/radix-ui/tabs', {
    waitUntil: 'networkidle',
  });
  const install = page.locator('[data-slot="install-tabs"]').first();
  await install.scrollIntoViewIfNeeded();
  const record = () =>
    install.evaluate(
      (root) =>
        new Promise<{ blur: number; shift: number }>((resolve) => {
          let blur = 0;
          let shift = 0;
          const start = performance.now();
          const tick = () => {
            for (const step of root.querySelectorAll('.fd-step')) {
              const style = getComputedStyle(step);
              blur = Math.max(
                blur,
                parseFloat(
                  style.filter.match(/blur\(([\d.]+)px\)/)?.[1] ?? '0',
                ),
              );
              shift = Math.max(
                shift,
                Math.abs(parseFloat(style.translate) || 0),
              );
            }
            if (performance.now() - start < 700) requestAnimationFrame(tick);
            else resolve({ blur, shift });
          };
          requestAnimationFrame(tick);
        }),
    );
  await install.getByRole('tab', { name: 'Manual', exact: true }).click();
  await page.waitForTimeout(900);
  const back = record();
  await install.getByRole('tab', { name: 'CLI', exact: true }).click();
  const { blur, shift } = await back;
  expect(blur).toBeGreaterThan(2);
  expect(shift).toBeGreaterThan(6);
  expect(
    await install
      .locator('.fd-step')
      .first()
      .evaluate((step) => getComputedStyle(step).position),
  ).toBe('relative');
});

test('the sidebar marks new and updated pages with badges set next to their name', async ({
  page,
}) => {
  await page.goto('/docs/primitives/radix-ui/accordion');
  const link = (name: RegExp) =>
    page.locator('#nd-sidebar').getByRole('link', { name });
  const badgeOf = (name: RegExp) => link(name).locator('[data-slot="badge"]');
  for (const name of [
    /^@animate-ui\/react/,
    /^CLI/,
    /^Skills/,
    /^Lucide Icons/,
    /^Combobox/,
  ])
    await expect(badgeOf(name).first()).toHaveText('new');
  for (const name of [/^Installation/, /^Get Started/, /^Accordion/, /^Ripple/])
    await expect(badgeOf(name).first()).toHaveText('updated');
  await expect(badgeOf(/^Introduction/)).toHaveCount(0);
  const updated = badgeOf(/^Accordion/).first();
  const muted = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.className = 'text-muted-foreground';
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect(updated).toHaveCSS('color', muted);
  const gap = await link(/^Accordion/)
    .first()
    .evaluate((anchor) => {
      const badge = anchor.querySelector('[data-slot="badge"]')!;
      const label = badge.previousElementSibling!;
      return (
        badge.getBoundingClientRect().left - label.getBoundingClientRect().right
      );
    });
  expect(gap).toBeLessThan(16);
});
