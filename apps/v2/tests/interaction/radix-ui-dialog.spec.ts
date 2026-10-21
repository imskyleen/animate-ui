import { expect, test, type Page } from '../test';

import { describeDialogDemo } from './dialog-demo';
import { expectDialogSettled, present, recordTimeline } from './modal-timeline';

const pageFree = (page: Page) =>
  page.evaluate(() => ({
    scrollLocked: document.body.hasAttribute('data-scroll-locked'),
    pointerEvents: getComputedStyle(document.body).pointerEvents,
    hidden: document.querySelector('main')?.getAttribute('aria-hidden') ?? null,
  }));
const FREE = { scrollLocked: false, pointerEvents: 'auto', hidden: null };

describeDialogDemo('radix-ui', (page) =>
  page.goto('/tests/demos/radix-ui/dialog', { waitUntil: 'networkidle' }),
);

test.describe('radix-ui dialog API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-dialog', {
      waitUntil: 'networkidle',
    });
  });

  test('defaultOpen, with the import * style', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Default open dialog' });
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close star' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });

  test('controlled open and onOpenChange', async ({ page }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    await page.getByRole('button', { name: 'Open from outside' }).click();
    const dialog = page.getByRole('dialog', { name: 'Controlled dialog' });
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Close controlled' }).click();
    await expect(page.getByTestId('controlled-state')).toHaveText('closed');
    await expect(page.getByTestId('controlled-changes')).toHaveText('false');
    await expect(dialog).toHaveCount(0, { timeout: 2500 });

    await page.getByRole('button', { name: 'Controlled trigger' }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId('controlled-changes')).toHaveText(
      'false,true',
    );
  });

  test('forceMount: closed content leaves, the page stays usable', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/radix-ui-dialog-force-mount', {
      waitUntil: 'networkidle',
    });
    const content = page.getByTestId('kept-content');
    await expect(content).toHaveCount(0);
    expect(await pageFree(page)).toEqual(FREE);

    await page.getByText('Force mounted trigger').click();
    await expect(content).toBeVisible();

    await page.getByText('Close kept').click();
    await expect(content).toHaveCount(0, { timeout: 2500 });
    await expect.poll(() => pageFree(page)).toEqual(FREE);
  });

  test('a Content without a Portal animates in and out', async ({ page }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    const inline = '[data-testid="inline-content"]';
    const timeline = await recordTimeline(page, { content: inline });
    await page.getByRole('button', { name: 'Inline trigger' }).click();
    await expectDialogSettled(page, inline);
    const first = present(await timeline.stop(), 'content')[0]!.samples
      .content!;
    expect(first.tilt).toBeLessThan(-12);
    expect(first.scale).toBeLessThan(0.88);
    expect(first.opacity).toBeLessThan(0.3);
    await page.getByRole('button', { name: 'Close inline' }).click();
    await expect(page.getByTestId('inline-content')).toHaveCount(0, {
      timeout: 2500,
    });
  });

  test('alert dialog: focuses Cancel, ignores outside clicks, closes with Cancel', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    await page.getByRole('button', { name: 'Alert trigger' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard changes?' });
    await expect(dialog).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Keep editing' }),
    ).toBeFocused();
    await page.waitForTimeout(800);
    await page.mouse.click(5, 5);
    await expect(page.getByTestId('alert-state')).toHaveText('open');
    await page.getByRole('button', { name: 'Keep editing' }).click();
    await expect(page.getByTestId('alert-state')).toHaveText('closed');
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });
});
