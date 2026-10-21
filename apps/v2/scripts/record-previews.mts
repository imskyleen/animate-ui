import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { chromium, type Page } from '@playwright/test';

const BASE = 'http://localhost:3300';
const root = path.join(import.meta.dirname, '..');
const outDir = path.join(root, 'public', 'previews');
mkdirSync(outDir, { recursive: true });

function ffmpegPath() {
  const cache = path.join(homedir(), 'Library', 'Caches', 'ms-playwright');
  const dir = readdirSync(cache).find((name) => name.startsWith('ffmpeg-'));
  if (!dir)
    throw new Error(
      'No Playwright ffmpeg: run `pnpm exec playwright install ffmpeg`.',
    );
  const bin = readdirSync(path.join(cache, dir)).find((name) =>
    name.startsWith('ffmpeg'),
  );
  return path.join(cache, dir, bin!);
}
const FFMPEG = ffmpegPath();

const OUTPUT = { width: 840, height: 630 };
const FILL = 0.78;
const MAX_ZOOM = 1.6;
const VIEWPORT = { width: 400, height: 300 };
const LARGE = { width: 480, height: 360 };

const zoomed = (size: { width: number; height: number }, zoom: number) => ({
  width: Math.round(size.width / zoom),
  height: Math.round(size.height / zoom),
});

const POPUPS = new Set([
  'alert-dialog',
  'combobox',
  'context-menu',
  'dialog',
  'drawer',
  'dropdown-menu',
  'hover-card',
  'menubar',
  'navigation-menu',
  'popover',
  'preview-link-card',
  'select',
  'sheet',
  'toast',
  'tooltip',
]);

async function measure(
  preview: Preview,
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  viewport: { width: number; height: number },
) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(`${BASE}${preview.demo}`, { waitUntil: 'networkidle' });
  await settle(page, preview);
  const box = await page.evaluate(() => {
    const main = document.querySelector('main');
    if (!main) return null;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const element of main.querySelectorAll('*')) {
      const style = getComputedStyle(element);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const painted =
        element.childElementCount === 0 ||
        /^(BUTTON|INPUT|SVG|IMG|CANVAS|VIDEO|svg)$/.test(element.tagName) ||
        parseFloat(style.borderTopWidth) > 0 ||
        style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      if (!painted) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 2 || rect.height <= 2) continue;
      if (rect.width >= innerWidth - 1 && rect.height >= innerHeight - 1)
        continue;
      left = Math.min(left, rect.left);
      top = Math.min(top, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
    return Number.isFinite(left) ? { left, top, right, bottom } : null;
  });
  await context.close();
  return box;
}

async function fitZoom(
  preview: Preview,
  browser: Awaited<ReturnType<typeof chromium.launch>>,
) {
  if (preview.zoom === false || preview.id.startsWith('backgrounds/')) return 1;
  if (POPUPS.has(preview.id.split('/').pop()!)) return 1;
  const viewport = preview.viewport ?? VIEWPORT;
  const base = await measure(preview, browser, viewport);
  if (!base) return 1;
  const fill = preview.nowrap ? 0.68 : FILL;
  const width = base.right - base.left;
  const height = base.bottom - base.top;
  let zoom = Math.max(
    1,
    Math.min(
      MAX_ZOOM,
      (viewport.width * fill) / width,
      (viewport.height * fill) / height,
    ),
  );
  while (zoom > 1) {
    const size = zoomed(viewport, zoom);
    const box = await measure(preview, browser, size);
    if (
      box &&
      box.left >= 8 &&
      box.top >= 8 &&
      box.right <= size.width - 8 &&
      box.bottom <= size.height - 8 &&
      box.bottom - box.top <= height * 1.04 &&
      box.right - box.left <= width * 1.04
    )
      break;
    zoom = Math.max(1, zoom - 0.1);
  }
  return zoom;
}

