import { expect, test, type Page } from '../test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixtures/as-child-render', {
    waitUntil: 'networkidle',
  });
});

const part = (page: Page, id: string) => page.getByTestId(id);

async function expectOwnElement(
  page: Page,
  id: string,
  attribute: string,
  motion: 'height' | 'transform' | 'width' | 'opacity',
) {
  const element = part(page, id);
  await expect(element).toHaveCount(1);
  expect(await element.evaluate((el) => el.tagName)).toBe('SECTION');
  await expect(element).toHaveAttribute(attribute);
  await expect
    .poll(() =>
      element.evaluate(
        (el, property) => (el as HTMLElement).style.getPropertyValue(property),
        motion,
      ),
    )
    .not.toBe('');
}

const CASES = [
  ['radix asChild', 'radix-collapsible', 'data-state', 'height', null],
  ['radix asChild', 'radix-accordion', 'data-state', 'height', null],
  ['radix asChild', 'radix-progress', 'data-state', 'transform', null],
  ['radix asChild', 'radix-range', 'data-orientation', 'transform', null],
  ['radix asChild', 'radix-thumb', 'role', 'transform', null],
  ['radix asChild', 'radix-menu', 'role', 'opacity', 'Radix menu'],
  ['base ui render', 'base-progress', 'style', 'width', null],
  ['base ui render', 'base-range', 'style', 'transform', null],
  ['base ui render', 'base-thumb', 'style', 'transform', null],
  ['base ui render', 'base-menu', 'role', 'opacity', 'Base menu'],
] as const;

for (const [library, id, attribute, motion, opener] of CASES)
  test(`${library}: ${id} is the given element, animated`, async ({ page }) => {
    if (opener) await page.getByRole('button', { name: opener }).click();
    await expectOwnElement(page, id, attribute, motion);
  });
