# @animate-ui/react

Animated drop-in primitives for Radix UI, Base UI and React Aria, built with [Motion](https://motion.dev).

Each primitive has exactly the API of its library: swap the import and your components animate.

```tsx
// Before
import { Accordion as AccordionPrimitive } from 'radix-ui';
// After
import { Accordion as AccordionPrimitive } from '@animate-ui/react/primitives/radix-ui/accordion';
```

Or let the CLI do it for every installed shadcn/ui component:

```bash
pnpm dlx @animate-ui/cli@latest animate all
```

Documentation: https://animate-ui.com