const CURSOR = `
(() => {
  const mount = () => {
    if (document.getElementById('__preview-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = '__preview-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.style.cssText =
      'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;translate:-60px -60px;will-change:translate';
    cursor.innerHTML =
      '<div style="transform-origin:3px 2px;transition:scale 120ms cubic-bezier(0.23,1,0.32,1)"><svg width="22" height="24" viewBox="0 0 22 24" style="display:block;filter:drop-shadow(0 1.5px 2px rgba(0,0,0,0.35))"><path d="M3 2.2v17.6c0 .7.8 1 1.3.5l4.4-4.6 3.3 6.4c.3.5.9.7 1.4.5l2-1c.5-.3.7-.9.4-1.4l-3.2-6.3h6.3c.7 0 1.1-.8.6-1.3L4.3 1.6C3.8 1.1 3 1.5 3 2.2Z" fill="#F59E0B" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg></div>';
    document.documentElement.appendChild(cursor);
    const inner = cursor.firstElementChild;
    window.__previewCursor = (x, y) => {
      cursor.style.translate = x + 'px ' + y + 'px';
    };
    addEventListener('mousemove', (event) => {
      cursor.style.translate = event.clientX + 'px ' + event.clientY + 'px';
    }, true);
    addEventListener('mousedown', () => { inner.style.scale = '0.82'; }, true);
    addEventListener('mouseup', () => { inner.style.scale = '1'; }, true);
  };
  if (document.readyState === 'loading')
    addEventListener('DOMContentLoaded', mount);
  else mount();
})();
`;

const HIDE_DEV = 'nextjs-portal{display:none!important}';

const layout = (preview?: Preview) =>
  HIDE_DEV +
  (preview?.shift
    ? `main{padding-${preview.shift > 0 ? 'bottom' : 'top'}:${Math.abs(preview.shift)}px!important}`
    : '') +
  (preview?.nowrap ? 'main,main *{text-wrap-mode:nowrap!important}' : '');

async function settle(page: Page, preview?: Preview) {
  await page.addStyleTag({ content: layout(preview) });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

type Preview = {
  id: string;
  demo: string;
  mount?: boolean;
  play?: (page: Page) => Promise<void>;
  tail?: number;
  shift?: number;
  cursor?: false;
  zoom?: false;
  nowrap?: true;
  viewport?: { width: number; height: number };
};

const wait = (page: Page, ms: number) => page.waitForTimeout(ms);

const pointer = { x: -40, y: -40 };
const size = { width: 0, height: 0 };

async function glide(page: Page, x: number, y: number, ms = 250) {
  const steps = Math.max(1, Math.round(ms / 16));
  const from = { ...pointer };
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    const px = from.x + (x - from.x) * e;
    const py = from.y + (y - from.y) * e;
    if (px >= 0 && py >= 0 && px < size.width && py < size.height)
      await page.mouse.move(px, py);
    await page.evaluate(
      ([cx, cy]) =>
        (
          window as unknown as {
            __previewCursor?: (x: number, y: number) => void;
          }
        ).__previewCursor?.(cx!, cy!),
      [px, py],
    );
    await page.waitForTimeout(12);
  }
  pointer.x = x;
  pointer.y = y;
}

async function pointAt(page: Page, target: ReturnType<Page['locator']>) {
  const box = (await target.boundingBox())!;
  await glide(page, box.x + box.width / 2, box.y + box.height / 2);
}

async function press(
  page: Page,
  target: ReturnType<Page['locator']>,
  hold = 160,
) {
  await pointAt(page, target);
  await wait(page, 120);
  await page.mouse.down();
  await wait(page, hold);
  await page.mouse.up();
}

const away = (page: Page) =>
  glide(page, size.width + 90, size.height * 0.75, 450);

async function clickAt(page: Page, x: number, y: number) {
  await glide(page, x, y, 350);
  await wait(page, 100);
  await page.mouse.down();
  await wait(page, 90);
  await page.mouse.up();
}

const clickOutside = (page: Page) =>
  clickAt(page, size.width - 18, size.height - 18);

async function hoverItems(
  page: Page,
  items: ReturnType<Page['locator']>,
  count = 3,
) {
  const visible = items.filter({ visible: true });
  const total = Math.min(count, await visible.count());
  for (let i = 0; i < total; i++) {
    await pointAt(page, visible.nth(i));
    await wait(page, 380);
  }
}

const menuItems = (page: Page) =>
  page.locator('[role="menu"] [role="menuitem"]');

