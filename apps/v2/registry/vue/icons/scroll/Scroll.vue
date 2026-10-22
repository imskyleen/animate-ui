<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ScrollProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    sheet: {
      initial: { d: 'M19 17V5a2 2 0 0 0 -2 -2H4' },
      animate: {
        d: [
          'M19 17V5a2 2 0 0 0 -2 -2H4',
          'M19 14V5a2 2 0 0 0 -2 -2H4',
          'M19 17V5a2 2 0 0 0 -2 -2H4',
        ],
        transition: { duration: 1, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
    side: {
      initial: { d: 'M6 19V5a2 2 0 1 0 -4 0v2a1 1 0 0 0 1 1h3' },
      animate: {
        d: [
          'M6 19V5a2 2 0 1 0 -4 0v2a1 1 0 0 0 1 1h3',
          'M6 16V5a2 2 0 1 0 -4 0v2a1 1 0 0 0 1 1h3',
          'M6 19V5a2 2 0 1 0 -4 0v2a1 1 0 0 0 1 1h3',
        ],
        transition: { duration: 1, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
    roll: {
      initial: { y: 0 },
      animate: {
        y: [0, -3, 0],
        transition: { duration: 1, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Scroll', inheritAttrs: false })
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
      stroke-linecap="round"
      stroke-linejoin="round"
      v-bind="attrs"
    >
      <motion.path
        d="M19 17V5a2 2 0 0 0 -2 -2H4"
        :variants="variants.sheet"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6 19V5a2 2 0 1 0 -4 0v2a1 1 0 0 0 1 1h3"
        :variants="variants.side"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0"
        :variants="variants.roll"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
