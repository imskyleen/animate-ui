import { test, type Page } from '@playwright/test';

// Base UI formats a Progress's and a Slider's numbers in the runtime's locale
// when none is given: the server's (en-US here) on the server, the browser's
// in the browser. In a French browser, "13%" was rendered and "13 %"
// hydrated: React reported the mismatch, and dropped the server's HTML for a
// text one. They're now formatted in en-US until the page has
// hydrated, then in the browser's locale.

/**
 * Loads `path` and tells whether it hydrated cleanly: React reported no
 * mismatch (an attribute's in the console, a text's as an uncaught error),
 * and the elements `selector` matches in the server's HTML, read before
 * React hydrated them, are still the ones on the page (a text's mismatch
 * makes React drop the server's HTML and render it again).
 */
export async function hydratesCleanly(
  page: Page,
  path: string,
  selector: string,
) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  page.on('pageerror', (error) => {
    if (/hydrat/i.test(error.message)) errors.push(error.message);
  });
  await page.addInitScript((selector) => {
    document.addEventListener('DOMContentLoaded', () => {
      const served = [...document.querySelectorAll(selector)];
      Object.assign(window, {
        __served: served,
        // React marks the elements it has hydrated (or rendered).
        __early: served.every(
          (el) => !Object.keys(el).some((key) => key.startsWith('__react')),
        ),
      });
    });
  }, selector);
  await page.goto(path, { waitUntil: 'networkidle' });
  // React hydrates, then renders again in the browser's locale.
  await page.waitForTimeout(500);
  const kept = await page.evaluate((selector) => {
    const { __served: served, __early: early } = window as unknown as {
      __served: Element[];
      __early: boolean;
    };
    const now = [...document.querySelectorAll(selector)];
    return (
      early &&
      served.length > 0 &&
      served.length === now.length &&
      served.every((el, i) => el === now[i])
    );
  }, selector);
  return { errors, kept };
}

/** `value` formatted the way the browser formats it (its locale). */
export function inBrowserLocale(
  page: Page,
  value: number,
  options: Intl.NumberFormatOptions,
) {
  return page.evaluate(
    ([value, options]) =>
      new Intl.NumberFormat(undefined, options).format(value),
    [value, options] as const,
  );
}

/** Runs `body` in a French browser. */
export function describeInFrench(title: string, body: () => void) {
  test.describe(`${title}, in a French browser`, () => {
    test.use({ locale: 'fr-FR' });
    body();
  });
}
