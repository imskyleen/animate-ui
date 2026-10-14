import { expect, test, type Page } from '../test';

const snapshot = (page: Page) =>
  page.evaluate(() => {
    const round = (value: string) =>
      value.replace(/-?\d+\.?\d*(e-?\d+)?/g, (n) => {
        const x = Math.round(Number(n) * 10) / 10;
        return String(Object.is(x, -0) ? 0 : x);
      });
    const ATTRIBUTES = [
      'd',
      'cx',
      'cy',
      'r',
      'rx',
      'ry',
      'x',
      'y',
      'x1',
      'x2',
      'y1',
      'y2',
      'width',
      'height',
      'points',
      'stroke-dasharray',
      'stroke-dashoffset',
      'opacity',
      'transform',
    ];
    const result: Record<string, string> = {};
    for (const host of document.querySelectorAll<HTMLElement>('[data-icon]')) {
      const svg = host.querySelector('svg')!;
      result[host.dataset.icon!] = [svg, ...svg.querySelectorAll('*')]
        .map((el) => {
          const cs = getComputedStyle(el);
          const drawn =
            cs.strokeDasharray === '1px, 1px' &&
            parseFloat(cs.strokeDashoffset) === 0;
          const filled = cs.fill !== 'none' && cs.fill !== 'rgba(0, 0, 0, 0)';
          return round(
            [
              el.tagName,
              cs.transform,
              cs.opacity,
              drawn ? 'none' : cs.strokeDasharray,
              drawn ? '0px' : cs.strokeDashoffset,
              filled ? cs.fillOpacity : '',
              ...ATTRIBUTES.map((name) =>
                drawn && name.startsWith('stroke-dash')
                  ? null
                  : el.getAttribute(name),
              ),
            ].join('|'),
          );
        })
        .join('\n');
    }
    return result;
  });

test('every icon animation moves, and returns to rest when stopped midway', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1600, height: 4000 });
  await page.goto('/tests/fixtures/icons-sweep', { waitUntil: 'networkidle' });
  await page.getByTestId('ready').waitFor({ timeout: 120_000 });
  await page.waitForTimeout(500);
  const play = page.getByRole('button', { name: 'Play' });

  const rest = await snapshot(page);
  const names = Object.keys(rest);
  expect(names.length).toBeGreaterThan(400);

  await play.click();
  const moved = new Set<string>();
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(100);
    const frame = await snapshot(page);
    for (const name of names) if (frame[name] !== rest[name]) moved.add(name);
  }
  expect(names.filter((name) => !moved.has(name))).toEqual([]);

  for (const playFor of [0, 250]) {
    if (playFor) {
      await play.click();
      await page.waitForTimeout(playFor);
    }
    await play.click();
    await page.waitForTimeout(3500);
    const back = await snapshot(page);
    expect(names.filter((name) => back[name] !== rest[name])).toEqual([]);
  }
});
