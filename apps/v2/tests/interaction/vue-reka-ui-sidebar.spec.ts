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

// #193: across the gaps between buttons, the highlight left and came back,
// starting over from an older copy: it stepped back mid-glide
test('vue sidebar: swept quickly down its buttons, the highlight never steps back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 800 });
  await page.goto('/tests/vue-demos/reka-ui/sidebar', {
    waitUntil: 'networkidle',
  });
  await page.locator('[data-slot="vue-demo"][data-mounted]').waitFor();
  const button = (name: string) =>
    page
      .locator('[data-sidebar="menu-button"]', { hasText: name })
      .first()
      .boundingBox();
  const top = (await button('Playground'))!;
  const bottom = (await button('Documentation'))!;
  const x = top.x + 40;
  const from = top.y + top.height / 2;
  const to = bottom.y + bottom.height / 2;
  for (let pass = 0; pass < 3; pass++) {
    await page.mouse.move(x, from);
    await page.waitForTimeout(600);
    const painted = page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const tops: number[] = [];
          // A resize observer runs after layout, right before the paint
          const tick = document.createElement('div');
          tick.style.cssText =
            'position:fixed;top:0;left:0;width:1px;height:1px';
          document.body.append(tick);
          const observer = new ResizeObserver(() => {
            const shown = [
              ...document.querySelectorAll<HTMLElement>(
                '[data-slot="trigger-highlight"]',
              ),
            ].sort(
              (a, b) =>
                Number(getComputedStyle(b).opacity) -
                Number(getComputedStyle(a).opacity),
            )[0];
            if (shown) tops.push(shown.getBoundingClientRect().top);
          });
          observer.observe(tick);
          const start = performance.now();
          const loop = () => {
            tick.style.width = tick.style.width === '1px' ? '2px' : '1px';
            if (performance.now() - start < 700) requestAnimationFrame(loop);
            else {
              observer.disconnect();
              tick.remove();
              resolve(tops);
            }
          };
          requestAnimationFrame(loop);
        }),
    );
    for (let step = 1; step <= 12; step++) {
      await page.mouse.move(x, from + ((to - from) * step) / 12);
      await page.waitForTimeout(8);
    }
    const tops = await painted;
    expect(tops.length).toBeGreaterThan(20);
    for (let i = 1; i < tops.length; i++)
      expect(tops[i]!, `pass ${pass}, frame ${i}`).toBeGreaterThanOrEqual(
        tops[i - 1]! - 1,
      );
  }
});
