import { readdirSync } from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

// Every docs page, from content/docs.
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

// React Aria's accessibility warnings: a collection without a label, an item
// without the text it's read and typed to by.
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
    // In LIBRARIES order; the current one is selected.
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
    // The shadcn/ui component's import, from Radix UI, then from Animate UI.
    const diff = page.locator('.has-diff');
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
    // Below the demo, in the same frame.
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

/** The import diff of a page's Manual installation: `-`, `+` or ` ` lines. */
async function importDiff(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' });
  await page
    .getByRole('tablist', { name: 'Installation' })
    .getByRole('tab', { name: 'Manual' })
    .click();
  return page
    .locator('.has-diff .line')
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
  // The component's own import, not the demo's (`Pressable`, used by the
  // demo only).
  expect(lines.filter((line) => !line.startsWith(' '))).toEqual([
    "-} from 'react-aria-components';",
    "+} from '@animate-ui/react/primitives/react-aria';",
  ]);
});

test('installation: the imports the CLI swaps, as shadcn/ui writes them', async ({
  page,
}) => {
  // shadcn/ui's Radix Drawer is built on Vaul.
  expect(await importDiff(page, '/docs/primitives/radix-ui/drawer')).toEqual([
    "-import { Drawer as DrawerPrimitive } from 'vaul';",
    "+import { Drawer as DrawerPrimitive } from '@animate-ui/react/primitives/radix-ui/drawer';",
  ]);
  // One line, with the names the component uses (not the demo's pattern).
  expect(
    await importDiff(page, '/docs/primitives/animate-ui/input-otp'),
  ).toEqual([
    "-import { OTPInput, OTPInputContext } from 'input-otp';",
    "+import { OTPInput, OTPInputContext } from '@animate-ui/react/primitives/input-otp';",
  ]);
  // Type-only imports stay, as the CLI leaves them (`Selection`, the demo's).
  const menu = await importDiff(
    page,
    '/docs/primitives/react-aria/dropdown-menu',
  );
  expect(menu.filter((line) => /import type/.test(line))).toEqual([]);
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
    'Effects',
    'Backgrounds',
    'Icons',
  ]);
  // Every shadcn/ui component: those with a library page (Animate UI's Tabs
  // and Tooltip included), and Input OTP (only an Animate UI page).
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
    section('Buttons').getByRole('link', { name: 'Ripple Button' }),
  ).toBeVisible();
  await expect(
    section('Texts').getByRole('link', { name: 'Typing Text' }),
  ).toBeVisible();
  await expect(
    section('Effects').getByRole('link', { name: 'Shine' }),
  ).toBeVisible();
  await expect(
    section('Backgrounds').getByRole('link', { name: 'Bubble', exact: true }),
  ).toHaveAttribute('href', '/docs/backgrounds/bubble');
  await expect(
    section('Icons').getByRole('link', { name: 'Get Started' }),
  ).toHaveAttribute('href', '/docs/icons/get-started');
  // Icon libraries show their logo.
  const lucide = section('Icons').getByRole('link', { name: 'Lucide Icons' });
  await expect(lucide).toHaveAttribute('href', '/docs/icons/lucide-icons');
  await expect(lucide.locator('svg')).toBeVisible();
  // Animate UI's own section shows the Animate UI logo.
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
  // Tall enough for several sections of the introduction at once.
  await page.setViewportSize({ width: 1440, height: 1600 });
  await page.goto('/docs');
  const bar = page.locator('#nd-toc span.bg-primary');
  const items = page.locator('#nd-toc a[data-active="true"]');
  await expect.poll(() => items.count()).toBeGreaterThan(1);
  // From the first active heading to the last one.
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
  // The TOC fits: no fade, so its first item isn't dimmed.
  await expect.poll(() => mask('#nd-toc .overscroll-none')).toBe('none');
  // The sidebar is long: it fades at the bottom only, at the top of the list.
  const sidebar = '#nd-sidebar [data-slot="scroll-fade"]';
  await expect.poll(() => mask(sidebar)).not.toBe('none');
  await expect
    .poll(() =>
      page
        .locator(sidebar)
        .evaluate((el) => el.style.getPropertyValue('--scroll-fade-top')),
    )
    .toMatch(/^0(\.0+)?$|^$/);
});

test('a page released in the last 30 days has a "new" badge', async ({
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
