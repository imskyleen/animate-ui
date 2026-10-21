import { expect, test, type Page } from '../test';

const trigger = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

export async function moveTo(page: Page, name: string) {
  const box = (await trigger(page, name).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 5,
  });
}

export async function press(page: Page) {
  await page.mouse.down();
  await page.mouse.up();
}

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
  library: 'radix-ui' | 'base-ui' | 'vue-reka-ui',
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
      await page.waitForTimeout(300);
      await trigger(page, 'Getting started').click();
      await expanded(page, 'Getting started', false);
    });

    if (library === 'radix-ui')
      test("opened again by Radix's hover timer after a double-click, it closes on the next click", async ({
        page,
      }) => {
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
