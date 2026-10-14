import { expect, test } from '../test';

for (const name of ['popover', 'dropdown-menu', 'select'])
  test(`react-aria ${name}: reopened while it leaves, it takes the focus back and Escape closes it`, async ({
    page,
  }) => {
    await page.goto(`/tests/demos/react-aria/${name}`, {
      waitUntil: 'networkidle',
    });
    const trigger = page.locator('main button, main [role=combobox]').first();
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60);
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            !!document.activeElement?.closest(
              '[role=dialog],[role=menu],[role=listbox]',
            ),
        ),
      )
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
