# Skeleton, then content

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: state, the content replaces its placeholder in place.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function Loaded({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  const fade = useTempoTransition(transition.fade);
  const reveal = useTempoTransition(transition.reveal);

  return (
    <ReducedMotionConfig>
      <div className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <motion.div
              key="skeleton"
              aria-hidden="true"
              exit={{ opacity: 0, transition: fade }}
              className="h-24 animate-pulse rounded-lg bg-neutral-200 motion-reduce:animate-none"
            />
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, filter: blur.surface }}
              animate={{ opacity: 1, filter: 'blur(0px)', transition: reveal }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ReducedMotionConfig>
  );
}
```

- The skeleton fades out on `transition.fade` while the content comes out of `blur.surface` on `transition.reveal`; `popLayout` overlaps them so nothing jumps between.
- The skeleton's pulse is CSS, stopped under reduced motion (`motion-reduce:animate-none`).
- When the content's height differs from the skeleton's, wrap both in Auto Height (catalog) so the space eases to it.
