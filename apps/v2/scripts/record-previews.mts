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

const VIEWPORT = { width: 400, height: 300 };
const LARGE = { width: 480, height: 360 };

const HIDE_DEV = 'nextjs-portal{display:none!important}';

async function settle(page: Page) {
  await page.addStyleTag({ content: HIDE_DEV });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

type Preview = {
  id: string;
  demo: string;
  mount?: boolean;
  play?: (page: Page) => Promise<void>;
  tail?: number;
  viewport?: { width: number; height: number };
};

const wait = (page: Page, ms: number) => page.waitForTimeout(ms);

const pointer = { x: 4, y: 4 };

async function glide(page: Page, x: number, y: number, ms = 250) {
  const steps = Math.max(1, Math.round(ms / 16));
  const from = { ...pointer };
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await page.waitForTimeout(16);
  }
  pointer.x = x;
  pointer.y = y;
}

async function pointAt(page: Page, target: ReturnType<Page['locator']>) {
  const box = (await target.boundingBox())!;
  await glide(page, box.x + box.width / 2, box.y + box.height / 2);
}

async function press(page: Page, target: ReturnType<Page['locator']>) {
  await pointAt(page, target);
  await wait(page, 120);
  await target.click();
}

const away = (page: Page) => glide(page, 4, 4, 300);

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
    await page.keyboard.press('Escape');
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
    for (let i = 1; i < count; i++) {
      await press(page, all.nth(i));
      await wait(page, hold);
    }
    await press(page, all.first());
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
      await page.keyboard.press('ArrowDown');
      await wait(page, 250);
      await page.keyboard.press('ArrowDown');
      await wait(page, 700);
      await page.keyboard.press('Escape');
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
      await page.keyboard.press('ArrowDown');
      await wait(page, 250);
      await page.keyboard.press('ArrowDown');
      await wait(page, 700);
      await page.keyboard.press('Escape');
      await away(page);
    },
  },
  dialog: { play: openClose() },
  drawer: { play: openClose() },
  'dropdown-menu': {
    async play(page) {
      await press(page, buttons(page).first());
      await wait(page, 400);
      await page.keyboard.press('ArrowDown');
      await wait(page, 250);
      await page.keyboard.press('ArrowDown');
      await wait(page, 700);
      await page.keyboard.press('Escape');
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
      await page.keyboard.press('Escape');
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
  popover: { play: openClose() },
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
  },
  progress: { mount: true, tail: 1600 },
  'radio-group': { play: clickThrough(role('radio')) },
  select: {
    async play(page) {
      await press(page, role('combobox')(page).first());
      await wait(page, 400);
      await page.keyboard.press('ArrowDown');
      await wait(page, 250);
      await page.keyboard.press('ArrowDown');
      await wait(page, 700);
      await page.keyboard.press('Escape');
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
  switch: { play: toggle((page) => role('switch')(page).first()) },
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
  'copy-button': {
    async play(page) {
      await press(page, buttons(page).first());
      await wait(page, 1500);
      await away(page);
    },
  },
  'counting-number': { play: replay(2000) },
  cursor: { play: sweep((page) => page.locator('main > *').first()) },
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
  'morphing-text': { mount: true, tail: 3000 },
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
  'scroll-fade': {
    async play(page) {
      const list = page.locator('main [data-slot="scroll-fade"]').first();
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
  tilt: { play: sweep((page) => page.locator('main > *').first()) },
  'typing-text': { mount: true, tail: 2800 },
  zoom: { play: replay() },
};

const LIBRARIES = ['base-ui', 'radix-ui', 'react-aria', 'animate-ui'];

const ROOMY = new Set([
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
    ...(PLAYS[slug] ?? { play: toggle((page) => buttons(page).first()) }),
  }));
  for (const file of readdirSync(path.join(docs, 'backgrounds')))
    if (file.endsWith('.mdx') && file !== 'index.mdx') {
      const slug = file.slice(0, -4);
      list.push({
        id: `backgrounds/${slug}`,
        demo: `/tests/demos/backgrounds/${slug}`,
        play: async (page) => {
          await glide(page, VIEWPORT.width * 0.3, VIEWPORT.height * 0.4, 600);
          await glide(page, VIEWPORT.width * 0.7, VIEWPORT.height * 0.6, 900);
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
) {
  const context = await browser.newContext({
    viewport: preview.viewport ?? VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: theme,
  });
  const page = await context.newPage();
  await page.goto(`${BASE}${preview.demo}`, { waitUntil: 'networkidle' });
  await settle(page);
  await page.mouse.move(4, 4);
  pointer.x = 4;
  pointer.y = 4;

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
      maxWidth: 840,
      maxHeight: 630,
    });

  if (preview.mount) {
    await page.reload({ waitUntil: 'commit' });
    await startScreencast();
    await page.waitForLoadState('domcontentloaded');
    await page.addStyleTag({ content: HIDE_DEV });
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
  args: [
    '--enable-gpu',
    '--ignore-gpu-blocklist',
    '--use-angle=metal',
    '--force-device-scale-factor=2',
  ],
});
for (const preview of chosen) {
  for (const theme of ['light', 'dark'] as const) {
    try {
      await record(preview, theme, browser);
      console.log(`✓ ${preview.id} ${theme}`);
    } catch (error) {
      console.log(
        `✗ ${preview.id} ${theme}: ${(error as Error).message.split('\n')[0]}`,
      );
    }
  }
}
await browser.close();
