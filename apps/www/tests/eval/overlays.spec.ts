import { expect, test, type Page } from '@playwright/test';
import { probeFirstFrame, sample } from '../interaction/motion-probe';

// Grades agent-generated components against the animate-ui skill's rules.
type Case = {
  name: string;
  slot: string;
  budget: number;
  open: (page: Page) => Promise<void>;
  close: (page: Page) => Promise<void>;
};

const escape = async (page: Page) => page.keyboard.press('Escape');

const CASES: Case[] = [
  {
    name: 'popover',
    slot: 'popover-content',
    budget: 250,
    open: (page) => page.getByRole('button', { name: 'Open popover' }).click(),
    close: escape,
  },
  {
    name: 'dropdown-menu',
    slot: 'dropdown-menu-content',
    budget: 250,
    open: (page) => page.getByRole('button', { name: 'Open menu' }).click(),
    close: escape,
  },
  {
    name: 'hover-card',
    slot: 'hover-card-content',
    budget: 250,
    open: (page) => page.getByText('Hover me').hover(),
    close: (page) => page.mouse.move(5, 5, { steps: 8 }),
  },
  {
    name: 'select',
    slot: 'select-content',
    budget: 250,
    open: (page) => page.getByRole('combobox', { name: 'Fruit' }).click(),
    close: escape,
  },
];

const only = process.env.EVAL_CASES?.split(',');

for (const c of CASES.filter((c) => !only || only.includes(c.name))) {
  const CONTENT = `[data-slot="${c.slot}"]`;

  test.describe(`eval: ${c.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/examples/eval/${c.name}`, { waitUntil: 'networkidle' });
    });

    test('rule 4: enters from 0.9–0.97 with opacity, never from 0', async ({
      page,
    }) => {
      const probe = await probeFirstFrame(page, CONTENT);
      await c.open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeGreaterThanOrEqual(0.9);
      expect(first.scale).toBeLessThan(1);
      expect(first.opacity).toBeLessThan(1);
    });

    test('rule 5: grows from the trigger, not the center', async ({ page }) => {
      await c.open(page);
      await page.locator(CONTENT).waitFor();
      const { origin } = await sample(page, CONTENT);
      expect(origin).not.toBe('50% 50%');
      const box = await page.locator(CONTENT).boundingBox();
      const [, oy] = origin.split(' ').map(parseFloat);
      // Content opens below the trigger: the origin sits on its top edge.
      expect(oy).toBeLessThan((box?.height ?? 100) / 2);
    });

    test('rule 9: settles within the duration budget', async ({ page }) => {
      await c.open(page);
      await page.waitForTimeout(c.budget + 30);
      const settled = await sample(page, CONTENT);
      expect(settled.opacity).toBe(1);
      expect(settled.scale).toBeCloseTo(1, 2);
    });

    test('rule 1: reduced motion keeps the fade, drops the scale', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const probe = await probeFirstFrame(page, CONTENT);
      await c.open(page);
      const first = await probe.firstFrame();
      expect(first.scale).toBeCloseTo(1, 3);
      expect(first.opacity).toBeLessThan(1);
    });

    test('exit animates, then unmounts', async ({ page }) => {
      await c.open(page);
      await page.waitForTimeout(300);
      await c.close(page);
      await page.waitForTimeout(40);
      const leaving = await page.locator(CONTENT).count();
      expect(leaving).toBe(1);
      await expect(page.locator(CONTENT)).toHaveCount(0, { timeout: 400 });
    });
  });
}
