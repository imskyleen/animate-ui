import { expect, test } from '../test';

for (const [url, previous, next] of [
  ['/docs/backgrounds/hole', 'Hexagon Background', 'Stars Background'],
  // The sidebar's Icons section comes after the backgrounds.
  ['/docs/icons/get-started', 'Topography Background', 'Lucide Icons'],
] as const)
  test(`${url} links to the pages around it`, async ({ request }) => {
    const html = await (await request.get(url)).text();
    expect(html).toContain(`aria-label="Previous: ${previous}"`);
    expect(html).toContain(`aria-label="Next: ${next}"`);
    expect(html).not.toContain('aria-label="Next: Introduction"');
    expect(html).not.toContain('[object Object]');
  });

// Bug (issue #188): "Next" went through one library's primitives by name, so
// it skipped the entries of other sections and jumped between sections.
for (const start of [
  '/docs/primitives/base-ui/accordion',
  '/docs/vue/primitives/reka-ui/accordion',
])
  test(`from ${start}, "Next" walks the sidebar's entries in order`, async ({
    page,
    request,
  }) => {
    // Page after page, to the end of the sidebar.
    test.setTimeout(600_000);
    await page.goto(start);
    const sidebar = await page
      .locator('#nd-sidebar a[href^="/docs"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
    const last = (url: string) => url.split('/').at(-1)!;
    const expected = sidebar
      // Its entry in the list (the framework switch links to it above).
      .slice(sidebar.lastIndexOf(start) + 1)
      .map(last);
    expect(expected.length).toBeGreaterThan(20);

    const walked: string[] = [];
    let url: string | undefined = start;
    while (url && walked.length < expected.length) {
      const html = await (await request.get(url)).text();
      url = /<a aria-label="Next: [^"]*"[^>]*href="([^"]+)"/.exec(html)?.[1];
      if (url) walked.push(last(url));
    }
    expect(walked).toEqual(expected);
  });
