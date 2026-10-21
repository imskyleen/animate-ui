import type { Page } from '../test';

/** Animate UI's own primitives, in React and in Vue: the same demo, the same tests. */
export const FRAMEWORKS = [
  {
    name: 'animate-ui',
    vue: false,
    demo: (slug: string) => `/tests/demos/animate-ui/${slug}`,
    fixture: (slug: string) => `/tests/fixtures/animate-ui-${slug}`,
  },
  {
    name: 'vue animate-ui',
    vue: true,
    demo: (slug: string) => `/tests/vue-demos/animate-ui/${slug}`,
    fixture: (slug: string) => `/tests/vue-demos/fixtures/animate-ui-${slug}`,
  },
] as const;

export type Framework = (typeof FRAMEWORKS)[number];

/** Waits until the demo answers events: hydrated in React, mounted in Vue. */
export async function ready(page: Page, selector: string) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    if (el.closest('[data-slot="vue-demo"][data-mounted]')) return true;
    return Object.keys(el).some((key) => key.startsWith('__reactProps'));
  }, selector);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}
