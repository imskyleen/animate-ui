import { expect, test, type Page } from '@playwright/test';
import { probeFirstFrame, sample } from './motion-probe';

// The Overlay recipe's grading grid, applied to every anchored overlay demo
// of the registry (same checks as tests/eval for agent-generated components).

type Case = {
  /** Fades without scaling by design (e.g. Base UI align-with-trigger). */
  fadeOnly?: boolean;
  demo: string;
  slot: string;
  open: (page: Page) => Promise<void>;
  close: (page: Page) => Promise<void>;
};

const escape = (page: Page) => page.keyboard.press('Escape');
const leave = (page: Page) => page.mouse.move(5, 5, { steps: 8 });
const click = (name: string) => (page: Page) =>
  page.getByRole('button', { name, exact: true }).click();
const hoverLink = (page: Page) => page.getByRole('link').first().hover();
const openSelect = (page: Page) =>
  page.getByRole('combobox', { name: 'Fruit' }).click();
const rightClick = (page: Page) =>
  page.getByText('Right click here').click({ button: 'right' });

const CASES: Case[] = [
  {
    demo: 'radix-popover',
    slot: 'popover-content',
    open: click('Open popover'),
    close: escape,
  },
  {
    demo: 'base-popover',
    slot: 'popover-popup',
    open: click('Open popover'),
    close: escape,
  },
  {
    demo: 'headless-popover',
    slot: 'popover-panel',
    open: click('Open popover'),
    close: escape,
  },
  {
    demo: 'radix-dropdown-menu',
    slot: 'dropdown-menu-content',
    open: click('Open'),
    close: escape,
  },
  { demo: 'base-menu', slot: 'menu-popup', open: click('Open'), close: escape },
  {
    demo: 'radix-hover-card',
    slot: 'hover-card-content',
    open: hoverLink,
    close: leave,
  },
  {
    demo: 'base-preview-card',
    slot: 'preview-card-popup',
    open: hoverLink,
    close: leave,
  },
  {
    demo: 'radix-select',
    slot: 'select-content',
    open: openSelect,
    close: escape,
  },
  {
    demo: 'base-select',
    slot: 'select-popup',
    open: openSelect,
    close: escape,
    fadeOnly: true,
  },
  {
    demo: 'radix-context-menu',
    slot: 'context-menu-content',
    open: rightClick,
    close: escape,
  },
  {
    demo: 'base-context-menu',
    slot: 'context-menu-popup',
    open: rightClick,
    close: escape,
  },
];

const BUDGET = 250;

for (const c of CASES) {
  const CONTENT = `[data-slot="${c.slot}"]`;

  test.describe(`overlay: ${c.demo}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/smoke/demo-components-${c.demo}`, {
        waitUntil: 'networkidle',
      });
    });

    test('enters from 0.9–0.97 with opacity', async ({ page }) => {
      const probe = await probeFirstFrame(page, CONTENT);
      await c.open(page);
      const first = await probe.firstFrame();
      if (c.fadeOnly) {
        expect(first.scale).toBeCloseTo(1, 3);
      } else {
        expect(first.scale).toBeGreaterThanOrEqual(0.9);
        expect(first.scale).toBeLessThan(1);
      }
      expect(first.opacity).toBeLessThan(1);
    });

    test('grows from the trigger, not the center', async ({ page }) => {
      test.skip(!!c.fadeOnly, 'fade-only overlays have no origin');
      await c.open(page);
      await page.locator(CONTENT).first().waitFor();
      expect((await sample(page, CONTENT)).origin).not.toBe('50% 50%');
    });

    test('settles within the budget', async ({ page }) => {
      await c.open(page);
      await page.locator(CONTENT).first().waitFor();
      await page.waitForTimeout(BUDGET + 30);
      const settled = await sample(page, CONTENT);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 2);
    });

    test('reduced motion keeps the fade, drops the scale', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, CONTENT);
      await c.open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });

    test('exit animates, then unmounts', async ({ page }) => {
      await c.open(page);
      await page.locator(CONTENT).first().waitFor();
      await page.waitForTimeout(300);
      await c.close(page);
      await page.waitForTimeout(40);
      expect(await page.locator(CONTENT).count()).toBeGreaterThan(0);
      // Unmounted, or (Base UI Select) kept mounted but hidden.
      await expect(page.locator(CONTENT).first()).toBeHidden({ timeout: 500 });
    });
  });
}

// A presence-gated Select must keep working once closed: Radix renders its
// items off-screen to show the selected label and feed the native <select>.
for (const lib of ['radix', 'base'] as const) {
  test(`select: ${lib} keeps the chosen label after closing`, async ({
    page,
  }) => {
    await page.goto(`/examples/smoke/demo-components-${lib}-select`, {
      waitUntil: 'networkidle',
    });
    const trigger = page.getByRole('combobox', { name: 'Fruit' });
    await trigger.click();
    await page.getByRole('option', { name: 'Banana' }).click();
    await page.waitForTimeout(400);
    await expect(trigger).toContainText('Banana');
  });
}
