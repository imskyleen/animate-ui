# A banner pushing the page

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: state, a message arrives and makes room for itself.

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

export function Banner({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const unfold = useTempoTransition(transition.disclosure);

  return (
    <ReducedMotionConfig>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="banner"
            role="status"
            initial={{ height: 0, opacity: 0, filter: blur.disclosure }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0, filter: blur.disclosure }}
            transition={unfold}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 px-4 py-3 text-sm">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </ReducedMotionConfig>
  );
}
```

- Height goes from 0 to `auto` on `transition.disclosure` while it fades out of `blur.disclosure`: the one place height animates, because the page below must move (../rules.md, A8).
- `role="status"` reads it out; a dismissible one gets a close button and leaves the same way.
- Content whose height changes on its own (not appearing): Auto Height (catalog).
