import { test, type Page } from '../test';

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
        __early: served.every(
          (el) => !Object.keys(el).some((key) => key.startsWith('__react')),
        ),
      });
    });
  }, selector);
  await page.goto(path, { waitUntil: 'networkidle' });
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

export function describeInFrench(title: string, body: () => void) {
  test.describe(`${title}, in a French browser`, () => {
    test.use({ locale: 'fr-FR' });
    body();
  });
}
