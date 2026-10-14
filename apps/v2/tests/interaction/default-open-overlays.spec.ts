import { test } from '../test';
import { expectEntranceOnLoad, type EntranceKind } from './anchored-overlay';

const FIXTURE = '/tests/fixtures/default-open-overlays';
const OVERLAY = '[data-testid="overlay"]';

const CASES: [name: string, kind: EntranceKind][] = [
  ['radix-popover', 'popover'],
  ['radix-tooltip', 'tooltip'],
  ['radix-hover-card', 'popover'],
  ['radix-dropdown-menu', 'menu'],
  ['radix-menubar', 'menu'],
  ['radix-select', 'menu'],
  ['radix-select-aligned', 'fade'],
  ['radix-navigation-menu', 'menu'],
  ['base-popover', 'popover'],
  ['base-tooltip', 'tooltip'],
  ['base-preview-card', 'popover'],
  ['base-menu', 'menu'],
  ['base-menubar', 'menu'],
  ['base-context-menu', 'menu'],
  ['base-select', 'menu'],
  ['base-select-aligned', 'fade'],
  ['base-combobox', 'menu'],
  ['base-navigation-menu', 'menu'],
  ['aria-popover', 'popover'],
  ['aria-tooltip', 'tooltip'],
  ['aria-hover-card', 'popover'],
  ['aria-menu', 'menu'],
  ['aria-select', 'menu'],
];

test.describe('overlays open from the start', () => {
  test.describe.configure({ timeout: 180_000 });

  for (const [name, kind] of CASES) {
    test(`${name} plays its entrance on page load`, async ({ page }) => {
      await expectEntranceOnLoad(
        page,
        `${FIXTURE}?case=${name}`,
        OVERLAY,
        kind,
      );
    });
  }

  for (const name of ['radix-popover', 'base-menu', 'aria-tooltip']) {
    test(`${name} only fades in on page load under reduced motion`, async ({
      page,
    }) => {
      await expectEntranceOnLoad(
        page,
        `${FIXTURE}?case=${name}`,
        OVERLAY,
        'popover',
        { reduced: true },
      );
    });
  }
});
