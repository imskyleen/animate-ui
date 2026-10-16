# Steps of a form

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: spatial, going forward slides on, going back slides back. (shadcn/ui's Questionnaire: [../recipes/steps.md](../recipes/steps.md).)

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  shift,
  transition,
  useShouldReduceMotion,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function FormSteps({
  step,
  direction,
  children,
}: {
  step: number;
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  return (
    <ReducedMotionConfig>
      <Steps step={step} direction={direction}>
        {children}
      </Steps>
    </ReducedMotionConfig>
  );
}

function Steps({
  step,
  direction,
  children,
}: {
  step: number;
  direction: 1 | -1;
  children: React.ReactNode;
}) {
  const reduce = useShouldReduceMotion();
  const leave = useTempoTransition(transition.panelOut);
  const enter = useTempoTransition(transition.panelIn);
  const away = (sign: number) => ({
    opacity: 0,
    filter: blur.panel,
    transform: `translateX(${reduce ? 0 : sign * direction * shift.step}px)`,
  });

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={away(1)}
        animate={{
          opacity: 1,
          filter: 'blur(0px)',
          transform: 'translateX(0px)',
          transition: enter,
        }}
        exit={{ ...away(-1), transition: leave }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- The step leaves `shift.step` (24px) toward where you're going, into `blur.panel`, on `transition.panelOut`; the next comes from the other side on `transition.panelIn`. `mode="wait"`: one step at a time.
- Pass the direction (1 forward, -1 back) so going back mirrors it.
- Move focus to the new step's first field or heading once it's in.
- Under reduced motion, no slide: the steps cross-fade through the blur.
