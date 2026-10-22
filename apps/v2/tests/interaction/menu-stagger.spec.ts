import { expect, test, type Page } from '../test';

type Open = 'click' | 'context' | 'hover' | 'input';

const MENUS: { demo: string; trigger: string; open: Open }[] = [];
for (const lib of ['radix-ui', 'base-ui', 'react-aria']) {
  MENUS.push(
    { demo: `/tests/demos/${lib}/dropdown-menu`, trigger: '[data-slot="dropdown-menu-trigger"], button[aria-haspopup]', open: 'click' },
    { demo: `/tests/demos/${lib}/context-menu`, trigger: '[data-slot="context-menu-trigger"], div[role="button"]', open: 'context' },
    { demo: `/tests/demos/${lib}/select`, trigger: '[role="combobox"], button[aria-haspopup]', open: 'click' },
  );
  if (lib !== 'react-aria')
    MENUS.push(
      { demo: `/tests/demos/${lib}/menubar`, trigger: '[data-slot="menubar-trigger"]', open: 'click' },
      { demo: `/tests/demos/${lib}/navigation-menu`, trigger: '[data-slot="navigation-menu-trigger"]', open: 'hover' },
    );
  if (lib !== 'radix-ui')
    MENUS.push({ demo: `/tests/demos/${lib}/combobox`, trigger: 'input', open: 'input' });
}
MENUS.push(
  { demo: '/tests/vue-demos/reka-ui/dropdown-menu', trigger: 'button[aria-haspopup]', open: 'click' },
  { demo: '/tests/vue-demos/reka-ui/context-menu', trigger: '[data-slot="context-menu-trigger"]', open: 'context' },
  { demo: '/tests/vue-demos/reka-ui/menubar', trigger: '[data-slot="menubar-trigger"]', open: 'click' },
  { demo: '/tests/vue-demos/reka-ui/select', trigger: '[role="combobox"], button[aria-haspopup]', open: 'click' },
  { demo: '/tests/vue-demos/reka-ui/combobox', trigger: '[data-slot="combobox"] button', open: 'click' },
  { demo: '/tests/vue-demos/reka-ui/navigation-menu', trigger: '[data-slot="navigation-menu-trigger"]', open: 'hover' },
);

const SIDEBARS = [
  '/tests/demos/radix-ui/sidebar',
  '/tests/demos/base-ui/sidebar',
  '/tests/demos/react-aria/sidebar',
  '/tests/vue-demos/reka-ui/sidebar',
];

