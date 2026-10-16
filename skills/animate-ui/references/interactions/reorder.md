# A list reordered by drag

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: spatial, the dragged item and the others make room as it moves.

```tsx
'use client';

import * as React from 'react';
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
  const [said, setSaid] = React.useState('');

  const place = (from: number, to: number, button: HTMLButtonElement) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onReorder(next);
    setSaid(`${item} moved to position ${to + 1}`);
    requestAnimationFrame(() => button.focus());
  };

  return (
    <ReducedMotionConfig>
      <Reorder.Group
        as="ol"
        axis="y"
        values={items}
        onReorder={onReorder}
        className="flex flex-col gap-2"
      >
        {items.map((item, index) => (
          <Reorder.Item
            as="li"
            key={item}
            value={item}
            transition={move}
            whileDrag={{ boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)', zIndex: 1 }}
            className="relative flex cursor-grab items-center justify-between rounded-lg border bg-white px-3 py-2 active:cursor-grabbing"
          >
            {item}
            <span className="flex gap-1">
              <button
                type="button"
                aria-label={`Move ${item} up`}
                onClick={(event) =>
                  place(index, index - 1, event.currentTarget)
                }
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${item} down`}
                onClick={(event) =>
                  place(index, index + 1, event.currentTarget)
                }
              >
                ↓
              </button>
            </span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <p aria-live="polite" className="sr-only">
        {said}
      </p>
    </ReducedMotionConfig>
  );
}
```

- Motion's `Reorder` swaps the order as the item passes its neighbours; the others slide on `spring.reflow`.
- The dragged item lifts with a shadow, never a scale on hover; raise its `zIndex` so it passes over the others.
- Prefer move up and move down buttons (no extra role needed), and announce each move in a polite live region ('Breathe moved to position 3'). Keep the user's `ol`/`li` with `as="ol"` and `as="li"`. The same `layout` animates those moves.
- The pressed button gets its focus back after the move: React moves its row's node, which drops the focus.
- Under reduced motion the item still follows the pointer (it's direct manipulation); the others jump to their places.
