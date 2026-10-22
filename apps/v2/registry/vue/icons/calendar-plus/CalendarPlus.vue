<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CalendarPlusProps = IconProps<keyof typeof animations>;

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
    plus: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CalendarPlus', inheritAttrs: false })
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
      <path
        d="M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3"
      />
      <path
        d="M3 9h18"
      />
      <motion.g
        :variants="variants.plus"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M16 18h6"
        />
        <path
          d="M19 15v6"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
