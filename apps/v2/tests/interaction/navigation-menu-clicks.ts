import { expect, test, type Page } from '@playwright/test';

// Clicking a navigation menu's triggers (shared by the Radix UI and Base UI
// navigation menu specs). A mouse always reaches a trigger before it clicks
// it, and that opens its item (or switches the menu to it): a click on it
// right after (Base UI's "patient click", 500ms) keeps the menu open, as
// Base UI keeps it after a hover opened it from closed. Base UI forgot it
// after a hover switched items, and Radix always toggled: the click closed
// the menu the pointer had just opened. Later clicks, a second click, clicks
// on an item a click opened, and the keyboard still toggle it closed.

const trigger = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

/** Moves the pointer onto a trigger (its center), in a few steps. */
export async function moveTo(page: Page, name: string) {
  const box = (await trigger(page, name).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 5,
  });
}

/** Presses the mouse where it is, as a click. */
export async function press(page: Page) {
  await page.mouse.down();
  await page.mouse.up();
}

/**
 * Waits for an element's item to open, seen within a frame (an assertion
 * polls up to 500ms apart: past the window a click keeps it open in).
 */
export async function opened(page: Page, locator: ReturnType<Page['locator']>) {
  await page.waitForFunction(
    (el) => el?.getAttribute('aria-expanded') === 'true',
    await locator.elementHandle(),
    { polling: 'raf' },
  );
}

const expanded = (page: Page, name: string, open: boolean) =>
  expect(trigger(page, name)).toHaveAttribute(
    'aria-expanded',
    open ? 'true' : 'false',
  );

/** Getting started opened by the pointer, then Components switched to. */
async function switchToComponents(page: Page) {
  await moveTo(page, 'Getting started');
  await expanded(page, 'Getting started', true);
  await page.waitForTimeout(700);
  await moveTo(page, 'Components');
  await opened(page, trigger(page, 'Components'));
}

export function describeNavigationMenuClicks(
  title: string,
  path: string,
  library: 'radix-ui' | 'base-ui',
) {
  test.describe(title, () => {
    test.describe.configure({ timeout: 180_000 });
    test.use({ viewport: { width: 1280, height: 800 } });
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
    });

    test('a click right after the pointer switched to another item keeps it open', async ({
      page,
    }) => {
      await switchToComponents(page);
      await page.waitForTimeout(100);
      await press(page);
      await page.waitForTimeout(400);
      await expanded(page, 'Components', true);
      await expect(
        page.getByRole('link', { name: /Alert Dialog/ }),
      ).toBeVisible();
    });

    test('a click right after the pointer opened an item keeps it open', async ({
      page,
    }) => {
      await moveTo(page, 'Getting started');
      await opened(page, trigger(page, 'Getting started'));
      await page.waitForTimeout(100);
      await press(page);
      await page.waitForTimeout(400);
      await expanded(page, 'Getting started', true);
    });

    test('kept open, it closes on the next click', async ({ page }) => {
      await switchToComponents(page);
      await page.waitForTimeout(100);
      await press(page);
      await page.waitForTimeout(100);
      await press(page);
      await expanded(page, 'Components', false);
    });

    if (library === 'base-ui')
      test('kept open, it stays open as the pointer leaves, like Base UI pins it', async ({
        page,
      }) => {
        await switchToComponents(page);
        await page.waitForTimeout(100);
        await press(page);
        await page.mouse.move(5, 5, { steps: 5 });
        await page.waitForTimeout(400);
        await expanded(page, 'Components', true);
      });

    test('a patient click still closes it', async ({ page }) => {
      await switchToComponents(page);
      await page.waitForTimeout(700);
      await press(page);
      await expanded(page, 'Components', false);
    });

    test('an item a click opened closes on the next click', async ({
      page,
    }) => {
      await trigger(page, 'Getting started').click();
      await expanded(page, 'Getting started', true);
      // (Past Radix's hover delay: its own timer, armed as the pointer
      // arrived, would open it again.)
      await page.waitForTimeout(300);
      await trigger(page, 'Getting started').click();
      await expanded(page, 'Getting started', false);
    });

    if (library === 'radix-ui')
      test("opened again by Radix's hover timer after a double-click, it closes on the next click", async ({
        page,
      }) => {
        // The double-click opens it and closes it before Radix's hover
        // delay; its timer, armed as the pointer arrived, opens it again.
        const box = (await trigger(page, 'Getting started').boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.dblclick(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        await expanded(page, 'Getting started', true);
        await page.waitForTimeout(100);
        await press(page);
        await expanded(page, 'Getting started', false);
      });

    test('from the keyboard, the item the pointer switched to closes at once', async ({
      page,
    }) => {
      await switchToComponents(page);
      await trigger(page, 'Components').focus();
      await page.keyboard.press('Enter');
      await expanded(page, 'Components', false);
    });
  });
}
