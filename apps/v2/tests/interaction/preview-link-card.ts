import { expect, test, type Page } from '../test';
import { describeAnchoredOverlay, gotoReady } from './anchored-overlay';

const SCREENSHOT = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135"><rect width="240" height="135" fill="#3b82f6"/></svg>`;

export async function stubScreenshots(page: Page) {
  const requests: string[] = [];
  await page.route(
    (url) =>
      url.hostname === 'api.microlink.io' ||
      url.hostname === 'screenshots.test',
    (route) => {
      requests.push(route.request().url());
      return route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: SCREENSHOT,
      });
    },
  );
  return requests;
}

export const DEMO_HREF = 'https://animate-ui.com/docs';

export function expectMicrolinkQuery(
  src: string,
  {
    href = DEMO_HREF,
    width = 240,
    height = 135,
    deviceScaleFactor = 1,
    colorScheme = 'light',
  } = {},
) {
  const url = new URL(src);
  expect(url.origin + url.pathname).toBe('https://api.microlink.io/');
  expect(Object.fromEntries(url.searchParams)).toEqual({
    url: href,
    screenshot: 'true',
    meta: 'false',
    embed: 'screenshot.url',
    colorScheme,
    'viewport.isMobile': 'true',
    'viewport.deviceScaleFactor': String(deviceScaleFactor),
    'viewport.width': String(width * 3),
    'viewport.height': String(height * 3),
  });
}

type PreviewLinkCardCase = {
  library: 'radix-ui' | 'base-ui' | 'react-aria' | 'vue-reka-ui';
  selector: string;
  openDelay: number;
  closeDelay: number;
};

export function describePreviewLinkCard(c: PreviewLinkCardCase) {
  const vue = c.library === 'vue-reka-ui';
  const path = vue
    ? '/tests/vue-demos/reka-ui/preview-link-card'
    : `/tests/demos/${c.library}/preview-link-card`;
  const fixture = vue
    ? '/tests/vue-demos/fixtures/preview-link-card'
    : '/tests/fixtures/preview-link-card';
  const trigger = (page: Page) =>
    page.getByRole('link', { name: 'Animate UI Docs' }).first();

  test.beforeEach(async ({ page }) => {
    await stubScreenshots(page);
  });

  describeAnchoredOverlay(`${c.library} preview-link-card demo`, {
    path,
    selector: c.selector,
    open: (page) => trigger(page).hover(),
    close: (page) => page.mouse.move(5, 5, { steps: 4 }),
    closeDelay: c.closeDelay,
  });

  test.describe(`${c.library} preview-link-card`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, path);
    });

    test('preloads the screenshot as soon as it mounts, before any hover', async ({
      page,
    }) => {
      const preload = page.locator('head link[rel="preload"][as="image"]');
      await expect(preload).toHaveCount(1);
      expectMicrolinkQuery((await preload.getAttribute('href'))!);
      await expect(page.locator(c.selector)).toHaveCount(0);
    });

    test(`opens on hover after the library's delay (${c.openDelay}ms)`, async ({
      page,
    }) => {
      const t0 = Date.now();
      await trigger(page).hover();
      await page.waitForTimeout(c.openDelay / 2);
      await expect(page.locator(c.selector)).toHaveCount(0);
      await page.locator(c.selector).waitFor();
      expect(Date.now() - t0).toBeGreaterThanOrEqual(c.openDelay * 0.9);
    });

    test('shows the screenshot, in a card that links to the page', async ({
      page,
    }) => {
      await expect(trigger(page)).toHaveAttribute('href', DEMO_HREF);
      await trigger(page).hover();
      const card = page.locator(c.selector);
      await expect(card).toBeVisible();
      const image = card.getByRole('img', { name: 'Animate UI Docs' });
      await expect(image).toBeVisible();
      expectMicrolinkQuery((await image.getAttribute('src'))!);
      await expect(image).toHaveAttribute('width', '240');
      await expect(image).toHaveAttribute('height', '135');
      await expect
        .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
        .toBe(240);
      const link = card.locator('xpath=descendant-or-self::a').first();
      await expect(link).toHaveAttribute('href', DEMO_HREF);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(card).toHaveCSS('transform', 'none', { timeout: 3000 });
      const [cardBox, imageBox] = await Promise.all([
        card.boundingBox(),
        image.boundingBox(),
      ]);
      expect(Math.abs(cardBox!.height - imageBox!.height)).toBeLessThanOrEqual(
        1,
      );
      expect(Math.abs(cardBox!.width - imageBox!.width)).toBeLessThanOrEqual(1);
    });
  });

  test.describe(`${c.library} preview-link-card props`, () => {
    test.describe.configure({ timeout: 180_000 });
    test.beforeEach(async ({ page }) => {
      await gotoReady(page, fixture);
    });

    test('src: an image of your own, preloaded, instead of the screenshot', async ({
      page,
    }) => {
      const id = `${c.library}-src`;
      await expect(
        page.locator(`head link[rel="preload"][href="${CUSTOM_SRC}"]`),
      ).not.toHaveCount(0);
      await page.getByRole('link', { name: `${id} link` }).hover();
      const image = page.getByTestId(id).getByRole('img');
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('src', CUSTOM_SRC);
      await expect(
        page.getByTestId(id).locator('xpath=descendant-or-self::a').first(),
      ).toHaveAttribute('href', 'https://example.com/');
    });

    test('width, height, deviceScaleFactor and colorScheme shape the screenshot', async ({
      page,
    }) => {
      const id = `${c.library}-options`;
      await page.getByRole('link', { name: `${id} link` }).hover();
      const image = page.getByTestId(id).getByRole('img');
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute('width', '320');
      await expect(image).toHaveAttribute('height', '180');
      expectMicrolinkQuery((await image.getAttribute('src'))!, {
        href: 'https://example.com/',
        width: 320,
        height: 180,
        deviceScaleFactor: 2,
        colorScheme: 'dark',
      });
    });
  });
}

const CUSTOM_SRC = 'https://screenshots.test/custom.svg';
