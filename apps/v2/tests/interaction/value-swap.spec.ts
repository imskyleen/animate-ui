import { expect, test, type Page } from '../test';

const GHOST = '[data-animate-ui-value-ghost]';

const CASES = [
  { name: 'radix-ui select', demo: '/tests/demos/radix-ui/select', input: false, picks: ['Apple', 'Banana'] },
  { name: 'base-ui select', demo: '/tests/demos/base-ui/select', input: false, picks: ['Apple', 'Banana'] },
  { name: 'react-aria select', demo: '/tests/demos/react-aria/select', input: false, picks: ['Apple', 'Banana'] },
  { name: 'vue reka-ui select', demo: '/tests/vue-demos/reka-ui/select', input: false, picks: ['Apple', 'Banana'] },
  { name: 'base-ui combobox', demo: '/tests/demos/base-ui/combobox', input: true, picks: ['Next.js', 'Remix'] },
  { name: 'react-aria combobox', demo: '/tests/demos/react-aria/combobox', input: true, picks: ['Next.js', 'Remix'] },
  { name: 'vue reka-ui combobox', demo: '/tests/vue-demos/reka-ui/combobox', input: false, picks: ['Next.js', 'Remix'] },
] as const;

for (const c of CASES) {
  const trigger = (page: Page) =>
    c.input
      ? page.locator('input').first()
      : page.locator('[role="combobox"], button[aria-haspopup]').first();

  async function open(page: Page) {
    await trigger(page).click();
    if (c.input) await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option').first()).toBeVisible();
    await page.waitForTimeout(400);
  }

  async function pick(page: Page, name: string) {
    await open(page);
    await page.getByRole('option', { name, exact: true }).first().click();
    await expect(page.getByRole('option')).toHaveCount(0);
    await page.waitForTimeout(300);
  }

  /** Every frame for 400ms: the ghost's opacity and text, and the trigger's width. */
  const record = (page: Page) =>
    trigger(page).evaluate(async (el, ghost) => {
      const frames: { opacity: number | null; text: string; width: number }[] = [];
      const start = performance.now();
      while (performance.now() - start < 400) {
        await new Promise((r) => requestAnimationFrame(r));
        const g = document.querySelector<HTMLElement>(ghost);
        frames.push({
          opacity: g ? Number(getComputedStyle(g).opacity) : null,
          text: g?.textContent?.trim() ?? '',
          width: el.getBoundingClientRect().width,
        });
      }
      return frames;
    }, GHOST);

  test.describe(`${c.name} value swap`, () => {
    test.describe.configure({ timeout: 90_000 });

    // The picked text used to change in one frame.
    test('the old text fades out where it was as the new one comes in', async ({ page }) => {
      await page.goto(c.demo, { waitUntil: 'networkidle' });
      await pick(page, c.picks[0]);
      await open(page);
      const frames = record(page);
      await page.getByRole('option', { name: c.picks[1], exact: true }).first().click();
      const seen = (await frames).filter((f) => f.opacity !== null);
      expect(seen.length).toBeGreaterThan(3);
      expect(seen.every((f) => f.text === c.picks[0])).toBe(true);
      const opacities = seen.map((f) => f.opacity!);
      expect(Math.min(...opacities)).toBeLessThan(0.2);
      for (let i = 1; i < opacities.length; i++)
        expect(opacities[i]).toBeLessThanOrEqual(opacities[i - 1]! + 0.01);
      expect((await frames).at(-1)!.opacity).toBeNull();
      const widths = (await frames).map((f) => f.width);
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.5);
      if (c.input) await expect(trigger(page)).toHaveValue(c.picks[1]);
      else await expect(trigger(page)).toContainText(c.picks[1]);
    });

    if (c.input)
      test('typing does not swap the text', async ({ page }) => {
        await page.goto(c.demo, { waitUntil: 'networkidle' });
        await pick(page, c.picks[0]);
        await trigger(page).click();
        await page.keyboard.press('ControlOrMeta+a');
        const frames = record(page);
        await page.keyboard.type('Nu', { delay: 60 });
        expect((await frames).every((f) => f.opacity === null)).toBe(true);
      });
  });
}
