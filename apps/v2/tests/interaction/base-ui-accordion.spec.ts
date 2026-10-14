import { expect, test, type Locator, type Page } from '../test';

import {
  clickAndInspect,
  disclosureDemoTests,
  gotoHydrated,
} from './disclosure-timeline';

const revealByFind = (panel: Locator) =>
  panel.evaluate(async (el) => {
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    el.removeAttribute('hidden');
    el.dispatchEvent(new Event('beforematch'));
    const start = performance.now();
    const isOpen = () =>
      el.hasAttribute('data-open') ||
      el.getAttribute('aria-hidden') === 'false';
    while (!isOpen() && performance.now() - start < 3000) await frame();
    await frame();
    return Number(getComputedStyle(el).opacity);
  });

disclosureDemoTests('base-ui accordion demo', {
  url: '/tests/demos/base-ui/accordion',
  panel: '[data-slot="accordion-content"]',
  closed: {
    trigger: 'What is your return policy?',
    text: 'Returns accepted within 30 days',
  },
  open: {
    trigger: 'What are your shipping options?',
    text: 'We offer standard (5-7 days)',
  },
  closedState: 'unmounted',
});

test.describe('base-ui accordion API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/fixtures/base-ui-accordion');
  });

  const button = (page: Page, name: string) =>
    page.getByRole('button', { name, exact: true });

  test('controlled value and onValueChange', async ({ page }) => {
    await button(page, 'Controlled b').click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(page.getByText('Controlled content b')).toBeVisible();
    await expect(page.getByText('Controlled content a')).toBeVisible();
    await expect(page.getByText('Controlled content a')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('multiple', async ({ page }) => {
    await button(page, 'Multiple y').click();
    await page.waitForTimeout(700);
    await expect(page.getByText('Multiple content x')).toBeVisible();
    await expect(page.getByText('Multiple content y')).toBeVisible();
  });

  test('items without a value', async ({ page }) => {
    await button(page, 'Unnamed 1').click();
    await expect(page.getByText('Unnamed content 1')).toBeVisible();
    await expect(page.getByText('Unnamed content 2')).toHaveCount(0);
    await button(page, 'Unnamed 2').click();
    await expect(page.getByText('Unnamed content 2')).toBeVisible();
    await expect(page.getByText('Unnamed content 1')).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('keepMounted from the Root: collapses, then hidden', async ({
    page,
  }) => {
    const panel = page.getByTestId('kept');
    const during = await clickAndInspect(page, 'Kept mounted', panel);
    expect(during.hidden).toBe(false);
    expect(during.height).toBeGreaterThan(0);
    expect(during.inert).toBe(true);
    await expect(panel).toHaveAttribute('hidden', '', { timeout: 600 });
    await button(page, 'Kept mounted').click();
    await expect(panel).not.toHaveAttribute('hidden');
    await expect(
      page.getByRole('button', { name: 'Kept button' }),
    ).toBeVisible();
  });

  test('hiddenUntilFound from the Root: find-in-page opens it at once', async ({
    page,
  }) => {
    const panel = page.getByTestId('until-found');
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    expect(await revealByFind(panel)).toBe(1);
    await expect(button(page, 'Until found')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