async function dismiss(page: Page) {
  const close = page
    .locator('[role="dialog"], [role="alertdialog"]')
    .getByRole('button', { name: /^(cancel|close)$/i })
    .filter({ visible: true });
  if (await close.count()) await press(page, close.first());
  else await clickOutside(page);
}

const buttons = (page: Page) => page.locator('main button:visible');

const openClose =
  (
    trigger: (page: Page) => ReturnType<Page['locator']> = (page) =>
      buttons(page).first(),
    hold = 1300,
  ) =>
  async (page: Page) => {
    await press(page, trigger(page));
    await wait(page, hold);
    await dismiss(page);
    await away(page);
  };

const hoverOver =
  (target: (page: Page) => ReturnType<Page['locator']>, hold = 1300) =>
  async (page: Page) => {
    await pointAt(page, target(page));
    await wait(page, hold);
    await away(page);
  };

const clickThrough =
  (targets: (page: Page) => ReturnType<Page['locator']>, hold = 700) =>
  async (page: Page) => {
    const all = targets(page);
    const count = await all.count();
    let start = 0;
    for (let i = 0; i < count; i++)
      if (
        await all
          .nth(i)
          .evaluate(
            (el) =>
              el.getAttribute('aria-checked') === 'true' ||
              el.getAttribute('aria-selected') === 'true' ||
              el.getAttribute('aria-pressed') === 'true' ||
              ['active', 'checked', 'on'].includes(
                el.getAttribute('data-state') ?? '',
              ) ||
              el.hasAttribute('data-checked') ||
              el.hasAttribute('data-pressed') ||
              el.hasAttribute('data-selected'),
          )
      ) {
        start = i;
        break;
      }
    for (let step = 1; step < count; step++) {
      await press(page, all.nth((start + step) % count));
      await wait(page, hold);
    }
    await press(page, all.nth(start));
    await away(page);
  };

const toggle =
  (target: (page: Page) => ReturnType<Page['locator']>, hold = 900) =>
  async (page: Page) => {
    await press(page, target(page));
    await wait(page, hold);
    await press(page, target(page));
    await away(page);
  };

const replay =
  (hold = 1800) =>
  async (page: Page) => {
    await press(page, page.getByRole('button', { name: /replay/i }).first());
    await away(page);
    await wait(page, hold);
  };

const sweep =
  (target: (page: Page) => ReturnType<Page['locator']>) =>
  async (page: Page) => {
    const box = (await target(page).boundingBox())!;
    const y = box.y + box.height / 2;
    await glide(page, box.x - 10, y, 300);
    await glide(page, box.x + box.width * 0.3, box.y + box.height * 0.3, 500);
    await glide(page, box.x + box.width * 0.7, box.y + box.height * 0.7, 700);
    await glide(page, box.x + box.width + 10, y, 500);
    await away(page);
  };

const role = (name: Parameters<Page['getByRole']>[0]) => (page: Page) =>
  page.locator('main').getByRole(name);

