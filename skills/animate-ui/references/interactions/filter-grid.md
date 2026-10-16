# A grid filtered or sorted

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: continuity, the items that stay move to their new places.

```tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Item = { id: string; name: string };

export function FilterGrid({ items }: { items: Item[] }) {
  const move = useTempoTransition(spring.reflow);
  const fade = useTempoTransition(transition.fade);

  return (
    <ReducedMotionConfig>
      <ul className="grid grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: fade }}
              transition={{ ...move, opacity: fade }}
              className="rounded-xl border p-4"
            >
              {item.name}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ReducedMotionConfig>
  );
}
```

- Staying items glide on `spring.reflow` (`layout`), new ones grow in from 0.95, removed ones shrink out on `transition.fade`; `popLayout` lets the others move at once.
- Opacity runs on its own tween (`opacity: fade`) so items don't fade on the spring.
- Long grids: animate what's on screen only; hundreds of `layout` items make every change expensive.
