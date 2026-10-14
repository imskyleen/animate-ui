import { readFileSync } from 'node:fs';
import path from 'node:path';

import { expect, test } from '../test';

const page = (name: string) =>
  readFileSync(path.join(process.cwd(), 'content', 'docs', name), 'utf8');

test('no page claims fixed 600ms entrances and 400ms exits', () => {
  for (const name of ['index.mdx', 'accessibility.mdx', 'changelog.mdx'])
    expect(page(name), name).not.toMatch(/600ms/);
});

test('the props tables match the code', () => {
  const primitive = (name: string) => page(`primitives/${name}.mdx`);
  expect(primitive('animate-ui/copy-button')).toContain(
    "default: '{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }'",
  );
  const dialog = primitive('react-aria/dialog');
  expect(dialog.indexOf('from: {')).toBeGreaterThan(
    dialog.indexOf('### Modal\n'),
  );
  expect(primitive('animate-ui/github-stars-button')).toContain('inViewMargin');
  expect(primitive('animate-ui/icon-button')).toContain('sideOffset');
  expect(primitive('animate-ui/spring')).not.toContain('dragElastic');
});
