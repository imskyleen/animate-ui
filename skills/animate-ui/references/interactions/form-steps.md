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
  const ref = React.useRef<HTMLDivElement>(null);
  const away = (sign: number) => ({
    opacity: 0,
    filter: blur.panel,
    transform: `translateX(${reduce ? 0 : sign * shift.step}px)`,
  });
  const variants = {
    enter: (dir: number) => away(dir),
    center: {
      opacity: 1,
      filter: 'blur(0px)',
      transform: 'translateX(0px)',
      transition: enter,
    },
    exit: (dir: number) => ({ ...away(-dir), transition: leave }),
  };

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <motion.div
        key={step}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        ref={ref}
        onAnimationComplete={(name) => {
          if (name !== 'center') return;
          ref.current
            ?.querySelector<HTMLElement>(
              'input, select, textarea, [tabindex="-1"]',
            )
            ?.focus();
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

In the form, the step and its direction change together:

```tsx
const [{ step, direction }, setStep] = React.useState({
  step: 0,
  direction: 1 as 1 | -1,
});
const go = (to: number) => setStep({ step: to, direction: to > step ? 1 : -1 });
```

- The step leaves `shift.step` (24px) toward where you're going, into `blur.panel`, on `transition.panelOut`; the next comes from the other side on `transition.panelIn`. `mode="wait"`: one step at a time.
- Pass the direction (1 forward, -1 back) so going back mirrors it. Keep `{ step, direction }` in one state so they never disagree.
- The leaving step keeps its last props, so the direction reaches it through `custom` on `AnimatePresence`.
- Focus moves to the new step's first field or heading in `onAnimationComplete`, once it's in, not on first mount. A heading gets `tabIndex={-1}`.
- Clip the steps (`overflow-x-clip`) only when the padding around them is narrower than `shift.step`; otherwise focus rings and shadows stay whole.
- Under reduced motion, no slide: the steps cross-fade through the blur.
