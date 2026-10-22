import { expect, test } from '../test';

for (const [lib, url] of [
  ...['radix-ui', 'base-ui', 'react-aria'].map(
    (lib) => [lib, `/tests/demos/${lib}/questionnaire`] as const,
  ),
  ['vue reka-ui', '/tests/vue-demos/reka-ui/questionnaire'] as const,
])
  test(`${lib} questionnaire demo: a saved plan shows Animate UI's toast`, async ({
    page,
  }) => {
    await page.goto(url, {
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
