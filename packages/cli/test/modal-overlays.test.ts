import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

// Dialog, sheet, alert dialog and drawer, in every base and style.
const FIXTURES = path.join(import.meta.dirname, 'fixtures');
const read = (library: string, file: string) =>
  readFileSync(path.join(FIXTURES, library, file), 'utf8');
const files = (library: string, component: RegExp) =>
  readdirSync(path.join(FIXTURES, library)).filter((f) => component.test(f));

const MODULE: Record<string, (component: string) => string> = {
  'radix-ui': (component) =>
    `@animate-ui/react/primitives/radix-ui/${component === 'sheet' ? 'dialog' : component}`,
  'base-ui': (component) =>
    `@animate-ui/react/primitives/base-ui/${component === 'sheet' ? 'dialog' : component}`,
  'react-aria': () => '@animate-ui/react/primitives/react-aria',
};

// Motion owns the modals: no keyframe, no CSS transition, no duration left on
// the overlay or the content; the centering translate and the layout stay.
for (const library of Object.keys(MODULE)) {
  for (const file of files(library, /^(dialog|sheet|alert-dialog)\./)) {
    test(`${library}/${file}: Motion owns the modal`, () => {
      const component = file.split('.')[0]!;
      const result = transform(read(library, file));
      expect(result.code).toContain(`"${MODULE[library]!(component)}"`);
      expect(result.code).not.toMatch(
        /\b(animate-(in|out)|fade-(in|out)|zoom-(in|out)|slide-(in-from|out-to))/,
      );
      expect(result.code).not.toMatch(
        /data-(starting-style|ending-style|entering|exiting):(opacity|-?translate)/,
      );
      expect(result.code).not.toMatch(
        /\s(transition|transition-opacity|duration-\d+|ease-in-out)\s/,
      );
      if (component === 'sheet') {
        expect(result.code).toContain('data-[side=right]:right-0');
      } else {
        expect(result.code).toContain('-translate-x-1/2 -translate-y-1/2');
      }
    });
  }
}

// The drawer stays CSS-driven, now by the primitive: shadcn's timing and
// transform classes go, the variables they fed (which the primitive reads)
// and the handle's and content's own fades stay.
for (const library of ['base-ui', 'react-aria']) {
  for (const file of files(library, /^drawer\./)) {
    test(`${library}/${file}: the primitive owns the drawer's motion`, () => {
      const result = transform(read(library, file));
      expect(result.code).toContain(
        '"@animate-ui/react/primitives/base-ui/drawer"',
      );
      expect(result.code).not.toMatch(
        /transform-\[translate3d|transform-\(--closed-transform\)|duration-450|data-swiping:duration|data-ending-style:duration/,
      );
      expect(result.code).not.toContain('opacity-[max(');
      // Read by the primitive.
      expect(result.code).toContain('[--closed-transform:translate3d(');
      expect(result.code).toContain('[--translate-y:calc(');
      expect(result.code).toContain('[--stack-scale:clamp(');
      // The swipe handle's and the content's fades for nested drawers.
      expect(result.code).toContain('transition-opacity duration-200');
      expect(result.code).toContain(
        'transition-opacity duration-300 ease-[cubic-bezier(0.45,1.005,0,1.005)]',
      );
    });
  }
}

test('react-aria: one import moves to the mirror for Modal and ModalOverlay', () => {
  const input = `import { Dialog, Modal, ModalOverlay, Heading } from "react-aria-components"
export const C = () => <ModalOverlay className="data-entering:animate-in data-entering:fade-in-0 duration-100 fixed inset-0"><Modal className="data-entering:zoom-in-95"><Dialog><Heading slot="title" /></Dialog></Modal></ModalOverlay>
`;
  const result = transform(input);
  expect(result.code).toContain(
    'import { Dialog, Modal, ModalOverlay, Heading } from "@animate-ui/react/primitives/react-aria"',
  );
  expect(result.code).toContain('className="fixed inset-0"');
  expect(result.code).toContain('<Modal className="">');
});
