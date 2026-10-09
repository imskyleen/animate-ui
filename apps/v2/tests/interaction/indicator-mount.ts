import { expect, test } from '@playwright/test';

import { expectAtRest, expectDrawnIn, recordCheck } from './item-checks';

// A check or a radio dot animates when it's checked or unchecked, not when
// it shows up already checked: the page loading, a dialog, a popover or a
// menu opening. Shared by the checkbox and radio group specs, on their
// fixture's "Show checked" section: a control mounted checked, after the
// page has loaded, the way a dialog's would.

export function describeCheckedOnMount(
  title: string,
  path: string,
  kind: 'checkbox' | 'radio',
) {
  test.describe(title, () => {
    test.describe.configure({ timeout: 180_000 });
    test('checked as it mounts, it shows at rest; checking it animates', async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      const target = {
        items: '[data-testid="mounted"]',
        label: '',
        indicator: '[data-testid="mounted-indicator"]',
      };
      const frames = recordCheck(page, target, 600);
      await page.getByRole('button', { name: 'Show checked' }).click();
      expectAtRest(await frames);

      if (kind === 'checkbox') {
        const box = page.getByRole('checkbox', { name: 'Mounted checked' });
        await box.click();
        await page.waitForTimeout(700);
        const drawn = recordCheck(page, target, 900);
        await box.click();
        expectDrawnIn(await drawn);
      } else {
        await page.getByRole('radio', { name: 'Mounted b' }).click();
        await page.waitForTimeout(700);
        const popped = recordCheck(page, target, 900);
        await page.getByRole('radio', { name: 'Mounted a' }).click();
        const shown = (await popped).filter((f) => f.present);
        // It pops in from nothing, then rests.
        expect(shown.some((f) => f.scale < 0.9 || f.opacity < 0.9)).toBe(true);
        expect(shown.at(-1)!.opacity).toBeGreaterThan(0.98);
      }
    });
  });
}