const PLAYS: Record<string, Omit<Preview, 'id' | 'demo'>> = {
  accordion: { play: clickThrough(role('button')) },
  'alert-dialog': { play: openClose() },
  checkbox: { play: toggle((page) => role('checkbox')(page).first()) },
  collapsible: { play: toggle((page) => buttons(page).first(), 1100) },
  combobox: {
    async play(page) {
      await press(page, page.locator('main input').first());
      await wait(page, 500);
      await hoverItems(page, page.locator('[role="option"]'));
      await wait(page, 300);
      await clickOutside(page);
      await away(page);
    },
  },
  'context-menu': {
    async play(page) {
      const area = page
        .locator('main [data-slot="context-menu-trigger"]')
        .first();
      await pointAt(page, area);
      await area.click({ button: 'right' });
      await wait(page, 400);
      await hoverItems(page, menuItems(page));
      await wait(page, 300);
      await clickOutside(page);
      await away(page);
    },
  },
  dialog: { play: openClose() },
  drawer: { play: openClose() },
  'dropdown-menu': {
    async play(page) {
      await press(page, buttons(page).first());
      await wait(page, 400);
      await hoverItems(page, menuItems(page));
      await wait(page, 300);
      await clickOutside(page);
      await away(page);
    },
  },
  'hover-card': { play: hoverOver((page) => buttons(page).first()) },
  menubar: {
    async play(page) {
      const triggers = role('menuitem')(page);
      await press(page, triggers.first());
      await wait(page, 600);
      await pointAt(page, triggers.nth(1));
      await wait(page, 600);
      await pointAt(page, triggers.nth(2));
      await wait(page, 600);
      await clickOutside(page);
      await away(page);
    },
  },
  'navigation-menu': {
    async play(page) {
      const triggers = page
        .locator('main [data-slot="navigation-menu-trigger"]')
        .filter({ visible: true });
      await pointAt(page, triggers.first());
      await wait(page, 800);
      await pointAt(page, triggers.nth(1));
      await wait(page, 900);
      await away(page);
    },
    tail: 900,
    viewport: { width: 800, height: 480 },
  },
  pagination: {
    async play(page) {
      const link = (name: string) =>
        page
          .locator('main [data-slot="pagination-link"]')
          .filter({ hasText: new RegExp(`^${name}$`) });
      await press(page, link('5'));
      await wait(page, 800);
      await press(page, link('1'));
      await wait(page, 700);
      await press(page, page.locator('main [aria-label="Go to next page"]'));
      await away(page);
    },
    viewport: { width: 320, height: 240 },
  },
  popover: { play: openClose(), shift: 230 },
  questionnaire: {
    async play(page) {
      const main = page.locator('main');
      await press(
        page,
        main.locator('label', { hasText: 'Tool call timeline' }),
      );
      await wait(page, 700);
      await press(page, main.locator('[data-slot="questionnaire-next"]'));
      await wait(page, 1100);
      await press(page, main.locator('[data-slot="questionnaire-previous"]'));
      await wait(page, 1000);
      await main
        .locator('form')
        .evaluate((form: HTMLFormElement) => form.reset());
      await away(page);
      await wait(page, 600);
    },
    viewport: { width: 640, height: 480 },
  },
  'preview-link-card': {
    play: hoverOver((page) => page.locator('main a').first()),
    shift: -170,
  },
  progress: { mount: true, tail: 1600 },
  'radio-group': { play: clickThrough(role('radio')) },
  select: {
    async play(page) {
      await press(page, role('combobox')(page).first());
      await wait(page, 400);
      await hoverItems(page, page.locator('[role="option"]'), 2);
      await wait(page, 300);
      await clickOutside(page);
      await away(page);
    },
  },
  sheet: { play: openClose() },
  sidebar: {
    play: toggle(
      (page) => page.locator('main [data-sidebar="trigger"]').first(),
      1100,
    ),
    viewport: { width: 960, height: 720 },
  },
  slider: {
    async play(page) {
      const thumb = role('slider')(page).first();
      const box = (await thumb.boundingBox())!;
      const y = box.y + box.height / 2;
      await pointAt(page, thumb);
      await page.mouse.down();
      await glide(page, box.x + 90, y, 500);
      await glide(page, box.x - 70, y, 700);
      await glide(page, box.x + box.width / 2, y, 400);
      await page.mouse.up();
      await away(page);
    },
  },
  switch: {
    async play(page) {
      const target = role('switch')(page).first();
      await press(page, target, 420);
      await wait(page, 900);
      await press(page, target, 420);
      await away(page);
    },
  },
  tabs: { play: clickThrough(role('tab'), 800) },
  toast: {
    async play(page) {
      await press(page, buttons(page).first());
      await wait(page, 2200);
      await away(page);
    },
    tail: 1500,
  },
  toggle: { play: toggle((page) => buttons(page).first()) },
  'toggle-group': { play: clickThrough((page) => buttons(page)) },
  tooltip: { play: hoverOver((page) => buttons(page).first(), 1100) },
  'input-otp': {
    async play(page) {
      await press(page, page.locator('main input').first());
      await page.keyboard.type('123456', { delay: 160 });
      await wait(page, 700);
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Backspace');
        await wait(page, 60);
      }
      await away(page);
    },
  },

  'auto-height': { play: toggle((page) => buttons(page).first(), 1000) },
  'avatar-group': {
    play: sweep((page) => page.locator('main [data-slot]').first()),
  },
  blur: { play: replay() },
  button: {
    async play(page) {
      for (let i = 0; i < 2; i++) {
        await pointAt(page, buttons(page).first());
        await page.mouse.down();
        await wait(page, 450);
        await page.mouse.up();
        await wait(page, 450);
      }
      await away(page);
    },
  },
  click: {
    play: toggle((page) => page.locator('main').getByText(/./).first(), 500),
  },
  'code-block': { mount: true, tail: 2500 },
  'page-transition': {
    async play(page) {
      for (const name of ['Docs', 'Blog', 'Home']) {
        await press(page, page.getByRole('button', { name, exact: true }));
        await wait(page, 900);
      }
      await away(page);
    },
  },
  'copy-button': {
    async play(page) {
      await press(page, buttons(page).first());
      await wait(page, 1500);
      await away(page);
    },
  },
  'counting-number': { play: replay(2000) },
  cursor: {
    play: sweep((page) => page.locator('main > *').first()),
    cursor: false,
  },
  effect: { play: replay() },
  fade: { play: replay() },
  'flip-button': { play: hoverOver((page) => buttons(page).first(), 900) },
  'github-stars-button': { mount: true, tail: 2200 },
  'github-stars': { mount: true, tail: 2200 },
  'gradient-text': { mount: true, tail: 2500 },
  'highlight-text': { play: replay() },
  highlight: { play: clickThrough((page) => buttons(page)) },
  'icon-button': { play: toggle((page) => buttons(page).first(), 900) },
  'image-zoom': { play: sweep((page) => page.locator('main img').first()) },
  'liquid-button': { play: hoverOver((page) => buttons(page).first(), 1000) },
  magnetic: { play: sweep((page) => buttons(page).first()) },
  'morphing-text': {
    mount: true,
    tail: 3000,
    viewport: { width: 560, height: 420 },
  },
  'motion-grid': { mount: true, tail: 2500 },
  particles: { play: toggle((page) => buttons(page).first(), 900) },
  'pinned-list': {
    async play(page) {
      const pins = page.locator('main [data-slot="pinned-list-trigger"]');
      await press(page, pins.nth(2));
      await wait(page, 900);
      await press(page, pins.first());
      await wait(page, 900);
      await away(page);
    },
  },
  'ripple-button': { play: toggle((page) => buttons(page).first(), 600) },
  'rolling-text': { play: replay() },
  'rotating-text': { mount: true, tail: 3000 },
  'swapping-text': { mount: true, tail: 5000 },
  'sliding-text': {
    play: hoverOver(
      (page) => page.locator('main [data-slot="sliding-text"]').first(),
      700,
    ),
  },
  'scroll-fade': {
    async play(page) {
      const list = page.locator('main [data-slot="scroll-fade"]').first();
      await list.evaluate((el) => {
        el.style.overscrollBehavior = 'contain';
      });
      await pointAt(page, list);
      for (let i = 0; i < 6; i++) {
        await page.mouse.wheel(0, 60);
        await wait(page, 80);
      }
      await wait(page, 500);
      for (let i = 0; i < 6; i++) {
        await page.mouse.wheel(0, -60);
        await wait(page, 80);
      }
      await away(page);
    },
  },
  'scroll-progress': {
    async play(page) {
      const box = page
        .locator('main [data-slot="scroll-progress-container"]')
        .first();
      await pointAt(page, box);
      for (let i = 0; i < 8; i++) {
        await page.mouse.wheel(0, 80);
        await wait(page, 80);
      }
      await wait(page, 400);
      for (let i = 0; i < 8; i++) {
        await page.mouse.wheel(0, -80);
        await wait(page, 80);
      }
      await away(page);
    },
  },
  'scrolling-number': { play: replay() },
  'shimmering-text': { mount: true, tail: 2500 },
  shine: { play: hoverOver((page) => buttons(page).first(), 900) },
  slide: { play: replay() },
  'sliding-number': { play: replay() },
  'splitting-text': { play: replay() },
  spring: {
    async play(page) {
      const handle = page.locator('main [aria-label="Drag me"]').first();
      const box = (await handle.boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await pointAt(page, handle);
      await page.mouse.down();
      await glide(page, x + 100, y - 50, 450);
      await glide(page, x - 80, y + 40, 600);
      await page.mouse.up();
      await away(page);
    },
    tail: 1400,
  },
  'theme-toggler-button': {
    play: toggle((page) => buttons(page).first(), 1100),
  },
  'theme-toggler': { play: toggle((page) => buttons(page).first(), 1100) },
  tilt: {
    play: sweep((page) => page.locator('main > *').first()),
    viewport: { width: 560, height: 420 },
  },
  'typing-text': {
    mount: true,
    tail: 2800,
    zoom: false,
    viewport: { width: 640, height: 480 },
  },
  zoom: { play: replay() },
};

