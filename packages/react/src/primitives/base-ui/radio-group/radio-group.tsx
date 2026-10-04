'use client';

// Same API as Base UI's Radio Group. Nothing animates on the group itself:
// its Radios do (`@animate-ui/react/primitives/base-ui/radio`), as v1's. Kept
// as its own module because shadcn/ui imports it next to Radio.
export { RadioGroup } from '@base-ui/react/radio-group';
