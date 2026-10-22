# A list: items in, out, and the gap closing

Read [README.md](README.md) first: keep the user's markup, use the project's colors, keep the recipe's values.

Purpose: continuity, the list stays the same list while it changes. Also for notifications, messages or results shown in the page; toasts fixed to a screen edge are `../recipes/toast.md`. An item the user closes leaves like any removed item, on `transition.fade`.

```tsx
'use client';

import type { RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/react/utils/motion';

type Item = { id: string; label: string };

export function AnimatedList({
  items,
  onRemove,
  emptyFocus,
}: {
  items: Item[];
  onRemove: (id: string) => void;
  // The field that adds items, or the list's heading (tabIndex={-1}).
  emptyFocus?: RefObject<HTMLElement | null>;
}) {
  const move = useTempoTransition(spring.reflow);
  const fade = useTempoTransition(transition.fade);

  // A17: the item leaving can't be tabbed to, and hands the focus to a neighbor.
  const leave = (item: HTMLElement) => {
    const next = (item.nextElementSibling ??
      item.previousElementSibling) as HTMLElement | null;
    if (item.contains(document.activeElement))
      (
        next?.querySelector<HTMLElement>('button, a, input') ??
        emptyFocus?.current
      )?.focus();
    item.inert = true;
  };

  return (
    <ReducedMotionConfig>
      <ul className="flex flex-col gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout="position"
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { ...move, opacity: fade },
              }}
              exit={{ opacity: 0, scale: 0.96, transition: fade }}
              transition={move}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              {item.label}
              <button
                type="button"
                onClick={(event) => {
                  leave(event.currentTarget.closest('li')!);
                  onRemove(item.id);
                }}
              >
                Remove
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </ReducedMotionConfig>
  );
}
```

- An added item fades in and rises 8px at once, wherever it lands. The items already there on first render show at rest (`initial={false}`); a page's first entrance is Effects with `holdDelay` (catalog), not this list.
- A removed item fades and shrinks to 0.96 in place, and `mode="popLayout"` takes it out of the flow at once so the others close the gap on `spring.reflow` (`layout="position"`: they move, they don't stretch).
- Results of a search or filter don't cascade ([../recipes/palette.md](../recipes/palette.md)): only items added one by one animate in.
- Spacing between items is `gap`, never `space-y-*` or margins (the item `popLayout` takes out of the flow would jump by its margin), and never `divide-y`: use a border on each item. Swapping the user's `space-y-*` for `flex flex-col gap-*` of the same size is part of the recipe; say so in the output.
- Under reduced motion, `ReducedMotionConfig` drops the rise and the layout moves; the fades stay.
- A removed item that had the focus hands it to its neighbor's control, and the item gets `inert` as its exit starts (rules A17). When the list empties, `emptyFocus` takes it: the field that adds items, or the list's heading.

## In Vue

```vue
<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v';
import {
  ReducedMotionConfig,
  spring,
  transition,
  useTempoTransition,
} from '@animate-ui/vue/utils/motion';

const props = defineProps<{
  items: { id: string; label: string }[];
  // The field that adds items, or the list's heading (tabindex="-1").
  emptyFocus?: HTMLElement | null;
}>();
const emit = defineEmits<{ remove: [id: string] }>();

const move = useTempoTransition(() => spring.reflow);
const fade = useTempoTransition(() => transition.fade);

function remove(id: string, event: MouseEvent) {
  const item = (event.currentTarget as HTMLElement).closest('li')!;
  const next = (item.nextElementSibling ??
    item.previousElementSibling) as HTMLElement | null;
  if (item.contains(document.activeElement))
    (
      next?.querySelector<HTMLElement>('button, a, input') ?? props.emptyFocus
    )?.focus();
  item.inert = true;
  emit('remove', id);
}
</script>

<template>
  <ReducedMotionConfig>
    <AnimatePresence
      as="ul"
      mode="popLayout"
      :initial="false"
      class="flex flex-col gap-2"
    >
      <motion.li
        v-for="item in items"
        :key="item.id"
        layout="position"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0, transition: { ...move, opacity: fade } }"
        :exit="{ opacity: 0, scale: 0.96, transition: fade }"
        :transition="move"
        class="flex items-center justify-between rounded-lg border px-3 py-2"
      >
        {{ item.label }}
        <button type="button" @click="remove(item.id, $event)">Remove</button>
      </motion.li>
    </AnimatePresence>
  </ReducedMotionConfig>
</template>
```

Outside `mode="wait"`, Motion for Vue's `AnimatePresence` is a `TransitionGroup`: `as="ul"` makes it the list itself (classes and attributes go on it), so the user's `<ul>` becomes the `AnimatePresence`, keeping its classes. Without `as`, it renders no element and sits inside the user's `<ul>`.
