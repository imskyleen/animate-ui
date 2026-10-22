<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CircuitBoardProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    path1: {
      initial: { pathLength: 1, opacity: 1, pathOffset: 0 },
      animate: {
        pathLength: [0.05, 1],
        pathOffset: [1, 0],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle1: {},
    path2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0.05, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CircuitBoard', inheritAttrs: false })
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
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11 9h4a2 2 0 0 0 2-2V3"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="9"
        cy="9"
        r="2"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 21v-4a2 2 0 0 1 2-2h4"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="15"
        cy="15"
        r="2"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
