import { expect, test, type Locator, type Page } from '../test';

import { clickAndInspect, gotoHydrated } from './disclosure-timeline';

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

test.describe('react-aria disclosure API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoHydrated(page, '/tests/fixtures/react-aria-disclosure');
  });

  const button = (page: Page, name: string) =>
    page.getByRole('button', { name, exact: true });

  test('controlled isExpanded and onExpandedChange', async ({ page }) => {
    const panel = page.getByTestId('controlled-panel');
    await expect(panel).toBeVisible();
    const during = await clickAndInspect(page, 'Controlled', panel);
    await expect(page.getByTestId('controlled-expanded')).toHaveText('false');
    expect(during.hidden).toBe(false);
    expect(during.height).toBeGreaterThan(0);
    expect(during.inert).toBe(true);
    await expect(panel).toHaveAttribute('hidden', 'until-found', {
      timeout: 600,
    });
    expect(await panel.evaluate((el) => (el as HTMLElement).inert)).toBe(false);
    await button(page, 'Controlled').click();
    await expect(page.getByTestId('controlled-expanded')).toHaveText('true');
    await expect(panel).not.toHaveAttribute('hidden');
    await expect(button(page, 'Controlled button')).toBeVisible();
  });

  test('a DisclosureGroup with controlled expandedKeys', async ({ page }) => {
    await button(page, 'Group b').click();
    await expect(page.getByTestId('group-keys')).toHaveText('b');
    await expect(page.getByText('Group content b')).toBeVisible();
    await expect(page.getByText('Group content a')).toBeHidden({
      timeout: 600,
    });
  });

  test('className and style render props still apply', async ({ page }) => {
    const panel = page.getByTestId('render-props');
    await expect(panel).toHaveClass(/panel-class/);
    await expect(panel).toHaveCSS('color', 'rgb(255, 0, 0)');
  });

  test('React Aria’s measured size variables follow Motion', async ({
    page,
  }) => {
    const panel = page.getByTestId('controlled-panel');
    await clickAndInspect(page, 'Controlled', panel);
    expect(
      await panel.evaluate((el) =>
        el.style.getPropertyValue('--disclosure-panel-height'),
      ),
    ).toBe('auto');
  });

  test('find-in-page opens a hidden panel at once', async ({ page }) => {
    const panel = page.getByTestId('render-props');
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    expect(await revealByFind(panel)).toBe(1);
    await expect(button(page, 'Render props')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
