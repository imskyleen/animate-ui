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
        transformOrigin: '74.28% 78.19%',
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        rotate: 360,
        transformOrigin: '74.28% 78.19%',
        transition: { ease: 'easeInOut', duration: 0.6, delay: 0.15 },
      },
    },
    line2: {},
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
      v-bind="attrs"
    >
      <path
        d="M5 4.82C3.14864 6.63902 2 9.17385 2 11.9776C2 17.5129 6.47715 22.0001 12 22.0001C17.5228 22.0001 22 17.5129 22 11.9776C22 7.1242 18.5581 3.07656 13.9872 2.15288C13.1512 1.98394 12.7332 1.89947 12.3666 2.20022C12 2.50097 12 2.98714 12 3.95949V4.96175"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M11.0809 13.152L8 7L13.4196 11.2796C14.1901 11.888 14.1941 13.0472 13.4277 13.6607C12.6614 14.2743 11.5189 14.0266 11.0809 13.152Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
