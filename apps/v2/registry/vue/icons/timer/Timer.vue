<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TimerProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: 360,
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.15 },
      },
    },
    line2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 1.5, 0],
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Timer', inheritAttrs: false })
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
      <motion.circle
        :cx="12"
        :cy="14"
        :r="8"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="12"
        :x2="15"
        :y1="14"
        :y2="11"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="10"
        :x2="14"
        :y1="2"
        :y2="2"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
