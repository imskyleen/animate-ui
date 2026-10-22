import { expect, test, type Page } from '../test';

const SURFACE = '[data-slot="trigger-highlight"]';
const BUTTONS =
  '[data-sidebar="menu-button"], [data-sidebar="menu-sub-button"]';
const GAP = '[data-slot="sidebar-gap"]';
const CONTAINER = '[data-slot="sidebar-container"]';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

const EXPANDED = 256;
const ICONS = 48;

type Surface = {
  button: string;
  top: number;
  left: number;
  width: number;
  height: number;
  opacity: number;
  color: string;
  fade: number | null;
  shown: number;
  item: { top: number; left: number; width: number; height: number };
};

type HighlightFrame = {
  t: number;
  surfaces: Surface[];
  own: Record<string, string>;
};

function recordHighlight(page: Page, duration: number) {
  return page.evaluate(
    ({ selector, buttons, duration }) =>
      new Promise<HighlightFrame[]>((resolve) => {
        const frames: HighlightFrame[] = [];
        const t0 = performance.now();
        const name = (el: Element | null | undefined) =>
          (el?.textContent ?? '').trim();
        const tick = () => {
          const surfaces = [...document.querySelectorAll<HTMLElement>(selector)]
            .map((el) => {
              const style = getComputedStyle(el);
              const box = el.getBoundingClientRect();
              const fade = el
                .getAnimations()
                .find((a) =>
                  (a.effect as KeyframeEffect | null)
                    ?.getKeyframes()
                    .some((k) => 'opacity' in k),
                );
              let clip = { top: box.top, bottom: box.bottom };
              for (
                let parent = el.parentElement;
                parent && parent !== document.body;
                parent = parent.parentElement
              ) {
                if (getComputedStyle(parent).overflow === 'visible') continue;
                const rect = parent.getBoundingClientRect();
                clip = {
                  top: Math.max(clip.top, rect.top),
                  bottom: Math.min(clip.bottom, rect.bottom),
                };
              }
              const item = el.parentElement?.matches(buttons)
                ? el.parentElement
                : el.parentElement?.querySelector(buttons);
              const itemBox = item?.getBoundingClientRect();
              return {
                button: name(item),
                item: {
                  top: itemBox?.top ?? 0,
                  left: itemBox?.left ?? 0,
                  width: itemBox?.width ?? 0,
                  height: itemBox?.height ?? 0,
                },
                shown: Math.max(0, clip.bottom - clip.top) / box.height,
                top: box.top,
                left: box.left,
                width: box.width,
                height: box.height,
                opacity: Number(style.opacity),
                color: style.backgroundColor,
                fade:
                  fade && fade.playState === 'running'
                    ? Number(fade.currentTime)
                    : null,
              };
            })
            .filter((surface) => surface.opacity > 0.02);
          const own: Record<string, string> = {};
          for (const el of document.querySelectorAll<HTMLElement>(buttons))
            own[name(el)] = getComputedStyle(el).backgroundColor;
          frames.push({ t: Math.round(performance.now() - t0), surfaces, own });
          if (performance.now() - t0 < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        requestAnimationFrame(tick);
      }),
    { selector: SURFACE, buttons: BUTTONS, duration },
  );
}

type WidthFrame = {
  t: number;
  gap: number;
  container: number;
  state: string | null;
};

function recordWidths(page: Page, duration: number) {
  return page.evaluate(
    ({ gap, container, duration }) =>
      new Promise<WidthFrame[]>((resolve) => {
        const frames: WidthFrame[] = [];
        const t0 = performance.now();
        const tick = () => {
          frames.push({
            t: Math.round(performance.now() - t0),
            gap: document.querySelector(gap)!.getBoundingClientRect().width,
            container: document
              .querySelector(container)!
              .getBoundingClientRect().width,
            state: document
              .querySelector('[data-slot="sidebar"][data-state]')!
              .getAttribute('data-state'),
          });
          if (performance.now() - t0 < duration) requestAnimationFrame(tick);
          else resolve(frames);
        };
        tick();
      }),
    { gap: GAP, container: CONTAINER, duration },
  );
}

function expectOneWay(values: number[], way: 1 | -1, slack = 0.5) {
  for (let i = 1; i < values.length; i++)
    expect((values[i]! - values[i - 1]!) * way).toBeGreaterThanOrEqual(-slack);
}

const button = (page: Page, name: string) =>
  page.locator(BUTTONS).filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) });

const boxOf = async (page: Page, name: string) =>
  (await button(page, name).boundingBox())!;

