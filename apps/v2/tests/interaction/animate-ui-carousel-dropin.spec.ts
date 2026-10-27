import { expect, test, type Page } from '../test';

import { FRAMEWORKS } from './animate-ui-frameworks';

// Every box of shadcn/ui's carousel demos: the carousels, their slides and
// arrows, at rest and after a couple of steps.
const boxes = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-demo]')].map((demo) =>
      [
        '[data-slot="carousel"]',
        '[data-slot="carousel-content"]',
        '[data-slot="carousel-item"]',
        '[data-slot="card"]',
        '[data-slot="carousel-previous"]',
        '[data-slot="carousel-next"]',
      ].map((selector) =>
        [...demo.querySelectorAll(selector)].map((el) => {
          const box = el.getBoundingClientRect();
          return [box.x, box.y, box.width, box.height].map((n) =>
            Math.round(n * 10),
          );
        }),
      ),
    ),
  );

for (const framework of FRAMEWORKS) {
  const shadcn = framework.vue
    ? '/tests/vue-demos/fixtures/shadcn-carousel-demos'
    : '/tests/fixtures/shadcn-carousel-demos';

  const layout = async (page: Page, url: string) => {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const rest = await boxes(page);
    for (const demo of ['default', 'size', 'spacing', 'orientation']) {
      const next = page.locator(`[data-demo="${demo}"] [data-slot="carousel-next"]`);
      await next.click();
      await page.waitForTimeout(500);
      await next.click();
    }
    await page.waitForTimeout(1200);
    return { rest, moved: await boxes(page) };
  };

  test.describe(`${framework.name} carousel, without its options`, () => {
    for (const width of [1280, 390])
      test(`lays shadcn/ui's demos out like shadcn/ui's carousel, at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 1600 });
        const theirs = await layout(page, shadcn);
        const ours = await layout(page, framework.fixture('carousel-demos'));
        expect(ours).toEqual(theirs);
      });
  });
}
