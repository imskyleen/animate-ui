import { expect, type Page } from '@playwright/test';

async function play(page: Page, animation: string) {
  const drawer = page.locator('[data-slot=icon-drawer]');
  await expect(
    drawer.getByRole('button', { name: animation, exact: true }),
  ).toBeVisible();
  const before = await drawer.locator('svg').first().elementHandle();
  await drawer.getByRole('button', { name: animation, exact: true }).click();
  await page.waitForFunction((el) => !el!.isConnected, before);
  return drawer.locator('svg').first();
}

type Dip = { min: number; at: number; wave: boolean };

export async function playWaves(
  page: Page,
  url: string,
  title: string,
  animation: string,
) {
  if (!page.url().endsWith(url))
    await page.goto(url, { waitUntil: 'networkidle' });
  else {
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot=icon-drawer]')).toHaveCount(0);
  }
  const tile = page.locator(`button[aria-pressed][title="${title}"]`);
  await page.getByPlaceholder(/Search/).fill(title.toLowerCase());
  await tile.click();
  return (await play(page, animation)).evaluate(async (svg) => {
    await new Promise(requestAnimationFrame);
    const elements = [...svg.querySelectorAll('path, circle, line, rect')];
    const planned = elements.map((el) => {
      const animation = el
        .getAnimations()
        .find((a) =>
          (a.effect as KeyframeEffect)
            .getKeyframes()
            .some((k) => k.opacity !== undefined),
        );
      if (!animation) return null;
      const effect = animation.effect as KeyframeEffect;
      const frames = effect.getKeyframes();
      const timing = effect.getTiming();
      const opacities = frames.map((k) => Number(k.opacity));
      const lowest = opacities.indexOf(Math.min(...opacities));
      return {
        min: opacities[lowest]!,
        at:
          Number(timing.delay) +
          Number(timing.duration) * frames[lowest]!.computedOffset!,
        wave: opacities[0] === 1 && opacities.length <= 3,
      };
    });
    const sampled = elements.map(() => ({ min: 1, at: 0, wave: true }));
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const now = performance.now() - start;
        elements.forEach((el, i) => {
          const opacity = Number(getComputedStyle(el).opacity);
          if (opacity < sampled[i]!.min)
            sampled[i] = { min: opacity, at: now, wave: true };
        });
        if (now < 1400) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return elements.map((_, i) => planned[i] ?? sampled[i]!);
  });
}

export function wavesOf(dips: Dip[], below = 0.6) {
  const waves: Dip[] = [];
  for (const dip of dips
    .filter((dip) => dip.wave && dip.min < below)
    .sort((a, b) => a.at - b.at))
    if (!waves.length || dip.at - waves.at(-1)!.at > 40) waves.push(dip);
  return waves;
}

export type Track = {
  tag: string;
  minOpacity: number;
  at: number;
  dx: [number, number];
  dy: [number, number];
  turn: number;
  scaled: number;
  dashed: boolean;
  delay: number;
};

export async function track(
  page: Page,
  url: string,
  title: string,
  animation: string,
) {
  if (!page.url().endsWith(url))
    await page.goto(url, { waitUntil: 'networkidle' });
  else {
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot=icon-drawer]')).toHaveCount(0);
  }
  await page.getByPlaceholder(/Search/).fill(title.toLowerCase());
  await page.locator(`button[aria-pressed][title="${title}"]`).click();
  return (await play(page, animation)).evaluate(
    (svg) =>
      new Promise<Track[]>((resolve) => {
        const elements = [
          svg,
          ...svg.querySelectorAll('g, path, circle, rect, line'),
        ];
        const tracks: Track[] = elements.map((el) => ({
          tag: el.tagName,
          minOpacity: 1,
          at: 0,
          dx: [0, 0],
          dy: [0, 0],
          turn: 0,
          scaled: 0,
          dashed: false,
          delay: Math.min(
            Infinity,
            ...el
              .getAnimations()
              .map((a) =>
                Number((a.effect as KeyframeEffect).getTiming().delay),
              ),
          ),
        }));
        const start = performance.now();
        const tick = () => {
          const now = performance.now() - start;
          elements.forEach((el, i) => {
            const t = tracks[i]!;
            const style = getComputedStyle(el);
            const opacity = Number(style.opacity);
            if (opacity < t.minOpacity) {
              t.minOpacity = opacity;
              t.at = now;
            }
            const m = new DOMMatrix(style.transform);
            t.dx = [Math.min(t.dx[0], m.e), Math.max(t.dx[1], m.e)];
            t.dy = [Math.min(t.dy[0], m.f), Math.max(t.dy[1], m.f)];
            t.turn = Math.max(
              t.turn,
              Math.abs((Math.atan2(m.b, m.a) * 180) / Math.PI),
            );
            t.scaled = Math.max(
              t.scaled,
              Math.abs(Math.hypot(m.a, m.b) - 1),
              Math.abs(Math.hypot(m.c, m.d) - 1),
            );
            if (style.strokeDasharray !== 'none') t.dashed = true;
          });
          if (now < 1300) requestAnimationFrame(tick);
          else resolve(tracks);
        };
        requestAnimationFrame(tick);
      }),
  );
}
