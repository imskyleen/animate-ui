import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';
import { transformVue } from '../src/lib/vue';

const CAROUSEL = '@animate-ui/react/primitives/carousel';
const VUE_CAROUSEL = '@animate-ui/vue/primitives/carousel';

test('shadcn/ui carousel: embla-carousel-react swapped for the animated hook, nothing else', () => {
  const input = readFileSync(
    path.join(import.meta.dirname, 'fixtures', 'embla', 'carousel.base-nova.tsx'),
    'utf8',
  );
  const result = transform(input);
  expect(result.code).not.toContain('"embla-carousel-react"');
  expect(result.code).toBe(
    input.replace('"embla-carousel-react"', `"${CAROUSEL}"`),
  );
  expect(result.imports).toEqual([
    { from: 'embla-carousel-react', to: CAROUSEL, name: 'carousel' },
  ]);
  expect(result.unsupported).toEqual([]);
  expect(transform(result.code).code).toBe(result.code);
});

test('shadcn-vue carousel: embla-carousel-vue swapped in every file, types included', () => {
  const dir = path.join(import.meta.dirname, 'fixtures-vue', 'carousel');
  let swapped = 0;
  for (const file of readdirSync(dir)) {
    const code = readFileSync(path.join(dir, file), 'utf8');
    const result = transformVue(code, 'carousel')!;
    expect(result.code).not.toMatch(/from\s+["']embla-carousel-vue["']/);
    expect(result.code).toBe(
      code.replaceAll('"embla-carousel-vue"', `"${VUE_CAROUSEL}"`),
    );
    swapped += result.packageImports;
  }
  // The hook in useCarousel.ts, its type and EmblaCarouselVueType in interface.ts.
  expect(swapped).toBe(3);
});
