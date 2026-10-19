# Recipes

Start from the recipe that matches the component kind (see the table in SKILL.md). Each one is how the matching `@animate-ui/react` primitives move, and they have interaction tests for timing, reduced motion and keyboard behavior: read the primitives as reference implementations.

Every recipe assumes the base-library wiring from `../base-libraries.md` (presence, mounted content, `ReducedMotionConfig`). Snippets show Radix; swap the mounting mechanism for Base UI or React Aria. Imports, once for all:

```tsx
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  scale,
  spring,
  transition as motionTransition,
  useMotionTokens,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';
```

One file per kind; read only the one you need:

- [Overlay (Popover, Tooltip, Hover Card, Preview Card)](overlay.md)
- [Menu (Dropdown Menu, Context Menu, Menubar, Select, Combobox, Navigation Menu)](menu.md)
- [Modal (Dialog, Alert Dialog)](modal.md)
- [Disclosure (Accordion, Collapsible)](disclosure.md)
- [Sheet (Sheet, Drawer)](sheet.md)
- [Indicator (Tabs, Toggle Group, Pagination, Navigation Menu, Sidebar active item)](indicator.md)
- [Steps (Questionnaire)](steps.md)
- [Press (Button, Toggle, Checkbox, Switch, Radio)](press.md)
- [Swap (copy → copied, sun → moon, a label changing)](swap.md)
- [Card (clickable card, tile, list row)](card.md)
- [Palette (command palette, spotlight search)](palette.md)
- [Toast (hand-built)](toast.md)
- [Page (hero, sections, feature grids, stats)](page.md)
- [Route change (page transitions, shared elements, new effects)](route.md)
- [CSS-driven by the base library (Base UI Drawer, Toast)](css-driven.md)
