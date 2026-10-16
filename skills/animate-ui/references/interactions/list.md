# A list: items in, out, and the gap closing

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: continuity, the list stays the same list while it changes.

```tsx
'use client';

import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Item = { id: string; label: string };

export function AnimatedList({
  items,
  onRemove,
}: {
  items: Item[];
  onRemove: (id: string) => void;
}) {
  const move = useTempoTransition(spring.reflow);
  const fade = useTempoTransition(transition.fade);

  return (
    <ReducedMotionConfig>
      <ul className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...move, opacity: fade },
              }}
              exit={{ opacity: 0, scale: 0.96, transition: fade }}
              transition={move}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              {item.label}
              <button type="button" onClick={() => onRemove(item.id)}>
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ReducedMotionConfig>
  );
}
```

- An added item fades in and rises 8px at once, wherever it lands. The items already there on first render show at rest (`initial={false}`); a page's first entrance is Effects with `holdDelay` (catalog), not this list.
- A removed item fades and shrinks to 0.96 in place, and `mode="popLayout"` takes it out of the flow at once so the others close the gap on `spring.reflow` (`layout="position"`: they move, they don't stretch).
- Results of a search or filter don't cascade ([../recipes/palette.md](../recipes/palette.md)): only items added one by one animate in.
- Spacing between items is `gap`, never `space-y-*` or margins: the item `popLayout` takes out of the flow would jump by its margin. Swapping the user's `space-y-*` for `flex flex-col gap-*` of the same size is part of the recipe; say so in the output.
- Under reduced motion, `ReducedMotionConfig` drops the rise and the layout moves; the fades stay.