async function hover(page: Page, name: string) {
  const box = await boxOf(page, name);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

const leave = (page: Page) => page.mouse.move(700, 400);

function expectCollapse(frames: WidthFrame[], from: number, to: number) {
  const way = to > from ? 1 : -1;
  expect(frames[0]!.container).toBeCloseTo(from, 0);
  expect(frames[0]!.gap).toBeCloseTo(from, 0);
  const containers = frames.map((frame) => frame.container);
  expectOneWay(containers, way);
  const between = (width: number) =>
    (width - from) * way > 1 && (to - width) * way > 1;
  expect(containers.filter(between).length).toBeGreaterThanOrEqual(5);
  expect(frames.at(-1)!.container).toBeCloseTo(to, 0);
  for (const frame of frames)
    expect(Math.abs(frame.gap - frame.container), `${frame.t}ms`).toBeLessThan(
      0.5,
    );
}

function bezier([x1, y1, x2, y2]: number[], x: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (at(x1!, x2!, mid) < x) lo = mid;
    else hi = mid;
  }
  return at(y1!, y2!, (lo + hi) / 2);
}

const COLLAPSE_MS = 280;
const COLLAPSE_CURVE = [0.77, 0, 0.175, 1];
const COLLAPSE_EASING = `cubic-bezier(${COLLAPSE_CURVE.join(', ')})`;
const LABEL_MS = 140;
const STEPS = [0, 35, 70, 105, 140, 175, 210, 245, 280];

type Seek = {
  t: number;
  container: number;
  gap: number;
  edges: number;
  icon: number;
  logo: number;
  groupLabel: { marginTop: number; opacity: number; filter: string };
  label: { opacity: number; filter: string };
  ellipses: string[];
  sub: { height: number; opacity: number };
  projects: { height: number; opacity: number };
};

type Seeked = {
  running: {
    target: string;
    property: string;
    duration: number;
    easing: string;
    delay: number;
  }[];
  steps: Seek[];
};

function seekToggle(page: Page) {
  return page.evaluate(
    ({ steps }) => {
      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]')!;
      const animations = document.getAnimations().filter((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        return target instanceof Element && wrapper.contains(target);
      });
      const describe = (element: Element) =>
        (element.getAttribute('data-sidebar') === 'menu-button'
          ? 'sidebar-menu-button'
          : element.getAttribute('data-slot')) ??
        element.getAttribute('data-sidebar') ??
        element.tagName.toLowerCase();
      const running = animations.map((animation) => {
        const effect = animation.effect as KeyframeEffect;
        const timing = effect.getTiming();
        return {
          target: describe(effect.target!),
          property:
            animation instanceof CSSTransition
              ? animation.transitionProperty
              : effect
                  .getKeyframes()
                  .flatMap((k) =>
                    Object.keys(k).filter(
                      (key) =>
                        ![
                          'offset',
                          'easing',
                          'composite',
                          'computedOffset',
                        ].includes(key),
                    ),
                  )
                  .filter((key, i, all) => all.indexOf(key) === i)
                  .join('+'),
          duration: Number(timing.duration),
          easing: String(timing.easing),
          delay: Number(timing.delay ?? 0),
        };
      });
      for (const animation of animations) animation.pause();
      const button = (name: string) =>
        [
          ...document.querySelectorAll<HTMLElement>(
            '[data-sidebar="menu-button"]',
          ),
        ].find((el) => el.textContent?.trim().startsWith(name))!;
      const shownOpacity = (element: Element) => {
        let opacity = 1;
        for (let el: Element | null = element; el; el = el.parentElement)
          opacity *= Number(getComputedStyle(el).opacity);
        return opacity;
      };
      const read = (t: number) => {
        for (const animation of animations) animation.currentTime = t;
        const container = document
          .querySelector('[data-slot="sidebar-container"]')!
          .getBoundingClientRect();
        const inset = document
          .querySelector('[data-slot="sidebar-inset"]')!
          .getBoundingClientRect();
        const models = button('Models');
        const groupLabel = document.querySelector<HTMLElement>(
          '[data-sidebar="group-label"]',
        )!;
        const label = models.querySelector('span')!;
        const sub = document.querySelector<HTMLElement>(
          ':is([data-sidebar="menu-sub"],[data-slot="sidebar-menu-sub"])',
        )!;
        const projects = button('Design Engineering').closest<HTMLElement>(
          ':is([data-sidebar="group"],[data-slot="sidebar-group"])',
        )!;
        const ellipses = [
          ...wrapper.querySelectorAll<HTMLElement>('[data-sidebar] span'),
        ]
          .filter(
            (span) =>
              span.textContent?.trim() &&
              span.scrollWidth > span.clientWidth + 0.5 &&
              span.clientWidth > 1 &&
              getComputedStyle(span).textOverflow === 'ellipsis' &&
              shownOpacity(span) > 0.02 &&
              getComputedStyle(span).display !== 'none',
          )
          .map((span) => span.textContent!.trim());
        return {
          t,
          container: container.width,
          gap: document
            .querySelector('[data-slot="sidebar-gap"]')!
            .getBoundingClientRect().width,
          edges: container.right - inset.left,
          icon: models.querySelector('svg')!.getBoundingClientRect().left,
          logo: button('Acme').firstElementChild!.getBoundingClientRect().left,
          groupLabel: {
            marginTop: parseFloat(getComputedStyle(groupLabel).marginTop),
            opacity: Number(getComputedStyle(groupLabel).opacity),
            filter: getComputedStyle(groupLabel).filter,
          },
          label: {
            opacity: Number(getComputedStyle(label).opacity),
            filter: getComputedStyle(label).filter,
          },
          ellipses,
          sub: {
            height: sub.getBoundingClientRect().height,
            opacity: shownOpacity(sub),
          },
          projects: {
            height: projects.getBoundingClientRect().height,
            opacity: shownOpacity(projects),
          },
        };
      };
      const result = steps.map(read);
      for (const animation of animations) animation.finish();
      return { running, steps: result };
    },
    { steps: STEPS },
  ) as Promise<Seeked>;
}

