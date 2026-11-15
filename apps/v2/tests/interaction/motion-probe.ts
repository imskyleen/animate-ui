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

/** The opacity `selector` is painted with, ancestors included, frame by frame for `ms`. */
export function paintedOpacities(page: Page, selector: string, ms: number) {
  return page.evaluate(
    ({ selector, ms }) =>
      new Promise<number[]>((resolve) => {
        const seen: number[] = [];
        // A resize observer runs after layout, right before the paint
        const tick = document.createElement('div');
        tick.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px';
        document.body.append(tick);
        const observer = new ResizeObserver(() => {
          const el = document.querySelector(selector);
          if (!el) return;
          let opacity = 1;
          for (let n: Element | null = el; n; n = n.parentElement)
            opacity *= Number(getComputedStyle(n).opacity);
          seen.push(opacity);
        });
        observer.observe(tick);
        const start = performance.now();
        const frame = () => {
          tick.style.width = tick.style.width === '1px' ? '2px' : '1px';
          if (performance.now() - start < ms) requestAnimationFrame(frame);
          else {
            observer.disconnect();
            tick.remove();
            resolve(seen);
          }
        };
        requestAnimationFrame(frame);
      }),
    { selector, ms },
  );
}
