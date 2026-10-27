import { expect, test, type Page } from '../test';

import { FRAMEWORKS } from './animate-ui-frameworks';

for (const framework of FRAMEWORKS) {
  const open = (page: Page, query = '') =>
    page.goto(framework.demo('code-block') + query, {
      waitUntil: 'networkidle',
    });

  const content = (page: Page) =>
    page.locator('[data-slot="code-block-content"]');
  const LAST_LINE = 'return result.toUIMessageStreamResponse()';
  const textLength = (page: Page) =>
    content(page).evaluate((el) => el.textContent?.length ?? 0);

  // The cursor: after the last line's text, or before an empty last line's.
  const cursor = (page: Page) =>
    content(page).evaluate((el) => {
      const last = [
        ...el.querySelectorAll('[data-slot="code-block-line-content"]'),
      ].at(-1);
      if (!last) return 'none';
      const after = getComputedStyle(last, '::after').content;
      const before = getComputedStyle(last, '::before').content;
      return after !== 'none' ? after : before;
    });

  test.describe(`${framework.name} code-block`, () => {
    test('types the code out over its duration, highlighted line by line', async ({
      page,
    }) => {
      await open(page);
      await expect(content(page)).toHaveAttribute('data-writing', 'true');
      const early = await textLength(page);
      await page.waitForTimeout(800);
      const later = await textLength(page);
      expect(later).toBeGreaterThan(early);
      await expect(content(page)).not.toContainText(LAST_LINE);
      expect(
        await content(page).locator('span[style*="--shiki-light"]').count(),
      ).toBeGreaterThan(0);
      await expect(
        content(page).locator('[data-slot="code-block-line"]').first(),
      ).toBeVisible();

      await expect(content(page)).not.toHaveAttribute('data-writing', {
        timeout: 10000,
      });
      await expect(content(page)).toContainText(LAST_LINE);
    });

    test('a cursor sits at the end of the code while it writes, and goes once done', async ({
      page,
    }) => {
      await open(page);
      await expect(content(page)).toHaveAttribute('data-writing', 'true');
      await page.waitForTimeout(400);
      expect(await cursor(page)).toBe('"|"');
      await expect(content(page)).not.toHaveAttribute('data-writing', {
        timeout: 10000,
      });
      expect(await cursor(page)).toBe('none');
    });

    test('without the cursor, nothing shows at the end while it writes', async ({
      page,
    }) => {
      await open(page, '?cursor=false');
      await expect(content(page)).toHaveAttribute('data-writing', 'true');
      await page.waitForTimeout(400);
      expect(await cursor(page)).toBe('none');
    });

    test('while it writes, the block follows its last line', async ({
      page,
    }) => {
      await open(page);
      // A short block, so the code overflows it.
      await page.addStyleTag({
        content:
          '[data-slot="code-block-content"] { min-height: 0 !important; max-height: 120px !important; }',
      });
      // Scrolled, and at the bottom, while lines keep coming.
      await expect
        .poll(
          () =>
            content(page).evaluate(
              (el) =>
                el.scrollTop > 0 &&
                el.scrollHeight - el.clientHeight - el.scrollTop < 2 &&
                el.dataset.writing === 'true',
            ),
          { timeout: 8000 },
        )
        .toBe(true);
    });

    test('the block keeps its height while it writes', async ({ page }) => {
      await open(page);
      const block = page.locator('[data-slot="code-block"]');
      const start = (await block.boundingBox())!.height;
      await page.waitForTimeout(1500);
      expect((await block.boundingBox())!.height).toBe(start);
    });

    test('the copy button copies the whole code, even while it writes, and its icon swaps', async ({
      page,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await open(page);
      const copy = page.locator('[data-slot="code-block-copy-button"]');
      await expect(copy).toHaveAttribute('aria-label', 'Copy');
      await copy.click();
      await expect(copy).toHaveAttribute('data-copied');
      await expect(copy).toHaveAttribute('aria-label', 'Copied');
      await expect(
        copy.locator('[data-slot="copy-button-icon"]'),
      ).toBeAttached();
      const text = await page.evaluate(() => navigator.clipboard.readText());
      expect(text).toContain('import { streamText } from "ai"');
      expect(text).toContain(LAST_LINE);
    });

    // From the end of the first line to the start of the third: a line
    // break, a blank line, then the next line's first character.
    const lineBreakPause = (page: Page) =>
      content(page).evaluate(
        (el) =>
          new Promise<number>((resolve) => {
            let endOfFirst = 0;
            const observer = new MutationObserver(() => {
              const text = el.textContent ?? '';
              if (!endOfFirst && text.includes('from "ai"'))
                endOfFirst = performance.now();
              if (
                endOfFirst &&
                /\n\s*e/.test(text.slice(text.indexOf('"ai"')))
              ) {
                observer.disconnect();
                resolve(performance.now() - endOfFirst);
              }
            });
            observer.observe(el, {
              subtree: true,
              childList: true,
              characterData: true,
            });
          }),
      );

    test('with a natural cadence, it types like someone typing: a pause at the end of a line', async ({
      page,
    }) => {
      await open(page, '?delay=400&cadence=natural');
      expect(await lineBreakPause(page)).toBeGreaterThan(120);
    });

    test('by default, it types at a steady pace', async ({ page }) => {
      await open(page, '?delay=400');
      expect(await lineBreakPause(page)).toBeLessThan(100);
    });

    const lastText = (page: Page) =>
      content(page).evaluate((el) => {
        const last = [
          ...el.querySelectorAll<HTMLElement>(
            '[data-slot="code-block-line-content"]',
          ),
        ].at(-1)!;
        const style = getComputedStyle(last);
        return {
          empty: last.hasAttribute('data-empty'),
          mask: style.maskImage,
          width: last.getBoundingClientRect().width,
          text: last.textContent?.length ?? 0,
        };
      });

    test('the last characters fade in behind the cursor, and the trail is gone once done', async ({
      page,
    }) => {
      await open(page, '?duration=30000');
      await expect
        .poll(async () => {
          const last = await lastText(page);
          return !last.empty && last.text > 3 && last.mask.includes('gradient');
        })
        .toBe(true);
      // The trail ends where the text does, not at the edge of the line.
      const last = await lastText(page);
      const lineWidth = await content(page)
        .locator('[data-slot="code-block-line"]')
        .last()
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(last.width).toBeLessThan(lineWidth / 2);
    });

    test('once written, no line keeps a trail', async ({ page }) => {
      await open(page);
      await expect(content(page)).not.toHaveAttribute('data-writing', {
        timeout: 10000,
      });
      await expect
        .poll(() =>
          content(page)
            .locator('[data-slot="code-block-line-content"]')
            .evaluateAll(
              (els) =>
                els.filter((el) => getComputedStyle(el).maskImage !== 'none')
                  .length,
            ),
        )
        .toBe(0);
    });

    test('paused, the cursor pulses', async ({ page }) => {
      await open(page, '?delay=3000');
      await expect(content(page)).toHaveAttribute('data-idle', '');
      const animation = await content(page)
        .locator('[data-slot="code-block-line-content"]')
        .last()
        .evaluate((el) => getComputedStyle(el, '::before').animationName);
      expect(animation).not.toBe('none');
    });

    test('wrapping glides the lines to their new place and the block to its new height', async ({
      page,
    }) => {
      await open(page, '?writing=false');
      await content(page).evaluate((el) => (el.style.minHeight = '0'));
      await page.waitForTimeout(300);
      await page.getByRole('button', { name: 'Wrap lines' }).click();
      await expect(content(page)).toHaveAttribute('data-wrap');
      const moving = await content(page).evaluate((el) => ({
        block: el.getAnimations().filter((a) => !(a instanceof CSSAnimation))
          .length,
        lines: [...el.querySelectorAll('[data-slot="code-block-line"]')].filter(
          (line) =>
            line.getAnimations().filter((a) => !(a instanceof CSSAnimation))
              .length > 0,
        ).length,
      }));
      expect(moving.block).toBeGreaterThan(0);
      expect(moving.lines).toBeGreaterThan(0);
    });

    test('reduced motion: no trail, no glide', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      expect((await lastText(page)).mask).toBe('none');
      await page.waitForTimeout(300);
      await page.getByRole('button', { name: 'Wrap lines' }).click();
      await expect(content(page)).toHaveAttribute('data-wrap');
      expect(
        await content(page).evaluate(
          (el) =>
            el.getAnimations().filter((a) => !(a instanceof CSSAnimation))
              .length,
        ),
      ).toBe(0);
    });

    test('reduced motion: the whole code at once, without a cursor', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await open(page);
      await expect(content(page)).toContainText(LAST_LINE, { timeout: 2000 });
      await expect(content(page)).not.toHaveAttribute('data-writing');
      expect(await cursor(page)).toBe('none');
    });
  });
}

