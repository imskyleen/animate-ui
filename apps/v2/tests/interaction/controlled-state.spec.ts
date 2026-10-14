import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/controlled-state', {
    waitUntil: 'networkidle',
  });
});

test('a controlled modal stays open when its parent keeps it open', async ({
  page,
}) => {
  await expect(page.getByText('Kept open')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('log')).toContainText('modal false');
  await page.waitForTimeout(600);
  await expect(page.getByText('Kept open')).toBeVisible();
});

test('a controlled copy button stays as its parent says', async ({ page }) => {
  await page.getByTestId('log').evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
    });
  });
  const button = page.locator('button[aria-label="Copy"]');
  await button.dispatchEvent('click');
  await expect(page.getByTestId('log')).toContainText('copied true');
  await page.waitForTimeout(300);
  expect(await button.getAttribute('data-copied')).toBeNull();
});

test('a controlled highlight stays on the value its parent gives', async ({
  page,
}) => {
  await page.locator('button[data-value="two"]').dispatchEvent('click');
  await expect(page.getByTestId('log')).toContainText('highlight two');
  await page.waitForTimeout(300);
  await expect(page.locator('button[data-value="one"]')).toHaveAttribute(
    'data-active',
    'true',
  );
  await expect(page.locator('button[data-value="two"]')).toHaveAttribute(
    'data-active',
    'false',
  );
});
