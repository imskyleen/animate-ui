import { expect, test, type Page } from '../test';

import {
  DISMISS_CURVE,
  present,
  readState,
  recordTimeline,
} from './modal-timeline';
import { expectCssCurve, expectCssSpring, overshootOf } from './spring-curves';

const TOAST = '[data-slot="toast"]';
const TOAST_SPRING = { stiffness: 280, damping: 24 };

const read = (page: Page, i: number, selector = TOAST) =>
  page
    .locator(selector)
    .nth(i)
    .evaluate((el) => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return {
        x: m.m41,
        y: m.m42 / (el as HTMLElement).offsetHeight,
        scale: Math.hypot(m.a, m.b),
        opacity: Number(getComputedStyle(el).opacity),
      };
    });

const timing = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        duration: cs.transitionDuration.split(',')[0]!.trim(),
        easing: cs.transitionTimingFunction.split(', linear')[0]!,
      };
    });

const settled = (page: Page, i = 0, selector = TOAST) =>
  expect
    .poll(
      async () => {
        const state = await read(page, i, selector);
        return state.opacity === 1 && Math.abs(state.y) < 0.002;
      },
      { timeout: 2500 },
    )
    .toBe(true);

async function recordFrames<T>(page: Page, sample: string) {
  await page.evaluate((sample) => {
    const w = window as unknown as {
      __frames: { t: number; v: unknown }[];
      __stopFrames: boolean;
    };
    w.__frames = [];
    w.__stopFrames = false;
    const read = new Function(`return (${sample})()`) as () => unknown;
    const t0 = performance.now();
    const tick = () => {
      if (w.__stopFrames) return;
      w.__frames.push({ t: performance.now() - t0, v: read() });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, sample);
  return {
    stop: () =>
      page.evaluate(() => {
        const w = window as unknown as {
          __frames: { t: number; v: T }[];
          __stopFrames: boolean;
        };
        w.__stopFrames = true;
        return w.__frames;
      }),
  };
}

async function watchExit(page: Page, selector = TOAST) {
  await page
    .locator(selector)
    .first()
    .evaluate((el) => {
      (window as unknown as { __exit: Promise<unknown> }).__exit = new Promise(
        (resolve) => {
          const observer = new MutationObserver(() => {
            if (!el.hasAttribute('data-ending-style')) return;
            observer.disconnect();
            const cs = getComputedStyle(el);
            resolve({
              duration: cs.transitionDuration.split(',')[0]!.trim(),
              easing: cs.transitionTimingFunction.split(', linear')[0]!,
            });
          });
          observer.observe(el, { attributes: true });
        },
      );
    });
  return () =>
    page.evaluate(
      () => (window as unknown as { __exit: Promise<unknown> }).__exit,
    ) as Promise<{ duration: string; easing: string }>;
}

async function drag(page: Page, dx: number, steps = 10, release = true) {
  const box = (await page.locator(TOAST).first().boundingBox())!;
  const x = box.x + box.width / 3;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x + (dx * i) / steps, y);
    await page.waitForTimeout(16);
  }
  if (release) await page.mouse.up();
}

async function flick(page: Page, dx: number, steps = 6, every = 16) {
  const box = (await page.locator(TOAST).first().boundingBox())!;
  const x = box.x + 40;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const start = Date.now() / 1000;
  const mouse = (type: string, left: number, ms: number, buttons: number) =>
    cdp.send('Input.dispatchMouseEvent', {
      type: type as 'mouseMoved',
      x: left,
      y,
      button: 'left',
      buttons,
      clickCount: 1,
      timestamp: start + ms / 1000,
    });
  const frame = () =>
    page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve)),
    );
  await mouse('mouseMoved', x, 0, 0);
  await mouse('mousePressed', x, 1, 1);
  for (let i = 1; i <= steps; i++) {
    await frame();
    await mouse('mouseMoved', x + (dx * i) / steps, 1 + i * every, 1);
  }
  await mouse('mouseReleased', x + dx, 1 + (steps + 1) * every, 0);
  await cdp.detach();
}

