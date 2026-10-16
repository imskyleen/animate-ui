# Swap (copy → copied, sun → moon, a label changing)

Imports and base-library wiring: [README.md](README.md).

Purpose: state. Two states replace each other in place, briefly overlapping: a light blur makes the overlap read as one shape changing.

```tsx
const swap = useTempoTransition(motionTransition.swap);

<span className="relative inline-flex">
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.span
      key={copied ? 'copied' : 'copy'}
      initial={{ opacity: 0, scale: scale.icon, filter: blur.icon }}
      animate={{
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: swap,
      }}
      exit={{
        opacity: 0,
        scale: scale.icon,
        filter: blur.icon,
        transition: swap,
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </motion.span>
  </AnimatePresence>
</span>;
```

- `mode="popLayout"`: the old icon leaves while the new one arrives. The `relative` wrapper keeps the leaving one in place even while the button around it is scaled by its press.
- `initial={false}`: nothing animates on mount.
- `transition: swap` goes inside `animate` and `exit`, through `useTempoTransition` so the tempo reaches it.
- A text swaps without the scale: opacity and `blur.icon` only, `layout="position"` when the box around it resizes (rules B9). Words taking turns, a string changing or a number: Rotating, Morphing or Rolling Text, Sliding Number (catalog).
- A number with its unit ('$9/month') swaps as one piece, keyed on its whole text.
- Larger content (a panel, a card) uses `blur.surface` and its own recipe's transition.

## A word cycling in a line of text

A word changing on a timer inside a heading or a sentence ("Design. Code. **Ship.**" → "Grow." → "Win."): the line around it never moves, and the word keeps the line's baseline, color and weight.

```tsx
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  blur,
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

export function CyclingWord({
  words,
  every = 2000,
}: {
  words: string[];
  every?: number;
}) {
  const [index, setIndex] = React.useState(0);
  const rise = useTempoTransition(spring.slide);
  const fade = useTempoTransition(transition.swap);

  React.useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      every,
    );
    return () => clearInterval(id);
  }, [words.length, every]);

  return (
    <ReducedMotionConfig>
      <span className="inline-grid justify-items-start">
        <span className="sr-only">{words.join(', ')}</span>
        {words.map((word) => (
          <span
            key={word}
            aria-hidden="true"
            className="invisible col-start-1 row-start-1"
          >
            {word}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={words[index]}
            aria-hidden="true"
            className="col-start-1 row-start-1"
            initial={{ opacity: 0, y: '0.35em', filter: blur.surface }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { ...rise, opacity: fade, filter: fade },
            }}
            exit={{
              opacity: 0,
              y: '-0.35em',
              filter: blur.surface,
              transition: fade,
            }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </ReducedMotionConfig>
  );
}
```

- Every word sits in the same grid cell, the hidden ones reserving the widest word's width: the rest of the line stays put, and an inline grid keeps the text's baseline (Rotating Text renders a block, which drops it out of a line).
- The new word rises out of a blur while the old one leaves upward; under reduced motion only the fade and the blur stay. The words keep the wrapper's own classes (`text-blue-600` stays on the span around it).
- Screen readers read the list once; the timer runs from the first change, and the first word shows at rest on load.
- Check it: the line's other words don't move between changes, and the word's letters sit on the same baseline as before.
