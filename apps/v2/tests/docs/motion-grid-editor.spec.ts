import { expect, test, type Page } from '../test';

const FRAMEWORKS = [
  {
    name: 'React',
    url: '/docs/primitives/animate-ui/motion-grid',
    import: '@animate-ui/react/primitives/motion-grid',
    other: '@animate-ui/vue/',
    gridSize: (cols: number, rows: number) => `gridSize={[${cols}, ${rows}]}`,
    duration: (ms: number) => `duration={${ms}}`,
    cells: 'className="size-1 rounded-full',
  },
  {
    name: 'Vue',
    url: '/docs/vue/primitives/animate-ui/motion-grid',
    import: '@animate-ui/vue/primitives/motion-grid',
    other: '@animate-ui/react/',
    gridSize: (cols: number, rows: number) => `:grid-size="[${cols}, ${rows}]"`,
    duration: (ms: number) => `:duration="${ms}"`,
    cells: 'class="size-1 rounded-full',
  },
] as const;

const editor = (page: Page) => page.locator('[data-slot="motion-grid-editor"]');
const cells = (page: Page) =>
  editor(page).locator('[data-slot="motion-grid-editor-cell"]');
const preview = (page: Page) =>
  editor(page).locator(
    '[data-slot="motion-grid-editor-preview"] div[data-active][data-animate]',
  );
const code = (page: Page) =>
  editor(page).locator('[data-slot="motion-grid-editor-code"] pre');

const pattern = (page: Page) =>
  preview(page).evaluateAll((els) =>
    els
      .map((el) => (el.getAttribute('data-active') === 'true' ? 1 : 0))
      .join(''),
  );

for (const framework of FRAMEWORKS) {
  test.describe(`${framework.name} Motion Grid editor`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(framework.url);
      await editor(page).scrollIntoViewIfNeeded();
      await expect(preview(page)).toHaveCount(49);
    });

    // Bug: the code block's wrapper painted the page's color behind its rounder corners.
    test("the code block meets the editor with the panels' radius, nothing behind its corners", async ({
      page,
    }) => {
      const wrapper = editor(page).locator(
        '[data-slot="motion-grid-editor-code"]',
      );
      await expect(wrapper).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      const panel = await editor(page)
        .locator('[data-slot="motion-grid-editor-preview"]')
        .evaluate((el) => {
          for (let node: Element | null = el; node; node = node.parentElement)
            if (getComputedStyle(node).borderRadius !== '0px')
              return getComputedStyle(node).borderRadius;
          return '';
        });
      await expect(wrapper.locator('figure')).toHaveCSS('border-radius', panel);
    });

    test('renders the editor, its preview and code for its framework', async ({
      page,
    }) => {
      await expect(cells(page)).toHaveCount(49);
      // The Vue page previews with the Vue Motion Grid, mounted by Vue.
      await expect(
        editor(page).locator(
          '[data-slot="motion-grid-editor-preview"] [data-slot="vue-demo"][data-mounted]',
        ),
      ).toHaveCount(framework.name === 'Vue' ? 1 : 0);
      await expect(code(page)).toContainText(framework.import);
      await expect(code(page)).toContainText(framework.gridSize(7, 7));
      await expect(code(page)).toContainText(framework.cells);
      await expect(code(page)).not.toContainText(framework.other);
      if (framework.name === 'Vue') {
        await expect(code(page)).toContainText('<script setup lang="ts">');
        await expect(code(page)).toContainText('<MotionGrid :grid-size');
      } else {
        await expect(code(page)).toContainText('<MotionGrid gridSize=');
        await expect(code(page)).toContainText('export function Loader()');
      }
    });

    test('drawing on the grid changes the preview and the code', async ({
      page,
    }) => {
      await cells(page)
        .nth(3 * 7 + 2)
        .click();
      await expect(preview(page).nth(3 * 7 + 2)).toHaveAttribute(
        'data-active',
        'true',
      );
      await expect(code(page)).toContainText('[[2, 3]],');

      // Centered, clear of the sticky header.
      await editor(page)
        .locator('[data-slot="motion-grid-editor-grid"]')
        .evaluate((grid) => grid.scrollIntoView({ block: 'center' }));
      const box = async (index: number) => {
        const rect = (await cells(page).nth(index).boundingBox())!;
        return [rect.x + rect.width / 2, rect.y + rect.height / 2] as const;
      };
      const [x0, y0] = await box(0);
      const [x3, y3] = await box(3);
      await page.mouse.move(x0, y0);
      await page.mouse.down();
      await page.mouse.move(x3, y3, { steps: 12 });
      await page.mouse.up();
      await expect(code(page)).toContainText(
        '[[2, 3], [0, 0], [1, 0], [2, 0], [3, 0]],',
      );
      await expect
        .poll(() => pattern(page))
        .toBe('1111000' + '0'.repeat(14) + '0010000' + '0'.repeat(21));

      await cells(page)
        .nth(3 * 7 + 2)
        .click();
      await expect(preview(page).nth(3 * 7 + 2)).toHaveAttribute(
        'data-active',
        'false',
      );
      await expect(code(page)).toContainText(
        '[[0, 0], [1, 0], [2, 0], [3, 0]],',
      );
    });

    test('frames, size and duration reach the preview and the code', async ({
      page,
    }) => {
      await cells(page).nth(0).click();
      await editor(page).getByRole('button', { name: 'Add Frame' }).click();
      await cells(page).nth(0).click();
      await cells(page).nth(48).click();
      await expect(code(page)).toContainText('[[0, 0]],\n  [[6, 6]],');

      const seen = new Set<string>();
      for (let i = 0; i < 8; i++) {
        seen.add(await pattern(page));
        await page.waitForTimeout(60);
      }
      expect(seen.size).toBe(2);

      await editor(page).getByLabel('Duration').fill('300');
      await expect(code(page)).toContainText(framework.duration(300));

      await editor(page).getByLabel('Columns').fill('5');
      await editor(page).getByLabel('Columns').blur();
      await expect(cells(page)).toHaveCount(35);
      await expect(preview(page)).toHaveCount(35);
      await expect(code(page)).toContainText(framework.gridSize(5, 7));
      await expect(code(page)).toContainText('[[0, 0]],\n  [],');
    });

    test('a saved animation is listed and comes back after a reload', async ({
      page,
    }) => {
      await cells(page).nth(8).click();
      await editor(page).getByLabel('Animation name').fill('Dot');
      await editor(page)
        .getByRole('button', { name: 'Save Animation' })
        .click();
      const saved = editor(page).locator(
        '[data-slot="motion-grid-editor-animation"]',
      );
      await expect(saved).toHaveCount(1);
      await expect(saved).toContainText('7x7 • 1 frames');

      await page.reload();
      await editor(page).scrollIntoViewIfNeeded();
      await saved.click();
      await expect(editor(page).getByLabel('Animation name')).toHaveValue(
        'Dot',
      );
      await expect(code(page)).toContainText('[[1, 1]],');
      await expect(preview(page).nth(8)).toHaveAttribute('data-active', 'true');
    });
  });
}

test('the markdown export leaves the editor out', async ({ request }) => {
  const full = await (await request.get('/llms-full.txt')).text();
  expect(full).toContain(
    '# Motion Grid (/docs/primitives/animate-ui/motion-grid)',
  );
  expect(full).not.toContain('<MotionGridEditor');
  expect(full).not.toMatch(/^## Editor\b/m);
});
