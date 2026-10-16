import { expect, test, type Page } from '../test';

const open = (page: Page) =>
  page.goto('/tests/fixtures/scaled-measures', { waitUntil: 'networkidle' });

test.describe('inside a parent scaled to half', () => {
  test('Animate UI tabs: the contents take the active panel’s height', async ({
    page,
  }) => {
    await open(page);
    const tabs = page.getByTestId('tabs');
    for (const name of ['Analytics', 'Settings', 'Overview']) {
      await tabs.getByRole('tab', { name }).click();
      await expect
        .poll(() =>
          tabs.evaluate((root) => {
            const contents = root.querySelector<HTMLElement>(
              '[data-slot="tabs-contents"]',
            )!;
            const pane = root.querySelector<HTMLElement>(
              '[data-slot="tabs-content"][data-state="active"]',
            )!;
            return Math.abs(contents.offsetHeight - pane.offsetHeight);
          }),
        )
        .toBeLessThanOrEqual(1);
    }
  });

  test('Auto Height: the box follows its content both ways', async ({
    page,
  }) => {
    await open(page);
    const root = page.getByTestId('auto-height');
    const gap = () =>
      root.evaluate((element) => {
        const box = element.querySelector<HTMLElement>('.rounded-xl')!;
        return box.offsetHeight - box.scrollHeight;
      });
    for (const name of [/Show more/, /Show less/]) {
      await root.getByRole('button', { name }).click();
      await expect.poll(gap).toBeGreaterThanOrEqual(0);
      await expect.poll(gap).toBeLessThanOrEqual(4);
    }
  });

  test('a chip left behind glides from where it was, not from further away', async ({
    page,
  }) => {
    await open(page);
    const root = page.getByTestId('combobox');
    await root.locator('[data-slot="combobox-chip-input"]').click();
    await page.getByRole('option').nth(1).click();
    await page.keyboard.press('Escape');
    const chips = root.locator('[data-slot="combobox-chip"]');
    await expect(chips).toHaveCount(2);
    await page.waitForTimeout(600);
    const before = await chips
      .nth(1)
      .evaluate((chip) => Math.round(chip.getBoundingClientRect().left));
    await page.evaluate(() => {
      const samples: number[] = [];
      (window as unknown as { samples: number[] }).samples = samples;
      const second = document.querySelectorAll(
        '[data-testid="combobox"] [data-slot="combobox-chip"]',
      )[1]!;
      const tick = () => {
        if (second.isConnected)
          samples.push(Math.round(second.getBoundingClientRect().left));
        if (samples.length < 20) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await chips.first().locator('[data-slot="combobox-chip-remove"]').click();
    await page.waitForTimeout(800);
    const samples = await page.evaluate(
      () => (window as unknown as { samples: number[] }).samples,
    );
    const moved = samples.filter((left) => left !== before);
    expect(moved.length).toBeGreaterThan(0);
    expect(Math.abs(moved[0]! - before)).toBeLessThanOrEqual(6);
  });

  test('a removed chip fades out from its own place and size', async ({
    page,
  }) => {
    await open(page);
    const root = page.getByTestId('combobox');
    await root.locator('[data-slot="combobox-chip-input"]').click();
    await page.getByRole('option').nth(1).click();
    await page.keyboard.press('Escape');
    const chips = root.locator('[data-slot="combobox-chip"]');
    await expect(chips).toHaveCount(2);
    await page.waitForTimeout(600);
    const before = await chips.first().evaluate((chip) => {
      const box = chip.getBoundingClientRect();
      return [box.left, box.top, box.width, box.height].map(Math.round);
    });
    await page.evaluate(() => {
      const samples: number[][] = [];
      (window as unknown as { samples: number[][] }).samples = samples;
      const start = performance.now();
      const tick = () => {
        const copy = document.querySelector(
          '[data-testid="combobox"] [data-exiting]',
        );
        if (copy) {
          const box = copy.getBoundingClientRect();
          samples.push(
            [box.left, box.top, box.width, box.height].map(Math.round),
          );
        }
        if (performance.now() - start < 400) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await chips.first().locator('[data-slot="combobox-chip-remove"]').click();
    await page.waitForTimeout(600);
    const samples = await page.evaluate(
      () => (window as unknown as { samples: number[][] }).samples,
    );
    expect(samples.length).toBeGreaterThan(0);
    for (const [i, value] of samples[0]!.entries())
      expect(Math.abs(value - before[i]!)).toBeLessThanOrEqual(2);
  });
});