/** Every row stagger started from now on: its text, delay and keyframes. */
const recordStaggers = (page: Page) =>
  page.evaluate(() => {
    const seen = new Map<Element, { text: string; delay: number; from: string }>();
    (window as unknown as { __staggers: typeof seen }).__staggers = seen;
    const tick = () => {
      for (const animation of document.getAnimations()) {
        const effect = animation.effect as KeyframeEffect | null;
        const target = effect?.target;
        if (!target || seen.has(target)) continue;
        const [first] = effect.getKeyframes();
        if (first?.filter !== 'blur(4px)' || Number(first.opacity) !== 0 || !String(first.translate).startsWith('8px')) continue;
        if (!target.closest('[role="menu"], [role="listbox"], [data-slot$="-content"], [data-slot="navigation-menu-viewport"], [data-slot="sidebar"], [data-slot="combobox-list"]'))
          continue;
        seen.set(target, {
          text: target.textContent?.trim().slice(0, 20) ?? '',
          delay: Number(effect.getTiming().delay),
          from: `${first.opacity} ${first.filter} ${first.translate}`,
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const staggers = (page: Page) =>
  page.evaluate(() => [
    ...(window as unknown as { __staggers: Map<Element, { text: string; delay: number }> }).__staggers.values(),
  ]);

async function openMenu(page: Page, trigger: string, open: Open) {
  const target = page.locator(trigger).first();
  if (open === 'context') await target.click({ button: 'right' });
  else if (open === 'hover') await target.hover();
  else if (open === 'input') {
    await target.click();
    await page.keyboard.press('ArrowDown');
  } else await target.click();
}

test.describe('menus stagger their rows as they open', () => {
  test.describe.configure({ timeout: 60_000 });

  for (const { demo, trigger, open } of MENUS) {
    test(`${demo}: rows slide in from the right one after another, out of a 4px blur`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await recordStaggers(page);
      await openMenu(page, trigger, open);
      await expect.poll(async () => (await staggers(page)).length, { timeout: 3000 }).toBeGreaterThan(2);
      await page.waitForTimeout(600);
      const delays = (await staggers(page)).map((s) => s.delay);
      // Bug: rows past the 10th all came in together; past 10, they're closer instead.
      const step = delays.length > 10 ? 33 * Math.sqrt(10 / delays.length) : 33;
      delays.forEach((delay, index) => expect(delay).toBeCloseTo(index * step, 0));
    });
  }

  for (const demo of SIDEBARS) {
    test(`${demo}: a submenu's sub-items stagger as it unfolds`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);
      await recordStaggers(page);
      await page
        .locator('[data-slot="sidebar"] [aria-expanded="false"]:not([data-slot*="dropdown"]):not([aria-haspopup="true"])')
        .first()
        .click();
      await expect.poll(async () => (await staggers(page)).length, { timeout: 3000 }).toBeGreaterThan(1);
      await page.waitForTimeout(300);
      expect((await staggers(page)).map((s) => s.delay).slice(0, 3)).toEqual([0, 33, 66]);
    });
  }

  test('an accordion panel does not stagger', async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/accordion', { waitUntil: 'networkidle' });
    await recordStaggers(page);
    await page.locator('[data-slot="accordion-trigger"][aria-expanded="false"]').first().click();
    await page.waitForTimeout(600);
    expect(await staggers(page)).toEqual([]);
  });

  for (const lib of ['radix-ui', 'base-ui']) {
    test(`${lib} menubar: moving to the next menu does not stagger again`, async ({ page }) => {
      await page.goto(`/tests/demos/${lib}/menubar`, { waitUntil: 'networkidle' });
      const triggers = page.locator('[data-slot="menubar-trigger"]');
      await triggers.nth(0).click();
      await page.waitForTimeout(600);
      await recordStaggers(page);
      await triggers.nth(1).hover();
      await page.waitForTimeout(600);
      expect(await staggers(page)).toEqual([]);
    });

    test(`${lib} navigation menu: moving to the next item does not stagger again`, async ({ page }) => {
      await page.goto(`/tests/demos/${lib}/navigation-menu`, { waitUntil: 'networkidle' });
      const triggers = page.locator('[data-slot="navigation-menu-trigger"]');
      await triggers.nth(0).hover();
      await page.waitForTimeout(800);
      await recordStaggers(page);
      await triggers.nth(1).hover({ force: true });
      await page.waitForTimeout(800);
      expect(await staggers(page)).toEqual([]);
    });
  }

  for (const demo of ['/tests/demos/radix-ui/dropdown-menu', '/tests/demos/base-ui/dropdown-menu']) {
    test(`${demo}: reopened while it closes, it does not stagger again`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      const trigger = page.locator('[data-slot="dropdown-menu-trigger"], button[aria-haspopup]').first();
      await trigger.click();
      await page.waitForTimeout(600);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(60);
      await recordStaggers(page);
      await trigger.click();
      await page.waitForTimeout(500);
      expect(await staggers(page)).toEqual([]);
    });
  }

  // Bug: the chosen item's highlight, a solid bar, showed at half opacity long before its blurred row.
  for (const { demo, trigger, pick } of [
    { demo: '/tests/demos/base-ui/combobox', trigger: '[data-slot="input-group-button"]', pick: 'SvelteKit' },
    { demo: '/tests/demos/radix-ui/select', trigger: '[role="combobox"]', pick: 'Banana' },
    { demo: '/tests/vue-demos/reka-ui/select', trigger: '[role="combobox"]', pick: 'Banana' },
  ]) {
    test(`${demo}: the chosen item's highlight waits for its row to land`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      const opener = page.locator(trigger).first();
      await opener.click();
      await page.getByRole('option', { name: pick, exact: true }).first().click();
      await page.waitForTimeout(1000);
      const measured = page.evaluate(
        () =>
          new Promise<{ highlight: number; row: number }>((resolve) => {
            const tick = () => {
              const surface = document.querySelector('[data-slot="item-highlight"]');
              const fade = surface?.getAnimations()[0];
              const row = surface?.parentElement?.getAnimations().find((a) => a.id === 'animate-ui-stagger');
              if (!fade || !row) return void requestAnimationFrame(tick);
              resolve({
                highlight: Number(fade.effect!.getTiming().delay),
                row: Number(row.effect!.getComputedTiming().endTime),
              });
            };
            requestAnimationFrame(tick);
          }),
      );
      await opener.click();
      const { highlight, row } = await measured;
      expect(highlight).toBeGreaterThan(row - 40);
    });
  }

  test('a combobox filtering as the user types does not stagger again', async ({ page }) => {
    await page.goto('/tests/demos/base-ui/combobox', { waitUntil: 'networkidle' });
    await openMenu(page, 'input', 'input');
    await page.waitForTimeout(600);
    await recordStaggers(page);
    await page.keyboard.type('n');
    await page.waitForTimeout(500);
    expect(await staggers(page)).toEqual([]);
  });

  test('closing shows every row: what was still waiting leaves with the list', async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/dropdown-menu', { waitUntil: 'networkidle' });
    await page.locator('button[aria-haspopup]').first().click();
    await page.waitForTimeout(40);
    await page.keyboard.press('Escape');
    const waiting = await page.evaluate(() =>
      document.getAnimations().filter((a) => {
        const [first] = (a.effect as KeyframeEffect).getKeyframes();
        return first?.filter === 'blur(4px)' && a.playState === 'running';
      }).length,
    );
    expect(waiting).toBe(0);
  });

  test('reduced motion: no stagger', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tests/demos/radix-ui/dropdown-menu', { waitUntil: 'networkidle' });
    await recordStaggers(page);
    await page.locator('button[aria-haspopup]').first().click();
    await page.waitForTimeout(600);
    expect(await staggers(page)).toEqual([]);
  });
});
