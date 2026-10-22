import { expect, test, type Page } from '../test';

import {
  describeNavigationMenuClicks,
  moveTo,
  opened,
  press,
} from './navigation-menu-clicks';
import { probeFirstFrame, sample } from './motion-probe';
import {
  describeNavigationMenuBackdrop,
  describeNavigationMenuSwap,
  describeNavigationMenuTriggerColors,
  describeNavigationMenuTriggers,
} from './navigation-menu-swap';
import { describeBaseNavigationMenuCases } from './navigation-menu-cases';

const POPUP = '[class*="h-(--popup-height)"]';

const size = (page: Page) =>
  page
    .locator(POPUP)
    .evaluate((el) => ({ width: (el as HTMLElement).offsetWidth }));

test.describe('base-ui navigation-menu demo', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/navigation-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('the popup scales and fades in from its trigger in 220ms', async ({
    page,
  }) => {
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('button', { name: 'Getting started' }).click();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
    expect(first.scale).toBeLessThan(1);
    expect(first.scale).toBeGreaterThanOrEqual(0.899);
    await page.waitForTimeout(400);
    const settled = await sample(page, POPUP);
    expect(settled.opacity).toBe(1);
    expect(settled.scale).toBe(1);
  });

  test('moving to another item resizes the popup smoothly', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    const before = await size(page);
    const widths = page.evaluate(
      (selector) =>
        new Promise<number[]>((resolve) => {
          const seen: number[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = document.querySelector<HTMLElement>(selector);
            if (el) seen.push(el.offsetWidth);
            if (performance.now() - t0 < 700) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
      POPUP,
    );
    await page.getByRole('button', { name: 'Components' }).hover();
    const seen = await widths;
    const after = await size(page);
    expect(after.width).toBeGreaterThan(before.width);
    expect(seen.some((w) => w > before.width + 1 && w < after.width - 1)).toBe(
      true,
    );
  });

  test('the new content fades in', async ({ page }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(700);
    const probe = await probeFirstFrame(
      page,
      '[data-slot="navigation-menu-content"][data-activation-direction="right"]',
    );
    await page.getByRole('button', { name: 'Components' }).hover();
    const first = await probe.firstFrame();
    expect(first.opacity).toBeLessThan(1);
  });

  test('hovering from one item to the next, the popup never fades or shrinks', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Getting started' }).hover();
    await page.waitForTimeout(700);
    const looks = page.evaluate(
      (selector) =>
        new Promise<{ opacity: number; transform: string }[]>((resolve) => {
          const seen: { opacity: number; transform: string }[] = [];
          const t0 = performance.now();
          const tick = () => {
            const el = document.querySelector(selector);
            if (el) {
              const style = getComputedStyle(el);
              seen.push({
                opacity: Number(style.opacity),
                transform: style.transform,
              });
            }
            if (performance.now() - t0 < 500) requestAnimationFrame(tick);
            else resolve(seen);
          };
          tick();
        }),
      POPUP,
    );
    const next = (await page
      .getByRole('button', { name: 'Components' })
      .boundingBox())!;
    await page.mouse.move(next.x + next.width / 2, next.y + next.height / 2);
    const seen = await looks;
    expect(seen.length).toBeGreaterThan(10);
    for (const look of seen) {
      expect(look.opacity).toBe(1);
      expect(look.transform).toBe('none');
    }
  });

  test('leaving every item by hover still closes it, then unmounts', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Getting started' }).hover();
    await page.waitForTimeout(700);
    await page.mouse.move(5, 700);
    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPUP)).toHaveCount(0, { timeout: 1500 });
  });

  test('closes the same way, then unmounts', async ({ page }) => {
    await page.getByRole('button', { name: 'Getting started' }).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await sample(page, POPUP)).opacity, {
        intervals: [16],
      })
      .toBeLessThan(1);
    await expect(page.locator(POPUP)).toHaveCount(0, {
      timeout: 600,
    });
  });

  test('reduced motion: no scale, the size jumps', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const probe = await probeFirstFrame(page, POPUP);
    await page.getByRole('button', { name: 'Getting started' }).click();
    const first = await probe.firstFrame();
    expect(first.scale).toBe(1);
    expect(first.opacity).toBeLessThan(1);
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: 'Components' }).hover();
    await page.waitForTimeout(150);
    const during = await size(page);
    await page.waitForTimeout(400);
    expect(during.width).toBe((await size(page)).width);
  });
});

test.describe('base-ui navigation-menu API', () => {
  test.describe.configure({ timeout: 180_000 });
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-navigation-menu', {
      waitUntil: 'networkidle',
    });
  });

  test('controlled, a click right after the pointer switched to another item keeps it open', async ({
    page,
  }) => {
    await moveTo(page, 'Controlled one');
    await opened(page, page.getByRole('button', { name: 'Controlled one' }));
    await page.waitForTimeout(700);
    await moveTo(page, 'Controlled two');
    const two = page.getByRole('button', { name: 'Controlled two' });
    await opened(page, two);
    await page.waitForTimeout(100);
    await press(page);
    await page.waitForTimeout(400);
    await expect(two).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('value')).toHaveText('two');
  });

  test('controlled value, onValueChange and onOpenChangeComplete', async ({
    page,
  }) => {
    await expect(page.getByTestId('value')).toHaveText('none');
    await page.getByRole('button', { name: 'Controlled one' }).click();
    await expect(page.getByTestId('value')).toHaveText('one');
    await expect(page.getByRole('link', { name: 'Link one' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('value')).toHaveText('none');
    await expect(page.getByTestId('complete')).toHaveText('closed', {
      timeout: 600,
    });
    await expect(page.getByRole('link', { name: 'Link one' })).toHaveCount(0);
  });

  test('the parent can close it, and a user actionsRef is set', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Controlled one' }).click();
    await expect(page.getByRole('link', { name: 'Link one' })).toBeVisible();
    await page.getByTestId('check-actions').dispatchEvent('click');
    await expect(page.getByTestId('has-actions')).toHaveText('true');
    await page.getByTestId('close').dispatchEvent('click');
    await expect(page.getByTestId('value')).toHaveText('none');
    await expect(page.getByRole('link', { name: 'Link one' })).toHaveCount(0, {
      timeout: 600,
    });
  });
});

describeNavigationMenuSwap(
  'base-ui navigation-menu content',
  '/tests/demos/base-ui/navigation-menu',
  { container: '[class*="h-(--popup-height)"]', moves: true },
);

describeNavigationMenuTriggers(
  'base-ui navigation-menu',
  '/tests/demos/base-ui/navigation-menu',
);

describeBaseNavigationMenuCases();

describeNavigationMenuTriggerColors(
  'base-ui navigation-menu',
  '/tests/demos/base-ui/navigation-menu',
);

describeNavigationMenuClicks(
  'base-ui navigation-menu clicks',
  '/tests/demos/base-ui/navigation-menu',
  'base-ui',
);

describeNavigationMenuBackdrop(
  'base-ui navigation-menu',
  '/tests/demos/base-ui/navigation-menu',
);
