import type { Page } from '../test';

export type MotionSample = { opacity: number; scale: number; origin: string };

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
  const match = raw.transform.match(/matrix\(([^,]+)/);
  return {
    opacity: Number(raw.opacity),
    scale: match ? Number(match[1]) : 1,
    origin: raw.origin,
  };
}

export type MotionFrame = {
  t: number;
  opacity: number;
  scale: number;
  dash: number | null;
};

type MotionTarget = {
  selector: string;
  text?: string;
  child?: string;
};

export function recordMotion(
  page: Page,
  { selector, text, child }: MotionTarget,
  duration: number,
) {
  return page.evaluate(
    ({ selector, text, child, duration }) =>
      new Promise<MotionFrame[]>((resolve) => {
        const frames: MotionFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const t = performance.now() - t0;
          const host = [
            ...document.querySelectorAll<HTMLElement>(selector),
          ].find((el) => text === undefined || el.textContent?.includes(text));
          const el =
            host && child ? host.querySelector<HTMLElement>(child) : host;
          if (el) {
            const cs = getComputedStyle(el);
            const match = cs.transform.match(/matrix\(([^,]+)/);
            frames.push({
              t,
              opacity: Number(cs.opacity),
              scale: match ? Number(match[1]) : 1,
              dash:
                el instanceof SVGGeometryElement
                  ? cs.strokeDasharray === 'none'
                    ? 1
                    : parseFloat(cs.strokeDasharray)
                  : null,
            });
          }
          if (t < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { selector, text, child, duration },
  );
}