test.describe('base-ui toast demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/toast', { waitUntil: 'networkidle' });
  });

  test('rises from its edge out of a blur, and lands a little past its rest', async ({
    page,
  }) => {
    const timeline = await recordTimeline(page, { toast: TOAST });
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    await page.waitForTimeout(300);
    const shown = present(await timeline.stop(), 'toast');
    const first = shown[0]!.samples.toast!;
    expect(first.y).toBeGreaterThan(0.6);
    expect(first.opacity).toBeLessThan(0.3);
    expect(first.scale).toBeLessThan(0.975);
    expect(first.blur).toBeGreaterThan(2);
    const peak = Math.min(...shown.map((frame) => frame.samples.toast!.y));
    expect(peak).toBeLessThan(-overshootOf(TOAST_SPRING) / 3);
    const last = shown.at(-1)!.samples.toast!;
    expect(last.blur).toBe(0);
    expect(last.scale).toBeCloseTo(1, 3);
    expectCssSpring(await timing(page, TOAST), TOAST_SPRING);
  });

  test('stacks: toasts behind are scaled down, hover unfolds them front to back', async ({
    page,
  }) => {
    const scales = () =>
      page.evaluate(() =>
        [...document.querySelectorAll('[data-slot="toast"]')].map((el) => {
          const m = new DOMMatrix(getComputedStyle(el).transform);
          return Math.hypot(m.a, m.b);
        }),
      );
    const button = page.getByRole('button', { name: 'Show Toast' });
    for (let i = 0; i < 3; i++) await button.click();
    await settled(page, 0);
    await expect
      .poll(async () => {
        const list = await scales();
        return list.length === 3 && Math.min(...list) < 0.95;
      })
      .toBe(true);
    await page.waitForTimeout(700);
    expect(Math.min(...(await scales()))).toBeGreaterThanOrEqual(0.9);

    const frames = await recordFrames<number[]>(
      page,
      `() => [...document.querySelectorAll('[data-slot="toast"]')].map((el) => new DOMMatrix(getComputedStyle(el).transform).m42)`,
    );
    await page.waitForTimeout(100);
    await page.locator(TOAST).first().hover({ force: true });
    await page.waitForTimeout(700);
    const unfold = await frames.stop();
    const start = (i: number) =>
      unfold.find((f) => Math.abs(f.v[i]! - unfold[0]!.v[i]!) > 1)!.t;
    expect(start(2) - start(1)).toBeGreaterThan(15);
    expect(start(2) - start(1)).toBeLessThan(80);
    expect((await scales()).every((s) => Math.abs(s - 1) < 0.005)).toBe(true);
    const content = await timing(page, '[data-slot="toast-content"]');
    expect(content.duration).toBe('0.2s');
    expect(content.easing).toBe('cubic-bezier(0.23, 1, 0.32, 1)');

    const fold = await recordFrames<number[]>(
      page,
      `() => [...document.querySelectorAll('[data-slot="toast"]')].map((el) => new DOMMatrix(getComputedStyle(el).transform).m42)`,
    );
    await page.waitForTimeout(100);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(700);
    const folded = await fold.stop();
    const back = (i: number) =>
      folded.find((f) => Math.abs(f.v[i]! - folded[0]!.v[i]!) > 1)!.t;
    expect(back(2) - back(1)).toBeGreaterThan(15);
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await page.waitForTimeout(50);
    const delays = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="toast"]')].map(
        (el) => getComputedStyle(el).transitionDelay.split(',')[0],
      ),
    );
    expect(delays.every((delay) => delay === '0s')).toBe(true);
  });

  test('dismissed, it leaves through its edge quicker, speeding away', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    const toast = page.locator(TOAST).first();
    await settled(page);
    const exit = await watchExit(page);
    const timeline = await recordTimeline(page, { toast: TOAST });
    await toast.locator('[data-slot="toast-close"]').click();
    expectCssCurve(await exit(), DISMISS_CURVE);
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });
    const last = present(await timeline.stop(), 'toast').at(-1)!.samples.toast!;
    expect(last.y).toBeGreaterThan(0.6);
    expect(last.opacity).toBeLessThan(0.3);
    expect(last.blur).toBeGreaterThan(2);
  });

  test('a swipe follows the finger and fades with distance', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    const width = (await page.locator(TOAST).first().boundingBox())!.width;
    await drag(page, 60, 10, false);
    const dragged = await read(page, 0);
    expect(dragged.x).toBeGreaterThan(45);
    expect(dragged.opacity).toBeCloseTo(1 - dragged.x / width, 2);
    expect(dragged.opacity).toBeLessThan(0.95);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expect.poll(async () => (await read(page, 0)).opacity).toBe(1);
  });

  test('dragged the wrong way, it rubber-bands', async ({ page }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    await drag(page, -120, 12, false);
    const left = await read(page, 0);
    expect(left.x).toBeLessThan(-22);
    expect(left.x).toBeGreaterThan(-36);
    expect(left.opacity).toBe(1);
    await page.mouse.up();
    await expect.poll(async () => Math.abs((await read(page, 0)).x)).toBe(0);
    await expect(page.locator(TOAST)).toHaveCount(1);
  });

  test("thrown by a swipe, it keeps the finger's speed", async ({ page }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    const width = (await page.locator(TOAST).first().boundingBox())!.width;
    let exit = await watchExit(page);
    await flick(page, 192);
    const flung = await exit();
    expect(flung.easing).toBe('linear');
    const flickMs = Number.parseFloat(flung.duration) * 1000;
    expect(Math.abs(flickMs - width / (160 / 96))).toBeLessThan(12);
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });

    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    exit = await watchExit(page);
    await drag(page, 120, 12);
    const slow = await exit();
    expect(slow.easing).toBe('linear');
    expect(slow.duration).toBe('0.36s');
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });
  });

  test('a bar shows the time left, paused while Base UI pauses the timer', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Show Toast' }).click();
    const bar = page.locator('[data-animate-ui-toast-progress-bar]').first();
    const left = () =>
      bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
    await expect(bar).toHaveCount(1);
    await page.waitForTimeout(500);
    const before = await left();
    expect(before).toBeLessThan(0.95);
    expect(before).toBeGreaterThan(0.8);
    await page.locator(TOAST).first().hover({ force: true });
    await page.waitForTimeout(100);
    const paused = await left();
    await page.waitForTimeout(600);
    expect(Math.abs((await left()) - paused)).toBeLessThan(0.005);
    await page.mouse.move(5, 5);
    await page.waitForTimeout(600);
    expect(await left()).toBeLessThan(paused - 0.08);
  });

  test('the bar is on by default, and progressBar={false} leaves it out', async ({
    page,
  }) => {
    await page.goto('/tests/fixtures/base-ui-toast', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.locator('[data-testid="bottom-toast"]')).toHaveCount(1);
    await expect(page.locator('[data-animate-ui-toast-progress]')).toHaveCount(
      1,
    );
    await page.goto('/tests/demos/base-ui/toast?progressBar=false', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    await expect(page.locator('[data-animate-ui-toast-progress]')).toHaveCount(
      0,
    );
  });

  test("the bar takes the color of the toast's type", async ({ page }) => {
    await page.goto('/tests/demos/base-ui/toast-types', {
      waitUntil: 'networkidle',
    });
    const bar = () =>
      page
        .locator('[data-animate-ui-toast-progress-bar]')
        .first()
        .evaluate((el) => {
          const cs = getComputedStyle(el);
          const toast =
            el.closest('[data-slot="toast"]') ??
            el.parentElement!.parentElement!;
          const icon = toast.querySelector('[data-slot="toast-icon"] > *');
          return {
            bg: cs.backgroundColor,
            opacity: Number(cs.opacity),
            icon: icon ? getComputedStyle(icon).color : null,
            text: getComputedStyle(toast).color,
          };
        });
    await page.getByRole('button', { name: 'Error' }).click();
    await expect(
      page.locator('[data-animate-ui-toast-progress-bar]'),
    ).toHaveCount(1);
    const error = await bar();
    expect(error.icon).not.toBe(error.text);
    expect(error.bg).toBe(error.icon);
    expect(error.opacity).toBeCloseTo(0.8, 2);

    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Success' }).click();
    await expect(
      page.locator('[data-animate-ui-toast-progress-bar]'),
    ).toHaveCount(1);
    const success = await bar();
    expect(success.bg).toBe(success.text);
    expect(success.opacity).toBeCloseTo(0.25, 2);
  });

  test('reduced motion: fades in place, the stack unfolds at once', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    const timeline = await recordTimeline(page, { toast: TOAST });
    await page.getByRole('button', { name: 'Show Toast' }).click();
    await settled(page);
    const shown = present(await timeline.stop(), 'toast');
    const first = shown[0]!.samples.toast!;
    expect(Math.abs(first.y)).toBeLessThan(0.02);
    expect(first.opacity).toBeLessThan(1);
    for (const frame of shown) {
      expect(frame.samples.toast!.blur).toBe(0);
      expect(frame.samples.toast!.scale).toBe(1);
      expect(frame.samples.toast!.y).toBeGreaterThanOrEqual(-0.001);
    }
    const button = page.getByRole('button', { name: 'Show Toast' });
    await button.click();
    await button.click();
    await page.waitForTimeout(600);
    await page.locator(TOAST).first().hover({ force: true });
    const delays = await page.evaluate(() =>
      [...document.querySelectorAll('[data-slot="toast"]')].map(
        (el) => getComputedStyle(el).transitionDelay.split(',')[0],
      ),
    );
    expect(delays).toEqual(['0s', '0s', '0s']);
  });
});

