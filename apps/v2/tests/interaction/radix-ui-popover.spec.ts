import { expect, test } from '@playwright/test';
import { describeAnchoredOverlay, gotoReady } from './anchored-overlay';

const PATH = '/tests/demos/radix-ui/popover';
const CONTENT = '[data-slot="popover-content"]';
const trigger = 'Share';

describeAnchoredOverlay('radix-ui popover demo', {
  path: PATH,
  selector: CONTENT,
  open: (page) => page.getByRole('button', { name: trigger }).click(),
  close: (page) => page.keyboard.press('Escape'),
});

test.describe('radix-ui popover keyboard', () => {
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

test.describe('radix-ui popover API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/radix-ui-popover');
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    const content = page.getByTestId('controlled-content');
    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('open');
    await expect(page.getByTestId('changes')).toHaveText('1');
    await expect(content).toBeVisible();
    await page.getByRole('button', { name: 'Close controlled' }).click();
    await expect(page.getByTestId('controlled-open')).toHaveText('closed');
    await expect(content).toHaveCount(0, { timeout: 600 });
    // Opened from outside: the state is the only source of truth.
    await page.getByRole('button', { name: 'Open from outside' }).click();
    await expect(content).toBeVisible();
    await expect(page.getByTestId('changes')).toHaveText('2');
  });

  test('reopening during the exit picks up from where it is', async ({
    page,
  }) => {
    const trigger = page.getByRole('button', { name: 'Controlled trigger' });
    await trigger.click();
    const content = page.getByTestId('controlled-content');
    await expect(content).toBeVisible();
    await page.waitForTimeout(650);
    const element = await content.elementHandle();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);
    await trigger.click();
    await page.waitForTimeout(650);
    // Same element: it retargeted instead of remounting.
    expect(await element!.evaluate((el) => el.isConnected)).toBe(true);
    expect(
      await element!.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });

  test('defaultOpen shows without an entrance, even without a Portal', async ({
    page,
  }) => {
    const content = page.getByTestId('default-open-content');
    await expect(content).toBeVisible();
    expect(
      await content.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
    await page.getByRole('button', { name: 'Default open trigger' }).click();
    await expect(content).toHaveCount(0, { timeout: 600 });
  });

  test('forceMount keeps closed content mounted, hidden and inert', async ({
    page,
  }) => {
    const content = page.getByTestId('force-mount-content');
    const state = () =>
      content.evaluate((el) => ({
        inert: el.closest('[inert]') !== null,
        visibility: getComputedStyle(el).visibility,
      }));
    await expect(content).toHaveCount(1);
    expect(await state()).toEqual({ inert: true, visibility: 'hidden' });
    await page.getByRole('button', { name: 'Force mounted trigger' }).click();
    await expect(
      page.getByRole('button', { name: 'Hidden button' }),
    ).toBeVisible();
    expect(await state()).toEqual({ inert: false, visibility: 'visible' });
    await page.keyboard.press('Escape');
    // Hidden once the exit is over, still mounted.
    await expect.poll(state).toEqual({ inert: true, visibility: 'hidden' });
    await expect(content).toHaveCount(1);
  });

  test('import * style, className, style and transition', async ({ page }) => {
    await page.getByRole('button', { name: 'Star trigger' }).click();
    const content = page.getByTestId('star-content');
    await expect(content).toHaveClass(/custom-class/);
    expect(
      await content.evaluate((el) => getComputedStyle(el).transformOrigin),
    ).toBe('0px 0px');
    // A 200ms entrance instead of 600ms.
    await page.waitForTimeout(260);
    expect(
      await content.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });
});
