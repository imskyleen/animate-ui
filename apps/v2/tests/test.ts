import { test as base, expect } from '@playwright/test';

export * from '@playwright/test';

const LOCAL =
  /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/|data:|blob:|about:)/;

const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

const STAND_INS: [RegExp, { contentType: string; body: string | Buffer }][] = [
  [
    /^https:\/\/api\.microlink\.io\//,
    { contentType: 'image/png', body: PIXEL },
  ],
  [
    /^https:\/\/api\.github\.com\/repos\//,
    {
      contentType: 'application/json',
      body: JSON.stringify({ stargazers_count: 1234 }),
    },
  ],
];

export const test = base.extend<{
  expectedProblems: RegExp | null;
  guards: void;
}>({
  expectedProblems: [null, { option: true }],
  guards: [
    async ({ page, expectedProblems }, use) => {
      const problems: string[] = [];
      const modalHydration = (text: string) => {
        if (!text.includes('A tree hydrated but some attributes')) return false;
        const changed = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => /^[+-]\s+[\w-]+=/.test(line));
        return (
          changed.length > 0 &&
          changed.every((line) => /\b(inert|aria-hidden)=/.test(line))
        );
      };
      page.on('console', (message) => {
        if (
          message.type() === 'error' &&
          !message.text().includes('/_next/hmr') &&
          !modalHydration(message.text())
        )
          problems.push(`console: ${message.text()}`);
      });
      page.on('pageerror', (error) => problems.push(`page: ${error.message}`));
      // A Vue demo mounts after the page loads: wait for it, wherever a suite navigates.
      const mounted = async () => {
        if (page.url().includes('/vue-demos/'))
          await page
            .locator('[data-slot="vue-demo"][data-mounted]')
            .first()
            .waitFor({ state: 'attached' });
      };
      const goto = page.goto.bind(page);
      page.goto = async (...args) => {
        const response = await goto(...args);
        await mounted();
        return response;
      };
      const reload = page.reload.bind(page);
      page.reload = async (...args) => {
        const response = await reload(...args);
        await mounted();
        return response;
      };
      await page.context().route(
        (url) => !LOCAL.test(url.href),
        (route) => {
          const url = route.request().url();
          const standIn = STAND_INS.find(([pattern]) => pattern.test(url));
          if (standIn) return route.fulfill({ status: 200, ...standIn[1] });
          problems.push(`outside request: ${url}`);
          return route.abort();
        },
      );
      await use();
      expect(
        problems.filter((problem) => !expectedProblems?.test(problem)),
        'console errors and outside requests',
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
