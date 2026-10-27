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

  const itemSizes = (page: Page) =>
    page.locator(`${NAV} li button`).evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return [Math.round(rect.width), Math.round(rect.height)];
      }),
    );

  const minimize = async (page: Page) => {
    await scrollTo(page, 120);
    await expect(page.locator(NAV)).toHaveAttribute('data-minimized', '');
  };

  const cardBottom = (page: Page) =>
    list(page).evaluate((el) => el.getBoundingClientRect().bottom);

  const inlineSizes = (page: Page) =>
    page
      .locator(`${NAV} li button`)
      .evaluateAll((els) =>
        els.map(
          (el) =>
            (el as HTMLElement).style.width + (el as HTMLElement).style.height,
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
      await open(page, undefined, { labels: 'none' });
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
      const EXPANDED = [78, 62];
      const MINIMIZED = [48, 48];

      test('scrolling down shrinks every item to its icon, up grows them back', async ({
        page,
      }) => {
        await open(page, 'minimize');
        expect(await itemSizes(page)).toEqual(Array(4).fill(EXPANDED));
        const full = await navWidth(page);
        await minimize(page);
        await page.waitForTimeout(80);
        const mid = await navWidth(page);
        expect(mid).toBeLessThan(full - 1);
        await expect
          .poll(() => itemSizes(page))
          .toEqual(Array(4).fill(MINIMIZED));
        expect(await navWidth(page)).toBeLessThan(mid - 1);
        for (const name of ['Home', 'Search', 'Wallet', 'Profile'])
          await expect(page.getByRole('button', { name })).toBeVisible();
        await expect(page.locator(`${NAV} [inert]`)).toHaveCount(0);

        await scrollTo(page, 60);
        await expect(page.locator(NAV)).not.toHaveAttribute('data-minimized');
        await page.waitForTimeout(80);
        const growing = (await itemSizes(page))[0];
        expect(growing[0]).toBeGreaterThan(MINIMIZED[0]);
        expect(growing[0]).toBeLessThan(EXPANDED[0]);
        await expect
          .poll(async () => Math.abs((await navWidth(page)) - full))
          .toBeLessThan(0.5);
        await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
      });

      test('labels fold away and the icons end centered in their items', async ({
        page,
      }) => {
        await open(page, 'minimize');
        const label = page.locator(`${NAV} [aria-label="Wallet"] ${LABEL}`);
        const iconOffset = () =>
          page.getByRole('button', { name: 'Wallet' }).evaluate((el) => {
            const item = el.getBoundingClientRect();
            const icon = el.querySelector('svg')!.getBoundingClientRect();
            return icon.y + icon.height / 2 - (item.y + item.height / 2);
          });
        expect(await iconOffset()).toBeLessThan(-3);
        // Each frame's opacity and height while the bar minimizes.
        const frames = label.evaluate(
          (el) =>
            new Promise<number[][]>((resolve) => {
              const out: number[][] = [];
              const start = performance.now();
              const tick = (now: number) => {
                out.push([
                  Number(getComputedStyle(el).opacity),
                  el.getBoundingClientRect().height,
                ]);
                if (now - start < 600) requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            }),
        );
        await minimize(page);
        // It has faded out while its room is still folding.
        expect(
          (await frames).some(
            ([opacity, height]) => opacity < 0.2 && height > 3,
          ),
        ).toBe(true);
        await expect
          .poll(() => label.evaluate((el) => el.getBoundingClientRect().height))
          .toBe(0);
        expect(Math.abs(await iconOffset())).toBeLessThan(0.5);
        // Folded, it still names its item for screen readers.
        await expect(
          page.getByRole('button', { name: 'Wallet' }),
        ).toBeVisible();

        await scrollTo(page, 60);
        await expect
          .poll(() =>
            label.evaluate((el) => Number(getComputedStyle(el).opacity)),
          )
          .toBe(1);
        expect(await iconOffset()).toBeLessThan(-3);
      });

      // Bug: on growing back, the items' padding came back at once while
      // their width still grew, squeezing the icons for a few frames.
      for (const labels of ['below', 'beside', 'none'])
        test(`the icons keep their size as the bar minimizes and grows back (labels ${labels})`, async ({
          page,
        }) => {
          await open(page, 'minimize', { labels });
          const widths = page.locator(NAV).evaluate(
            (nav) =>
              new Promise<number[][]>((resolve) => {
                const out: number[][] = [];
                const start = performance.now();
                const tick = (now: number) => {
                  for (const item of nav.querySelectorAll('li button')) {
                    const box = item.getBoundingClientRect();
                    const icon = item
                      .querySelector('svg')!
                      .getBoundingClientRect();
                    out.push([
                      icon.width,
                      icon.x + icon.width / 2 - (box.x + box.width / 2),
                      icon.y - box.y,
                    ]);
                  }
                  if (now - start < 1400) requestAnimationFrame(tick);
                  else resolve(out);
                };
                requestAnimationFrame(tick);
              }),
          );
          await minimize(page);
          await page.waitForTimeout(600);
          await scrollTo(page, 60);
          const frames = await widths;
          expect(Math.min(...frames.map(([width]) => width))).toBeGreaterThan(
            21.5,
          );
          // Its place in its item glides, frame after frame, without a jump.
          const tops = frames.map(([, , top]) => top);
          const jumps = tops
            .slice(4)
            .map((top, index) => Math.abs(top - tops[index]!));
          expect(Math.max(...jumps)).toBeLessThan(1.5);
          // Alone or above its label, it stays in the middle of its item.
          if (labels !== 'beside')
            expect(
              Math.max(...frames.map(([, offset]) => Math.abs(offset))),
            ).toBeLessThan(1);
        });

      // Bug: labels folded their width too: below the icons, their words
      // came back cut on both sides; beside them, centred and cut.
      for (const labels of ['below', 'beside'])
        test(`labels fold along their item (labels ${labels})`, async ({
          page,
        }) => {
          await open(page, 'minimize', { labels });
          const label = page.locator(`${NAV} [aria-label="Home"] ${LABEL}`);
          const full = await label.evaluate(
            (el) => el.getBoundingClientRect().width,
          );
          // Each frame's width, and how far the text sits from the left.
          const frames = label.evaluate(
            (el) =>
              new Promise<number[][]>((resolve) => {
                const out: number[][] = [];
                const start = performance.now();
                const tick = (now: number) => {
                  const box = el.getBoundingClientRect();
                  const text = el.firstElementChild!.getBoundingClientRect();
                  out.push([box.width, text.left - box.left]);
                  if (now - start < 1400) requestAnimationFrame(tick);
                  else resolve(out);
                };
                requestAnimationFrame(tick);
              }),
          );
          await minimize(page);
          await page.waitForTimeout(600);
          await scrollTo(page, 60);
          for (const [width, offset] of await frames) {
            if (labels === 'below') expect(width).toBeCloseTo(full, 0);
            else expect(Math.abs(offset)).toBeLessThan(0.5);
          }
        });

      test('the highlight stays on the selected item while the bar minimizes', async ({
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
                out.push(
                  Math.abs(highlight.x - item.x) +
                    Math.abs(highlight.width - item.width) +
                    Math.abs(
                      highlight.y +
                        highlight.height / 2 -
                        (item.y + item.height / 2),
                    ),
                );
                if (now - start < 600) requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            }),
        );
        await scrollTo(page, 120);
        expect(Math.max(...(await gaps))).toBeLessThan(1);
      });

      test('tapping a minimized item selects it and grows the bar back', async ({
        page,
      }) => {
        await open(page, 'minimize');
        const full = await navWidth(page);
        await minimize(page);
        await expect
          .poll(() => itemSizes(page))
          .toEqual(Array(4).fill(MINIMIZED));
        await page.getByRole('button', { name: 'Profile' }).click();
        await expect(page.locator(NAV)).not.toHaveAttribute('data-minimized');
        await expect(
          page.getByRole('button', { name: 'Profile' }),
        ).toHaveAttribute('aria-current', 'page');
        await expect
          .poll(async () => Math.abs((await navWidth(page)) - full))
          .toBeLessThan(0.5);
        await settled(page, 'Profile');
        await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
      });

      // Growing back while the bar still shrank (and shrinking again
      // mid-grow) must not leave the items at a fixed inline size.
      test('interrupted minimizes end at the items’ own sizes', async ({
        page,
      }) => {
        await open(page, 'minimize');
        const full = await navWidth(page);
        for (const wait of [120, 900, 150, 600, 80, 300]) {
          await scrollTo(page, 200);
          await page.waitForTimeout(wait);
          await scrollTo(page, 100);
          await page.waitForTimeout(120);
          await scrollTo(page, 200);
          await page.waitForTimeout(wait);
          await scrollTo(page, 100);
          await expect
            .poll(async () => Math.abs((await navWidth(page)) - full))
            .toBeLessThan(0.5);
          await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
          expect(await itemSizes(page)).toEqual(Array(4).fill(EXPANDED));
        }
      });

      test('under reduced motion, the bar minimizes at once', async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await open(page, 'minimize');
        await minimize(page);
        await page.waitForTimeout(50);
        expect(await itemSizes(page)).toEqual(Array(4).fill(MINIMIZED));
        expect(
          await page
            .locator(`${NAV} [aria-label="Home"] ${LABEL}`)
            .evaluate((el) => el.getBoundingClientRect().height),
        ).toBe(0);
        await scrollTo(page, 60);
        await expect(page.locator(NAV)).not.toHaveAttribute('data-minimized');
        await page.waitForTimeout(50);
        expect(await itemSizes(page)).toEqual(Array(4).fill(EXPANDED));
      });
    });

    test.describe('labels', () => {
      test('every item shows its label under its icon', async ({ page }) => {
        await open(page);
        for (const name of ['Home', 'Search', 'Wallet', 'Profile']) {
          const label = page.locator(`${NAV} [aria-label="${name}"] ${LABEL}`);
          await expect(label).toHaveCSS('opacity', '1');
          expect(await labelWidth(page, name)).toBeGreaterThan(20);
          const [icon, text] = await page
            .getByRole('button', { name })
            .evaluate((el) => [
              el.querySelector('svg')!.getBoundingClientRect().bottom,
              el
                .querySelector('[data-slot="bottom-navigation-label"]')!
                .getBoundingClientRect().top,
            ]);
          expect(text).toBeGreaterThanOrEqual(icon - 0.5);
        }
      });

      test.describe('beside', () => {
        const beside = { labels: 'beside' };

        test('only the selected item shows its label, next to its icon', async ({
          page,
        }) => {
          await open(page, undefined, beside);
          expect(await labelWidth(page, 'Home')).toBeGreaterThan(20);
          const [icon, text] = await page
            .getByRole('button', { name: 'Home' })
            .evaluate((el) => [
              el.querySelector('svg')!.getBoundingClientRect().right,
              el
                .querySelector('[data-slot="bottom-navigation-label"]')!
                .getBoundingClientRect().left,
            ]);
          expect(text).toBeGreaterThanOrEqual(icon - 0.5);
          for (const name of ['Search', 'Wallet', 'Profile']) {
            expect(await labelWidth(page, name)).toBe(0);
            await expect(
              page.locator(`${NAV} [aria-label="${name}"] ${LABEL}`),
            ).toHaveCSS('opacity', '0');
          }
        });

        test('selecting an item opens its label as the other one closes, the highlight around it', async ({
          page,
        }) => {
          await open(page, undefined, beside);
          const home = await labelWidth(page, 'Home');
          // Both labels' widths, frame after frame.
          const frames = page.locator(NAV).evaluate(
            (nav) =>
              new Promise<number[][]>((resolve) => {
                const out: number[][] = [];
                const width = (name: string) =>
                  nav
                    .querySelector(
                      `[aria-label="${name}"] [data-slot="bottom-navigation-label"]`,
                    )!
                    .getBoundingClientRect().width;
                const start = performance.now();
                const tick = (now: number) => {
                  out.push([width('Home'), width('Wallet')]);
                  if (now - start < 700) requestAnimationFrame(tick);
                  else resolve(out);
                };
                requestAnimationFrame(tick);
              }),
          );
          await page.getByRole('button', { name: 'Wallet' }).click();
          await expect.poll(() => labelWidth(page, 'Home')).toBe(0);
          await settled(page, 'Wallet');
          const wallet = await labelWidth(page, 'Wallet');
          expect(wallet).toBeGreaterThan(20);
          // Mid-way, one opens while the other closes.
          expect(
            (await frames).some(
              ([closing, opening]) =>
                closing > 1 &&
                closing < home - 1 &&
                opening > 1 &&
                opening < wallet - 1,
            ),
          ).toBe(true);
        });

        // The item's size to grow back to was measured with its label still
        // folded: it stopped icon-wide and its label then pushed it open.
        test('minimized, every item is its icon; grown back, the selected one opens its label at once', async ({
          page,
        }) => {
          await open(page, 'minimize', beside);
          const home = page.getByRole('button', { name: 'Home' });
          const full = (await home.boundingBox())!.width;
          await minimize(page);
          await expect
            .poll(() => itemSizes(page))
            .toEqual(Array(4).fill([48, 48]));
          await expect.poll(() => labelWidth(page, 'Home')).toBe(0);
          // Its width once its size animation ends.
          const released = home.evaluate(
            (el) =>
              new Promise<number>((resolve) => {
                let sized = false;
                const tick = () => {
                  if (el.getAnimations().length) sized = true;
                  else if (sized)
                    return resolve(el.getBoundingClientRect().width);
                  requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
              }),
          );
          await scrollTo(page, 60);
          expect(Math.abs((await released) - full)).toBeLessThan(1);
          await expect.poll(() => inlineSizes(page)).toEqual(['', '', '', '']);
          await settled(page, 'Home');
        });

        // Bug: the label faded in late (and out early): the pill stood open
        // with no text in it.
        test('the selected label shows as much as its pill is open', async ({
          page,
        }) => {
          await open(page, 'minimize', beside);
          const full = await labelWidth(page, 'Home');
          const label = page.locator(`${NAV} [aria-label="Home"] ${LABEL}`);
          const frames = label.evaluate(
            (el) =>
              new Promise<number[][]>((resolve) => {
                const out: number[][] = [];
                const start = performance.now();
                const tick = (now: number) => {
                  out.push([
                    el.getBoundingClientRect().width,
                    Number(getComputedStyle(el).opacity),
                  ]);
                  if (now - start < 1600) requestAnimationFrame(tick);
                  else resolve(out);
                };
                requestAnimationFrame(tick);
              }),
          );
          await minimize(page);
          await page.waitForTimeout(700);
          await scrollTo(page, 60);
          for (const [width, opacity] of await frames)
            expect(opacity).toBeGreaterThan(width / full - 0.45);
        });

        // Bug: the press's focus grew the bar before its click selected: the
        // item grew to an icon's width, then jumped open once let go.
        test('tapping a minimized item grows it open in one move', async ({
          page,
        }) => {
          await open(page, 'minimize', beside);
          await minimize(page);
          await expect
            .poll(() => itemSizes(page))
            .toEqual(Array(4).fill([48, 48]));
          const wallet = page.getByRole('button', { name: 'Wallet' });
          // Each frame's time and width.
          const widths = wallet.evaluate(
            (el) =>
              new Promise<number[][]>((resolve) => {
                const out: number[][] = [];
                const start = performance.now();
                const tick = (now: number) => {
                  out.push([now, el.getBoundingClientRect().width]);
                  if (now - start < 1200) requestAnimationFrame(tick);
                  else resolve(out);
                };
                requestAnimationFrame(tick);
              }),
          );
          await wallet.click();
          const frames = await widths;
          expect(frames.at(-1)![1]).toBeGreaterThan(80);
          const steps = frames.slice(1).map(([time, width], index) => {
            const [before, previous] = frames[index]!;
            return (width - previous) / Math.max(time - before, 1);
          });
          // In px per ms: the spring peaks well under 1.
          expect(Math.max(...steps)).toBeLessThan(1);
          expect(Math.min(...steps)).toBeGreaterThan(-0.05);
        });

        test('under reduced motion, labels switch at once', async ({
          page,
        }) => {
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await open(page, undefined, beside);
          await page.getByRole('button', { name: 'Wallet' }).click();
          await page.waitForTimeout(50);
          expect(await labelWidth(page, 'Home')).toBe(0);
          expect(await labelWidth(page, 'Wallet')).toBeGreaterThan(20);
        });
      });

      test('without labels, items are icons only', async ({ page }) => {
        await open(page, undefined, { labels: 'none' });
        await expect(page.locator(LABEL)).toHaveCount(0);
      });
    });

    test.describe('accessory', () => {
      const accessoryBox = (page: Page) =>
        page.getByRole('button', { name: 'New payment' }).boundingBox();

      const barRight = async (page: Page) => {
        const bar = (await page.locator(`${NAV} ul`).boundingBox())!;
        return bar.x + bar.width;
      };

      test('it sits beside the bar and minimizes with it', async ({ page }) => {
        await open(page, 'minimize');
        const accessory = page.getByRole('button', { name: 'New payment' });
        const barHeight = async () =>
          (await page.locator(`${NAV} ul`).boundingBox())!.height;
        await expect(accessory).toBeVisible();
        expect((await accessoryBox(page))!.x).toBeGreaterThan(
          await barRight(page),
        );
        const expanded = (await page.locator(ACCESSORY).boundingBox())!;
        expect(Math.abs(expanded.height - (await barHeight()))).toBeLessThan(
          0.5,
        );
        await minimize(page);
        await page.waitForTimeout(80);
        const mid = (await page.locator(ACCESSORY).boundingBox())!.height;
        expect(mid).toBeLessThan(expanded.height - 0.5);
        await expect
          .poll(
            async () => (await page.locator(ACCESSORY).boundingBox())!.height,
          )
          .toBeLessThan(expanded.height - 10);
        await page.waitForTimeout(700);
        const minimized = (await page.locator(ACCESSORY).boundingBox())!;
        expect(Math.abs(minimized.height - (await barHeight()))).toBeLessThan(
          0.5,
        );
        expect(minimized.x).toBeGreaterThan(await barRight(page));
        await expect
          .poll(() =>
            page
              .locator(ACCESSORY)
              .evaluate((el) => (el as HTMLElement).style.width),
          )
          .toBe('');
      });

      test('pressing or focusing it keeps the bar minimized', async ({
        page,
      }) => {
        await open(page, 'minimize');
        await minimize(page);
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
