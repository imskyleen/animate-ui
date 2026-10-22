import { expect, test } from '../test';

import { FRAMEWORKS } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  test(`${framework.name} sliding and scrolling numbers report their progress`, async ({
    page,
  }) => {
    await page.goto(framework.fixture('number-events'), {
      waitUntil: 'networkidle',
    });
    await expect(page.getByTestId('sliding')).toHaveText('42');
    await expect(page.getByTestId('scrolling')).toHaveText('true', {
      timeout: 8000,
    });
  });
}
