import { expect, test, type Page } from '@playwright/test';

// @animate-ui/react/primitives/sidebar on its own (tests/fixtures/
// animate-ui-sidebar): shadcn/ui's sidebar behaviour (state, controlled or
// not, the cookie, useSidebar), the offcanvas slide, and the highlight
// switched off. The shadcn/ui demos (radix-ui-, base-ui-, react-aria-
// sidebar.spec.ts) cover the motion in every base.

const PATH = '/tests/fixtures/animate-ui-sidebar';
const SURFACE = '[data-slot="trigger-highlight"]';

const sidebar = (page: Page, label: string) => page.getByTestId(label);
const state = (page: Page, label: string) => page.getByTestId(`${label}-state`);

/** The container's `left` transition, paused and seeked (0, 70… 280ms). */
function seekLeft(page: Page, label: string) {
  return sidebar(page, label)
    .locator('[data-slot="sidebar-container"]')
    .evaluate((el) => {
      const animation = el
        .getAnimations()
        .find(
          (a) => a instanceof CSSTransition && a.transitionProperty === 'left',
        );
      if (!animation) return null;
      animation.pause();
      const timing = animation.effect!.getTiming();
      // From the box's padding edge (inside its border).
      const parent =
        el.parentElement!.getBoundingClientRect().left +
        el.parentElement!.clientLeft;
      const lefts = [0, 70, 140, 210, 280].map((t) => {
        animation.currentTime = t;
        return el.getBoundingClientRect().left - parent;
      });
      animation.finish();
      return {
        duration: Number(timing.duration),
        easing: String(timing.easing),
        lefts,
      };
    });
}