const LIBRARIES = ['base-ui', 'radix-ui', 'react-aria', 'animate-ui'];

const TEXTS = new Set([
  'gradient-text',
  'highlight-text',
  'morphing-text',
  'rolling-text',
  'rotating-text',
  'shimmering-text',
  'sliding-text',
  'splitting-text',
  'swapping-text',
]);

const PAGE_TRANSITION_EFFECTS = [
  'fade',
  'slide',
  'push',
  'zoom',
  'iris',
  'wipe',
  'bands',
  'stack',
  'flow',
  'chop',
];

const ROOMY = new Set([
  'page-transition',
  'accordion',
  'alert-dialog',
  'auto-height',
  'checkbox',
  'click',
  'code-block',
  'collapsible',
  'combobox',
  'context-menu',
  'cursor',
  'dialog',
  'drawer',
  'dropdown-menu',
  'hover-card',
  'image-zoom',
  'menubar',
  'navigation-menu',
  'pinned-list',
  'popover',
  'preview-link-card',
  'scroll-fade',
  'scroll-progress',
  'scrolling-number',
  'select',
  'sheet',
  'tabs',
  'tilt',
  'toast',
  'typing-text',
]);

function previews(): Preview[] {
  const docs = path.join(root, 'content', 'docs');
  const primitives = new Map<string, string>();
  for (const library of LIBRARIES)
    for (const file of readdirSync(path.join(docs, 'primitives', library)))
      if (file.endsWith('.mdx')) {
        const slug = file.slice(0, -4);
        if (
          !primitives.has(slug) &&
          existsSync(path.join(root, 'demos', library, `${slug}.tsx`))
        )
          primitives.set(slug, library);
      }
  const list: Preview[] = [...primitives].map(([slug, library]) => ({
    id: `primitives/${slug}`,
    demo: `/tests/demos/${library}/${slug}`,
    ...(ROOMY.has(slug) ? { viewport: LARGE } : {}),
    ...(TEXTS.has(slug) ? { nowrap: true as const } : {}),
    ...(PLAYS[slug] ?? { play: toggle((page) => buttons(page).first()) }),
  }));
  // The Vue demos, played the same way.
  for (const file of readdirSync(
    path.join(docs, 'vue', 'primitives', 'reka-ui'),
  ))
    if (file.endsWith('.mdx')) {
      const slug = file.slice(0, -4);
      list.push({
        id: `vue/primitives/${slug}`,
        demo: `/tests/vue-demos/reka-ui/${slug}`,
        ...(ROOMY.has(slug) ? { viewport: LARGE } : {}),
        ...(TEXTS.has(slug) ? { nowrap: true as const } : {}),
        ...(PLAYS[slug] ?? { play: toggle((page) => buttons(page).first()) }),
      });
    }
  for (const effect of PAGE_TRANSITION_EFFECTS)
    list.push({
      id: `page-transition/${effect}`,
      demo: `/tests/demos/animate-ui/page-transition?effect=${effect}&shared=&picker=`,
      viewport: LARGE,
      cursor: false,
      play: async (page) => {
        for (const name of ['Docs', 'Home']) {
          await page.getByRole('button', { name, exact: true }).click();
          await wait(page, 1100);
        }
      },
      tail: 0,
    });
  for (const file of readdirSync(path.join(docs, 'backgrounds')))
    if (file.endsWith('.mdx') && file !== 'index.mdx') {
      const slug = file.slice(0, -4);
      list.push({
        id: `backgrounds/${slug}`,
        demo: `/tests/demos/backgrounds/${slug}`,
        play: async (page) => {
          await glide(page, size.width * 0.3, size.height * 0.4, 600);
          await glide(page, size.width * 0.7, size.height * 0.6, 900);
          if (slug === 'glyph') {
            await page.mouse.click(size.width * 0.5, size.height * 0.5);
            await page.waitForTimeout(1800);
          }
          await away(page);
        },
        tail: 1200,
      });
    }
  return list;
}

