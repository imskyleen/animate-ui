import { expect, test } from '../test';

for (const lib of ['radix-ui', 'base-ui', 'react-aria'])
  test(`${lib} questionnaire demo: a saved plan shows Animate UI's toast`, async ({
    page,
  }) => {
    await page.goto(`/tests/demos/${lib}/questionnaire`, {
      waitUntil: 'networkidle',
    });
    const form = page.locator('form');
    for (let step = 0; step < 3; step++) {
      await form
        .getByRole('radio')
        .or(form.getByRole('checkbox'))
        .filter({ visible: true })
        .first()
        .click({ force: true });
      const save = page
        .getByRole('button', { name: 'Save plan' })
        .filter({ visible: true });
      if (await save.count()) {
        await save.first().click();
        break;
      }
      await page
        .getByRole('button', { name: 'Next' })
        .filter({ visible: true })
        .first()
        .click();
      await page.waitForTimeout(700);
    }
    const toast = page.locator('[data-slot="toast"]');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Agent plan saved');
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  });
