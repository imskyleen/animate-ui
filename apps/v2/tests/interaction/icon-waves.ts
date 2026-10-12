import { expect, type Page } from '@playwright/test';

// Waves (wifi, volume, radio…) animated one after the other: each
// element's lowest opacity while the animation plays, and when it got
// there.

/** Its lowest opacity, when, and its smallest scale. */
type Dip = { min: number; at: number; scale: number };

/**
 * Picks `title`'s icon in the gallery at `url`, plays `animation` from its
 * drawer, and returns each element's dip.
 */
export async function playWaves(
  page: Page,
  url: string,
  title: string,
  animation: string,
) {
  if (!page.url().endsWith(url))
    await page.goto(url, { waitUntil: 'networkidle' });
  const tile = page.locator(`button[aria-pressed][title="${title}"]`);
  await page.getByPlaceholder(/Search/).fill(title.toLowerCase());
  await tile.click();
  const drawer = page.locator('[data-slot=icon-drawer]');
  await expect(drawer).toContainText(animation);
  await drawer.getByRole('button', { name: animation, exact: true }).click();
  return drawer
    .locator('svg')
    .first()
    .evaluate(
      (svg) =>
        new Promise<Dip[]>((resolve) => {
          const elements = [
            ...svg.querySelectorAll('path, circle, line, rect'),
          ];
          const dips = elements.map(() => ({ min: 1, at: 0, scale: 1 }));
          const start = performance.now();
          const tick = () => {
            const now = performance.now() - start;
            elements.forEach((el, i) => {
              const style = getComputedStyle(el);
              const opacity = Number(style.opacity);
              const m = new DOMMatrix(style.transform);
              const dip = dips[i]!;
              dip.scale = Math.min(dip.scale, Math.hypot(m.a, m.b));
              if (opacity < dip.min) {
                dip.min = opacity;
                dip.at = now;
              }
            });
            if (now < 1400) requestAnimationFrame(tick);
            else resolve(dips);
          };
          requestAnimationFrame(tick);
        }),
    );
}

/**
 * The waves dimmed (below `below`), in the order they dipped: the elements
 * of one wave (its arcs on either side) dip together. A wave also shrinks
 * (a router's lights only dim).
 */
export function wavesOf(dips: Dip[], below = 0.6) {
  const waves: Dip[] = [];
  for (const dip of dips
    .filter((dip) => dip.min < below && dip.scale < 0.95)
    .sort((a, b) => a.at - b.at))
    if (!waves.length || dip.at - waves.at(-1)!.at > 40) waves.push(dip);
  return waves;
}
