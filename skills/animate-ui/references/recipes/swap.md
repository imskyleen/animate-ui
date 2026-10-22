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
- A text swaps without the scale: opacity and `blur.icon` only, `layout="position"` when the box around it resizes (rules B9). A label swapping inside a button or beside a control keeps the control's size (below, a label taking turns). Words taking turns, a string changing or a number: Rotating, Morphing or Rolling Text, Sliding Number (catalog).
- A number with its unit ('$9/month') swaps as one piece, keyed on its whole text.
- Larger content (a panel, a card) uses `blur.surface` and its own recipe's transition.

### In Vue

The same swap with Motion for Vue (`references/vue.md`):

```vue
<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import {
  blur,
  scale,
  transition,
  useTempoTransition,
} from '@animate-ui/vue/utils/motion';

defineProps<{ copied: boolean }>();
const swap = useTempoTransition(() => transition.swap);
</script>

<template>
  <span class="relative inline-flex">
    <AnimatePresence mode="popLayout" :initial="false">
      <motion.span
        :key="copied ? 'copied' : 'copy'"
        :initial="{ opacity: 0, scale: scale.icon, filter: blur.icon }"
        :animate="{
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: swap,
        }"
        :exit="{
          opacity: 0,
          scale: scale.icon,
          filter: blur.icon,
          transition: swap,
        }"
      >
        <CheckIcon v-if="copied" />
        <CopyIcon v-else />
      </motion.span>
    </AnimatePresence>
  </span>
</template>
```

`useTempoTransition` takes a getter and returns a computed: `swap` in the template.

## A label taking turns in a control

A button or a pill whose label changes (Save → Saved, Follow → Following): the label fades through `blur.icon`, without the scale, and the control keeps its size. Size the label's box from its longest label, never from a guess: every label sits invisible in the same grid cell, so the box is exactly as wide as the widest one in the font, the weight and the language it is set in. A `min-width` in `ch` is a guess: `ch` is the width of a `0`, so it runs short of wide letters (`W`, `M`) and long of narrow ones, and breaks once the label is translated.

```tsx
const LABELS = { idle: 'Save', saved: 'Saved' } as const;

function SaveLabel({ saved }: { saved: boolean }) {
  const swap = useTempoTransition(motionTransition.swap);
  return (
    <span className="relative inline-grid place-items-center">
      {Object.values(LABELS).map((label) => (
        <span key={label} aria-hidden className="invisible [grid-area:1/1]">
          {label}
        </span>
      ))}
      <span className="[grid-area:1/1]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={saved ? 'saved' : 'idle'}
            className="inline-block"
            initial={{ opacity: 0, filter: blur.icon }}
            animate={{ opacity: 1, filter: 'blur(0px)', transition: swap }}
            exit={{ opacity: 0, filter: blur.icon, transition: swap }}
          >
            {saved ? LABELS.saved : LABELS.idle}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
```

```vue
<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import {
  blur,
  transition,
  useTempoTransition,
} from '@animate-ui/vue/utils/motion';

const LABELS = { idle: 'Save', saved: 'Saved' } as const;
defineProps<{ saved: boolean }>();
const swap = useTempoTransition(() => transition.swap);
</script>

<template>
  <span class="relative inline-grid place-items-center">
    <span
      v-for="label in Object.values(LABELS)"
      :key="label"
      aria-hidden="true"
      class="invisible [grid-area:1/1]"
    >
      {{ label }}
    </span>
    <span class="[grid-area:1/1]">
      <AnimatePresence mode="popLayout" :initial="false">
        <motion.span
          :key="saved ? 'saved' : 'idle'"
          class="inline-block"
          :initial="{ opacity: 0, filter: blur.icon }"
          :animate="{ opacity: 1, filter: 'blur(0px)', transition: swap }"
          :exit="{ opacity: 0, filter: blur.icon, transition: swap }"
        >
          {{ saved ? LABELS.saved : LABELS.idle }}
        </motion.span>
      </AnimatePresence>
    </span>
  </span>
</template>
```

- The invisible copies are `aria-hidden`; screen readers read the shown label. When the change is news (Saved), the button's accessible name already says it; a status beside it goes in a live region.
- The labels come from one list, so a new or translated label widens the box on its own.
- Morphing Text, in an expressive context, sizes the same way: its strings, invisible, in the same cell.

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
