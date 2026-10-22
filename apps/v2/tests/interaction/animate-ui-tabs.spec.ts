import { expect, test, type Page } from '../test';

import { gotoTabs } from './tabs-helpers';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = (page: Page) => gotoTabs(page, framework.demo('tabs'));

  const HIGHLIGHT = '[data-slot="motion-highlight"]';

  const highlightX = (page: Page, value: string) =>
    page
      .locator(`${HIGHLIGHT}[data-value="${value}"]`)
      .evaluate((el) => el.getBoundingClientRect().x);

  const stripX = (page: Page) =>
    page.locator('[data-slot="tabs-contents"] > div').evaluate((el) => {
      const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
      const tx = m ? Number(m[1]!.split(',')[4]) : 0;
      return (tx / el.getBoundingClientRect().width) * 100;
    });

  test.describe(`${framework.name} tabs`, () => {
    test('the first tab is selected; tabs are exposed as tabs', async ({
      page,
    }) => {
      await open(page);
      await expect(page.getByRole('tablist')).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(
        page.getByRole('tab', { name: 'Analytics' }),
      ).toHaveAttribute('aria-selected', 'false');
      await expect(
        page.getByRole('tabpanel').filter({ hasText: 'Track performance' }),
      ).toHaveAttribute('inert', '');
    });

    test('switching glides the highlight and slides the panel', async ({
      page,
    }) => {
      await open(page);
      const tab = page.getByRole('tab', { name: 'Analytics' });
      const end = (await tab.boundingBox())!.x;
      await tab.click();
      await page.waitForTimeout(60);
      const mid = await highlightX(page, 'analytics');
      expect(mid).toBeLessThan(end - 1);
      expect(await stripX(page)).toBeGreaterThan(-99);
      await expect
        .poll(async () => Math.abs((await highlightX(page, 'analytics')) - end))
        .toBeLessThan(1.5);
      await expect.poll(async () => Math.round(await stripX(page))).toBe(-100);
      await expect(tab).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByText('Page views')).toBeVisible();
    });

    test('the panels glide into place without bouncing past it', async ({
      page,
    }) => {
      await open(page);
      const frames = page.locator('[data-slot="tabs-contents"] > div').evaluate(
        (el) =>
          new Promise<{ x: number; width: number }[]>((resolve) => {
            const out: { x: number; width: number }[] = [];
            const start = performance.now();
            const tick = (now: number) => {
              const m =
                getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
              out.push({
                x: m ? Number(m[1]!.split(',')[4]) : 0,
                width: el.getBoundingClientRect().width,
              });
              if (now - start < 900) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          }),
      );
      await page.getByRole('tab', { name: 'Settings' }).click();
      const xs = await frames;
      const target = -3 * xs[0]!.width;
      expect(xs.at(-1)!.x).toBeCloseTo(target, 0);
      expect(Math.min(...xs.map((f) => f.x))).toBeGreaterThan(target - 0.25);
      expect(
        xs.filter((f) => f.x < -1 && f.x > target + 1).length,
      ).toBeGreaterThan(6);
    });

    test('the height follows the active panel', async ({ page }) => {
      await open(page);
      const contents = page.locator('[data-slot="tabs-contents"]');
      const before = (await contents.boundingBox())!.height;
      await page.getByRole('tab', { name: 'Analytics' }).click();
      await expect
        .poll(async () => (await contents.boundingBox())!.height)
        .not.toBe(before);
    });

    test('reduced motion: everything changes at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      const tab = page.getByRole('tab', { name: 'Analytics' });
      const end = (await tab.boundingBox())!.x;
      await tab.click();
      await page.waitForTimeout(60);
      expect(
        Math.abs((await highlightX(page, 'analytics')) - end),
      ).toBeLessThan(1.5);
      expect(Math.round(await stripX(page))).toBe(-100);
    });

    test('triggers and panels reference each other', async ({ page }) => {
      await open(page);
      for (const name of ['Overview', 'Analytics']) {
        const tab = page.getByRole('tab', { name });
        const panelId = await tab.getAttribute('aria-controls');
        const tabId = await tab.getAttribute('id');
        expect(panelId).toBeTruthy();
        const panel = page.locator(`[id="${panelId}"]`);
        await expect(panel).toHaveAttribute('role', 'tabpanel');
        await expect(panel).toHaveAttribute('aria-labelledby', tabId!);
      }
      await expect(page.getByRole('tablist')).toHaveAttribute(
        'aria-orientation',
        'horizontal',
      );
    });

    test('keyboard: the selection animates like a click', async ({ page }) => {
      await open(page);
      const overview = page.getByRole('tab', { name: 'Overview' });
      const analytics = page.getByRole('tab', { name: 'Analytics' });
      const overviewX = (await overview.boundingBox())!.x;
      const analyticsX = (await analytics.boundingBox())!.x;
      await overview.focus();
      const frames = page.evaluate(
        (selector) =>
          new Promise<{ x: number; strip: number }[]>((resolve) => {
            const out: { x: number; strip: number }[] = [];
            const start = performance.now();
            const tick = () => {
              const el = document.querySelector(
                `${selector}[data-value="analytics"]`,
              );
              const strip = document.querySelector<HTMLElement>(
                '[data-slot="tabs-contents"] > div',
              )!;
              const m =
                getComputedStyle(strip).transform.match(/matrix\(([^)]+)\)/);
              const tx = m ? Number(m[1]!.split(',')[4]) : 0;
              if (el)
                out.push({
                  x: el.getBoundingClientRect().x,
                  strip: (tx / strip.getBoundingClientRect().width) * 100,
                });
              if (performance.now() - start < 900) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          }),
        HIGHLIGHT,
      );
      await page.keyboard.press('ArrowRight');
      await expect(analytics).toBeFocused();
      await expect(analytics).toHaveAttribute('aria-selected', 'true');
      const xs = await frames;
      expect(xs.some((f) => f.x > overviewX + 1 && f.x < analyticsX - 1)).toBe(
        true,
      );
      expect(xs.some((f) => f.strip < -1 && f.strip > -99)).toBe(true);
      await expect
        .poll(async () =>
          Math.abs((await highlightX(page, 'analytics')) - analyticsX),
        )
        .toBeLessThan(1.5);
      await expect.poll(async () => Math.round(await stripX(page))).toBe(-100);
    });
  });

  test.describe(`${framework.name} tabs keyboard`, () => {
    const openFixture = (page: Page) =>
      gotoTabs(page, framework.fixture('tabs'));

    const list = (page: Page, name: string) =>
      page.getByRole('tablist', { name });
    const tab = (page: Page, listName: string, name: string) =>
      list(page, listName).getByRole('tab', { name, exact: true });

    async function expectSelected(page: Page, listName: string, name: string) {
      const t = tab(page, listName, name);
      await expect(t).toBeFocused();
      await expect(t).toHaveAttribute('aria-selected', 'true');
      await expect(t).toHaveAttribute('tabindex', '0');
      await expect(
        list(page, listName).locator('[role="tab"][tabindex="0"]'),
      ).toHaveCount(1);
    }

    test('roving tabindex: Tab enters on the selected tab, then leaves the list', async ({
      page,
    }) => {
      await openFixture(page);
      await expect(tab(page, 'Horizontal', 'One')).toHaveAttribute(
        'tabindex',
        '0',
      );
      await expect(tab(page, 'Horizontal', 'Three')).toHaveAttribute(
        'tabindex',
        '-1',
      );
      await page.getByRole('button', { name: 'Before' }).focus();
      await page.keyboard.press('Tab');
      await expect(tab(page, 'Horizontal', 'One')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.getByText('Horizontal One panel')).toBeFocused();
    });

    test('arrows select the next enabled tab, skip disabled ones and wrap', async ({
      page,
    }) => {
      await openFixture(page);
      await tab(page, 'Horizontal', 'One').focus();
      await page.keyboard.press('ArrowRight');
      await expectSelected(page, 'Horizontal', 'Three');
      await page.keyboard.press('ArrowRight');
      await expectSelected(page, 'Horizontal', 'Four');
      await page.keyboard.press('ArrowRight');
      await expectSelected(page, 'Horizontal', 'One');
      await page.keyboard.press('ArrowLeft');
      await expectSelected(page, 'Horizontal', 'Four');
      await page.keyboard.press('ArrowLeft');
      await expectSelected(page, 'Horizontal', 'Three');
      await page.keyboard.press('ArrowDown');
      await expectSelected(page, 'Horizontal', 'Three');
      await expect(tab(page, 'Horizontal', 'Two')).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });

    test('Home and End jump to the first and last tabs', async ({ page }) => {
      await openFixture(page);
      await tab(page, 'Horizontal', 'One').focus();
      await page.keyboard.press('End');
      await expectSelected(page, 'Horizontal', 'Four');
      await page.keyboard.press('Home');
      await expectSelected(page, 'Horizontal', 'One');
    });

    test('the panel follows the keyboard selection', async ({ page }) => {
      await openFixture(page);
      await tab(page, 'Horizontal', 'One').focus();
      await page.keyboard.press('End');
      const panel = page.locator(
        `[id="${await tab(page, 'Horizontal', 'Four').getAttribute('aria-controls')}"]`,
      );
      await expect(panel).not.toHaveAttribute('inert', '');
      await expect(panel).toContainText('Horizontal Four panel');
    });

    test('vertical: Up and Down move, Left and Right do not', async ({
      page,
    }) => {
      await openFixture(page);
      await expect(list(page, 'Vertical')).toHaveAttribute(
        'aria-orientation',
        'vertical',
      );
      await tab(page, 'Vertical', 'One').focus();
      await page.keyboard.press('ArrowRight');
      await expectSelected(page, 'Vertical', 'One');
      await page.keyboard.press('ArrowDown');
      await expectSelected(page, 'Vertical', 'Three');
      await page.keyboard.press('ArrowUp');
      await expectSelected(page, 'Vertical', 'One');
      await page.keyboard.press('ArrowUp');
      await expectSelected(page, 'Vertical', 'Four');
    });

    test('RTL: Left moves forward', async ({ page }) => {
      await openFixture(page);
      await tab(page, 'RTL', 'One').focus();
      await page.keyboard.press('ArrowLeft');
      await expectSelected(page, 'RTL', 'Three');
      await page.keyboard.press('ArrowRight');
      await expectSelected(page, 'RTL', 'One');
    });

    const panelInView = (page: Page, text: string) =>
      page.getByText(text, { exact: true }).evaluate((panel) => {
        const contents = panel.closest('[data-slot="tabs-contents"]')!;
        const a = panel.getBoundingClientRect();
        const b = contents.getBoundingClientRect();
        return a.left >= b.left - 1 && a.right <= b.right + 1;
      });

    test('RTL: the chosen panel slides into view', async ({ page }) => {
      await openFixture(page);
      await tab(page, 'RTL', 'Three').click();
      await expect.poll(() => panelInView(page, 'RTL Three panel')).toBe(true);
    });

    test('own ids on a trigger and a panel stay paired', async ({ page }) => {
      await openFixture(page);
      const t = tab(page, 'Custom ids', 'Alpha');
      await expect(t).toHaveAttribute('id', 'my-trigger');
      await expect(t).toHaveAttribute('aria-controls', 'my-panel');
      const panel = page.locator('#my-panel');
      await expect(panel).toHaveAttribute('role', 'tabpanel');
      await expect(panel).toHaveAttribute('aria-labelledby', 'my-trigger');
      const beta = tab(page, 'Custom ids', 'Beta');
      const betaPanel = page.locator(
        `[id="${await beta.getAttribute('aria-controls')}"]`,
      );
      await expect(betaPanel).toHaveAttribute(
        'aria-labelledby',
        (await beta.getAttribute('id'))!,
      );
    });

    const shownHeights = (page: Page, id: string, ms = 600) =>
      page.getByTestId(id).evaluate(
        (el, ms) =>
          new Promise<number[]>((resolve) => {
            const out: number[] = [];
            let start = 0;
            const tick = (now: number) => {
              if (el.getClientRects().length > 0) {
                start ||= now;
                out.push(el.getBoundingClientRect().height);
              }
              if (!start || now - start < ms) requestAnimationFrame(tick);
              else resolve(out);
            };
            requestAnimationFrame(tick);
          }),
        ms,
      );

    test('mounted hidden, its contents show at the active panel height, without growing', async ({
      page,
    }) => {
      await page.goto(framework.fixture('tabs-hidden'), {
        waitUntil: 'networkidle',
      });
      const tallest = shownHeights(page, 'tallest');
      const shorter = shownHeights(page, 'shorter');
      await page.getByRole('button', { name: 'Show' }).click();
      for (const height of await tallest) expect(height).toBeCloseTo(120, 0);
      for (const height of await shorter) expect(height).toBeCloseTo(40, 0);
    });

    test('an active panel empty at first leaves no gap, then shows its content', async ({
      page,
    }) => {
      await page.goto(framework.fixture('tabs-hidden'), {
        waitUntil: 'networkidle',
      });
      const contents = page.getByTestId('empty');
      expect((await contents.boundingBox())!.height).toBeCloseTo(0, 0);
      const frames = shownHeights(page, 'empty');
      await page.getByRole('button', { name: 'Load' }).click();
      for (const height of await frames) expect(height).toBeLessThan(41);
      await expect
        .poll(async () => (await contents.boundingBox())!.height)
        .toBeCloseTo(40, 0);
    });

    test('without defaultValue, the server renders the first panel at its height', async ({
      browser,
    }) => {
      test.skip(
        framework.vue,
        'Vue demos mount in the browser: no server render',
      );
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(framework.fixture('tabs-hidden'));
      expect(
        (await page.getByTestId('no-default').boundingBox())!.height,
      ).toBeCloseTo(40, 0);
      await context.close();
    });

    test('switching away from a panel left empty glides the height', async ({
      page,
    }) => {
      await page.goto(framework.fixture('tabs-hidden'), {
        waitUntil: 'networkidle',
      });
      await page.waitForTimeout(300);
      const frames = shownHeights(page, 'empty', 900);
      await page
        .getByTestId('empty')
        .locator('xpath=..')
        .getByRole('tab', { name: 'Two' })
        .click();
      const heights = await frames;
      const steps = heights.slice(1).map((h, i) => Math.abs(h - heights[i]!));
      expect(Math.max(...steps)).toBeLessThan(60);
      expect(heights.at(-1)!).toBeCloseTo(120, 0);
    });
  });

  test(`${framework.name} switching tabs hands one highlight over: never two shown at once`, async ({
    page,
  }) => {
    await page.goto(framework.demo('tabs'), { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Overview' }).click();
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      const samples: number[] = [];
      (window as unknown as { samples: number[] }).samples = samples;
      const start = performance.now();
      const tick = () => {
        samples.push(
          [
            ...document.querySelectorAll('[data-slot="motion-highlight"]'),
          ].filter(
            (element) => Number(getComputedStyle(element).opacity) > 0.02,
          ).length,
        );
        if (performance.now() - start < 700) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.getByRole('tab', { name: 'Reports' }).click();
    await page.waitForTimeout(900);
    const samples = await page.evaluate(
      () => (window as unknown as { samples: number[] }).samples,
    );
    expect(Math.max(...samples)).toBe(1);
  });

  test(`${framework.name} switching tabs never blinks the highlight`, async ({
    page,
  }) => {
    await page.goto(framework.demo('tabs'), { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Overview' }).click();
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      const samples: number[] = [];
      (window as unknown as { samples: number[] }).samples = samples;
      const start = performance.now();
      const tick = () => {
        samples.push(
          Math.max(
            0,
            ...[
              ...document.querySelectorAll('[data-slot="motion-highlight"]'),
            ].map((element) => Number(getComputedStyle(element).opacity)),
          ),
        );
        if (performance.now() - start < 700) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.getByRole('tab', { name: 'Reports' }).click();
    await page.waitForTimeout(900);
    const samples = await page.evaluate(
      () => (window as unknown as { samples: number[] }).samples,
    );
    expect(Math.min(...samples)).toBeGreaterThan(0.95);
  });
}
