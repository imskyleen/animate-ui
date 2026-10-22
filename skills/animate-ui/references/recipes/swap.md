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
- A text swaps without the scale: opacity and `blur.icon` only, `layout="position"` when the box around it resizes (rules B9). A label swapping inside a button or beside a control keeps the control's size: give the label's box a `min-width` for the longest label (`min-w-[5ch]` for Save / Saved), centered, so nothing around it moves. Words taking turns, a string changing or a number: Rotating, Morphing or Rolling Text, Sliding Number (catalog).
- A number with its unit ('$9/month') swaps as one piece, keyed on its whole text.
- Larger content (a panel, a card) uses `blur.surface` and its own recipe's transition.

## A word cycling in a line of text

A word changing on a timer inside a heading or a sentence ("Design. Code. **Ship.**" → "Grow." → "Win."): the line around it never moves, and the word keeps the line's baseline, color and weight. Use Animate UI's Rotating Text, set inline:

```tsx
'use client';

import {
  RotatingText,
  RotatingTextContainer,
} from '@animate-ui/react/primitives/texts/rotating';

export function CyclingWord({
  words,
  every = 2000,
}: {
  words: string[];
  every?: number;
}) {
  return (
    <RotatingTextContainer
      text={words}
      duration={every}
      align="start"
      style={{ display: 'inline-block', overflow: 'clip' }}
    >
      <RotatingText className="text-blue-600" />
    </RotatingTextContainer>
  );
}
```

- `align` keeps the widest word's width, so the rest of the line stays put, and places each word at its start (`center` or `end` otherwise).
- `display: inline-block` keeps it in the line. `overflow: clip` still hides the word's travel but, unlike the container's default `hidden`, keeps the text's baseline (an `overflow: hidden` inline-block sits on its bottom edge, a few pixels too high).
- In a centered heading that wraps on narrow screens, the word can end up alone on its line: switch `align` to `center` when it does (compare its `offsetTop` with the line's first word, again on resize and once fonts load).
- When the heading enters with its own effect (words rising out of a blur), wrap the container in that same entrance and give it a single word until the entrance ends. Otherwise it plays its own slide-in on mount, unlike the words around it.
- Screen readers read the list once.
- Check it: the line's other words don't move between changes, and the word's letters sit on the same baseline as the line's.
