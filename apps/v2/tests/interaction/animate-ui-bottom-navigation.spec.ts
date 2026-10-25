import { expect, test, type Page } from '../test';

import { FRAMEWORKS, ready } from './animate-ui-frameworks';

type ScrollBehavior = 'none' | 'hide' | 'minimize';

for (const framework of FRAMEWORKS) {
  const NAV = '[data-slot="bottom-navigation"]';
  const HIGHLIGHT = '[data-slot="motion-highlight"]';

  const open = async (
    page: Page,
    scrollBehavior?: ScrollBehavior,
    controls: Record<string, string> = {},
  ) => {
    const query = new URLSearchParams({
      ...(scrollBehavior ? { scrollBehavior } : {}),
      ...controls,
    }).toString();
    await page.goto(
      framework.demo('bottom-navigation') + (query ? `?${query}` : ''),
    );
    await ready(page, `${NAV} button`);
  };

  const list = (page: Page) =>
    page
      .locator(NAV)
      .locator('xpath=ancestor::div[contains(@class,"relative")][1]/div[1]');

  const scrollTo = (page: Page, top: number) =>
    list(page).evaluate((el, value) => {
      el.scrollTop = value;
    }, top);

  const highlightX = (page: Page, value: string) =>
    page
      .locator(`${HIGHLIGHT}[data-value="${value}"]`)
      .evaluate((el) => el.getBoundingClientRect().x);

  const navTop = (page: Page) =>
    page.locator(NAV).evaluate((el) => el.getBoundingClientRect().top);

  // The bar itself, without the accessory beside it.
  const navWidth = (page: Page) =>
    page
      .locator(`${NAV} ul`)
      .evaluate((el) => el.getBoundingClientRect().width);

  // The highlight has reached the item and fits it, its label open.
  const settled = (page: Page, name: string) =>
    expect
      .poll(async () => {
        const item = (await page.getByRole('button', { name }).boundingBox())!;
        const highlight = (await page
          .locator(`${HIGHLIGHT}[data-value="${name.toLowerCase()}"]`)
          .boundingBox())!;
        return (
          Math.abs(highlight.x - item.x) +
          Math.abs(highlight.width - item.width)
        );
      })
      .toBeLessThan(1);

  const LABEL = '[data-slot="bottom-navigation-label"]';
  const ACCESSORY = '[data-slot="bottom-navigation-accessory"]';

  const widthOf = (page: Page, selector: string) =>
    page.locator(selector).evaluate((el) => el.getBoundingClientRect().width);

  const labelWidth = (page: Page, name: string) =>
    widthOf(page, `${NAV} [aria-label="${name}"] ${LABEL}`);

  const cardBottom = (page: Page) =>
    list(page).evaluate((el) => el.getBoundingClientRect().bottom);

  const inlineSizes = (page: Page) =>
    page
      .locator(`${NAV} li button`)
      .evaluateAll((els) =>
        els.map(
          (el) =>
            (el as HTMLElement).style.width +
            (el as HTMLElement).style.paddingLeft,
        ),
      );

  test.describe(`${framework.name} bottom navigation`, () => {
    test('the selected item is the current page', async ({ page }) => {
      await open(page);
      await expect(
        page.getByRole('navigation', { name: 'Main' }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Home' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      await expect(
        page.getByRole('button', { name: 'Wallet' }),
      ).not.toHaveAttribute('aria-current');
    });

    test('selecting an item glides the highlight to it', async ({ page }) => {
      await open(page, undefined, { labels: 'false' });
      const wallet = page.getByRole('button', { name: 'Wallet' });
      const end = (await wallet.boundingBox())!.x;
      const start = await highlightX(page, 'home');
      await wallet.click();
      await page.waitForTimeout(60);
      const mid = await highlightX(page, 'wallet');
      expect(mid).toBeGreaterThan(start + 1);
      expect(mid).toBeLessThan(end - 1);
      await expect
        .poll(async () => Math.abs((await highlightX(page, 'wallet')) - end))
        .toBeLessThan(1.5);
      await expect(wallet).toHaveAttribute('aria-current', 'page');
      await expect(page.locator(`${HIGHLIGHT}:visible`)).toHaveCount(1);
    });

    test('with no scroll behavior, scrolling leaves the bar as it is', async ({
      page,
    }) => {
      await open(page, 'none');
      const width = await navWidth(page);
      const top = await navTop(page);
      await scrollTo(page, 120);
      await page.waitForTimeout(400);
      await expect(page.locator(NAV)).not.toHaveAttribute('data-hidden');
      await expect(page.locator(NAV)).not.toHaveAttribute('data-minimized');
      expect(await navWidth(page)).toBe(width);
      expect(await navTop(page)).toBe(top);
    });

    test.describe('minimize', () => {
      test('scrolling down folds the bar to the selected item, up unfolds it', async ({
        page,
      }) => {
        await open(page, 'minimize');
        await page.getByRole('button', { name: 'Wallet' }).click();
        await settled(page, 'Wallet');
        const wallet = page.getByRole('button', { name: 'Wallet' });
        const full = await navWidth(page);
        const item = (await wallet.boundingBox())!.width;
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
        await page.waitForTimeout(80);
        const mid = await navWidth(page);
        expect(mid).toBeLessThan(full - 1);
        expect(mid).toBeGreaterThan(item + 20);
        await expect
          .poll(async () => (await navWidth(page)) - item)
          .toBeLessThan(20);
        await expect(
          page.getByRole('button', { name: 'Home' }),
        ).toHaveJSProperty('inert', true);
        await expect(wallet).toBeVisible();

        await scrollTo(page, 60);
        await expect(page.locator(NAV)).not.toHaveAttribute('data-minimized');
        await expect
          .poll(async () => Math.abs((await navWidth(page)) - full))
          .toBeLessThan(0.5);
        await expect(
          page.getByRole('button', { name: 'Home' }),
        ).toHaveJSProperty('inert', false);
      });

      test('the highlight stays under the selected item while folding', async ({
        page,
      }) => {
        await open(page, 'minimize');
        await page.getByRole('button', { name: 'Wallet' }).click();
        await settled(page, 'Wallet');
        const gaps = page.locator(NAV).evaluate(
          (nav) =>
            new Promise<number[]>((resolve) => {
              const out: number[] = [];
              const start = performance.now();
              const tick = (now: number) => {
                const item = nav
                  .querySelector('[aria-label="Wallet"]')!
                  .getBoundingClientRect();
                const highlight = [
                  ...nav.querySelectorAll('[data-slot="motion-highlight"]'),
                ]
                  .find((el) => getComputedStyle(el).visibility !== 'hidden')!
                  .getBoundingClientRect();
                out.push(Math.abs(highlight.x - item.x));
                if (now - start < 600) requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            }),
        );
        await scrollTo(page, 120);
        expect(Math.max(...(await gaps))).toBeLessThan(1);
      });

      test('tapping the folded bar unfolds it and lets go of the inline sizes', async ({
        page,
      }) => {
        await open(page, 'minimize');
        const full = await navWidth(page);
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
        await page.waitForTimeout(600);
        await page.locator(NAV).click();
        await expect(page.locator(NAV)).not.toHaveAttribute('data-minimized');
        await expect
          .poll(async () => Math.abs((await navWidth(page)) - full))
          .toBeLessThan(0.5);
        await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
      });

      // Unfolding while the bar still folded (and folding back mid-unfold)
      // left the items at a fixed inline width.
      test('interrupted folds and unfolds end at the bar’s own sizes', async ({
        page,
      }) => {
        await open(page, 'minimize');
        const full = await navWidth(page);
        for (const fold of [120, 900, 150, 600, 80, 300]) {
          await scrollTo(page, 200);
          await page.waitForTimeout(fold);
          await scrollTo(page, 100);
          await page.waitForTimeout(120);
          await scrollTo(page, 200);
          await page.waitForTimeout(fold);
          await scrollTo(page, 100);
          await expect
            .poll(async () => Math.abs((await navWidth(page)) - full))
            .toBeLessThan(0.5);
          await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
        }
      });

      // The fold's sizes came back on the item's next render: selected after
      // a fold, it stayed icon-wide, its label and highlight cut.
      test('an item folded before opens its label once selected', async ({
        page,
      }) => {
        await open(page, 'minimize');
        await page.getByRole('button', { name: 'Wallet' }).click();
        await settled(page, 'Wallet');
        await scrollTo(page, 150);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
        await page.waitForTimeout(500);
        await scrollTo(page, 60);
        await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
        await page.getByRole('button', { name: 'Home' }).click();
        await settled(page, 'Home');
        expect(await labelWidth(page, 'Home')).toBeGreaterThan(20);
        expect(await inlineSizes(page)).toEqual(['', '', '', '']);
      });

      test('under reduced motion, the bar folds at once', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page, 'minimize');
        const item = (await page
          .getByRole('button', { name: 'Home' })
          .boundingBox())!.width;
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
        await page.waitForTimeout(50);
        expect((await navWidth(page)) - item).toBeLessThan(20);
      });
    });

    test.describe('labels', () => {
      test('only the selected item shows its label', async ({ page }) => {
        await open(page);
        expect(await labelWidth(page, 'Home')).toBeGreaterThan(20);
        for (const name of ['Search', 'Wallet', 'Profile']) {
          expect(await labelWidth(page, name)).toBe(0);
          await expect(
            page.locator(`${NAV} [aria-label="${name}"] ${LABEL}`),
          ).toHaveCSS('opacity', '0');
          // Closed, it still names its item for screen readers.
          expect(
            await page
              .locator(`${NAV} [aria-label="${name}"] ${LABEL}`)
              .evaluate((el) => !el.closest('[inert]')),
          ).toBe(true);
        }
      });

      test('selecting an item opens its label as the other one closes, the highlight around it', async ({
        page,
      }) => {
        await open(page);
        const home = await labelWidth(page, 'Home');
        await page.getByRole('button', { name: 'Wallet' }).click();
        await page.waitForTimeout(80);
        const opening = await labelWidth(page, 'Wallet');
        const closing = await labelWidth(page, 'Home');
        expect(opening).toBeGreaterThan(0);
        expect(closing).toBeLessThan(home - 1);
        await expect.poll(() => labelWidth(page, 'Home')).toBe(0);
        await settled(page, 'Wallet');
        expect(await labelWidth(page, 'Wallet')).toBeGreaterThan(opening + 1);
      });

      test('without labels, items are icons only', async ({ page }) => {
        await open(page, undefined, { labels: 'false' });
        await expect(page.locator(LABEL)).toHaveCount(0);
      });

      test('under reduced motion, labels switch at once', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page);
        await page.getByRole('button', { name: 'Wallet' }).click();
        await page.waitForTimeout(50);
        expect(await labelWidth(page, 'Home')).toBe(0);
        expect(await labelWidth(page, 'Wallet')).toBeGreaterThan(20);
      });
    });

    test.describe('accessory', () => {
      const accessoryBox = (page: Page) =>
        page.getByRole('button', { name: 'New payment' }).boundingBox();

      const barRight = async (page: Page) => {
        const bar = (await page.locator(`${NAV} ul`).boundingBox())!;
        return bar.x + bar.width;
      };

      test('it sits beside the bar, unfolded or folded', async ({ page }) => {
        await open(page, 'minimize');
        const accessory = page.getByRole('button', { name: 'New payment' });
        await expect(accessory).toBeVisible();
        expect((await accessoryBox(page))!.x).toBeGreaterThan(
          await barRight(page),
        );
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
        await expect(accessory).toBeVisible();
        const unfolded = (await accessoryBox(page))!.x;
        await expect
          .poll(async () => (await accessoryBox(page))!.x)
          .toBeLessThan(unfolded - 20);
        await page.waitForTimeout(700);
        expect((await accessoryBox(page))!.x).toBeGreaterThan(
          await barRight(page),
        );
      });

      test('pressing or focusing it keeps the bar folded', async ({ page }) => {
        await open(page, 'minimize');
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
        await page.waitForTimeout(500);
        const accessory = page.getByRole('button', { name: 'New payment' });
        await accessory.focus();
        await accessory.click();
        await page.waitForTimeout(200);
        await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
      });

      test('hovered, it looks like the selected item', async ({ page }) => {
        await open(page);
        const accessory = page.getByRole('button', { name: 'New payment' });
        await accessory.hover();
        const looks = (selector: string) =>
          page
            .locator(selector)
            .first()
            .evaluate((el) => {
              const style = getComputedStyle(el);
              return [style.backgroundColor, style.color];
            });
        await expect
          .poll(async () => (await looks('[aria-label="New payment"]'))[0])
          .toBe((await looks(`${HIGHLIGHT}[data-active="true"]`))[0]);
        expect((await looks('[aria-label="New payment"]'))[1]).toBe(
          (await looks('[aria-current="page"]'))[1],
        );
      });

      test('pressed, it scales down like the bar’s items', async ({ page }) => {
        await open(page);
        const accessory = page.getByRole('button', { name: 'New payment' });
        const box = (await accessory.boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        const scale = () =>
          accessory.evaluate(
            (el) => new DOMMatrix(getComputedStyle(el).transform).a,
          );
        await expect.poll(scale).toBeLessThan(0.98);
        await page.mouse.up();
        await expect.poll(scale).toBe(1);
      });

      test('its hover background fades in', async ({ page }) => {
        await open(page);
        const accessory = page.getByRole('button', { name: 'New payment' });
        await accessory.hover();
        await page.waitForTimeout(160);
        const alpha = await page
          .locator('[aria-label="New payment"]')
          .evaluate((el) => {
            const color = getComputedStyle(el).backgroundColor;
            const match = color.match(/\/\s*([\d.]+)\)$/);
            return match ? Number(match[1]) : 1;
          });
        expect(alpha).toBeGreaterThan(0);
        expect(alpha).toBeLessThan(1);
      });

      test('its icon plays on each press, not on hover', async ({ page }) => {
        await open(page);
        const accessory = page.getByRole('button', { name: 'New payment' });
        // Whether the icon's drawing changes from one frame to the next.
        const moving = () =>
          accessory.evaluate(
            (el) =>
              new Promise<boolean>((resolve) => {
                const read = () =>
                  [el.querySelector('svg')!, ...el.querySelectorAll('svg *')]
                    .map((node) => getComputedStyle(node).transform)
                    .join();
                const before = read();
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => resolve(read() !== before)),
                );
              }),
          );
        await accessory.hover();
        await page.waitForTimeout(150);
        expect(await moving()).toBe(false);
        for (let press = 0; press < 2; press++) {
          await accessory.click();
          await expect.poll(moving).toBe(true);
          await expect.poll(moving, { timeout: 3000 }).toBe(false);
        }
      });

      test('without it, the bar is alone', async ({ page }) => {
        await open(page, 'minimize', { accessory: 'false' });
        await expect(page.locator(ACCESSORY)).toHaveCount(0);
      });
    });

    // Bug (Vue): Motion for Vue's focus listeners made the icons' SVGs
    // focusable: a click on an icon focused it (with an outline), and Tab
    // stopped on its parts.
    test('a click on an icon focuses its item without a ring, and Tab moves on to the next item', async ({
      page,
    }) => {
      await open(page);
      const icon = (await page
        .getByRole('button', { name: 'Wallet' })
        .locator('svg')
        .boundingBox())!;
      await page.mouse.click(icon.x + icon.width / 2, icon.y + icon.height / 2);
      const focused = () =>
        page.evaluate(() => ({
          label: document.activeElement!.getAttribute('aria-label'),
          ring: document.activeElement!.matches(':focus-visible'),
        }));
      expect(await focused()).toEqual({ label: 'Wallet', ring: false });
      await page.keyboard.press('Tab');
      expect((await focused()).label).toBe('Profile');
      await page.keyboard.press('Tab');
      expect((await focused()).label).toBe('New payment');
    });

    test('the hovered icon darkens', async ({ page }) => {
      await open(page);
      const search = page.getByRole('button', { name: 'Search' });
      const before = await search.evaluate((el) => getComputedStyle(el).color);
      await search.hover();
      await expect
        .poll(() => search.evaluate((el) => getComputedStyle(el).color))
        .not.toBe(before);
    });

    test.describe('hide', () => {
      test('scrolling down slides the bar out of its container, up brings it back', async ({
        page,
      }) => {
        await open(page, 'hide');
        const rest = await navTop(page);
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-hidden', '');
        await page.waitForTimeout(60);
        const mid = await navTop(page);
        expect(mid).toBeGreaterThan(rest + 1);
        await expect
          .poll(async () => (await navTop(page)) - (await cardBottom(page)))
          .toBeGreaterThan(0);
        await scrollTo(page, 60);
        await expect(page.locator(NAV)).not.toHaveAttribute('data-hidden');
        await expect
          .poll(async () => Math.abs((await navTop(page)) - rest))
          .toBeLessThan(0.5);
      });

      test('a scroll smaller than the threshold leaves the bar in place', async ({
        page,
      }) => {
        await open(page, 'hide');
        await scrollTo(page, 3);
        await page.waitForTimeout(200);
        await expect(page.locator(NAV)).not.toHaveAttribute('data-hidden');
      });

      test('focusing an item brings the hidden bar back', async ({ page }) => {
        await open(page, 'hide');
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-hidden', '');
        await page.getByRole('button', { name: 'Search' }).focus();
        await expect(page.locator(NAV)).not.toHaveAttribute('data-hidden');
      });

      test('under reduced motion, the hidden bar fades out and lets clicks through', async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page, 'hide');
        const rest = await navTop(page);
        await scrollTo(page, 120);
        await expect(page.locator(NAV)).toHaveAttribute('data-hidden', '');
        await expect
          .poll(() =>
            page
              .locator(NAV)
              .evaluate((el) => Number(getComputedStyle(el).opacity)),
          )
          .toBe(0);
        expect(await navTop(page)).toBe(rest);
        expect(
          await page
            .locator(NAV)
            .evaluate((el) => getComputedStyle(el).pointerEvents),
        ).toBe('none');
      });
    });
  });
}