const ICON_SAMPLE = `() => {
  const svg = document.querySelector('[data-slot="toast"] [data-slot="toast-icon"] svg');
  if (!svg) return null;
  const shapes = [...svg.querySelectorAll('path, circle')];
  const drawn = shapes.map((s) => {
    const dash = s.getAttribute('stroke-dasharray');
    return dash === null ? 1 : Number.parseFloat(dash);
  });
  const cs = getComputedStyle(svg);
  const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform);
  const blur = /blur\\(([\\d.]+)px\\)/.exec(cs.filter);
  const text = document.querySelector('[data-slot="toast"] [data-slot="toast-description"]')?.textContent;
  return { text, drawn: Math.min(...drawn), x: m.m41, scale: m.a, opacity: Math.min(Number(cs.opacity), ...shapes.map((s) => Number(getComputedStyle(s).opacity))), blur: blur ? Number(blur[1]) : 0 };
}`;

type IconSample = {
  text: string;
  drawn: number;
  x: number;
  scale: number;
  opacity: number;
  blur: number;
} | null;

const TYPE_TEXT: Record<string, string> = {
  Success: 'Event has been created.',
  Info: 'Arrive 10 minutes before the event.',
  Warning: 'The event cannot start before 8:00 AM.',
  Error: 'The event could not be created.',
};

