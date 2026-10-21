import { expect, test, type Locator, type Page } from '../test';

export type BarSetup = {
  triggers: string;
  locate: (page: Page, name: string) => Locator;
  first: string;
  second: string;
  third: string;
  menu: { trigger: string; content: (page: Page) => Locator };
  open: (page: Page, name: string) => Promise<void>;
  escapeClears: boolean;
  /** A background the triggers wear at rest (shadcn-vue's `bg-background`). */
  rest?: string;
};

const MENUBAR: BarSetup = {
  triggers: '[data-slot="menubar-trigger"]',
  locate: (page, name) => page.getByRole('menuitem', { name, exact: true }),
  first: 'File',
  second: 'Edit',
  third: 'View',
  menu: {
    trigger: 'Profiles',
    content: (page) =>
      page.locator('[data-slot="menubar-content"]', { hasText: 'Andy' }),
  },
  open: (page, name) =>
    page.getByRole('menuitem', { name, exact: true }).click(),
  escapeClears: true,
};

const SURFACE = '[data-slot="trigger-highlight"]';

type Surface = {
  trigger: string;
  left: number;
  width: number;
  opacity: number;
  color: string;
  fade: number | null;
};

type TriggerFrame = {
  t: number;
  surfaces: Surface[];
  own: Record<string, string>;
};

