import { expect, test } from '@playwright/test';
import { describeAnchoredOverlay, gotoReady } from './anchored-overlay';

const PATH = '/tests/demos/base-ui/popover';
const CONTENT = '[data-slot="popover-content"]';
const trigger = 'Share';

describeAnchoredOverlay('base-ui popover demo', {
  path: PATH,
  selector: CONTENT,
  open: (page) => page.getByRole('button', { name: trigger }).click(),
  close: (page) => page.keyboard.press('Escape'),
});

test.describe('base-ui popover keyboard', () => {
  test.describe.configure({ timeout: 180_000 });
  test('opens from the keyboard and gives focus back on close', async ({
    page,
  }) => {
    await gotoReady(page, PATH);
    await page.getByRole('button', { name: trigger }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator(CONTENT)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(CONTENT)).toHaveCount(0);
    await expect(page.getByRole('button', { name: trigger })).toBeFocused();
  });
});

test.describe('base-ui popover API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/base-ui-popover');
  });

  test('controlled open, onOpenChange and onOpenChangeComplete', async ({
    page,
  }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(content).toBeVisible();
    await expect(page.getByTestId('completed')).toHaveText('opened');
    await page.getByRole('button', { name: 'Close controlled' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 600 });
    // Fires once the exit is over, not when it starts.
    await expect(page.getByTestId('completed')).toHaveText('opened,closed');
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(content).toBeVisible();
  });

  test('a canceled change keeps it open', async ({ page }) => {
    await page.getByRole('button', { name: 'Sticky trigger' }).click();
    const content = page.getByTestId('cancel-content');
    await expect(content).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('blocked')).toHaveText('1');
    await page.waitForTimeout(500);
    await expect(content).toBeVisible();
    await page.getByRole('button', { name: 'Close sticky' }).click();
    await expect(content).toHaveCount(0, { timeout: 600 });
  });

  test('keepMounted keeps the closed popup mounted and hidden', async ({
    page,
  }) => {
    const content = page.getByTestId('keep-mounted-content');
    await expect(content).toHaveCount(1);
    await expect(content).toBeHidden();
    await page.getByRole('button', { name: 'Kept mounted trigger' }).click();
    await expect(
      page.getByRole('button', { name: 'Hidden button' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(content).toHaveCount(1);
    await expect(content).toBeHidden();
  });

  test('render element, className function and transition', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Render trigger' }).click();
    const content = page.getByTestId('render-content');
    await expect(content).toBeVisible();
    expect(await content.evaluate((el) => el.tagName)).toBe('SECTION');
    await expect(content).toHaveClass(/custom-right/);
    expect(
      await content.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBeLessThan(1);
    // A 200ms entrance instead of 600ms.
    await page.waitForTimeout(260);
    expect(
      await content.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });
});