const framesOf = (frames: { t: number; v: IconSample }[], type: string) =>
  frames.filter((f) => f.v?.text === TYPE_TEXT[type]);

test.describe('base-ui toast types', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/demos/base-ui/toast-types', {
      waitUntil: 'networkidle',
    });
  });

  test('a success check draws itself once the toast has landed', async ({
    page,
  }) => {
    const frames = await recordFrames<IconSample>(page, ICON_SAMPLE);
    await page.getByRole('button', { name: 'Success' }).click();
    await page.waitForTimeout(900);
    const samples = framesOf(await frames.stop(), 'Success');
    expect(samples[0]!.v!.drawn).toBeLessThan(0.05);
    expect(samples.some((f) => f.v!.drawn > 0.2 && f.v!.drawn < 0.8)).toBe(
      true,
    );
    expect(samples.at(-1)!.v!.drawn).toBe(1);
    expect(samples.every((f) => f.v!.x === 0)).toBe(true);
  });

  test('an error cross draws itself and shakes', async ({ page }) => {
    const frames = await recordFrames<IconSample>(page, ICON_SAMPLE);
    await page.getByRole('button', { name: 'Error' }).click();
    await page.waitForTimeout(1200);
    const samples = framesOf(await frames.stop(), 'Error');
    expect(samples[0]!.v!.drawn).toBeLessThan(0.05);
    expect(samples.at(-1)!.v!.drawn).toBe(1);
    const xs = samples.map((f) => f.v!.x);
    expect(Math.min(...xs)).toBeLessThan(-1.5);
    expect(Math.max(...xs)).toBeGreaterThan(1.5);
    expect(Math.max(...xs.map(Math.abs))).toBeLessThanOrEqual(3.01);
    expect(xs.at(-1)).toBe(0);
  });

  test('info and warning icons pop in from half their size', async ({
    page,
  }) => {
    for (const type of ['Info', 'Warning']) {
      const frames = await recordFrames<IconSample>(page, ICON_SAMPLE);
      await page.getByRole('button', { name: type }).click();
      await page.waitForTimeout(800);
      const samples = framesOf(await frames.stop(), type);
      expect(samples[0]!.v!.opacity).toBeLessThan(0.05);
      const first = samples.find((f) => f.v!.opacity > 0.02)!.v!;
      expect(first.scale).toBeLessThan(0.75);
      expect(first.blur).toBeGreaterThan(0.8);
      expect(Math.max(...samples.map((f) => f.v!.scale))).toBeGreaterThan(1.02);
      expect(samples.at(-1)!.v!.scale).toBe(1);
      expect(samples.at(-1)!.v!.drawn).toBe(1);
      await page.mouse.move(5, 5);
      await page.waitForTimeout(300);
    }
  });

  test('reduced motion: icons only fade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload({ waitUntil: 'networkidle' });
    for (const type of ['Error', 'Info']) {
      const frames = await recordFrames<IconSample>(page, ICON_SAMPLE);
      await page.getByRole('button', { name: type }).click();
      await page.waitForTimeout(900);
      const samples = framesOf(await frames.stop(), type);
      expect(samples[0]!.v!.opacity).toBeLessThan(0.1);
      for (const { v } of samples) {
        expect(v!.drawn).toBe(1);
        expect(v!.x).toBe(0);
        expect(v!.scale).toBe(1);
        expect(v!.blur).toBe(0);
      }
      expect(samples.at(-1)!.v!.opacity).toBe(1);
    }
  });
});

