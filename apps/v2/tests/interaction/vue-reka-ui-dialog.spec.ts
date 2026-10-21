import { expect, test, type Page } from '../test';

import { describeAlertDialogDemo } from './alert-dialog-demo';
import { describeDialogDemo } from './dialog-demo';
import { gotoVueMounted } from './disclosure-timeline';
import { expectDialogSettled, present, recordTimeline } from './modal-timeline';

const FIXTURE = '/tests/vue-demos/fixtures/reka-ui-dialog';

const pageFree = (page: Page) =>
  page.evaluate(() => ({
    scrollLocked: document.body.style.overflow === 'hidden',
    pointerEvents: getComputedStyle(document.body).pointerEvents,
  }));
const FREE = { scrollLocked: false, pointerEvents: 'auto' };

// shadcn-vue's overlay is bg-black/80.
describeDialogDemo(
  'vue-reka-ui',
  (page) => gotoVueMounted(page, '/tests/vue-demos/reka-ui/dialog'),
  0.8,
);

describeAlertDialogDemo(
  'vue-reka-ui',
  (page) => gotoVueMounted(page, '/tests/vue-demos/reka-ui/alert-dialog'),
  0.8,
);

test.describe('vue reka-ui dialog API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoVueMounted(page, FIXTURE);
  });

  test('default-open', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Default open dialog' });
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close star' }).click();
    await expect(dialog).toHaveCount(0, { timeout: 2500 });
  });

  test('open and update:open, changed from both sides', async ({ page }) => {
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

  test('force-mount: closed content leaves, the page stays usable', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Close star' }).click();
    const content = page.getByTestId('kept-content');
    await expect(content).toHaveCount(0, { timeout: 2500 });
    await expect.poll(() => pageFree(page)).toEqual(FREE);
    await page.getByText('Force mounted trigger').click();
    await expect(content).toBeVisible();
    await page.getByText('Close kept').click();
    await expect(content).toHaveCount(0, { timeout: 2500 });
    await expect.poll(() => pageFree(page)).toEqual(FREE);
  });

  test('a content without a portal animates in and out', async ({ page }) => {
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

  test('clicks reach the page as soon as it closes', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Default open dialog' });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(700);
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]').first()).toHaveCSS(
      'pointer-events',
      'none',
    );
  });
});
