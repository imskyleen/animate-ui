import { expect, test } from '../test';

type Timers = { created: number[]; cleared: number[]; recording: boolean };

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const timers: Timers = { created: [], cleared: [], recording: false };
    (window as unknown as { timers: Timers }).timers = timers;
    const set = window.setTimeout;
    const clear = window.clearTimeout;
    window.setTimeout = ((
      handler: TimerHandler,
      delay?: number,
      ...rest: unknown[]
    ) => {
      const id = set(handler, delay, ...rest);
      if (timers.recording && (delay ?? 0) >= 500) timers.created.push(id);
      return id;
    }) as typeof window.setTimeout;
    window.clearTimeout = ((id?: number) => {
      if (id !== undefined) timers.cleared.push(id);
      clear(id);
    }) as typeof window.clearTimeout;
  });
  await page.goto('/tests/fixtures/minor-cases-unmount', {
    waitUntil: 'networkidle',
  });
});

test('ScrollingNumber with step 0 renders instead of freezing', async ({
  page,
}) => {
  await expect(page.getByTestId('scrolling')).toContainText('3');
});

test('FlipButton is named by its front face only', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Front', exact: true }),
  ).toBeVisible();
});

test('RippleButton and Click clear their timers on unmount', async ({
  page,
}) => {
  await page.evaluate(() => {
    (window as unknown as { timers: Timers }).timers.recording = true;
  });
  await page.getByRole('button', { name: 'Ripple' }).click();
  await page.evaluate(() => {
    (window as unknown as { timers: Timers }).timers.recording = false;
  });
  await page.getByRole('button', { name: 'Unmount' }).click();
  const { created, cleared } = await page.evaluate(
    () => (window as unknown as { timers: Timers }).timers,
  );
  expect(created.length).toBeGreaterThanOrEqual(2);
  expect(created.filter((id) => !cleared.includes(id))).toEqual([]);
});