test.describe('base-ui toast promise', () => {
  test('the spinner turns into a drawn check, the text swaps through a blur', async ({
    page,
  }) => {
    await page.goto('/tests/demos/base-ui/toast-promise', {
      waitUntil: 'networkidle',
    });
    await page.getByRole('button', { name: 'Create Event' }).click();
    const description = page.locator('[data-slot="toast-description"]');
    await expect(description).toHaveText('Creating event…');
    await settled(page);
    const frames = await recordFrames<{
      copies: { text: string; opacity: number; blur: number }[];
      text: string;
      opacity: number;
      blur: number;
      icon: { drawn: number } | null;
    }>(
      page,
      `() => {
        const root = document.querySelector('[data-slot="toast"]');
        const d = root.querySelector('[data-slot="toast-description"]');
        const blurOf = (el) => { const b = /blur\\(([\\d.]+)px\\)/.exec(getComputedStyle(el).filter); return b ? Number(b[1]) : 0; };
        const copies = [...root.querySelectorAll(':scope > [aria-hidden="true"]:not([data-animate-ui-toast-progress])')].map((c) => ({ text: c.textContent, opacity: Number(getComputedStyle(c).opacity), blur: blurOf(c) }));
        return { copies, text: d.textContent, opacity: Number(getComputedStyle(d).opacity), blur: blurOf(d), icon: (${ICON_SAMPLE})() };
      }`,
    );
    await expect(description).toHaveText('Event created.', { timeout: 4000 });
    await page.waitForTimeout(800);
    const samples = await frames.stop();
    const swap = samples.findIndex((f) => f.v.text === 'Event created.');
    const leaving = samples
      .slice(swap)
      .flatMap((f) => f.v.copies)
      .filter((c) => c.text === 'Creating event…');
    expect(leaving.length).toBeGreaterThan(0);
    expect(leaving.some((c) => c.blur > 0.5 && c.opacity < 0.9)).toBe(true);
    expect(
      samples.slice(swap).some((f) => f.v.copies.some((c) => c.text === '')),
    ).toBe(true);
    const arriving = samples.slice(swap, swap + 4).map((f) => f.v);
    expect(arriving.some((v) => v.opacity < 0.8 && v.blur > 0.3)).toBe(true);
    const icons = samples.slice(swap).map((f) => f.v.icon!.drawn);
    expect(Math.min(...icons)).toBeLessThan(0.1);
    expect(icons.at(-1)).toBe(1);
    expect(samples.at(-1)!.v.copies).toEqual([]);
  });
});

