<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ShapesProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    triangle: {
      initial: { scale: 1, transformOrigin: '50% 50%' },
      animate: {
        scale: [1, 0.72, 1.08, 1],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.75, 1],
          ease: 'easeOut',
          delay: 0,
        },
      },
    },
    square: {
      initial: { scale: 1, transformOrigin: '50% 50%' },
      animate: {
        scale: [1, 0.72, 1.08, 1],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.75, 1],
          ease: 'easeOut',
          delay: 0.12,
        },
      },
    },
    circle: {
      initial: { scale: 1, transformOrigin: '50% 50%' },
      animate: {
        scale: [1, 0.72, 1.08, 1],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.75, 1],
          ease: 'easeOut',
          delay: 0.24,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Shapes', inheritAttrs: false })
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
        d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"
        :variants="variants.triangle"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        :variants="variants.square"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="17.5"
        cy="17.5"
        r="3.5"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
