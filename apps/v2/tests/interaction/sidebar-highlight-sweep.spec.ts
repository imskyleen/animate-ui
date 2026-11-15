import { expect, test, type Page } from '../test';

// The highlight handed over from a copy left behind (one fading out where the
// pointer left, or an older one) instead of the one shown: swept across the
// menu, it stepped back mid-glide (#193)

type Case = { cpu: number; step: number };

const CASES: Record<string, { path: string; cases: Case[] }> = {
  'radix-ui': {
    path: '/tests/demos/radix-ui/sidebar',
    cases: [
      { cpu: 1, step: 16 },
      { cpu: 4, step: 30 },
    ],
  },
  'vue-reka-ui': {
    path: '/tests/vue-demos/reka-ui/sidebar',
    cases: [
      { cpu: 1, step: 16 },
      { cpu: 4, step: 30 },
    ],
  },
};

function paintedTops(page: Page, ms: number) {
  return page.evaluate(
    (ms) =>
      new Promise<number[]>((resolve) => {
        const tops: number[] = [];
        // A resize observer runs after layout, right before the paint
        const tick = document.createElement('div');
        tick.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px';
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
          if (performance.now() - start < ms) requestAnimationFrame(loop);
          else {
            observer.disconnect();
            tick.remove();
            resolve(tops);
          }
        };
        requestAnimationFrame(loop);
      }),
    ms,
  );
}

for (const [name, { path, cases }] of Object.entries(CASES))
  test.describe(`${name} sidebar highlight, swept across the menu`, () => {
    test.describe.configure({ timeout: 120_000 });
    for (const { cpu, step } of cases)
      test(`${cpu > 1 ? `${cpu}x slower CPU, ` : ''}${step}ms steps: it never steps back`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1100, height: 800 });
        await page.goto(path, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
        const middle = async (label: string) => {
          const box = (await page
            .locator('[data-sidebar="menu-button"]', { hasText: label })
            .first()
            .boundingBox())!;
          return { x: box.x + 40, y: box.y + box.height / 2 };
        };
        const top = await middle('Playground');
        const bottom = await middle('Travel');
        for (let pass = 0; pass < 4; pass++) {
          const [from, to] = pass % 2 ? [bottom.y, top.y] : [top.y, bottom.y];
          const way = Math.sign(to - from);
          await page.mouse.move(top.x, from);
          await page.waitForTimeout(700);
          const painted = paintedTops(page, 1400);
          for (let i = 1; i <= 12; i++) {
            await page.mouse.move(top.x, from + ((to - from) * i) / 12);
            await page.waitForTimeout(step);
          }
          const tops = await painted;
          expect(tops.length).toBeGreaterThan(20);
          for (let i = 1; i < tops.length; i++)
            expect(
              (tops[i]! - tops[i - 1]!) * way,
              `pass ${pass}, frame ${i}`,
            ).toBeGreaterThan(-20);
        }
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      });
  });