test.describe('animate-ui sidebar primitive', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(PATH, { waitUntil: 'networkidle' });
  });

  test('defaultOpen={false} starts collapsed, without animating', async ({
    page,
  }) => {
    await expect(state(page, 'collapsed')).toHaveText('collapsed false');
    const gap = sidebar(page, 'collapsed').locator('[data-slot="sidebar-gap"]');
    expect((await gap.boundingBox())!.width).toBe(0);
    // No transition ran on mount.
    expect(
      await sidebar(page, 'collapsed').evaluate(
        (root) => root.getAnimations({ subtree: true }).length,
      ),
    ).toBe(0);
  });

  test('offcanvas, the container slides out and in on the in-out curve', async ({
    page,
  }) => {
    await page.getByTestId('plain-toggle').click();
    const out = await seekLeft(page, 'plain');
    expect(out).not.toBeNull();
    expect(out!.duration).toBe(280);
    expect(out!.easing).toBe('cubic-bezier(0.77, 0, 0.175, 1)');
    // Slow at first, half way at half time, then there.
    expect(out!.lefts[0]).toBeCloseTo(0, 0);
    expect(out!.lefts[1]).toBeGreaterThan(-20);
    expect(out!.lefts[2]).toBeLessThan(-100);
    expect(out!.lefts[2]).toBeGreaterThan(-160);
    expect(out!.lefts[4]).toBeCloseTo(-256, 0);
    await expect(state(page, 'plain')).toHaveText('collapsed false');

    await page.getByTestId('plain-toggle').click();
    const back = await seekLeft(page, 'plain');
    expect(back!.lefts[0]).toBeCloseTo(-256, 0);
    expect(back!.lefts[4]).toBeCloseTo(0, 0);
  });

  test('toggling keeps the state in the sidebar_state cookie', async ({
    page,
    context,
  }) => {
    await page.getByTestId('collapsed-toggle').click();
    await expect(state(page, 'collapsed')).toHaveText('expanded true');
    const cookie = (await context.cookies()).find(
      (c) => c.name === 'sidebar_state',
    );
    expect(cookie?.value).toBe('true');
    // shadcn/ui's 7 days.
    expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(
      60 * 60 * 24 * 7 - 60,
    );
  });

  test('controlled: open follows its prop, onOpenChange reports changes', async ({
    page,
  }) => {
    await expect(state(page, 'controlled')).toHaveText('expanded true');
    await page.getByTestId('controlled-toggle').click();
    await expect(state(page, 'controlled')).toHaveText('collapsed false');
    await expect(page.getByTestId('controlled-changes')).toHaveText('false');
    // Changed from outside: it follows, without calling onOpenChange.
    await page.getByTestId('controlled-outside').click();
    await expect(state(page, 'controlled')).toHaveText('expanded true');
    await expect(page.getByTestId('controlled-changes')).toHaveText('false');
  });

  test('Cmd/Ctrl+B toggles every sidebar on the page', async ({ page }) => {
    await page.keyboard.press('ControlOrMeta+b');
    await expect(state(page, 'collapsed')).toHaveText('expanded true');
    await expect(state(page, 'plain')).toHaveText('collapsed false');
  });

  test('the highlight glides between buttons that clip their content', async ({
    page,
  }) => {
    const box = async (name: string) =>
      (await sidebar(page, 'controlled')
        .getByRole('button', { name, exact: true })
        .boundingBox())!;
    const inbox = await box('Inbox');
    const sent = await box('Sent');
    await page.mouse.move(inbox.x + 20, inbox.y + 10);
    await page.waitForTimeout(400);
    const tops = sidebar(page, 'controlled').evaluate(
      (root, selector) =>
        new Promise<number[]>((resolve) => {
          const out: number[] = [];
          const t0 = performance.now();
          const tick = () => {
            const visible = [
              ...root.querySelectorAll<HTMLElement>(selector),
            ].filter((el) => Number(getComputedStyle(el).opacity) > 0.5);
            // The part of it on screen: inside its clipping button, it
            // would show only once inside the button.
            for (const el of visible) out.push(el.getBoundingClientRect().top);
            if (performance.now() - t0 < 400) requestAnimationFrame(tick);
            else resolve(out);
          };
          requestAnimationFrame(tick);
        }),
      SURFACE,
    );
    await page.mouse.move(sent.x + 20, sent.y + 10);
    const frames = await tops;
    expect(
      frames.filter((top) => top > inbox.y + 1 && top < sent.y - 1).length,
    ).toBeGreaterThanOrEqual(3);
    // Beside the button, in its item: not clipped by the button.
    expect(
      await page
        .locator(SURFACE)
        .first()
        .evaluate((el) => el.parentElement!.tagName),
    ).toBe('LI');
  });

  test('the highlight follows its button as it resizes', async ({ page }) => {
    const pinned = sidebar(page, 'icons').getByRole('button', {
      name: 'Pinned',
    });
    // Lit by its own styles while it's expanded, wherever the pointer is.
    await pinned.click();
    await page.mouse.move(5, 5);
    await expect(sidebar(page, 'icons').locator(SURFACE)).toHaveCount(1);
    const frames = sidebar(page, 'icons').evaluate(
      (root, selector) =>
        new Promise<{ surface: DOMRect; item: DOMRect }[]>((resolve) => {
          const out: { surface: DOMRect; item: DOMRect }[] = [];
          const t0 = performance.now();
          const channel = new MessageChannel();
          // Read once the frame is painted (after the resize observers).
          channel.port1.onmessage = () => {
            const surface = root.querySelector(selector);
            const item = root.querySelector('[data-sidebar="menu-button"]')!;
            if (surface)
              out.push({
                surface: surface.getBoundingClientRect().toJSON(),
                item: item.getBoundingClientRect().toJSON(),
              });
            if (performance.now() - t0 < 600) tick();
            else resolve(out);
          };
          const tick = () =>
            requestAnimationFrame(() => channel.port2.postMessage(null));
          tick();
        }),
      SURFACE,
    );
    await page.getByTestId('icons-toggle').click();
    const shown = await frames;
    expect(shown.length).toBeGreaterThan(10);
    expect(
      shown.filter(({ item }) => item.width > 40 && item.width < 200).length,
    ).toBeGreaterThanOrEqual(3);
    for (const { surface, item } of shown) {
      expect(Math.abs(surface.width - item.width)).toBeLessThan(1);
      expect(Math.abs(surface.left - item.left)).toBeLessThan(1);
      expect(Math.abs(surface.top - item.top)).toBeLessThan(1);
    }
    expect(shown.at(-1)!.surface.width).toBeCloseTo(32, 0);
  });

  test('an active button keeps its own background; hovered, the surface stands for it', async ({
    page,
  }) => {
    const section = sidebar(page, 'controlled');
    const own = (name: string) =>
      section
        .getByRole('button', { name, exact: true })
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    const lit = () =>
      section
        .locator(SURFACE)
        .evaluateAll((els) =>
          els
            .filter((el) => Number(getComputedStyle(el).opacity) > 0.02)
            .map((el) => el.parentElement!.textContent!.trim()),
        );
    const TRANSPARENT = 'rgba(0, 0, 0, 0)';
    // At rest: its own background, no surface.
    expect(await own('Drafts')).not.toBe(TRANSPARENT);
    expect(await lit()).toEqual([]);
    // Another button hovered: one surface there, the active one keeps its own.
    await section.getByRole('button', { name: 'Inbox', exact: true }).hover();
    await page.waitForTimeout(300);
    expect(await lit()).toEqual(['Inbox']);
    expect(await own('Drafts')).not.toBe(TRANSPARENT);
    // The active one hovered: the surface glides there and stands for it.
    await section.getByRole('button', { name: 'Drafts', exact: true }).hover();
    await page.waitForTimeout(300);
    expect(await lit()).toEqual(['Drafts']);
    expect(await own('Drafts')).toBe(TRANSPARENT);
    // Left: its own background is back, the surface goes.
    await page.mouse.move(5, 5);
    await page.waitForTimeout(400);
    expect(await lit()).toEqual([]);
    expect(await own('Drafts')).not.toBe(TRANSPARENT);
  });

  test('animateOnHover={false}: no highlight, the buttons keep their own', async ({
    page,
  }) => {
    const inbox = sidebar(page, 'plain').getByRole('button', {
      name: 'Inbox',
      exact: true,
    });
    await inbox.hover();
    await page.waitForTimeout(300);
    await expect(sidebar(page, 'plain').locator(SURFACE)).toHaveCount(0);
    expect(
      await inbox.evaluate((el) => getComputedStyle(el).backgroundColor),
    ).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('useSidebar outside a Provider throws, as shadcn/ui', async ({
    page,
  }) => {
    await expect(page.getByTestId('outside-error')).toHaveText(
      'useSidebar must be used within a SidebarProvider.',
    );
  });
});
