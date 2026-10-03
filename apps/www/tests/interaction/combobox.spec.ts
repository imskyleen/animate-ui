import { expect, test, type Page } from '@playwright/test';
import { probeFirstFrame, sample } from './motion-probe';

// Combobox (Base UI + Headless UI): the list is an anchored overlay (Overlay
// recipe), while filtering and keyboard highlight stay instant.

type Case = {
  name: string;
  demo: string;
  slot: string;
  /** Accessible name of the input in the demo. */
  label: string;
  /** Selector of an option inside the list. */
  option: string;
  /** Attribute set on the highlighted option. */
  highlight: string;
  /** A query that matches several options. */
  query: string;
};

const CASES: Case[] = [
  {
    name: 'base primitive',
    demo: 'demo-primitives-base-combobox',
    slot: 'combobox-popup',
    label: 'Fruit',
    option: '[role="option"]',
    highlight: 'data-highlighted',
    query: 'e',
  },
  {
    name: 'base component',
    demo: 'demo-components-base-combobox',
    slot: 'combobox-popup',
    label: 'Framework',
    option: '[role="option"]',
    highlight: 'data-highlighted',
    query: 'e',
  },
  {
    name: 'headless primitive',
    demo: 'demo-primitives-headless-combobox',
    slot: 'combobox-options',
    label: 'Fruit',
    option: '[role="option"]',
    highlight: 'data-focus',
    query: 'e',
  },
  {
    name: 'headless component',
    demo: 'demo-components-headless-combobox',
    slot: 'combobox-options',
    label: 'Framework',
    option: '[role="option"]',
    highlight: 'data-focus',
    query: 'e',
  },
];

const ENTER_BUDGET = 650;
const EXIT_BUDGET = 450;

/** Running Web Animations on the element and its subtree. */
const runningAnimations = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate(
      (el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => a.playState === 'running').length,
    );

for (const c of CASES) {
  const LIST = `[data-slot="${c.slot}"]`;
  const input = (page: Page) => page.getByRole('combobox', { name: c.label });
  const open = async (page: Page) => {
    await input(page).click();
    await input(page).pressSequentially(c.query);
  };
  const openAndSettle = async (page: Page) => {
    await open(page);
    await page.locator(LIST).first().waitFor();
    await page.waitForTimeout(ENTER_BUDGET + 50);
  };

  test.describe(`combobox: ${c.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/smoke/${c.demo}`, {
        waitUntil: 'networkidle',
      });
    });

    test('enters from 0.9–0.97 with opacity', async ({ page }) => {
      const probe = await probeFirstFrame(page, LIST);
      await open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeGreaterThanOrEqual(0.9);
      expect(first.scale).toBeLessThan(1);
      expect(first.opacity).toBeLessThan(1);
    });

    test('grows from the input, not the center', async ({ page }) => {
      await open(page);
      await page.locator(LIST).first().waitFor();
      expect((await sample(page, LIST)).origin).not.toBe('50% 50%');
    });

    test('settles within the budget', async ({ page }) => {
      await openAndSettle(page);
      const settled = await sample(page, LIST);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 2);
    });

    test('reduced motion keeps the fade, drops the scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, LIST);
      await open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });

    test('exit animates faster, then unmounts', async ({ page }) => {
      await openAndSettle(page);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(40);
      expect(await page.locator(LIST).count()).toBeGreaterThan(0);
      const mid = await sample(page, LIST);
      expect(mid.opacity).toBeLessThan(1);
      await expect(page.locator(LIST).first()).toBeHidden({
        timeout: EXIT_BUDGET + 350,
      });
    });

    test('filtering is instant: no item or height animation', async ({
      page,
    }) => {
      await openAndSettle(page);
      const before = await page.locator(`${LIST} ${c.option}`).count();
      await input(page).pressSequentially('zzz');
      // Empty state shows on the next frame, nothing animates.
      await expect(page.locator(LIST).getByText('No results.')).toBeVisible({
        timeout: 100,
      });
      expect(await page.locator(`${LIST} ${c.option}`).count()).toBe(0);
      expect(await runningAnimations(page, LIST)).toBe(0);

      for (let i = 0; i < 3; i++) await input(page).press('Backspace');
      await expect(page.locator(`${LIST} ${c.option}`)).toHaveCount(before, {
        timeout: 100,
      });
      expect(await runningAnimations(page, LIST)).toBe(0);
      expect((await sample(page, `${LIST} ${c.option}`)).opacity).toBe(1);
    });

    test('keyboard highlight is instant', async ({ page }) => {
      await openAndSettle(page);
      await input(page).press('ArrowDown');
      await input(page).press('ArrowDown');
      const highlighted = page.locator(`${LIST} ${c.option}[${c.highlight}]`);
      await expect(highlighted).toHaveCount(1, { timeout: 100 });
      expect(await runningAnimations(page, LIST)).toBe(0);
    });

    test('selecting an item fills the input once closed', async ({ page }) => {
      await openAndSettle(page);
      const option = page.locator(`${LIST} ${c.option}`).first();
      const label = (await option.innerText()).replace('✓', '').trim();
      await option.click();
      await expect(page.locator(LIST).first()).toBeHidden({
        timeout: EXIT_BUDGET + 350,
      });
      await expect(input(page)).toHaveValue(label);
    });
  });
}

// The query is reset when the list closes: during the exit, the list must
// keep showing the filtered options instead of flashing the full list.
for (const c of CASES) {
  test(`combobox: ${c.name} keeps the filtered list while exiting`, async ({
    page,
  }) => {
    const LIST = `[data-slot="${c.slot}"]`;
    await page.goto(`/examples/smoke/${c.demo}`, { waitUntil: 'networkidle' });
    const input = page.getByRole('combobox', { name: c.label });
    await input.click();
    await input.pressSequentially('r');
    await page.locator(LIST).first().waitFor();
    await page.waitForTimeout(ENTER_BUDGET + 50);
    const filtered = await page.locator(`${LIST} [role="option"]`).count();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(60);
    expect(await page.locator(`${LIST} [role="option"]`).count()).toBe(
      filtered,
    );
  });
}
