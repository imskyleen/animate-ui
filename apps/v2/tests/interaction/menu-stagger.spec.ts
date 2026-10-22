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
    const runs = new Set<Animation>();
    (window as unknown as { __staggers: typeof seen; __runs: typeof runs }).__staggers = seen;
    (window as unknown as { __runs: typeof runs }).__runs = runs;
    const tick = () => {
      for (const animation of document.getAnimations()) {
        if (animation.id === 'animate-ui-stagger') runs.add(animation);
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
      // Bug: Base UI's select restarted its opening while still transparent, staggering every row twice.
      expect(await page.evaluate(() => (window as unknown as { __runs: Set<Animation> }).__runs.size)).toBe(delays.length);
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

  // Bug: the submenu's panel faded in out of a blur as it unfolded, hiding its sub-items' stagger.
  for (const demo of SIDEBARS) {
    test(`${demo}: a reopened submenu's panel is there at once, its sub-items come in`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      const playground = page.locator('[data-slot="sidebar"] button', { hasText: 'Playground' }).first();
      await playground.click();
      await page.waitForTimeout(800);
      const frames = page.evaluate(async () => {
        const out: { panel: number; last: number }[] = [];
        const start = performance.now();
        while (performance.now() - start < 500) {
          await new Promise((r) => requestAnimationFrame(r));
          const sub = document.querySelector('[data-slot="sidebar-menu-sub"]');
          const panel = sub?.parentElement;
          const last = sub && [...sub.querySelectorAll('[data-slot="sidebar-menu-sub-item"]')].at(-1);
          if (!panel || !last) continue;
          out.push({ panel: Number(getComputedStyle(panel).opacity), last: Number(getComputedStyle(last).opacity) });
        }
        return out;
      });
      await playground.click();
      const all = await frames;
      const lateRows = all.filter((f) => f.last > 0.05 && f.last < 0.5);
      expect(lateRows.length).toBeGreaterThan(0);
      for (const f of lateRows) expect(f.panel).toBeGreaterThan(0.85);
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
    { demo: '/tests/demos/base-ui/select', trigger: '[data-slot="select-trigger"]', pick: 'Banana' },
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

  // Bug: disabled rows came in at full opacity, then dropped to their own.
  for (const demo of ['/tests/demos/radix-ui/dropdown-menu', '/tests/demos/react-aria/dropdown-menu', '/tests/vue-demos/reka-ui/dropdown-menu']) {
    test(`${demo}: a disabled row comes in at its own opacity`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      const peak = page.evaluate(async () => {
        let most = 0;
        let rest = 1;
        const start = performance.now();
        while (performance.now() - start < 900) {
          await new Promise((r) => requestAnimationFrame(r));
          const row = [...document.querySelectorAll('[role^="menuitem"]')].find((el) =>
            el.matches('[aria-disabled="true"], [data-disabled]'),
          );
          if (!row) continue;
          const opacity = Number(getComputedStyle(row).opacity);
          most = Math.max(most, opacity);
          rest = opacity;
        }
        return { most, rest };
      });
      await page.locator('[data-slot="dropdown-menu-trigger"], button[aria-haspopup]').first().click();
      const { most, rest } = await peak;
      expect(rest).toBeLessThan(0.9);
      expect(most).toBeLessThanOrEqual(rest + 0.02);
    });
  }

  // Bug: the box faded in slowly with its rows, a pale empty box first; the rows bring the fade.
  for (const { demo, box, trigger } of [
    { demo: '/tests/demos/base-ui/combobox', box: '[data-slot="combobox-content"]', trigger: '[data-slot="input-group-button"]' },
    { demo: '/tests/demos/radix-ui/dropdown-menu', box: '[data-slot="dropdown-menu-content"]', trigger: 'button[aria-haspopup]' },
    { demo: '/tests/vue-demos/reka-ui/dropdown-menu', box: '[data-slot="dropdown-menu-content"]', trigger: 'button[aria-haspopup]' },
  ]) {
    test(`${demo}: the box is there at once, its rows come in`, async ({ page }) => {
      await page.goto(demo, { waitUntil: 'networkidle' });
      await page.locator(trigger).first().click();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
      const frames = page.evaluate(async (box) => {
        const out: { t: number; box: number; row: number }[] = [];
        const start = performance.now();
        let seen: number | null = null;
        while (performance.now() - start < 1200) {
          await new Promise((r) => requestAnimationFrame(r));
          const el = document.querySelector(box);
          if (!el) continue;
          const opacity = Number(getComputedStyle(el).opacity);
          if (seen === null && opacity > 0) seen = performance.now();
          if (seen === null) continue;
          const last = [...el.querySelectorAll('[role^="menuitem"], [role="option"]')].at(-1);
          out.push({ t: performance.now() - seen, box: opacity, row: last ? Number(getComputedStyle(last).opacity) : 0 });
          if (performance.now() - seen > 200) break;
        }
        return out;
      }, box);
      await page.locator(trigger).first().click();
      const early = (await frames).filter((f) => f.t > 60 && f.t < 140);
      expect(early.length).toBeGreaterThan(0);
      for (const f of early) {
        expect(f.box).toBeGreaterThan(0.85);
        expect(f.row).toBeLessThan(0.5);
      }
    });
  }

  // Bug: with a selection, Base UI scrolled the list sideways toward the slid rows, which bounced left then back.
  test('base-ui combobox with a selection: rows land without going past their place', async ({ page }) => {
    await page.goto('/tests/demos/base-ui/combobox', { waitUntil: 'networkidle' });
    const chevron = page.locator('[data-slot="input-group-button"]').first();
    await chevron.click();
    await page.getByRole('option', { name: 'SvelteKit', exact: true }).click();
    await page.waitForTimeout(1000);
    const frames = page.evaluate(async () => {
      const out: number[][] = [];
      const start = performance.now();
      while (performance.now() - start < 700) {
        await new Promise((r) => requestAnimationFrame(r));
        const box = document.querySelector('[data-slot="combobox-content"]');
        const rows = [...document.querySelectorAll('[role="option"]')];
        if (!box || !rows.length) continue;
        const left = box.getBoundingClientRect().left;
        out.push(rows.map((row) => row.getBoundingClientRect().left - left));
      }
      return out;
    });
    await chevron.click();
    const all = await frames;
    const rest = all.at(-1)!;
    for (const frame of all)
      frame.forEach((left, i) => expect(left).toBeGreaterThan(rest[i]! - 0.5));
  });

  test('base-ui select with a selection: each row staggers once', async ({ page }) => {
    await page.goto('/tests/demos/base-ui/select', { waitUntil: 'networkidle' });
    const trigger = page.locator('[data-slot="select-trigger"]').first();
    await trigger.click();
    await page.getByRole('option', { name: 'Banana', exact: true }).click();
    await page.waitForTimeout(1000);
    await recordStaggers(page);
    await trigger.click();
    await page.waitForTimeout(700);
    const rows = (await staggers(page)).length;
    expect(rows).toBeGreaterThan(3);
    expect(await page.evaluate(() => (window as unknown as { __runs: Set<Animation> }).__runs.size)).toBe(rows);
  });

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
