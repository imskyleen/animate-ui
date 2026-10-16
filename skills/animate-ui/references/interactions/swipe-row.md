# A row swiped away

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: spatial, the row leaves the way it was pushed.

```tsx
'use client';

import { motion, type PanInfo } from 'motion/react';
import {
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function SwipeRow({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => void;
}) {
  const back = useTempoTransition(spring.slide);
  const away = useTempoTransition(transition.dismiss);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -120 || info.velocity.x < -500) onDelete();
  };

  return (
    <motion.li
      layout="position"
      exit={{ x: '-100%', opacity: 0, transition: away }}
      className="relative overflow-hidden rounded-lg"
    >
      <div className="absolute inset-0 flex items-center justify-end bg-red-500 pr-4 text-white">
        Delete
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        dragTransition={{
          bounceStiffness: back.stiffness as number,
          bounceDamping: back.damping as number,
        }}
        onDragEnd={onDragEnd}
        className="relative flex items-center justify-between border bg-white px-3 py-3"
      >
        {label}
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-neutral-500"
        >
          Delete
        </button>
      </motion.div>
    </motion.li>
  );
}
```

- The row only drags left (`dragConstraints` and `dragElastic` 0 on the right); released past 120px or thrown fast, it's deleted, otherwise it springs back on `spring.slide` (no overshoot past its place).
- Deleted, it leaves on `transition.dismiss` (`x: '-100%'`, under an `AnimatePresence` in the list) and the rows below close the gap with `layout`.
- Swiping is never the only way: a visible Delete button (or a menu) does the same.
- Under reduced motion (inside `ReducedMotionConfig`), the drag still follows the finger and the deleted row fades instead of sliding.
