<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CircleXProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CircleX', inheritAttrs: false })
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
        :cy="12"
        :r="10"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="9"
        :y1="15"
        :x2="15"
        :y2="9"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="9"
        :y1="9"
        :x2="15"
        :y2="15"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
