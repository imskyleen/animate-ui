import { expect, test, type Locator } from '../test';

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

disclosureDemoTests('base-ui collapsible demo', {
  url: '/tests/demos/base-ui/collapsible',
  panel: '[data-slot="collapsible-content"]',
  closed: {
    trigger: 'Toggle details',
    text: '100 Market St, San Francisco',
  },
  closedState: 'unmounted',
});

test.describe('base-ui collapsible API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/fixtures/base-ui-collapsible');
  });

  const button = (page: import('@playwright/test').Page, name: string) =>
    page.getByRole('button', { name, exact: true });

  test('controlled open and onOpenChange', async ({ page }) => {
    const content = page.getByText('Controlled content', { exact: true });
    await expect(content).toBeVisible();
    await button(page, 'Controlled').click();
    await expect(page.getByTestId('controlled-open')).toHaveText('false');
    await expect(content).toHaveCount(0, { timeout: 600 });
    await button(page, 'Controlled').click();
    await expect(page.getByTestId('controlled-open')).toHaveText('true');
    await expect(content).toBeVisible();
  });

  test('a canceled change keeps it closed', async ({ page }) => {
    await button(page, 'Canceled').click();
    await expect(page.getByTestId('canceled-changes')).toHaveText('1');
    await page.waitForTimeout(300);
    await expect(page.getByText('Canceled content')).toHaveCount(0);
    await expect(button(page, 'Canceled')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('keepMounted: collapses, then hidden like Base UI', async ({ page }) => {
    const panel = page.getByTestId('kept');
    const during = await clickAndInspect(page, 'Kept mounted', panel);
    expect(during.hidden).toBe(false);
    expect(during.height).toBeGreaterThan(0);
    expect(during.inert).toBe(true);
    await expect(panel).toHaveAttribute('hidden', '', { timeout: 600 });
    await expect(panel).toHaveAttribute('data-closed', '');
    await button(page, 'Kept mounted').click();
    await expect(panel).not.toHaveAttribute('hidden');
    await expect(
      page.getByRole('button', { name: 'Kept button' }),
    ).toBeVisible();
  });

  test('hiddenUntilFound: hidden until found, and find-in-page opens it at once', async ({
    page,
  }) => {
    const panel = page.getByTestId('until-found');
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await expect(panel).toHaveClass('is-closed');

    expect(await revealByFind(panel)).toBe(1);
    await expect(panel).toHaveClass('is-open');

    const during = await clickAndInspect(page, 'Until found', panel);
    expect(during.hidden).toBe(false);
    expect(during.height).toBeGreaterThan(0);
    await expect(panel).toHaveAttribute('hidden', 'until-found', {
      timeout: 600,
    });
  });

  test('a custom render element animates too', async ({ page }) => {
    const panel = page.getByTestId('custom-render');
    expect(await panel.evaluate((el) => el.tagName)).toBe('SECTION');
    await expect(panel).toHaveCSS('color', 'rgb(255, 0, 0)');
    const during = await clickAndInspect(page, 'Custom render', panel);
    expect(during.height).toBeGreaterThan(0);
    expect(during.opacity).toBeLessThan(1);
    await expect(panel).toHaveCount(0, { timeout: 600 });
  });
});
