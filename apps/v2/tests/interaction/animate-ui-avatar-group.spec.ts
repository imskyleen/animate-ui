import { expect, test, type Page } from '@playwright/test';

const open = (page: Page) =>
  page.goto('/tests/demos/animate-ui/avatar-group', {
    waitUntil: 'networkidle',
  });

const avatar = (page: Page, name: string) =>
  page.getByRole('img', { name, exact: true });

/** The element that rises: the avatar's motion wrapper. */
const riseOf = (page: Page, name: string) =>
  avatar(page, name)
    .locator('..')
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);

test.describe('animate-ui avatar-group', () => {
  test('the hovered avatar rises on a spring and shows its tooltip', async ({
    page,
  }) => {
    await open(page);
    expect(await riseOf(page, 'Adam Wathan')).toBe(0);
    await avatar(page, 'Adam Wathan').hover();
    await page.waitForTimeout(60);
    const during = await riseOf(page, 'Adam Wathan');
    // -30% of the 48px avatar.
    expect(during).toBeLessThan(0);
    expect(during).toBeGreaterThan(-14.4);
    await expect(page.getByRole('tooltip')).toContainText('Adam Wathan');
    await expect.poll(() => riseOf(page, 'Adam Wathan')).toBeCloseTo(-14.4, 0);
  });

  test('one tooltip glides between avatars; leaving lowers them', async ({
    page,
  }) => {
    await open(page);
    await avatar(page, 'Skyleen').hover();
    await expect(page.getByRole('tooltip')).toContainText('Skyleen');
    await avatar(page, 'Jhey').hover();
    await expect(page.getByRole('tooltip')).toContainText('Jhey');
    await expect(page.locator('[data-slot="tooltip-content"]')).toHaveCount(1);
    await expect.poll(() => riseOf(page, 'Skyleen')).toBeCloseTo(0, 0);

    await page.mouse.move(5, 5);
    await expect(page.locator('[data-slot="tooltip-content"]')).toHaveCount(0);
    await expect.poll(() => riseOf(page, 'Jhey')).toBeCloseTo(0, 0);
  });

  test('focusing an avatar shows its tooltip', async ({ page }) => {
    await open(page);
    await avatar(page, 'Shadcn').focus();
    await expect(page.getByRole('tooltip')).toContainText('Shadcn');
  });

  test('reduced motion: the avatar rises at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    await avatar(page, 'Jhey').hover();
    await page.waitForTimeout(60);
    expect(await riseOf(page, 'Jhey')).toBeCloseTo(-14.4, 0);
  });
});
