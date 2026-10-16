# A list reordered by drag

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: spatial, the dragged item and the others make room as it moves.

```tsx
'use client';

import { Reorder } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function ReorderList({
  items,
  onReorder,
}: {
  items: string[];
  onReorder: (items: string[]) => void;
}) {
  const move = useTempoTransition(spring.reflow);

  return (
    <ReducedMotionConfig>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onReorder}
        className="flex flex-col gap-2"
      >
        {items.map((item) => (
          <Reorder.Item
            key={item}
            value={item}
            transition={move}
            whileDrag={{ boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)', zIndex: 1 }}
            className="relative cursor-grab rounded-lg border bg-white px-3 py-2 active:cursor-grabbing"
          >
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </ReducedMotionConfig>
  );
}
```

- Motion's `Reorder` swaps the order as the item passes its neighbours; the others slide on `spring.reflow`.
- The dragged item lifts with a shadow, never a scale on hover; raise its `zIndex` so it passes over the others.
- Give the keyboard a way too (move up / move down buttons, or arrow keys on a focused item): the same `layout` animates those changes.
- Under reduced motion the item still follows the pointer (it's direct manipulation); the others jump to their places.
