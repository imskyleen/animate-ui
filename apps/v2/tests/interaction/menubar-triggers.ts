import { expect, test, type Page } from '@playwright/test';

// A menubar's triggers share one highlight (shared by the Radix UI and Base UI
// menubar specs), like a menu's items: a trigger hovered, focused or with its
// menu open is lit by its own styles (`hover:bg-muted`,
// `aria-expanded:bg-muted`), and that background is one surface gliding from
// trigger to trigger, on the highlight's spring. It fades in from nothing,
// fades out where it is once no trigger is lit, and lit again meanwhile, it
// comes back from there.

const SURFACE = '[data-slot="trigger-highlight"]';

type Surface = {
  /** The trigger it's in. */
  trigger: string;
  left: number;
  width: number;
  opacity: number;
  color: string;
};

type TriggerFrame = {
  t: number;
  /** Surfaces on screen (not transparent). */
  surfaces: Surface[];
  /** The triggers' own backgrounds, by name. */
  own: Record<string, string>;
};

/** Records, frame by frame, the triggers' highlight, for `duration` ms. */
function recordTriggers(page: Page, duration: number) {
  return page.evaluate(
    ({ selector, duration }) =>
      new Promise<TriggerFrame[]>((resolve) => {
        const frames: TriggerFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const surfaces = [...document.querySelectorAll<HTMLElement>(selector)]
            .map((el) => {
              const style = getComputedStyle(el);
              const box = el.getBoundingClientRect();
              return {
                trigger: (
                  el.closest('[data-slot="menubar-trigger"]')?.textContent ?? ''
                ).trim(),
                left: box.left,
                width: box.width,
                opacity: Number(style.opacity),
                color: style.backgroundColor,
              };
            })
            .filter((surface) => surface.opacity > 0.02);
          const own: Record<string, string> = {};
          for (const el of document.querySelectorAll<HTMLElement>(
            '[data-slot="menubar-trigger"]',
          ))
            own[(el.textContent ?? '').trim()] =
              getComputedStyle(el).backgroundColor;
          frames.push({ t: Math.round(performance.now() - t0), surfaces, own });
          if (performance.now() - t0 < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    { selector: SURFACE, duration },
  );
}

const trigger = (page: Page, name: string) =>
  page.getByRole('menuitem', { name, exact: true });

async function boxOf(page: Page, name: string) {
  return (await trigger(page, name).boundingBox())!;
}

/** Hovers a trigger (its center), at once. */
async function hover(page: Page, name: string) {
  const box = await boxOf(page, name);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

/** Moves the pointer off the bar, below it. */
async function leave(page: Page) {
  const box = await boxOf(page, 'File');
  await page.mouse.move(box.x + box.width / 2, box.y + 200);
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

/** One highlight at most, every frame, and no trigger painting its own. */
function expectOneHighlight(frames: TriggerFrame[]) {
  expect(frames.length).toBeGreaterThan(5);
  for (const frame of frames) {
    expect(frame.surfaces.length, `${frame.t}ms`).toBeLessThanOrEqual(1);
    for (const [name, color] of Object.entries(frame.own))
      expect(color, `${frame.t}ms: ${name}`).toBe(TRANSPARENT);
  }
}

/**
 * Only ever goes one way (`way` 1: right, -1: left), within `slack` pixels
 * (the spring's slight overshoot, on a long glide).
 */
function expectOneWay(values: number[], way: 1 | -1, slack = 0.5) {
  for (let i = 1; i < values.length; i++)
    expect((values[i]! - values[i - 1]!) * way).toBeGreaterThanOrEqual(-slack);
}

export function describeMenubarTriggers(title: string, path: string) {
  test.describe(title, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.mouse.move(5, 5);
    });

    test('hovering a trigger lights it from nothing, with its own background', async ({
      page,
    }) => {
      const recording = recordTriggers(page, 500);
      await hover(page, 'File');
      const frames = await recording;
      expectOneHighlight(frames);
      const lit = frames.filter((frame) => frame.surfaces.length);
      expect(lit.length).toBeGreaterThan(5);
      const file = await boxOf(page, 'File');
      for (const { surfaces } of lit) {
        expect(surfaces[0]!.trigger).toBe('File');
        expect(Math.abs(surfaces[0]!.left - file.x)).toBeLessThan(0.5);
        expect(surfaces[0]!.color).not.toBe(TRANSPARENT);
      }
      // It fades in.
      expect(lit[0]!.surfaces[0]!.opacity).toBeLessThan(0.7);
      expect(lit.at(-1)!.surfaces[0]!.opacity).toBe(1);
    });

    test('moving to the next trigger, the highlight glides there', async ({
      page,
    }) => {
      await hover(page, 'File');
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, 600);
      await hover(page, 'Edit');
      const frames = await recording;
      expectOneHighlight(frames);
      const file = await boxOf(page, 'File');
      const edit = await boxOf(page, 'Edit');
      const lefts = frames.map((frame) => frame.surfaces[0]!.left);
      // On screen all along, fully, and on its way through every frame.
      for (const frame of frames)
        expect(frame.surfaces[0]!.opacity, `${frame.t}ms`).toBeGreaterThan(
          0.99,
        );
      expectOneWay(lefts, 1);
      expect(
        lefts.filter((left) => left > file.x + 1 && left < edit.x - 1).length,
      ).toBeGreaterThanOrEqual(3);
      const last = frames.at(-1)!.surfaces[0]!;
      expect(last.trigger).toBe('Edit');
      expect(Math.abs(last.left - edit.x)).toBeLessThan(0.5);
      expect(Math.abs(last.width - edit.width)).toBeLessThan(0.5);
    });

    test('leaving the bar, it fades out where it is', async ({ page }) => {
      await hover(page, 'Edit');
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, 500);
      await leave(page);
      const frames = await recording;
      expectOneHighlight(frames);
      const edit = await boxOf(page, 'Edit');
      const fading = frames.filter(
        (frame) => frame.surfaces[0] && frame.surfaces[0].opacity < 0.99,
      );
      expect(fading.length).toBeGreaterThanOrEqual(3);
      for (const { surfaces } of fading)
        expect(Math.abs(surfaces[0]!.left - edit.x)).toBeLessThan(0.5);
      expectOneWay(
        fading.map((frame) => frame.surfaces[0]!.opacity),
        -1,
      );
      expect(frames.at(-1)!.surfaces).toEqual([]);
      await expect(page.locator(SURFACE)).toHaveCount(0);
    });

    test('lit again while it fades out, it comes back from there', async ({
      page,
    }) => {
      await hover(page, 'Edit');
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, 700);
      await leave(page);
      await page.waitForTimeout(60);
      await hover(page, 'View');
      const frames = await recording;
      expectOneHighlight(frames);
      const edit = await boxOf(page, 'Edit');
      const view = await boxOf(page, 'View');
      const shown = frames.filter((frame) => frame.surfaces.length);
      const back = shown.findIndex(
        (frame) => frame.surfaces[0]!.trigger === 'View',
      );
      expect(back).toBeGreaterThan(0);
      // From Edit's place, at the opacity it had faded to, without a gap.
      const before = shown[back - 1]!.surfaces[0]!;
      const after = shown[back]!.surfaces[0]!;
      expect(before.opacity).toBeLessThan(0.95);
      expect(after.opacity).toBeGreaterThan(before.opacity * 0.6);
      expect(Math.abs(after.left - edit.x)).toBeLessThan(1.5);
      expect(shown[back]!.t - shown[back - 1]!.t).toBeLessThan(40);
      // Then it glides to View, showing again.
      const rest = shown.slice(back).map((frame) => frame.surfaces[0]!);
      expectOneWay(
        rest.map((surface) => surface.left),
        1,
      );
      expectOneWay(
        rest.map((surface) => surface.opacity),
        1,
      );
      expect(Math.abs(rest.at(-1)!.left - view.x)).toBeLessThan(0.5);
      expect(rest.at(-1)!.opacity).toBe(1);
    });

    test('with a menu open, it follows the open menu, and stays while the pointer is in it', async ({
      page,
    }) => {
      await trigger(page, 'File').click();
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, 900);
      await hover(page, 'Profiles');
      await page.waitForTimeout(400);
      // Into Profiles' menu: the pointer leaves the bar.
      await page
        .locator('[data-slot="menubar-content"]', { hasText: 'Andy' })
        .hover();
      const frames = await recording;
      expectOneHighlight(frames);
      const file = await boxOf(page, 'File');
      const profiles = await boxOf(page, 'Profiles');
      const lefts = frames.map((frame) => frame.surfaces[0]!.left);
      expectOneWay(lefts, 1, 1.5);
      expect(
        lefts.filter((left) => left > file.x + 1 && left < profiles.x - 1)
          .length,
      ).toBeGreaterThanOrEqual(3);
      for (const frame of frames.slice(-10)) {
        expect(frame.surfaces[0]!.trigger).toBe('Profiles');
        expect(frame.surfaces[0]!.opacity).toBe(1);
      }

      // Its menu closed (the pointer elsewhere), it goes.
      await page.keyboard.press('Escape');
      await expect(page.locator(SURFACE)).toHaveCount(0, { timeout: 1000 });
    });
  });

  test.describe(`${title}, reduced motion`, () => {
    test.describe.configure({ timeout: 120_000 });
    test('it moves to the next trigger at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path, { waitUntil: 'networkidle' });
      await hover(page, 'File');
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, 400);
      await hover(page, 'Edit');
      const frames = await recording;
      expectOneHighlight(frames);
      const file = await boxOf(page, 'File');
      const edit = await boxOf(page, 'Edit');
      for (const frame of frames) {
        const { left } = frame.surfaces[0]!;
        expect(
          Math.min(Math.abs(left - file.x), Math.abs(left - edit.x)),
          `${frame.t}ms`,
        ).toBeLessThan(0.5);
      }
      expect(frames.at(-1)!.surfaces[0]!.trigger).toBe('Edit');
    });
  });
}
