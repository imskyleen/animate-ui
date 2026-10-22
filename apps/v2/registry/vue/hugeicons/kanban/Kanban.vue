<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type KanbanProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { d: 'M17 7V17' },
      animate: {
        d: ['M17 7V17', 'M17 7V11', 'M17 7V14', 'M17 7V17'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: { d: 'M12 7V11' },
      animate: {
        d: ['M12 7V11', 'M12 7V14', 'M12 7V17', 'M12 7V11'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: { d: 'M7 7V14' },
      animate: {
        d: ['M7 7V14', 'M7 7V17', 'M7 7V11', 'M7 7V14'],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Kanban', inheritAttrs: false })
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
      <path
        d="M12 21C15.7497 21 17.6246 21 18.9389 20.0451C19.3634 19.7367 19.7367 19.3634 20.0451 18.9389C21 17.6246 21 15.7497 21 12C21 8.25027 21 6.3754 20.0451 5.06107C19.7367 4.6366 19.3634 4.26331 18.9389 3.95491C17.6246 3 15.7497 3 12 3C8.25027 3 6.3754 3 5.06107 3.95491C4.6366 4.26331 4.26331 4.6366 3.95491 5.06107C3 6.3754 3 8.25027 3 12C3 15.7497 3 17.6246 3.95491 18.9389C4.26331 19.3634 4.6366 19.7367 5.06107 20.0451C6.3754 21 8.25027 21 12 21Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M17 7V17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 7V11"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 7V14"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
