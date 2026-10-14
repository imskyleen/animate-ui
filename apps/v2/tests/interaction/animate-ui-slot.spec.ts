import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/animate-ui-slot', {
    waitUntil: 'networkidle',
  });
});

test("the child's own handler runs, then the slot's", async ({ page }) => {
  await page.getByRole('button', { name: 'Slotted' }).click();
  await expect(page.getByTestId('log')).toHaveText('child click, slot click');
});

test("asChild keeps the child's handlers on a tab trigger", async ({
  page,
}) => {
  await page.getByRole('tab', { name: 'B' }).click();
  await expect(page.getByTestId('log')).toHaveText('tab child click');
  await expect(page.getByRole('tab', { name: 'B' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});

test("asChild keeps the child's handlers on a tooltip trigger", async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Hover me' }).hover();
  await expect(page.getByTestId('log')).toContainText('trigger child enter');
  await expect(page.getByText('Tip')).toBeVisible();
});

test('an empty child renders nothing instead of crashing', async ({ page }) => {
  await expect(page.getByText('Shown')).toHaveCount(0);
  await page.getByRole('button', { name: 'Toggle' }).click();
  await expect(page.getByText('Shown')).toBeVisible();
  await page.getByRole('button', { name: 'Toggle' }).click();
  await expect(page.getByText('Shown')).toHaveCount(0);
});