test.describe('base-ui toast updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-toast-update', {
      waitUntil: 'networkidle',
    });
  });

  test('its height glides to its new content on its spring', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await settled(page);
    const before = (await page.locator(TOAST).boundingBox())!.height;
    const frames = await recordFrames<number>(
      page,
      `() => document.querySelector('[data-slot="toast"]').getBoundingClientRect().height`,
    );
    await page.getByRole('button', { name: 'Update' }).click();
    await page.waitForTimeout(900);
    const heights = (await frames.stop()).map((f) => f.v);
    const after = heights.at(-1)!;
    expect(after).toBeGreaterThan(before + 15);
    expect(heights.some((h) => h > before + 3 && h < after - 3)).toBe(true);
  });

  test('a loading toast has no bar; resolved, its bar starts full', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await settled(page);
    const bar = page.locator('[data-animate-ui-toast-progress-bar]');
    await expect(bar).toHaveCount(0);
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(bar).toHaveCount(1);
    const left = await bar.evaluate(
      (el) => new DOMMatrix(getComputedStyle(el).transform).a,
    );
    expect(left).toBeGreaterThan(0.9);
  });

  test('updated while coming in, dismissed mid-update: clean', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Update' }).click();
    await settled(page);
    await page.waitForTimeout(600);
    await expect(page.locator(TOAST)).toContainText('Saved');
    const state = await readState(page, TOAST);
    expect(state.blur).toBe(0);
    expect(state.opacity).toBe(1);
    await expect(
      page.locator(
        `${TOAST} > [aria-hidden="true"]:not([data-animate-ui-toast-progress])`,
      ),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Fail' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });
    expect(errors).toEqual([]);
  });

  test('swiped while coming in, it follows the finger and leaves', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Short', exact: true }).click();
    await page.waitForTimeout(60);
    await drag(page, 150, 8);
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 2500 });
  });

  test('many toasts added fast all land at rest', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Short', exact: true });
    for (let i = 0; i < 6; i++) await button.click();
    await settled(page, 0);
    await page.waitForTimeout(400);
    const state = await readState(page, TOAST);
    expect(state.blur).toBe(0);
    expect(state.scale).toBeCloseTo(1, 3);
    await expect(page.locator(TOAST)).toHaveCount(0, { timeout: 4000 });
  });
});

test.describe('base-ui toast API', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/base-ui-toast', {
      waitUntil: 'networkidle',
    });
  });

  test('useToastManager adds and closes toasts', async ({ page }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    const toast = page.locator('[data-testid="bottom-toast"]');
    await expect(toast).toHaveCount(1);
    await expect(toast).toContainText('Bottom toast');
    const dismiss = toast.getByText('Dismiss');
    await expect(dismiss).toBeInViewport({ ratio: 1 });
    await dismiss.click();
    await expect(toast).toHaveCount(0, { timeout: 2500 });
  });

  test('a toast swiped up enters from the top edge', async ({ page }) => {
    const selector = '[data-testid="top-toast"]';
    const timeline = await recordTimeline(page, { toast: selector });
    await page.getByRole('button', { name: 'Add top' }).click();
    await settled(page, 0, selector);
    const first = present(await timeline.stop(), 'toast')[0]!.samples.toast!;
    expect(first.y).toBeLessThan(-0.6);
  });

  test('timeouts still close toasts, the user style still applies', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    const toast = page.locator('[data-testid="bottom-toast"]');
    await expect(toast).toHaveCSS('outline-style', 'dashed');
    await expect(toast).toHaveCount(0, { timeout: 3000 });
  });
});
