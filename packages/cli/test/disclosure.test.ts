import { expect, test } from 'vitest';

import { transform } from '../src/lib/transform';

// Disclosures: Motion animates the panel's height, so the CSS height
// animations reading the libraries' measured variables go, and nothing else.

test('base-ui accordion: the CSS-variable height animation is gone', () => {
  const input = `import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
export const C = () => (
  <AccordionPrimitive.Panel className="overflow-hidden data-open:animate-accordion-down">
    <div className="h-(--accordion-panel-height) data-ending-style:h-0 data-starting-style:h-0 pb-4 data-open:h-0" />
  </AccordionPrimitive.Panel>
)
`;
  const result = transform(input);
  expect(result.code).toContain(
    'from "@animate-ui/react/primitives/base-ui/accordion"',
  );
  expect(result.code).toContain('className="overflow-hidden"');
  // Only the starting/ending-style heights: other h-0 variants stay.
  expect(result.code).toContain('className="pb-4 data-open:h-0"');
});

test('base-ui collapsible: Base UI’s documented height transition is gone', () => {
  const input = `import { Collapsible } from "@base-ui/react/collapsible"
export const C = () => <Collapsible.Panel className="h-(--collapsible-panel-height) data-starting-style:h-0 data-ending-style:h-0 flex flex-col" />
`;
  const result = transform(input);
  expect(result.code).toContain(
    'from "@animate-ui/react/primitives/base-ui/collapsible"',
  );
  expect(result.code).toContain('className="flex flex-col"');
});

test('react-aria: a DisclosurePanel import switches to the mirror', () => {
  const input = `import { Disclosure, DisclosurePanel, Button } from "react-aria-components"
export const C = () => <DisclosurePanel className="h-(--disclosure-panel-height) overflow-clip transition-[height] text-sm" />
`;
  const result = transform(input);
  expect(result.code).toContain(
    'import { Disclosure, DisclosurePanel, Button } from "@animate-ui/react/primitives/react-aria"',
  );
  expect(result.code).toContain('className="overflow-clip text-sm"');
});

test('react-aria: files without a DisclosurePanel keep their classes', () => {
  const input = `import { Disclosure } from "react-aria-components"
export const C = () => <Disclosure className="transition-[height]" />
`;
  expect(transform(input).code).toBe(input);
});
