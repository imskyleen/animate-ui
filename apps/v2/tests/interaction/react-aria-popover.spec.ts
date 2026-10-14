import { expect, test } from '../test';
import {
  describeAnchoredOverlay,
  originIsAnchored,
  gotoReady,
} from './anchored-overlay';
import { probeFirstFrame } from './motion-probe';

const PATH = '/tests/demos/react-aria/popover';
const CONTENT = '[data-slot="popover-content"]';
const trigger = 'Open popover';

describeAnchoredOverlay('react-aria popover demo', {
  path: PATH,
  selector: CONTENT,
  open: (page) => page.getByRole('button', { name: trigger }).click(),
  close: (page) => page.keyboard.press('Escape'),
});

test.describe('react-aria popover keyboard', () => {
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

test.describe('react-aria popover API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await gotoReady(page, '/tests/fixtures/react-aria-popover');
  });

  test('standalone and controlled, with className and style functions', async ({
    page,
  }) => {
    const popover = page.getByTestId('standalone-popover');
    await page.getByRole('button', { name: 'Standalone trigger' }).click();
    await expect(page.getByTestId('standalone-open')).toHaveText('open');
    await expect(popover).toBeVisible();
    await expect(popover).toHaveClass(/is-open/);
    expect(
      await popover.evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe('solid');
    await page.getByRole('button', { name: 'Close standalone' }).click();
    await expect(popover).toHaveClass(/is-exiting/);
    await expect(popover).toHaveAttribute('data-exiting', 'true');
    await expect(popover).toHaveCount(0, { timeout: 1500 });
  });

  test('Select: animates, and keeps the chosen value once closed', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, '[data-testid="select-popover"]');
    const trigger = page.getByRole('button', { name: /Fruit/ });
    await trigger.click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeGreaterThanOrEqual(0.89);
    expect(first.scale).toBeLessThan(1);
    expect(first.opacity).toBeLessThan(1);
    await page.getByRole('option', { name: 'Banana' }).click();
    await expect(page.getByTestId('select-popover')).toHaveCount(0, {
      timeout: 1500,
    });
    await expect(trigger).toContainText('Banana');
    await trigger.click();
    await expect(page.getByRole('option', { name: 'Cherry' })).toBeVisible();
  });

  test('ComboBox: animates while typing, Escape closes it', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(
      page,
      '[data-testid="combobox-popover"]',
    );
    await page.getByRole('combobox', { name: 'Fruit search' }).fill('Ch');
    const first = await probe.firstFrame();
    expect(first.scale).toBeGreaterThanOrEqual(0.89);
    expect(first.scale).toBeLessThan(1);
    await expect(page.getByRole('option', { name: 'Cherry' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('combobox-popover')).toHaveCount(0, {
      timeout: 1500,
    });
  });

  test('menus and submenus fade and scale from 0.9', async ({ page }) => {
    const menu = await probeFirstFrame(page, '[data-testid="menu-popover"]');
    await page.getByRole('button', { name: 'Actions' }).click();
    const menuFirst = await menu.firstFrame();
    expect(menuFirst.scale).toBeGreaterThanOrEqual(0.89);
    expect(menuFirst.scale).toBeLessThan(1);
    expect(await originIsAnchored(page, '[data-testid="menu-popover"]')).toBe(
      true,
    );
    await page.waitForTimeout(400);

    const submenu = await probeFirstFrame(
      page,
      '[data-testid="submenu-popover"]',
    );
    await page.getByRole('menuitem', { name: 'Share' }).click();
    const subFirst = await submenu.firstFrame();
    expect(subFirst.scale).toBeGreaterThanOrEqual(0.89);
    expect(subFirst.scale).toBeLessThan(1);
    expect(subFirst.opacity).toBeLessThan(1);
    await page.getByRole('menuitem', { name: 'Email' }).click();
    await expect(page.getByTestId('menu-popover')).toHaveCount(0, {
      timeout: 1500,
    });
    await expect(page.getByTestId('submenu-popover')).toHaveCount(0);
  });

  test('a render function stays the element, animated', async ({ page }) => {
    await page.getByRole('button', { name: 'Rendered' }).click();
    const popover = page.getByTestId('render-popover');
    await expect(popover).toBeVisible();
    expect(await popover.evaluate((el) => el.tagName)).toBe('SECTION');
    await page.waitForTimeout(260);
    expect(
      await popover.evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });
});
