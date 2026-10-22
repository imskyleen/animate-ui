<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Clock4Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'top left',
        rotate: [0, 20, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: 360,
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Clock4', inheritAttrs: false })
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
        :x1="12"
        :y1="12"
        :x2="16"
        :y2="14"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="12"
        :y1="6"
        :x2="12"
        :y2="12"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
