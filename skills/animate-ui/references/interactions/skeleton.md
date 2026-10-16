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
            >
              <div className="flex animate-pulse items-center gap-3 p-4 motion-reduce:animate-none">
                <div className="size-10 rounded-full bg-neutral-200" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-1/3 rounded bg-neutral-200" />
                  <div className="h-4 w-2/3 rounded bg-neutral-200" />
                </div>
              </div>
            </motion.div>
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
- `initial={false}`: content already loaded on mount shows at once, on purpose; A15 doesn't apply.
- The pulse is CSS on an inner element, so its opacity loop doesn't fight the exit's opacity. It stops under reduced motion (`motion-reduce:animate-none`).
- Shape the skeleton like the content (its avatar, its text bars, the same padding) so the heights match; Auto Height (catalog) is for when they can't.