const FPS = 30;

async function record(
  preview: Preview,
  theme: 'light' | 'dark',
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  zoom: number,
) {
  const viewport = zoomed(preview.viewport ?? VIEWPORT, zoom);
  size.width = viewport.width;
  size.height = viewport.height;
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: OUTPUT.width / viewport.width,
    colorScheme: theme,
  });
  if (preview.cursor !== false) await context.addInitScript(CURSOR);
  const page = await context.newPage();
  await page.goto(`${BASE}${preview.demo}`, { waitUntil: 'networkidle' });
  await settle(page, preview);
  pointer.x = viewport.width + 90;
  pointer.y = viewport.height * 0.75;
  await page.mouse.move(pointer.x, pointer.y);

  const cdp = await context.newCDPSession(page);
  const frames: { data: Buffer; time: number }[] = [];
  cdp.on('Page.screencastFrame', (event) => {
    frames.push({
      data: Buffer.from(event.data, 'base64'),
      time: event.metadata.timestamp! * 1000,
    });
    void cdp
      .send('Page.screencastFrameAck', { sessionId: event.sessionId })
      .catch(() => {});
  });
  const startScreencast = () =>
    cdp.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 92,
      maxWidth: OUTPUT.width,
      maxHeight: OUTPUT.height,
    });

  let painted = 0;
  if (preview.mount) {
    await page.reload({ waitUntil: 'commit' });
    await startScreencast();
    await page.waitForLoadState('domcontentloaded');
    await page.addStyleTag({ content: layout(preview) });
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    painted = Date.now();
    await page.waitForLoadState('networkidle');
    if (preview.play) await preview.play(page);
  } else {
    await startScreencast();
    await page.waitForTimeout(300);
    await preview.play!(page);
  }
  await page.waitForTimeout(preview.tail ?? 600);
  const end = Date.now();
  await cdp.send('Page.stopScreencast');
  await context.close();
  const shown = frames.filter((frame) => frame.time >= painted);
  frames.splice(0, frames.length - shown.length);
  if (!frames.length) throw new Error('no frames');

  const first = frames[0]!.time;
  const last = Math.max(end, first);
  const sequence: Buffer[] = [];
  let index = 0;
  for (let time = first; time <= last; time += 1000 / FPS) {
    while (index + 1 < frames.length && frames[index + 1]!.time <= time)
      index++;
    sequence.push(frames[index]!.data);
  }

  const name = `${preview.id}-${theme}`;
  const out = path.join(outDir, name);
  mkdirSync(path.dirname(out), { recursive: true });
  execFileSync(
    FFMPEG,
    [
      '-y',
      '-loglevel',
      'error',
      '-f',
      'image2pipe',
      '-c:v',
      'mjpeg',
      '-framerate',
      String(FPS),
      '-i',
      'pipe:0',
      '-c:v',
      'libvpx',
      '-b:v',
      '900k',
      '-crf',
      '8',
      '-deadline',
      'good',
      '-auto-alt-ref',
      '0',
      '-an',
      `${out}.webm`,
    ],
    { input: Buffer.concat(sequence), maxBuffer: 1 << 30 },
  );
  writeFileSync(`${out}.jpg`, preview.mount ? sequence.at(-1)! : sequence[0]!);
}

const only = process.argv.slice(2);
const all = previews();
const chosen = only.length
  ? all.filter((p) => only.some((id) => p.id === id || p.id.endsWith(`/${id}`)))
  : all;
const browser = await chromium.launch({
  channel: 'chromium',
  args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=metal'],
});
for (const preview of chosen) {
  const zoom = await fitZoom(preview, browser);
  for (const theme of ['light', 'dark'] as const) {
    try {
      await record(preview, theme, browser, zoom);
      console.log(`✓ ${preview.id} ${theme} ×${zoom.toFixed(2)}`);
    } catch (error) {
      console.log(
        `✗ ${preview.id} ${theme}: ${(error as Error).message.split('\n')[0]}`,
      );
    }
  }
}
await browser.close();
