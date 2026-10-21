import { expect, test } from '../test';

import {
  INDICATOR,
  PANEL,
  describeTabsDemo,
  describeTabsFrames,
  describeTabsHeights,
  describeTabsMounted,
  gotoTabs,
} from './tabs-helpers';

describeTabsDemo('vue-reka-ui', { selectKeys: ['ArrowRight'] });
describeTabsHeights('vue-reka-ui');
describeTabsFrames('vue-reka-ui');
describeTabsMounted('vue-reka-ui');

test.describe('vue-reka-ui tabs, the panel leaving', () => {
  test('keeps its content: reka-ui never mounts it again as it fades out', async ({
    page,
  }) => {
    await gotoTabs(page, '/tests/vue-demos/reka-ui/tabs');
    await page.evaluate(() => {
      const w = window as unknown as { __mutations: string[] };
      w.__mutations = [];
      const panel = document.querySelector('[role="tabpanel"]:not([hidden])')!;
      // reka-ui keeps a hidden panel's element and drops its content once
      // it's hidden: only what happens while it fades out counts.
      new MutationObserver((records) => {
        if ((panel as HTMLElement).hidden) return;
        for (const record of records)
          if (record.addedNodes.length || record.removedNodes.length)
            w.__mutations.push(record.target.nodeName);
      }).observe(panel, { childList: true, subtree: true });
    });
    const card = page.locator('[data-slot="card"]').first();
    await card.evaluate((el) => {
      (window as unknown as { __card: Element }).__card = el;
    });
    await page.getByRole('tab', { name: 'Analytics' }).click();
    expect(
      await card.evaluate(
        (el) => el === (window as unknown as { __card: Element }).__card,
      ),
    ).toBe(true);
    await expect(
      page.getByRole('tabpanel').filter({ hasText: 'Analytics' }),
    ).toBeVisible();
    const mutations = await page.evaluate(
      () => (window as unknown as { __mutations: string[] }).__mutations,
    );
    expect(mutations.length).toBeLessThanOrEqual(1);
  });
});

test.describe('vue-reka-ui tabs API', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTabs(page, '/tests/vue-demos/fixtures/reka-ui-tabs');
  });

  test('v-model, changed from both sides', async ({ page }) => {
    const section = page.getByTestId('controlled');
    await section.getByRole('tab', { name: 'Controlled b' }).click();
    await expect(page.getByTestId('controlled-value')).toHaveText('b');
    await expect(section.getByText('Controlled panel b')).toBeVisible();
    await expect(section.getByText('Controlled panel a')).toHaveCount(0);
    await page.getByRole('button', { name: 'Select a' }).click();
    await expect(
      section.getByRole('tab', { name: 'Controlled a' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(section.getByText('Controlled panel a')).toBeVisible();
  });

  test('uncontrolled', async ({ page }) => {
    const section = page.getByTestId('star');
    await expect(section.getByText('Star panel y')).toBeVisible();
    await section.getByRole('tab', { name: 'Star x' }).click();
    await expect(section.getByText('Star panel x')).toBeVisible();
    await expect(section.locator(INDICATOR)).toHaveCount(1);
  });

  test('forceMount keeps inactive panels mounted and hidden', async ({
    page,
  }) => {
    const section = page.getByTestId('force-mount');
    const panels = section.locator(PANEL);
    await expect(panels).toHaveCount(2);
    await expect(section.getByText('Forced panel 2')).toBeHidden();
    await section.getByRole('tab', { name: 'Forced 2' }).click();
    await expect(section.getByText('Forced panel 2')).toBeVisible();
    await expect(section.getByText('Forced panel 1')).toBeHidden();
    await expect(panels).toHaveCount(2);
    await page.waitForTimeout(650);
    expect(
      await section
        .getByTestId('forced-2')
        .evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBe(1);
  });

  test('manual activation: arrows move focus only', async ({ page }) => {
    const section = page.getByTestId('manual');
    await section.getByRole('tab', { name: 'Manual 1' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(section.getByRole('tab', { name: 'Manual 2' })).toBeFocused();
    await expect(
      section.getByRole('tab', { name: 'Manual 1' }),
    ).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Enter');
    await expect(
      section.getByRole('tab', { name: 'Manual 2' }),
    ).toHaveAttribute('aria-selected', 'true');
  });
});
