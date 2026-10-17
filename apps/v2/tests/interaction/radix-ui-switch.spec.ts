import { expect, test } from '../test';

import {
  describeSwitchDemo,
  expectContinuous,
  readSamples,
  startSampling,
} from './controls-helpers';

describeSwitchDemo('radix-ui');

test.describe('radix-ui switch API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-switch', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled, changed from both sides', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'Controlled', exact: true });
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await sw.click({ force: true });
    await expect(page.getByTestId('controlled-value')).toHaveText('true');
    await expect(sw).toBeChecked();
    await sw.click({ force: true });
    await expect(page.getByTestId('controlled-value')).toHaveText('false');
    await page.getByRole('button', { name: 'Turn on', exact: true }).click();
    await expect(sw).toBeChecked();
  });

  test('the import * style, uncontrolled', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'Star', exact: true });
    await expect(sw).toBeChecked();
    await expect(page.getByTestId('star-thumb')).toHaveAttribute(
      'data-state',
      'checked',
    );
    await sw.click();
    await expect(sw).not.toBeChecked();
    await expect(page.getByTestId('star-thumb')).toHaveAttribute(
      'data-state',
      'unchecked',
    );
  });

  test('disabled, inside a form', async ({ page }) => {
    const sw = page.getByRole('switch', { name: 'In a form', exact: true });
    await expect(sw).toBeDisabled();
    await sw.click({ force: true });
    await expect(sw).not.toBeChecked();
  });

  test('a leftover transition-transform class does not break the glide', async ({
    page,
  }) => {
    const root = '[aria-label="Leftover transition"]';
    await startSampling(page, root, 0, '[data-state]', 50);
    await page.locator(root).click();
    await page.waitForTimeout(800);
    const samples = await readSamples(page);
    const start = samples[0]!.x;
    const end = samples[samples.length - 1]!.x;
    expect(end).toBeGreaterThan(start + 8);
    expectContinuous(samples);
    const first = samples.find((s) => s.state === 'true')!;
    expect(first.x - start).toBeLessThan((end - start) / 3);
  });
});
