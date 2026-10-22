<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SquareKanbanProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line1: {
      initial: { d: 'M16.9922 7V17' },
      animate: {
        d: ['M16.9922 7V17', 'M16.9922 7V11', 'M16.9922 7V14', 'M16.9922 7V17'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: { d: 'M11.9922 7V11' },
      animate: {
        d: ['M11.9922 7V11', 'M11.9922 7V14', 'M11.9922 7V17', 'M11.9922 7V11'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: { d: 'M6.9922 7V14' },
      animate: {
        d: ['M6.9922 7V14', 'M6.9922 7V17', 'M6.9922 7V11', 'M6.9922 7V14'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SquareKanban', inheritAttrs: false })
</script>

<template>
  <IconWrapper
    v-slot="{ variants, controls, size, attrs }"
    :animations="animations"
    v-bind="$attrs"
  >
    <motion.svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      :stroke-width="2"
      v-bind="attrs"
    >
      <motion.path
        d="M11.9922 21C15.7419 21 17.6168 21 18.9311 20.0451C19.3556 19.7367 19.7289 19.3634 20.0373 18.9389C20.9922 17.6246 20.9922 15.7497 20.9922 12C20.9922 8.25027 20.9922 6.3754 20.0373 5.06107C19.7289 4.6366 19.3556 4.26331 18.9311 3.95491C17.6168 3 15.7419 3 11.9922 3C8.24246 3 6.36759 3 5.05326 3.95491C4.62879 4.26331 4.2555 4.6366 3.9471 5.06107C2.99219 6.3754 2.99219 8.25027 2.99219 12C2.99219 15.7497 2.99219 17.6246 3.9471 18.9389C4.2555 19.3634 4.62879 19.7367 5.05326 20.0451C6.36759 21 8.24246 21 11.9922 21Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16.9922 7V17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11.9922 7V11"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.9922 7V14"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
