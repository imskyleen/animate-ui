import type { Page } from '@playwright/test';

export type MotionSample = { opacity: number; scale: number; origin: string };

/**
 * Records the computed style of the first element matching `selector` on the
 * first animation frame after it is added to the DOM.
 * Call before triggering the element, then await `firstFrame()`.
 */
export async function probeFirstFrame(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const w = window as unknown as { __firstFrame?: Promise<unknown> };
    w.__firstFrame = new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const el = document.querySelector(sel);
        if (!el) return;
        observer.disconnect();
        requestAnimationFrame(() => {
          const cs = getComputedStyle(el);
          resolve({
            opacity: cs.opacity,
            transform: cs.transform,
            origin: cs.transformOrigin,
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }, selector);

  return {
    firstFrame: async (): Promise<MotionSample> => {
      const raw = (await page.evaluate(
        () =>
          (window as unknown as { __firstFrame: Promise<unknown> })
            .__firstFrame,
      )) as { opacity: string; transform: string; origin: string };
      return toSample(raw);
    },
  };
}

export async function sample(
  page: Page,
  selector: string,
): Promise<MotionSample> {
  const raw = await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        opacity: cs.opacity,
        transform: cs.transform,
        origin: cs.transformOrigin,
      };
    });
  return toSample(raw);
}

function toSample(raw: {
  opacity: string;
  transform: string;
  origin: string;
}): MotionSample {
  // matrix(a, b, c, d, e, f): scale = a when there is no rotation.
  const match = raw.transform.match(/matrix\(([^,]+)/);
  return {
    opacity: Number(raw.opacity),
    scale: match ? Number(match[1]) : 1,
    origin: raw.origin,
  };
}