function heightsBefore(page: Page) {
  return page.evaluate(() => ({
    sub: document
      .querySelector(
        ':is([data-sidebar="menu-sub"],[data-slot="sidebar-menu-sub"])',
      )!
      .getBoundingClientRect().height,
    projects: [
      ...document.querySelectorAll<HTMLElement>('[data-sidebar="menu-button"]'),
    ]
      .find((el) => el.textContent?.includes('Design Engineering'))!
      .closest(':is([data-sidebar="group"],[data-slot="sidebar-group"])')!
      .getBoundingClientRect().height,
  }));
}

function expectToggle(
  seeked: Seeked,
  collapsing: boolean,
  heights: { sub: number; projects: number },
) {
  for (const target of [
    'sidebar-gap',
    'sidebar-container',
    'sidebar-menu-button',
  ]) {
    const transitions = seeked.running.filter(
      (r) => r.target === target && /width/.test(r.property),
    );
    expect(transitions.length, target).toBeGreaterThan(0);
    for (const r of transitions) {
      expect(r.duration, target).toBe(COLLAPSE_MS);
      expect(r.easing, target).toBe(COLLAPSE_EASING);
    }
  }
  const from = collapsing ? EXPANDED : ICONS;
  const to = collapsing ? ICONS : EXPANDED;
  for (const step of seeked.steps) {
    const at = `${step.t}ms`;
    const p = bezier(COLLAPSE_CURVE, step.t / COLLAPSE_MS);
    const shrink = collapsing ? p : 1 - p;
    expect(
      Math.abs(step.container - (from + (to - from) * p)),
      at,
    ).toBeLessThan(1);
    expect(Math.abs(step.edges), at).toBeLessThan(0.5);
    expect(Math.abs(step.gap - step.container), at).toBeLessThan(0.5);
    expect(Math.abs(step.icon - 16), at).toBeLessThan(0.5);
    expect(Math.abs(step.logo - (16 - 8 * shrink)), at).toBeLessThan(0.5);
    expect(Math.abs(step.groupLabel.marginTop + 32 * shrink), at).toBeLessThan(
      0.5,
    );
    const labelShown = collapsing
      ? step.t >= LABEL_MS
        ? 0
        : null
      : step.t <= COLLAPSE_MS - LABEL_MS
        ? 0
        : null;
    if (labelShown === 0) {
      expect(step.label.opacity, at).toBeLessThan(0.01);
      expect(step.groupLabel.opacity, at).toBeLessThan(0.01);
    }
    expect(step.ellipses, at).toEqual([]);
    expect(
      Math.abs(step.sub.height - heights.sub * (1 - shrink)),
      at,
    ).toBeLessThan(1);
    expect(
      Math.abs(step.projects.height - heights.projects * (1 - shrink)),
      at,
    ).toBeLessThan(1);
    expect(step.sub.opacity, at).toBeLessThanOrEqual(1);
  }
  const first = seeked.steps[0]!;
  const last = seeked.steps.at(-1)!;
  if (collapsing) {
    expect(first.label.opacity).toBe(1);
    expect(first.label.filter).toBe('blur(0px)');
    const faded = seeked.steps.find((step) => step.t === LABEL_MS)!;
    expect(faded.label.filter).toBe('blur(2px)');
    expect(last.sub.opacity).toBeLessThan(0.01);
  } else {
    expect(last.label.opacity).toBe(1);
    expect(['none', 'blur(0px)']).toContain(last.label.filter);
    expect(last.groupLabel.opacity).toBe(1);
    expect(last.sub.opacity).toBe(1);
    expect(last.projects.opacity).toBe(1);
  }
}

