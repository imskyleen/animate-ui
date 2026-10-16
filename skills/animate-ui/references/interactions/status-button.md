# Status button (loading, success, error)

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: state, the action's progress shows where it was triggered. The label swaps in place through a light blur while the button resizes to it.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  scale,
  spring,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Status = 'idle' | 'loading' | 'success' | 'error';

const LABELS: Record<Status, string> = {
  idle: 'Save changes',
  loading: 'Saving…',
  success: 'Saved',
  error: 'Try again',
};

export function StatusButton({
  status,
  onClick,
}: {
  status: Status;
  onClick: () => void;
}) {
  return (
    <ReducedMotionConfig>
      <StatusButtonMotion status={status} onClick={onClick} />
    </ReducedMotionConfig>
  );
}

function StatusButtonMotion({
  status,
  onClick,
}: {
  status: Status;
  onClick: () => void;
}) {
  const reduce = useShouldReduceMotion();
  const press = useTempoTransition(spring.press);
  const resize = useTempoTransition(spring.reflow);
  const swap = useTempoTransition(transition.swap);

  return (
    <motion.button
      type="button"
      layout
      onClick={onClick}
      disabled={status === 'loading'}
      aria-live="polite"
      initial={{ transform: 'scale(1)' }}
      whileTap={{ transform: reduce ? 'scale(1)' : `scale(${scale.press})` }}
      transition={{ ...press, layout: resize }}
      className="inline-flex h-9 items-center gap-2 overflow-hidden rounded-md bg-neutral-900 px-4 text-sm text-white"
    >
      <span className="relative inline-flex">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status}
            layout="position"
            initial={{ opacity: 0, filter: blur.icon }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: blur.icon, transition: swap }}
            transition={{ ...swap, layout: resize }}
          >
            {LABELS[status]}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
```

When the button runs the action itself (`onSave: () => Promise<void>`), it owns its status:

```tsx
export function useActionStatus(action: () => Promise<unknown>, hold = 1500) {
  const [status, setStatus] = React.useState<Status>('idle');
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const run = React.useCallback(async () => {
    clearTimeout(timer.current);
    setStatus('loading');
    try {
      await action();
      setStatus('success');
      timer.current = setTimeout(() => setStatus('idle'), hold);
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  }, [action, hold]);

  return [status, run] as const;
}

export function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [status, run] = useActionStatus(onSave);
  return <StatusButton status={status} onClick={run} />;
}
```

- The label is a Swap ([../recipes/swap.md](../recipes/swap.md)): `mode="popLayout"` lets the old one leave while the new one comes, `initial={false}` keeps the first render still. The label fades through the blur without scaling, and `layout="position"` keeps it from stretching while the button resizes (rules B9). An icon beside it swaps from `scale.icon`.
- The error state is part of the recipe: a failure shows "Try again", and the error still reaches the logs (`console.error`, or the project's own logger).
- "Saved" holds about 1.5s, then goes back to idle. The hold is real time: `tempo` paces motion, not how long a message stays readable. A failure stays on "Try again" until the next click; clicking again clears a pending hold.
- What the animation needs from the classes: `inline-flex items-center overflow-hidden` on the button. The height, padding and colors are the user's.
- `layout` resizes the button to its label on `spring.reflow`; the press stays on `spring.press` (the `layout` key of the transition only drives the resize).
- `aria-live="polite"` reads the new label; disable the button while loading so a second click can't fire.
- "Show it's loading" is the label; add a spinner only when the project has one (an icon set, a Spinner component). It spins with CSS (`motion-safe:animate-spin`): under reduced motion it stops, the label still says it's loading.
- Copying text or toggling a like has a catalog item (Copy Button, Icon Button): use those.
