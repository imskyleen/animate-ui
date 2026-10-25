import { expect, test } from '../test';

import { describeSidebar } from './sidebar-cases';

describeSidebar(
  'vue-reka-ui',
  '/examples/vue/reka-ui/sidebar',
  '/docs/vue/primitives/reka-ui/sidebar',
);

// Bug: collapsed from the start, the trigger's panel icon played its narrowing on load.
test('vue sidebar collapsed from the start: the trigger icon shows narrowed at once', async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: 'sidebar_state', value: 'false', url: 'http://localhost:3300' },
  ]);
  await page.addInitScript(() => {
    const w = window as unknown as { __shifts: number[] };
    w.__shifts = [];
    const tick = () => {
      const part = document.querySelector(
        '[data-sidebar="trigger"] svg > :last-child',
      );
      if (part)
        w.__shifts.push(new DOMMatrix(getComputedStyle(part).transform).e);
      if (w.__shifts.length < 120) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto('/tests/vue-demos/reka-ui/sidebar', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(600);
  const shifts = await page.evaluate(
    () => (window as unknown as { __shifts: number[] }).__shifts,
  );
  expect(shifts.length).toBeGreaterThan(10);
  expect(shifts.filter((x) => x > -1.95)).toEqual([]);
});

// Bug: Motion for Vue's focus listeners made the icon's SVG focusable: a click
// on it focused the SVG (with an outline) instead of the button, and Tab
// stopped on its parts.
test('vue sidebar trigger: a click on its icon focuses the button, and Tab skips the icon', async ({
  page,
}) => {
  await page.goto('/tests/vue-demos/reka-ui/sidebar', {
    waitUntil: 'networkidle',
  });
  await page.locator('[data-slot="vue-demo"][data-mounted]').waitFor();
  const trigger = page.locator('[data-sidebar="trigger"]');
  const icon = (await trigger.locator('svg').boundingBox())!;
  await page.mouse.click(icon.x + icon.width / 2, icon.y + icon.height / 2);
  const focused = () =>
    page.evaluate(() => ({
      tag: document.activeElement!.tagName,
      trigger: document.activeElement!.matches('[data-sidebar="trigger"]'),
      outlined: [
        ...document.querySelectorAll('[data-sidebar="trigger"] *'),
      ].some((el) => el.matches(':focus')),
    }));
  expect(await focused()).toEqual({
    tag: 'BUTTON',
    trigger: true,
    outlined: false,
  });
  await page.keyboard.press('Tab');
  expect((await focused()).tag).not.toBe('svg');
  expect((await focused()).trigger).toBe(false);
});
