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
