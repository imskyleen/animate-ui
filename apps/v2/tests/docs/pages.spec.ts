import { readdirSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '@playwright/test';

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

for (const url of ['/', ...PAGES]) {
  test(`${url} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !message.text().includes('/_next/hmr'))
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

  test('the Code tab reveals the whole demo source', async ({ page }) => {
    const code = page
      .getByRole('tablist', { name: 'Preview' })
      .getByRole('tab', { name: 'Code', exact: true });
    await code.click();
    await expect(code).toHaveAttribute('aria-selected', 'true');
    await expect(
      page.getByText('export default function AccordionDemo'),
    ).toBeVisible();
  });

  test('the demo animates in the page', async ({ page }) => {
    await page
      .getByRole('button', {
        name: 'How is it different from other libraries?',
      })
      .click();
    await expect(
      page
        .getByRole('region', {
          name: 'How is it different from other libraries?',
        })
        .getByText('You keep your own components'),
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

test('the sidebar groups primitives into sections', async ({ page }) => {
  await page.goto('/docs/primitives/animate-ui/cursor');
  const section = (title: string) =>
    page.locator('#nd-sidebar > * > div').filter({
      has: page.locator('p', { hasText: new RegExp(`^${title}$`) }),
    });
  const titles = await page.locator('#nd-sidebar p').allTextContents();
  expect(titles).toEqual([
    'Guide',
    'Libraries',
    'Animate UI',
    'Buttons',
    'Texts',
    'Effects',
    'Backgrounds',
    'Icons',
  ]);
  // Primitives with a library page, Animate UI's Tabs and Tooltip included.
  await expect(
    section('Libraries').getByRole('link', { name: 'Tooltip' }),
  ).toBeVisible();
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
    section('Icons').getByRole('link', { name: 'Lucide' }),
  ).toHaveAttribute('href', '/docs/icons/lucide');
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
