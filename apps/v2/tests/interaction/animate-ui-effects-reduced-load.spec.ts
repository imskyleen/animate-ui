import { expect, test } from '../test';

import { FRAMEWORKS } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS)
  for (const name of ['slide', 'zoom', 'blur', 'effect', 'fade'])
    test(`${framework.name} ${name}: under reduced motion, a server-rendered page lands at rest`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(framework.demo(name), {
        waitUntil: 'networkidle',
      });
      await expect
        .poll(
          () =>
            page.evaluate(() =>
              [...document.querySelectorAll('main *')]
                .filter((element) => {
                  const box = element.getBoundingClientRect();
                  if (!box.width || !box.height) return false;
                  const style = getComputedStyle(element);
                  return (
                    !['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(
                      style.transform,
                    ) ||
                    /blur\((?!0px)/.test(style.filter) ||
                    Number(style.opacity) < 0.99
                  );
                })
                .map(
                  (element) =>
                    `${element.tagName} ${getComputedStyle(element).transform} ${getComputedStyle(element).filter}`,
                ),
            ),
          { timeout: 5000 },
        )
        .toEqual([]);
    });