// An empty line holds a newline: a cursor after it showed one line lower
// and grew the block by a line.
for (const framework of FRAMEWORKS)
  test(`${framework.name}: on an empty last line, the cursor sits at its start and the block keeps its lines`, async ({
    page,
  }) => {
    await page.goto(
      framework.fixture('code-block-cursor').replace('animate-ui-', ''),
      {
        waitUntil: 'networkidle',
      },
    );
    await page.locator('[data-slot="code-block-line"]').nth(1).waitFor();
    const lines = page.locator('[data-slot="code-block-line"]');
    const [first, last] = [
      (await lines.nth(0).boundingBox())!,
      (await lines.nth(1).boundingBox())!,
    ];
    expect(last.height).toBeCloseTo(first.height, 0);
    const marks = await lines
      .nth(1)
      .locator('[data-slot="code-block-line-content"]')
      .evaluate((el) => [
        getComputedStyle(el, '::before').content,
        getComputedStyle(el, '::after').content,
      ]);
    expect(marks).toEqual(['"|"', 'none']);
  });

// Bug: rendered on the server, the block had its cursor before the empty
// lines were known, so it sat past the first line's newline until hydration.
test('rendered on the server, the block has no cursor until it knows its empty lines', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/tests/fixtures/code-block-cursor');
  await expect(page.locator('[data-slot="code-block-content"]')).toBeAttached();
  await expect(
    page.locator('[data-slot="code-block-content"][data-cursor]'),
  ).toHaveCount(0);
  await context.close();
});
