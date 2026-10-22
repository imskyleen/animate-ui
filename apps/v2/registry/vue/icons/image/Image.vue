<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ImageProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    frame: {},
    sun: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, delay: 0.05, ease: 'easeOut' },
      },
    },
    mountain: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, delay: 0.3, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Image', inheritAttrs: false })
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
      <motion.rect
        width="18"
        height="18"
        x="3"
        y="3"
        rx="2"
        ry="2"
        :variants="variants.frame"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="9"
        cy="9"
        r="2"
        :variants="variants.sun"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
        :variants="variants.mountain"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
