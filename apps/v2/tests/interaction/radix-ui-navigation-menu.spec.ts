import { expect, test, type Page } from '@playwright/test';

import {
  describeNavigationMenuClicks,
  moveTo,
  opened,
  press,
} from './navigation-menu-clicks';
import { probeFirstFrame, sample } from './motion-probe';
import {
  describeNavigationMenuSwap,
  describeNavigationMenuTriggerColors,
  describeNavigationMenuTriggers,
} from './navigation-menu-swap';
import { describeRadixNavigationMenuCases } from './navigation-menu-cases';

const VIEWPORT = '[data-slot="navigation-menu-viewport"]';

const size = (page: Page) =>
  page.locator(VIEWPORT).evaluate((el) => ({
    width: (el as HTMLElement).offsetWidth,
    height: (el as HTMLElement).offsetHeight,
  }));

test.describe('radix-ui navigation-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/radix-ui/navigation-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('the viewport drops in with a 220ms scale and fade', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, VIEWPORT);
    await page.getByRole('button', { name: 'Getting started' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    // From its top edge.
    expect(first.origin.endsWith(' 0px')).toBe(true);
    await page.waitForTimeout(400);
    const settled = await sample(page, VIEWPORT);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('moving to another item resizes the viewport smoothly', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    const before = await size(page);
    // Sampled in the page: the resize is mostly done in ~155ms.
    const widths = page.evaluate(
      (selector) =>
        new Promise<number[]>((resolve) => {
          const seen: number[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = document.querySelector<HTMLElement>(selector);
            if (el) seen.push(el.offsetWidth);
            if (performance.now() - t0 < 600) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
      VIEWPORT,
    );
    await page.getByRole('button', { name: 'Components' }).hover();
    const seen = await widths;
    const after = await size(page);
    expect(after.width).toBeGreaterThan(before.width);
    // Part of the way there on some frames, and never past it.
    expect(seen.some((w) => w > before.width + 1 && w < after.width - 1)).toBe(
      true,
    );
    expect(Math.max(...seen)).toBeLessThanOrEqual(after.width + 0.5);
  });

  test('the new content fades in', async ({ page }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(
      page,
      `${VIEWPORT} [data-motion="from-end"]`,
    );
    await page.getByRole('button', { name: 'Components' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    // It plays an exit (polled: a loaded machine can skip the first frames).
    await expect
      .poll(async () => (await sample(page, VIEWPORT)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(VIEWPORT)).toHaveCount(0, { timeout: 600 });
  });

  test('reduced motion: no scale, the size jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, VIEWPORT);
    await page.getByRole('button', { name: 'Getting started' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Components' }).hover();
    await page.waitForTimeout(80);
    const during = await size(page);
    await page.waitForTimeout(400);
    expect(during.width).toBe((await size(page)).width);
  });
});

test.describe('radix-ui navigation-menu API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/radix-ui-navigation-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('a link trigger the pointer has just opened still navigates when clicked', async ({
    page,
  }) => {
    const link = page.getByRole('link', { name: 'Anchor trigger' });
    const box = (await link.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 5,
    });
    await opened(page, link);
    await page.waitForTimeout(100);
    await press(page);
    await expect(page).toHaveURL(/#anchored$/);
  });

  test('controlled value and onValueChange', async ({ page }) => {
    await expect(page.getByTestId('value')).toHaveText('none');
    await page.getByRole('button', { name: 'Controlled one' }).click();
    await expect(page.getByTestId('value')).toHaveText('one');
    await expect(page.getByRole('link', { name: 'Link one' })).toBeVisible();
    await page.getByRole('button', { name: 'Close it' }).click();
    await expect(page.getByTestId('value')).toHaveText('none');
    await expect(page.getByRole('link', { name: 'Link one' })).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('without a viewport, content scales in and out on its own', async ({
    page,
  }) => {
    const content = '[data-testid="inline"] [aria-labelledby]';
    const probe = await probeFirstFrame(page, `${content}[data-state="open"]`);
    await page.getByRole('button', { name: 'Inline' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBeLessThan(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Inline' }).click();
    await expect(page.getByRole('link', { name: 'Inline link' })).toHaveCount(
      0,
      {
        timeout: 600,
      },
    );
  });

  test('the indicator follows the active trigger', async ({ page }) => {
    const indicator = page.getByTestId('indicator');
    await page.getByRole('button', { name: 'Star one' }).click();
    await expect(indicator).toHaveCount(1);
    await page.waitForTimeout(700);
    const x = () =>
      indicator.evaluate(
        (el) => new DOMMatrix(getComputedStyle(el).transform).m41,
      );
    const start = await x();
    // v1's highlight spring: sampled in the page.
    const xs = indicator.evaluate(
      (el) =>
        new Promise<number[]>((resolve) => {
          const seen: number[] = [];
          const t0 = performance.now();
          const tick = () => {
            seen.push(new DOMMatrix(getComputedStyle(el).transform).m41);
            if (performance.now() - t0 < 700) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
    );
    await page.getByRole('button', { name: 'Star two' }).click();
    const seen = await xs;
    const end = seen.at(-1)!;
    expect(end).toBeGreaterThan(start);
    expect(seen.some((v) => v > start + 1 && v < end - 1)).toBe(true);
  });
});

describeNavigationMenuSwap(
  'radix-ui navigation-menu content',
  '/tests/demos/radix-ui/navigation-menu',
  { container: '[data-slot="navigation-menu-viewport"]', moves: false },
);

describeNavigationMenuTriggers(
  'radix-ui navigation-menu',
  '/tests/demos/radix-ui/navigation-menu',
);

describeRadixNavigationMenuCases();

describeNavigationMenuTriggerColors(
  'radix-ui navigation-menu',
  '/tests/demos/radix-ui/navigation-menu',
);

describeNavigationMenuClicks(
  'radix-ui navigation-menu clicks',
  '/tests/demos/radix-ui/navigation-menu',
  'radix-ui',
);