function recordTriggers(page: Page, bar: BarSetup, duration: number) {
  return page.evaluate(
    ({ selector, triggers, duration }) =>
      new Promise<TriggerFrame[]>((resolve) => {
        const frames: TriggerFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          const surfaces = [...document.querySelectorAll<HTMLElement>(selector)]
            .map((el) => {
              const style = getComputedStyle(el);
              const box = el.getBoundingClientRect();
              return {
                trigger: (el.closest(triggers)?.textContent ?? '').trim(),
                left: box.left,
                width: box.width,
                opacity: Number(style.opacity),
                color: style.backgroundColor,
                fade: (() => {
                  const animation = el
                    .getAnimations()
                    .find((a) =>
                      (a.effect as KeyframeEffect | null)
                        ?.getKeyframes()
                        .some((k) => 'opacity' in k),
                    );
                  return animation && animation.playState === 'running'
                    ? Number(animation.currentTime)
                    : null;
                })(),
              };
            })
            .filter((surface) => surface.opacity > 0.02);
          const own: Record<string, string> = {};
          for (const el of document.querySelectorAll<HTMLElement>(triggers))
            own[(el.textContent ?? '').trim()] =
              getComputedStyle(el).backgroundColor;
          frames.push({ t: Math.round(performance.now() - t0), surfaces, own });
          if (performance.now() - t0 < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    { selector: SURFACE, triggers: bar.triggers, duration },
  );
}

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

function expectOneHighlight(frames: TriggerFrame[], rest?: string) {
  expect(frames.length).toBeGreaterThan(5);
  const allowed = rest ? [TRANSPARENT, rest] : [TRANSPARENT];
  for (const frame of frames) {
    expect(frame.surfaces.length, `${frame.t}ms`).toBeLessThanOrEqual(1);
    for (const [name, color] of Object.entries(frame.own))
      expect(allowed, `${frame.t}ms: ${name}`).toContain(color);
  }
}

function expectOneWay(values: number[], way: 1 | -1, slack = 0.5) {
  for (let i = 1; i < values.length; i++)
    expect((values[i]! - values[i - 1]!) * way).toBeGreaterThanOrEqual(-slack);
}

export function describeMenubarTriggers(title: string, path: string) {
  describeBarTriggers(title, path, MENUBAR);
}

export function describeBarTriggers(
  title: string,
  path: string,
  bar: BarSetup,
) {
  const boxOf = async (page: Page, name: string) =>
    (await bar.locate(page, name).boundingBox())!;
  const hover = async (page: Page, name: string) => {
    const box = await boxOf(page, name);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  };
  const leave = async (page: Page) => {
    const box = await boxOf(page, bar.first);
    await page.mouse.move(Math.max(2, box.x - 120), box.y + box.height / 2);
  };
  const { first, second, third } = bar;

  test.describe(title, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.mouse.move(5, 5);
    });

    test('hovering a trigger lights it from nothing, with its own background', async ({
      page,
    }) => {
      const recording = recordTriggers(page, bar, 500);
      await hover(page, first);
      const frames = await recording;
      expectOneHighlight(frames, bar.rest);
      const lit = frames.filter((frame) => frame.surfaces.length);
      expect(lit.length).toBeGreaterThan(5);
      const file = await boxOf(page, first);
      for (const { surfaces } of lit) {
        expect(surfaces[0]!.trigger).toBe(first);
        expect(Math.abs(surfaces[0]!.left - file.x)).toBeLessThan(0.5);
        expect(surfaces[0]!.color).not.toBe(TRANSPARENT);
      }
      expect(lit[0]!.surfaces[0]!.opacity).toBeLessThan(0.7);
      expect(lit.at(-1)!.surfaces[0]!.opacity).toBe(1);
    });

    test('moving to the next trigger, the highlight glides there', async ({
      page,
    }) => {
      await hover(page, first);
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, bar, 600);
      await hover(page, second);
      const frames = await recording;
      expectOneHighlight(frames, bar.rest);
      const file = await boxOf(page, first);
      const edit = await boxOf(page, second);
      const lefts = frames.map((frame) => frame.surfaces[0]!.left);
      for (const frame of frames)
        expect(frame.surfaces[0]!.opacity, `${frame.t}ms`).toBeGreaterThan(
          0.99,
        );
      expectOneWay(lefts, 1);
      expect(
        lefts.filter((left) => left > file.x + 1 && left < edit.x - 1).length,
      ).toBeGreaterThanOrEqual(3);
      const last = frames.at(-1)!.surfaces[0]!;
      expect(last.trigger).toBe(second);
      expect(Math.abs(last.left - edit.x)).toBeLessThan(0.5);
      expect(Math.abs(last.width - edit.width)).toBeLessThan(0.5);
    });

    test("it shows up and goes on the color's curve, gently, not at once", async ({
      page,
    }) => {
      const expectGentle = (
        frames: TriggerFrame[],
        shown: (opacity: number) => number,
      ) => {
        const fading = frames.flatMap((frame) =>
          frame.surfaces[0]?.fade != null ? [frame.surfaces[0]] : [],
        );
        expect(fading.length).toBeGreaterThan(2);
        for (const { fade, opacity } of fading) {
          if (fade! > 10 && fade! <= 40)
            expect(shown(opacity), `${fade}ms`).toBeLessThan(0.5);
          if (fade! > 10 && fade! <= 80)
            expect(shown(opacity), `${fade}ms`).toBeLessThan(0.75);
        }
      };
      let recording = recordTriggers(page, bar, 400);
      await hover(page, first);
      expectGentle(await recording, (opacity) => opacity);
      await page.waitForTimeout(600);
      recording = recordTriggers(page, bar, 1500);
      await leave(page);
      expectGentle(await recording, (opacity) => 1 - opacity);
    });

    test('leaving the bar, it fades out where it is', async ({ page }) => {
      await hover(page, second);
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, bar, 900);
      await leave(page);
      const frames = await recording;
      expectOneHighlight(frames, bar.rest);
      const edit = await boxOf(page, second);
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
      await hover(page, second);
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, bar, 1000);
      await leave(page);
      await expect
        .poll(
          () =>
            page
              .locator(SURFACE)
              .evaluateAll(
                (els, triggers) =>
                  Math.min(
                    ...els
                      .filter((el) => el.parentElement?.closest(triggers))
                      .map((el) => Number(getComputedStyle(el).opacity)),
                  ),
                bar.triggers,
              ),
          { intervals: [16] },
        )
        .toBeLessThan(0.9);
      await hover(page, third);
      const frames = await recording;
      expectOneHighlight(frames, bar.rest);
      const edit = await boxOf(page, second);
      const view = await boxOf(page, third);
      const shown = frames.filter((frame) => frame.surfaces.length);
      const back = shown.findIndex(
        (frame) => frame.surfaces[0]!.trigger === third,
      );
      expect(back).toBeGreaterThan(0);
      const before = shown[back - 1]!.surfaces[0]!;
      const after = shown[back]!.surfaces[0]!;
      expect(before.opacity).toBeLessThan(0.95);
      expect(after.opacity).toBeGreaterThan(before.opacity * 0.6);
      expect(Math.abs(after.left - edit.x)).toBeLessThan(1.5);
      expect(shown[back]!.t - shown[back - 1]!.t).toBeLessThan(40);
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
      await bar.open(page, first);
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, bar, 900);
      await hover(page, bar.menu.trigger);
      await page.waitForTimeout(400);
      await bar.menu.content(page).hover();
      const frames = await recording;
      expectOneHighlight(frames, bar.rest);
      const file = await boxOf(page, first);
      const profiles = await boxOf(page, bar.menu.trigger);
      const lefts = frames.map((frame) => frame.surfaces[0]!.left);
      expectOneWay(lefts, 1, 1.5);
      expect(
        lefts.filter((left) => left > file.x + 1 && left < profiles.x - 1)
          .length,
      ).toBeGreaterThanOrEqual(3);
      for (const frame of frames.slice(-10)) {
        expect(frame.surfaces[0]!.trigger).toBe(bar.menu.trigger);
        expect(frame.surfaces[0]!.opacity).toBe(1);
      }

      if (!bar.escapeClears) return;
      await page.keyboard.press('Escape');
      await expect(page.locator(SURFACE)).toHaveCount(0, { timeout: 1000 });
    });
  });

  test.describe(`${title}, reduced motion`, () => {
    test.describe.configure({ timeout: 120_000 });
    test('it moves to the next trigger at once', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path, { waitUntil: 'networkidle' });
      await hover(page, first);
      await page.waitForTimeout(400);
      const recording = recordTriggers(page, bar, 400);
      await hover(page, second);
      const frames = await recording;
      expectOneHighlight(frames, bar.rest);
      const file = await boxOf(page, first);
      const edit = await boxOf(page, second);
      for (const frame of frames) {
        const { left } = frame.surfaces[0]!;
        expect(
          Math.min(Math.abs(left - file.x), Math.abs(left - edit.x)),
          `${frame.t}ms`,
        ).toBeLessThan(0.5);
      }
      expect(frames.at(-1)!.surfaces[0]!.trigger).toBe(second);
    });
  });
}
