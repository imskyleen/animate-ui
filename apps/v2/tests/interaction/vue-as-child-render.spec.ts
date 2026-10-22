import { expect, test, type Page } from '../test';

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/vue-demos/fixtures/as-child-render', {
    waitUntil: 'networkidle',
  });
});

// Bug: in Vue, `as-child` on an animated part rendered reka-ui's plain part, without its motion.
const CASES = [
  ['reka-collapsible', 'data-state', 'height', null],
  ['reka-accordion', 'data-state', 'height', null],
  ['reka-progress', 'data-state', 'transform', null],
  ['reka-menu', 'role', 'opacity', 'Reka menu'],
  ['reka-popover', 'role', 'opacity', 'Reka popover'],
  ['reka-overlay', 'data-state', 'backgroundColor', 'Reka dialog'],
  ['reka-dialog', 'role', 'opacity', 'Reka dialog'],
] as const;

const part = (page: Page, id: string) => page.getByTestId(id);

for (const [id, attribute, property, opener] of CASES)
  test(`vue as-child: ${id} is the given element, animated`, async ({ page }) => {
    if (opener) await page.getByRole('button', { name: opener }).click();
    const element = part(page, id);
    await expect(element).toHaveCount(1);
    expect(await element.evaluate((el) => el.tagName)).toBe('SECTION');
    await expect(element).toHaveAttribute(attribute);
    await expect
      .poll(() =>
        element.evaluate(
          (el, prop) =>
            (el as HTMLElement).style.getPropertyValue(prop) ||
            (el.getAnimations().some((a) =>
              (a.effect as KeyframeEffect).getKeyframes().some((k) => prop in k),
            )
              ? 'animated'
              : ''),
          property,
        ),
      )
      .not.toBe('');
  });
