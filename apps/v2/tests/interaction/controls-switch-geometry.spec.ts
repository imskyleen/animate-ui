import { expect, test, type Page } from '@playwright/test';

// At rest, Animate UI's switches sit exactly like shadcn/ui's: the thumb's
// size and its insets in the track come from shadcn's classes alone (the
// fixture renders the same classes with plain Radix UI as the reference),
// in both states, before and after the animations ran.

const LIBS = ['radix-ui', 'base-ui', 'react-aria'] as const;

type Geometry = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  /** Inline styles left on the track and the thumb. */
  styles: string;
};

function geometry(page: Page, section: string) {
  return page.evaluate(
    (section) =>
      [
        ...document.querySelectorAll(
          `[data-testid="${section}"] [data-slot="switch"]`,
        ),
      ].map((track) => {
        const thumb = track.querySelector('[data-slot="switch-thumb"]')!;
        const t = track.getBoundingClientRect();
        const h = thumb.getBoundingClientRect();
        return {
          left: h.left - t.left,
          right: t.right - h.right,
          top: h.top - t.top,
          bottom: t.bottom - h.bottom,
          width: h.width,
          height: h.height,
          styles: `${track.getAttribute('style') ?? ''}${thumb.getAttribute('style') ?? ''}`,
        };
      }),
    section,
  ) as Promise<Geometry[]>;
}

async function expectLikePlain(page: Page) {
  const plain = await geometry(page, 'plain');
  expect(plain).toHaveLength(3);
  for (const lib of LIBS) {
    const ours = await geometry(page, lib);
    expect(ours).toHaveLength(3);
    ours.forEach((g, i) => {
      const reference = plain[i]!;
      for (const key of [
        'left',
        'right',
        'top',
        'bottom',
        'width',
        'height',
      ] as const)
        expect(Math.abs(g[key] - reference[key])).toBeLessThan(0.05);
      expect(g.styles).toBe('');
    });
  }
}

test.describe('switch geometry at rest', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/fixtures/switch-geometry', {
      waitUntil: 'networkidle',
    });
  });

  test('on load, every switch sits exactly like shadcn/ui', async ({
    page,
  }) => {
    await expectLikePlain(page);
    // shadcn's nova insets: 1px from the edge it rests against, the rest of
    // the track on the other side.
    const [off, on] = await geometry(page, 'radix-ui');
    expect(off!.left).toBeCloseTo(1, 1);
    expect(off!.right).toBeCloseTo(15, 1);
    expect(on!.left).toBeCloseTo(15, 1);
    expect(on!.right).toBeCloseTo(1, 1);
  });

  test('after toggling, every switch comes to rest exactly like shadcn/ui', async ({
    page,
  }) => {
    for (const section of ['plain', ...LIBS])
      for (let i = 0; i < 3; i++)
        await page
          .getByRole('switch', { name: `${section} ${i}` })
          .click({ force: section === 'react-aria' });
    await page.mouse.move(0, 0);
    // The springs settle, then the thumbs are left as the library rendered
    // them.
    await expect
      .poll(
        async () =>
          (await Promise.all(LIBS.map((lib) => geometry(page, lib))))
            .flat()
            .every((g) => g.styles === ''),
        { timeout: 3000 },
      )
      .toBe(true);
    await expectLikePlain(page);
  });
});
