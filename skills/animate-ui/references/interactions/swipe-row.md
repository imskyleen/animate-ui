# A row swiped away

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: spatial, the row leaves the way it was pushed. The list around it is [list.md](list.md)'s.

```tsx
'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  type PanInfo,
} from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Item = { id: string; label: string };

export function SwipeList({
  items,
  onDelete,
}: {
  items: Item[];
  onDelete: (id: string) => void;
}) {
  const move = useTempoTransition(spring.reflow);
  const away = useTempoTransition(transition.dismiss);

  return (
    <ReducedMotionConfig>
      <ul className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout="position"
              transition={move}
              exit="gone"
              variants={{ gone: { opacity: 0, transition: away } }}
              className="relative overflow-hidden rounded-lg"
            >
              <SwipeRow label={item.label} onDelete={() => onDelete(item.id)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ReducedMotionConfig>
  );
}

function SwipeRow({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => void;
}) {
  const back = useTempoTransition(spring.slide);
  const away = useTempoTransition(transition.dismiss);
  const x = useMotionValue(0);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -120 || info.velocity.x < -500) {
      x.stop();
      onDelete();
    }
  };

  return (
    <>
      <div className="absolute inset-0 flex items-center justify-end bg-red-500 pr-4 text-white">
        Delete
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        dragTransition={{
          bounceStiffness: back.stiffness as number,
          bounceDamping: back.damping as number,
        }}
        onDragEnd={onDragEnd}
        style={{ x }}
        variants={{ gone: { x: '-100%', transition: away } }}
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
    </>
  );
}
```

- The row only drags left (`dragConstraints` and `dragElastic` 0 on the right); released past 120px or thrown fast, it's deleted, otherwise it springs back on `spring.slide` (no overshoot past its place).
- `dragDirectionLock`: a vertical scroll still scrolls the page; the row moves only when the swipe starts sideways.
- Deleted, it leaves on `transition.dismiss` toward `x: '-100%'` from where the finger left it: `x.stop()` cancels the spring back, and the `gone` variant carries the exit from the `li` to its sliding part. The list's `AnimatePresence` plays it, and the rows below close the gap with `layout`.
- The `motion.li` stays a direct child of `AnimatePresence`: `popLayout` needs the element itself to take it out of the flow at once.
- Swiping is never the only way: a visible Delete button (or a menu) does the same.
- The visible Delete may be the user's `sr-only` button made visible; say so in the output.
- Under reduced motion (inside `ReducedMotionConfig`), the drag still follows the finger and the deleted row fades instead of sliding.
