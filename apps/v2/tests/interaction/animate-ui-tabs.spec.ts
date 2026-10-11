import { expect, test, type Page } from '@playwright/test';

import {
  expectCurvePace,
  expectSpringPace,
  type Sample,
} from './spring-curves';
import {
  PANEL_HEIGHT,
  SELECTION_SPRING,
  expectBoxStays,
  expectOneIndicator,
  expectOnePanelAtATime,
  expectPanelsInSequence,
  framesOf,
  gotoTabs,
  offsetFrom,
  recordBoxes,
  recordSwitch,
  tabCenter,
  tabLeft,
} from './tabs-helpers';

// Animate UI's own tabs move like the library tabs (Motion's Radix tabs
// example): one highlight slides to the selected trigger, and the panels
// change one after the other while the height glides.

const open = (page: Page) => gotoTabs(page, '/tests/demos/animate-ui/tabs');

const HIGHLIGHT = '[data-slot="tabs-highlight"]';
/** The demo's panels, by the start of their text. */
const ACCOUNT = 'Make changes';
const PASSWORD = 'Change your password';

const panelHeight = (page: Page, name: string) =>
  page
    .getByRole('tabpanel')
    .filter({ hasText: name })
    .evaluate((el) => el.getBoundingClientRect().height);

test.describe('animate-ui tabs', () => {
  test('the first tab is selected; tabs are exposed as tabs', async ({
    page,
  }) => {
    await open(page);
    await expect(page.getByRole('tablist')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Account' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tab', { name: 'Password' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    // The inactive panel is hidden and can't be focused.
    const inactive = page
      .getByRole('tabpanel', { includeHidden: true })
      .filter({ hasText: PASSWORD });
    await expect(inactive).toHaveAttribute('inert', '');
    await expect(inactive).toBeHidden();
  });

  test('page load: nothing moves, the highlight sits on the selected trigger', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __load: number[][] };
      w.__load = [];
      const tick = () => {
        const el = document.querySelector<HTMLElement>(
          '[data-slot="tabs-content"]',
        );
        if (el) {
          const style = getComputedStyle(el);
          w.__load.push([
            Number(style.opacity),
            parseFloat(style.filter.match(/blur\(([^)]+)\)/)?.[1] ?? '0'),
          ]);
        }
        if (w.__load.length < 3600) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await open(page);
    await expect(page.locator(HIGHLIGHT)).toHaveCount(1);
    expect(
      Math.abs(await offsetFrom(page, 'Account', undefined, HIGHLIGHT)),
    ).toBeLessThan(1);
    await page.waitForTimeout(400);
    const load = await page.evaluate(
      () => (window as unknown as { __load: number[][] }).__load,
    );
    expect(load.length).toBeGreaterThan(10);
    expect(load.every(([o, blur]) => o === 1 && blur === 0)).toBe(true);
  });

  test('one highlight slides to the selected trigger on the selection spring', async ({
    page,
  }) => {
    await open(page);
    const start = await tabLeft(page, 'Account');
    const target = await tabLeft(page, 'Password');
    const frames = await recordSwitch(
      page,
      'Password',
      900,
      undefined,
      undefined,
      HIGHLIGHT,
    );
    expectOneIndicator(frames);
    expect(
      frames.some(
        (f) =>
          f.indicators[0]!.x > start + 4 && f.indicators[0]!.x < target - 4,
      ),
    ).toBe(true);
    expectSpringPace(
      frames.map((f): Sample => [f.t, f.indicators[0]!.x]),
      SELECTION_SPRING,
      {
        from: start,
        to: target,
        a: start + (target - start) * 0.1,
        b: start + (target - start) * 0.9,
      },
    );
    await expect(page.getByRole('tab', { name: 'Password' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      Math.abs(await offsetFrom(page, 'Password', undefined, HIGHLIGHT)),
    ).toBeLessThan(1);
  });

  test("the panels change one after the other, the height gliding from the old panel's", async ({
    page,
  }) => {
    await open(page);
    const contents = page.locator('[data-slot="tabs-contents"]');
    const before = await panelHeight(page, ACCOUNT);
    const box = (await contents.boundingBox())!.height;
    const frames = await recordSwitch(
      page,
      'Password',
      1100,
      undefined,
      undefined,
      HIGHLIGHT,
    );
    expectPanelsInSequence(frames, ACCOUNT, PASSWORD);
    const comes = framesOf(frames, PASSWORD);
    const after = comes.at(-1)!.h;
    expect(after).toBeGreaterThan(before + 20);
    expect(Math.abs(comes[0]!.h - before)).toBeLessThan(3);
    expect(comes.every((p) => p.h <= after + 0.5)).toBe(true);
    expectCurvePace(
      comes.map((p): Sample => [p.t, p.h]),
      PANEL_HEIGHT,
      {
        from: before,
        to: after,
        a: before + (after - before) * 0.1,
        b: before + (after - before) * 0.9,
      },
    );
    // The container follows: its border and background glide with it.
    expect((await contents.boundingBox())!.height - box).toBeCloseTo(
      after - before,
      0,
    );
  });

  test('reduced motion: the highlight and the height jump, the panels only fade', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const before = await panelHeight(page, ACCOUNT);
    const start = await tabLeft(page, 'Account');
    const target = await tabLeft(page, 'Password');
    const frames = await recordSwitch(
      page,
      'Password',
      700,
      undefined,
      undefined,
      HIGHLIGHT,
    );
    const after = framesOf(frames, PASSWORD).at(-1)!.h;
    expect(after).toBeGreaterThan(before + 20);
    expect(frames.every((f) => f.panels.every((p) => p.blur === 0))).toBe(true);
    const heights = frames.flatMap((f) => f.panels.map((p) => p.h));
    expect(heights.some((h) => h > before + 1 && h < after - 1)).toBe(false);
    const lefts = frames.map((f) => f.indicators[0]!.x);
    expect(lefts.some((x) => x > start + 1 && x < target - 1)).toBe(false);
    expectOnePanelAtATime(frames);
    expect(framesOf(frames, ACCOUNT).some((p) => p.o > 0 && p.o < 1)).toBe(
      true,
    );
    expect(framesOf(frames, PASSWORD).some((p) => p.o > 0 && p.o < 1)).toBe(
      true,
    );
  });

  test('triggers and panels reference each other', async ({ page }) => {
    await open(page);
    for (const name of ['Account', 'Password']) {
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
    const start = await tabLeft(page, 'Account');
    const target = await tabLeft(page, 'Password');
    await page.getByRole('tab', { name: 'Account' }).focus();
    const frames = await recordSwitch(
      page,
      'Password',
      900,
      () => page.keyboard.press('ArrowRight'),
      undefined,
      HIGHLIGHT,
    );
    const password = page.getByRole('tab', { name: 'Password' });
    await expect(password).toBeFocused();
    await expect(password).toHaveAttribute('aria-selected', 'true');
    expectOneIndicator(frames);
    expect(
      frames.some(
        (f) =>
          f.indicators[0]!.x > start + 4 && f.indicators[0]!.x < target - 4,
      ),
    ).toBe(true);
    expectPanelsInSequence(frames, ACCOUNT, PASSWORD);
  });

  test('quick changes: a panel passed over never shows, one picked again comes back from where it is', async ({
    page,
  }) => {
    await gotoTabs(page, '/tests/fixtures/animate-ui-tabs');
    const scope = '[data-slot="tabs"]:has([aria-label="Horizontal"])';
    const three = await tabCenter(page, 'Three', scope);
    const four = await tabCenter(page, 'Four', scope);
    const one = await tabCenter(page, 'One', scope);
    // One → Three → Four at once: Three never shows.
    let frames = await recordSwitch(
      page,
      'Three',
      900,
      async () => {
        await page.mouse.click(three.x, three.y);
        await page.mouse.click(four.x, four.y);
      },
      scope,
      HIGHLIGHT,
    );
    expectOneIndicator(frames);
    expectOnePanelAtATime(frames);
    expect(framesOf(frames, 'Horizontal Three')).toHaveLength(0);
    expect(framesOf(frames, 'Horizontal Four').length).toBeGreaterThan(2);
    // Four → One, then Four again as One comes in: One fades back out from
    // where it is, Four comes back in.
    frames = await recordSwitch(
      page,
      'One',
      1000,
      async () => {
        await page.mouse.click(one.x, one.y);
        await page.waitForFunction((scope) => {
          const el = [
            ...document
              .querySelector(scope)!
              .querySelectorAll<HTMLElement>('[data-slot="tabs-content"]'),
          ].find((p) => !p.hidden && p.textContent?.includes('One'));
          const o = el ? Number(getComputedStyle(el).opacity) : 0;
          return o > 0.25 && o < 0.75;
        }, scope);
        await page.mouse.click(four.x, four.y);
      },
      scope,
      HIGHLIGHT,
    );
    expectOneIndicator(frames);
    expectOnePanelAtATime(frames);
    const passed = framesOf(frames, 'Horizontal One');
    const peak = passed.reduce((i, p, j) => (p.o > passed[i]!.o ? j : i), 0);
    expect(passed[peak]!.o).toBeLessThan(0.98);
    expect(passed.at(-1)!.o).toBeLessThan(0.2);
    const steps = passed.slice(1).map((p, i) => Math.abs(p.o - passed[i]!.o));
    expect(Math.max(...steps)).toBeLessThan(0.3);
    const back = framesOf(frames, 'Horizontal Four').filter(
      (p) => p.t > passed.at(-1)!.t,
    );
    expect(back[0]!.o).toBeLessThan(0.2);
    expect(back.at(-1)!.o).toBe(1);
  });
});

test.describe('animate-ui tabs, panels holding a box', () => {
  test('the box stays on screen as the next one takes over: only its content fades', async ({
    page,
  }) => {
    await gotoTabs(page, '/tests/fixtures/animate-ui-tabs');
    const scope = '[data-slot="tabs"]:has([aria-label="Frames"])';
    await page.locator(scope).scrollIntoViewIfNeeded();
    const target = await tabCenter(page, 'Boxed tall', scope);
    const recorded = await recordBoxes(page, scope, 'Boxed tall', () =>
      page.mouse.click(target.x, target.y),
    );
    expectBoxStays(recorded, 'Boxed panel', 'Boxed tall');
  });
});

test.describe('animate-ui tabs keyboard', () => {
  const openFixture = (page: Page) =>
    gotoTabs(page, '/tests/fixtures/animate-ui-tabs');

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
    // Next stop is the active panel, not the other tabs.
    await page.keyboard.press('Tab');
    await expect(page.getByText('Horizontal One panel')).toBeFocused();
  });

  test('arrows select the next enabled tab, skip disabled ones and wrap', async ({
    page,
  }) => {
    await openFixture(page);
    await tab(page, 'Horizontal', 'One').focus();
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Horizontal', 'Three'); // Two is disabled
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Horizontal', 'Four');
    await page.keyboard.press('ArrowRight');
    await expectSelected(page, 'Horizontal', 'One'); // wraps
    await page.keyboard.press('ArrowLeft');
    await expectSelected(page, 'Horizontal', 'Four'); // wraps back
    await page.keyboard.press('ArrowLeft');
    await expectSelected(page, 'Horizontal', 'Three');
    // Up/Down do nothing in a horizontal list.
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

  test('own ids on a trigger and a panel stay paired', async ({ page }) => {
    await openFixture(page);
    const t = tab(page, 'Custom ids', 'Alpha');
    await expect(t).toHaveAttribute('id', 'my-trigger');
    await expect(t).toHaveAttribute('aria-controls', 'my-panel');
    const panel = page.locator('#my-panel');
    await expect(panel).toHaveAttribute('role', 'tabpanel');
    await expect(panel).toHaveAttribute('aria-labelledby', 'my-trigger');
    // The other pair keeps its generated ids.
    const beta = tab(page, 'Custom ids', 'Beta');
    const betaPanel = page.locator(
      `[id="${await beta.getAttribute('aria-controls')}"]`,
    );
    await expect(betaPanel).toHaveAttribute(
      'aria-labelledby',
      (await beta.getAttribute('id'))!,
    );
  });
});
