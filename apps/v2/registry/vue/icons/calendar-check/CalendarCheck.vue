<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CalendarCheckProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    ring1: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
    ring2: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
          delay: 0.08,
        },
      },
    },
    check: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.2 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CalendarCheck', inheritAttrs: false })
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
        d="M8 2v3"
        :variants="variants.ring1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 2v3"
        :variants="variants.ring2"
        initial="initial"
        :animate="controls"
      />
      <rect
        :x="3"
        :y="3"
        :width="18"
        :height="18"
        :rx="2"
      />
      <path
        d="M3 9h18"
      />
      <motion.path
        d="m9 15 2 2 4-4"
        :variants="variants.check"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