export function describeSidebar(
  library: string,
  path = `/examples/${library}/sidebar`,
  docs = `/docs/primitives/${library}/sidebar`,
) {
  const title = `${library} sidebar demo`;
  const trigger = (page: Page) =>
    page.locator('[data-sidebar="trigger"]').first();
  const state = (page: Page) =>
    page
      .locator('[data-slot="sidebar"][data-state]')
      .getAttribute('data-state');

  test.describe(title, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.mouse.move(700, 400);
    });

    test('hovering a menu button lights it from nothing, with its own background', async ({
      page,
    }) => {
      const recording = recordHighlight(page, 500);
      await hover(page, 'Models');
      const frames = await recording;
      const models = await boxOf(page, 'Models');
      const lit = frames.filter((frame) => frame.surfaces.length);
      expect(lit.length).toBeGreaterThan(5);
      for (const frame of frames) {
        expect(frame.surfaces.length, `${frame.t}ms`).toBeLessThanOrEqual(1);
        expect(frame.own.Models, `${frame.t}ms`).toBe(TRANSPARENT);
      }
      for (const { surfaces } of lit) {
        const [surface] = surfaces;
        expect(surface!.button).toBe('Models');
        expect(Math.abs(surface!.top - models.y)).toBeLessThan(0.5);
        expect(Math.abs(surface!.left - models.x)).toBeLessThan(0.5);
        expect(Math.abs(surface!.width - models.width)).toBeLessThan(0.5);
        expect(Math.abs(surface!.height - models.height)).toBeLessThan(0.5);
        expect(surface!.color).not.toBe(TRANSPARENT);
      }
      expect(lit[0]!.surfaces[0]!.opacity).toBeLessThan(0.7);
      for (const { surfaces } of lit) {
        const { fade, opacity } = surfaces[0]!;
        if (fade !== null && fade > 10 && fade <= 40)
          expect(opacity, `${fade}ms`).toBeLessThan(0.5);
      }
      expect(lit.at(-1)!.surfaces[0]!.opacity).toBe(1);
      const covered = await button(page, 'Models').evaluate((el) => {
        const box = el.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.x + 40,
          box.y + box.height / 2,
        );
        return el.contains(hit);
      });
      expect(covered).toBe(true);
    });

    test('moving to another button, the highlight glides there', async ({
      page,
    }) => {
      await hover(page, 'Models');
      await page.waitForTimeout(400);
      const recording = recordHighlight(page, 500);
      await hover(page, 'Documentation');
      const frames = await recording;
      const models = await boxOf(page, 'Models');
      const documentation = await boxOf(page, 'Documentation');
      for (const frame of frames) {
        expect(frame.surfaces.length, `${frame.t}ms`).toBe(1);
        expect(frame.surfaces[0]!.opacity, `${frame.t}ms`).toBeGreaterThan(
          0.99,
        );
        expect(frame.surfaces[0]!.shown, `${frame.t}ms`).toBeGreaterThan(0.99);
        for (const [name, color] of Object.entries(frame.own))
          if (name === 'Models' || name === 'Documentation')
            expect(color, `${frame.t}ms: ${name}`).toBe(TRANSPARENT);
      }
      const tops = frames.map((frame) => frame.surfaces[0]!.top);
      expectOneWay(tops, 1);
      expect(
        tops.filter((top) => top > models.y + 1 && top < documentation.y - 1)
          .length,
      ).toBeGreaterThanOrEqual(3);
      const moved = frames.findIndex(
        (frame) => frame.surfaces[0]!.top > models.y + 0.5,
      );
      const start = frames[moved]!.t;
      const at = (t: number) =>
        frames.find((frame) => frame.t >= start + t) ?? frames.at(-1)!;
      const progress = (frame: HighlightFrame) =>
        (frame.surfaces[0]!.top - models.y) / (documentation.y - models.y);
      expect(progress(at(100))).toBeGreaterThan(0.6);
      expect(progress(at(100))).toBeLessThan(0.995);
      const last = frames.at(-1)!.surfaces[0]!;
      expect(last.button).toBe('Documentation');
      expect(Math.abs(last.top - documentation.y)).toBeLessThan(0.5);
      expect(progress(at(320))).toBeGreaterThan(0.99);
    });

    test('it glides into a sub-menu button, and back out', async ({ page }) => {
      await hover(page, 'Playground');
      await page.waitForTimeout(400);
      let recording = recordHighlight(page, 500);
      await hover(page, 'Starred');
      let frames = await recording;
      const playground = await boxOf(page, 'Playground');
      const starred = await boxOf(page, 'Starred');
      for (const frame of frames)
        expect(
          Math.max(...frame.surfaces.map((surface) => surface.opacity)),
          `${frame.t}ms`,
        ).toBeGreaterThan(0.99);
      const entering = frames.flatMap((frame) =>
        frame.surfaces.filter((surface) => surface.button === 'Starred'),
      );
      expect(entering.length).toBeGreaterThan(5);
      expect(Math.abs(entering[0]!.top - playground.y)).toBeLessThan(
        (starred.y - playground.y) / 2,
      );
      expectOneWay(
        entering.map((surface) => surface.top),
        1,
      );
      const last = frames.at(-1)!.surfaces;
      expect(last).toHaveLength(1);
      expect(last[0]!.button).toBe('Starred');
      expect(Math.abs(last[0]!.top - starred.y)).toBeLessThan(0.5);
      expect(Math.abs(last[0]!.left - starred.x)).toBeLessThan(0.5);
      expect(Math.abs(last[0]!.width - starred.width)).toBeLessThan(0.5);

      recording = recordHighlight(page, 500);
      await hover(page, 'Models');
      frames = await recording;
      const models = await boxOf(page, 'Models');
      for (const frame of frames)
        expect(
          Math.max(...frame.surfaces.map((surface) => surface.opacity)),
          `${frame.t}ms`,
        ).toBeGreaterThan(0.99);
      const back = frames.at(-1)!.surfaces;
      expect(back).toHaveLength(1);
      expect(back[0]!.button).toBe('Models');
      expect(Math.abs(back[0]!.top - models.y)).toBeLessThan(0.5);
    });

    for (const [where, name] of [
      ['header', 'Acme Inc'],
      ['footer', 'shadcn'],
    ] as const)
      test(`the ${where}'s dropdown trigger stays lit while its menu is open`, async ({
        page,
      }) => {
        const trigger = page.locator(BUTTONS).filter({ hasText: name });
        const surfaces = () =>
          page.locator(SURFACE).evaluateAll(
            (els, buttons) =>
              els
                .filter((el) => Number(getComputedStyle(el).opacity) > 0.02)
                .map((el) => ({
                  button: (
                    el.parentElement?.querySelector(buttons)?.textContent ?? ''
                  ).trim(),
                  opacity: Number(getComputedStyle(el).opacity),
                  color: getComputedStyle(el).backgroundColor,
                })),
            BUTTONS,
          );
        const expectLit = async (when: string) => {
          const lit = await surfaces();
          expect(lit, when).toHaveLength(1);
          expect(lit[0]!.button, when).toContain(name);
          expect(lit[0]!.opacity, when).toBe(1);
          expect(lit[0]!.color, when).not.toBe(TRANSPARENT);
          expect(
            await trigger.evaluate(
              (el) => getComputedStyle(el).backgroundColor,
            ),
            when,
          ).toBe(TRANSPARENT);
        };
        await trigger.click();
        const menu = page.getByRole('menu');
        await expect(menu).toBeVisible();
        await page.waitForTimeout(400);
        await expectLit('open');
        const box = (await menu.boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(400);
        await expectLit('pointer in the menu');
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(300);
        await expectLit('keyboard in the menu');
        await page.mouse.move(700, 400);
        const recording = recordHighlight(page, 600);
        await page.keyboard.press('Escape');
        const frames = await recording;
        const fading = frames.filter(
          (frame) =>
            frame.surfaces[0] &&
            frame.surfaces[0].opacity > 0.05 &&
            frame.surfaces[0].opacity < 0.95,
        );
        expect(fading.length).toBeGreaterThanOrEqual(2);
        for (const frame of frames)
          expect(frame.surfaces.length, `${frame.t}ms`).toBeLessThanOrEqual(1);
        expect(frames.at(-1)!.surfaces).toEqual([]);
      });

    test('leaving the sidebar, it fades out where it is, on the color curve', async ({
      page,
    }) => {
      await hover(page, 'Documentation');
      await page.waitForTimeout(400);
      const recording = recordHighlight(page, 500);
      await leave(page);
      const frames = await recording;
      const documentation = await boxOf(page, 'Documentation');
      const fading = frames.filter(
        (frame) => frame.surfaces[0] && frame.surfaces[0].opacity < 0.99,
      );
      expect(fading.length).toBeGreaterThanOrEqual(3);
      for (const { surfaces } of fading) {
        expect(surfaces).toHaveLength(1);
        expect(Math.abs(surfaces[0]!.top - documentation.y)).toBeLessThan(0.5);
        const { fade, opacity } = surfaces[0]!;
        if (fade !== null && fade > 10 && fade <= 40)
          expect(opacity, `${fade}ms`).toBeGreaterThan(0.5);
      }
      expectOneWay(
        fading.map((frame) => frame.surfaces[0]!.opacity),
        -1,
      );
      expect(frames.at(-1)!.surfaces).toEqual([]);
      await expect(page.locator(SURFACE)).toHaveCount(0);
      expect(frames.at(-1)!.own.Documentation).toBe(TRANSPARENT);
    });

    test('collapsing to icons and expanding again: one curve for all, edges together', async ({
      page,
    }) => {
      let recording = recordWidths(page, 700);
      await trigger(page).click();
      let frames = await recording;
      expect(frames.at(-1)!.state).toBe('collapsed');
      expectCollapse(frames, EXPANDED, ICONS);

      recording = recordWidths(page, 700);
      await trigger(page).click();
      frames = await recording;
      expect(frames.at(-1)!.state).toBe('expanded');
      expectCollapse(frames, ICONS, EXPANDED);

      await page.waitForTimeout(100);
      let heights = await heightsBefore(page);
      await trigger(page).click();
      expectToggle(await seekToggle(page), true, heights);
      await page.waitForTimeout(100);
      await trigger(page).click();
      expectToggle(await seekToggle(page), false, heights);
      heights = await heightsBefore(page);
      expect(heights.sub).toBeGreaterThan(50);
    });

    test('Cmd/Ctrl+B toggles it, and the cookie keeps its state', async ({
      page,
      context,
    }) => {
      const cookie = async () =>
        (await context.cookies()).find((c) => c.name === 'sidebar_state')
          ?.value;
      expect(await state(page)).toBe('expanded');
      const heights = await heightsBefore(page);
      await page.keyboard.press('ControlOrMeta+b');
      expectToggle(await seekToggle(page), true, heights);
      expect(await state(page)).toBe('collapsed');
      expect(await cookie()).toBe('false');
      await page.keyboard.press('ControlOrMeta+b');
      expect(await state(page)).toBe('expanded');
      expect(await cookie()).toBe('true');
    });

    test('collapsed to icons, a button shows its animated tooltip', async ({
      page,
    }) => {
      const tooltip = page
        .locator('[data-slot="tooltip-content"]')
        .filter({ hasText: 'Models' });
      await page.keyboard.press('ControlOrMeta+b');
      await page.waitForTimeout(600);
      const frames = page.evaluate(
        () =>
          new Promise<{ t: number; opacity: number; transform: string }[]>(
            (resolve) => {
              const out: { t: number; opacity: number; transform: string }[] =
                [];
              const t0 = performance.now();
              const tick = () => {
                const el = [
                  ...document.querySelectorAll<HTMLElement>(
                    '[data-slot="tooltip-content"]',
                  ),
                ].find(
                  (node) =>
                    node.textContent?.includes('Models') &&
                    node.getClientRects().length > 0,
                );
                if (el) {
                  const style = getComputedStyle(el);
                  out.push({
                    t: performance.now() - t0,
                    opacity: Number(style.opacity),
                    transform: style.transform,
                  });
                }
                if (performance.now() - t0 < 1200) requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            },
          ),
      );
      await hover(page, 'Models');
      const shown = await frames;
      await expect(tooltip).toBeVisible();
      expect(shown.length).toBeGreaterThan(5);
      expect(shown[0]!.opacity).toBeLessThan(1);
      expect(shown.at(-1)!.opacity).toBe(1);
      const models = await boxOf(page, 'Models');
      const box = (await tooltip.boundingBox())!;
      expect(box.x).toBeGreaterThan(models.x + models.width);

      await leave(page);
      await page.keyboard.press('ControlOrMeta+b');
      await page.waitForTimeout(600);
      await hover(page, 'Models');
      await page.waitForTimeout(400);
      await expect(tooltip).toBeHidden();
    });

    test("the trigger's panel icon narrows as the sidebar closes, and widens back", async ({
      page,
    }) => {
      const shifts = () =>
        page.evaluate(
          () =>
            new Promise<number[]>((resolve) => {
              const out: number[] = [];
              const t0 = performance.now();
              const tick = () => {
                const part = document.querySelector(
                  '[data-sidebar="trigger"] svg > :last-child',
                );
                if (part)
                  out.push(new DOMMatrix(getComputedStyle(part).transform).e);
                if (performance.now() - t0 < 700) requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            }),
        );
      let frames = shifts();
      await page.keyboard.press('ControlOrMeta+b');
      let seen = await frames;
      expect(seen[0]).toBeCloseTo(0, 1);
      expect(seen.some((x) => x < -0.3 && x > -1.7)).toBe(true);
      expect(seen.at(-1)).toBeCloseTo(-2, 1);
      frames = shifts();
      await page.keyboard.press('ControlOrMeta+b');
      seen = await frames;
      expect(seen.some((x) => x < -0.3 && x > -1.7)).toBe(true);
      expect(seen.at(-1)).toBeCloseTo(0, 1);
    });

    test("the rail's hover line fades on the color's curve", async ({
      page,
    }) => {
      const rail = page.locator('[data-sidebar="rail"]');
      const timing = await rail.evaluate((el) => {
        const after = getComputedStyle(el, '::after');
        return {
          property: after.transitionProperty,
          duration: after.transitionDuration,
          easing: after.transitionTimingFunction,
        };
      });
      expect(timing).toEqual({
        property: 'background-color',
        duration: '0.2s',
        easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      });
    });

    test("a sub-menu's chevron turns as it opens, on the disclosure's timing", async ({
      page,
    }) => {
      const chevron = (name: string) =>
        button(page, name).locator('svg').last();
      const angle = (name: string) =>
        chevron(name).evaluate(
          (el) => parseFloat(getComputedStyle(el).rotate) || 0,
        );
      await expect.poll(() => angle('Playground')).toBe(90);
      expect(await angle('Models')).toBe(0);
      expect(
        await chevron('Models').evaluate((el) => {
          const style = getComputedStyle(el);
          return [style.transitionDuration, style.transitionTimingFunction];
        }),
      ).toEqual(['0.35s', 'cubic-bezier(0.215, 0.61, 0.355, 1)']);
      await button(page, 'Models').click();
      await expect.poll(() => angle('Models')).toBe(90);
      await button(page, 'Models').click();
      await expect.poll(() => angle('Models')).toBe(0);
    });

    // Bug: in Vue, during a fast sweep, highlights handed off from earlier buttons stayed lit where they were.
    test('a fast sweep leaves one highlight, never several apart', async ({
      page,
    }) => {
      const boxes = await page
        .locator(BUTTONS)
        .filter({ visible: true })
        .evaluateAll((els) =>
          els.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, h: r.height };
          }),
        );
      const x = boxes[2]!.x + 60;
      const top = Math.min(...boxes.map((b) => b.y)) - 20;
      const bottom = Math.max(...boxes.map((b) => b.y + b.h)) + 20;
      await page.mouse.move(x, top);
      const spread = page.evaluate(async (surface) => {
        const apart: number[] = [];
        const start = performance.now();
        while (performance.now() - start < 1800) {
          await new Promise((r) => requestAnimationFrame(r));
          const ys = [...document.querySelectorAll(surface)]
            .filter((el) => Number(getComputedStyle(el).opacity) > 0.6)
            .map((el) => el.getBoundingClientRect().y);
          if (ys.length > 1) apart.push(Math.max(...ys) - Math.min(...ys));
        }
        return apart.filter((d) => d > 24).length;
      }, SURFACE);
      await page.mouse.move(x, bottom, { steps: 12 });
      await page.waitForTimeout(80);
      await page.mouse.move(x, top + 40, { steps: 9 });
      expect(await spread).toBe(0);
    });

    test('nothing animates on mount', async ({ page }) => {
      await page.addInitScript(
        ({ gap, surface }) => {
          const w = window as unknown as {
            __mount: { gap: number | null; surfaces: number }[];
          };
          w.__mount = [];
          let shownAt: number | null = null;
          const tick = () => {
            const el = document.querySelector(gap);
            if (el && shownAt === null) shownAt = performance.now();
            w.__mount.push({
              gap: el ? el.getBoundingClientRect().width : null,
              surfaces: document.querySelectorAll(surface).length,
            });
            if (shownAt === null || performance.now() - shownAt < 1500)
              requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        },
        { gap: GAP, surface: SURFACE },
      );
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const frames = await page.evaluate(
        () =>
          (
            window as unknown as {
              __mount: { gap: number | null; surfaces: number }[];
            }
          ).__mount,
      );
      const shown = frames.filter((frame) => frame.gap !== null);
      expect(shown.length).toBeGreaterThan(5);
      for (const frame of shown) {
        expect(frame.gap).toBeCloseTo(EXPANDED, 0);
        expect(frame.surfaces).toBe(0);
      }
    });
  });

  test.describe(`${title}, in the docs`, () => {
    test.describe.configure({ timeout: 120_000 });
    test('the preview shows it in an iframe of its page, at a desktop width', async ({
      page,
    }) => {
      await page.goto(docs, {
        waitUntil: 'networkidle',
      });
      const iframe = page.locator('[data-slot="preview-iframe"]');
      await expect(iframe).toHaveAttribute('src', path);
      const frame = page.frameLocator('[data-slot="preview-iframe"]');
      await expect(frame.locator(CONTAINER)).toBeVisible();
      expect((await iframe.boundingBox())!.width).toBeGreaterThanOrEqual(1024);
      await expect(
        frame.locator(BUTTONS).filter({ hasText: /^\s*Models\s*$/ }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Replay' }).first().click();
      await expect(frame.locator(CONTAINER)).toBeVisible();
    });
  });

  test.describe(`${title}, reduced motion`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.beforeEach(async ({ page, context }) => {
      await context.clearCookies();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.mouse.move(700, 400);
    });

    test('it collapses and expands at once, its labels still fading through their blur', async ({
      page,
    }) => {
      const recording = recordWidths(page, 400);
      await trigger(page).click();
      const frames = await recording;
      expect(frames.at(-1)!.state).toBe('collapsed');
      for (const frame of frames) {
        for (const width of [frame.gap, frame.container])
          expect(
            Math.min(Math.abs(width - EXPANDED), Math.abs(width - ICONS)),
            `${frame.t}ms`,
          ).toBeLessThan(0.5);
      }
      await trigger(page).click();
      const { running } = await seekToggle(page);
      const fades = running.filter((r) => /opacity/.test(r.property));
      expect(fades.length).toBeGreaterThan(3);
      expect(running.some((r) => /filter/.test(r.property))).toBe(true);
      for (const r of running) expect(r.property).not.toMatch(/height/);
    });

    test('the highlight moves to the next button at once, and still fades', async ({
      page,
    }) => {
      await hover(page, 'Models');
      await page.waitForTimeout(400);
      let recording = recordHighlight(page, 400);
      await hover(page, 'Documentation');
      let frames = await recording;
      const models = await boxOf(page, 'Models');
      const documentation = await boxOf(page, 'Documentation');
      for (const frame of frames) {
        expect(frame.surfaces).toHaveLength(1);
        const { top } = frame.surfaces[0]!;
        expect(
          Math.min(Math.abs(top - models.y), Math.abs(top - documentation.y)),
          `${frame.t}ms`,
        ).toBeLessThan(0.5);
      }
      expect(frames.at(-1)!.surfaces[0]!.button).toBe('Documentation');

      recording = recordHighlight(page, 400);
      await leave(page);
      frames = await recording;
      expect(
        frames.filter(
          (frame) =>
            frame.surfaces[0] &&
            frame.surfaces[0].opacity > 0.05 &&
            frame.surfaces[0].opacity < 0.95,
        ).length,
      ).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe(`${title}, on a phone`, () => {
    test.describe.configure({ timeout: 120_000 });
    test.use({ viewport: { width: 390, height: 844 } });

    test('the trigger opens a sheet that slides in from the left', async ({
      page,
    }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page.locator(CONTAINER)).toBeHidden();
      const sheet =
        '[data-mobile="true"][data-side], [data-slot="sheet-content"][data-side]';
      const frames = page.evaluate(
        (sheet) =>
          new Promise<{ t: number; left: number; opacity: number }[]>(
            (resolve) => {
              const out: { t: number; left: number; opacity: number }[] = [];
              const t0 = performance.now();
              const tick = () => {
                const el = document.querySelector<HTMLElement>(sheet);
                if (el)
                  out.push({
                    t: performance.now() - t0,
                    left: el.getBoundingClientRect().left,
                    opacity: Number(getComputedStyle(el).opacity),
                  });
                if (performance.now() - t0 < 800) requestAnimationFrame(tick);
                else resolve(out);
              };
              requestAnimationFrame(tick);
            },
          ),
        sheet,
      );
      await trigger(page).click();
      const shown = await frames;
      expect(shown.length).toBeGreaterThan(5);
      expect(shown[0]!.left).toBeLessThan(-100);
      expectOneWay(
        shown.map((frame) => frame.left),
        1,
      );
      expect(Math.abs(shown.at(-1)!.left)).toBeLessThan(0.5);
      expect(
        shown.filter((frame) => frame.left < -5 && frame.left > -250).length,
      ).toBeGreaterThanOrEqual(3);

      const recording = recordHighlight(page, 400);
      await hover(page, 'Models');
      const lit = (await recording).filter((frame) => frame.surfaces.length);
      expect(lit.length).toBeGreaterThan(3);
      expect(lit.at(-1)!.surfaces[0]!.button).toBe('Models');

      await page.keyboard.press('ControlOrMeta+b');
      await expect(page.locator(sheet)).toHaveCount(0);
    });
  });
}
