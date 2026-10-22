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
      v-bind="attrs"
    >
      <motion.path
        d="M19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682C3 18.364 3 16.2426 3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11 9H20.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="9"
        :cy="9"
        :r="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 20.5C7 18.1544 7 16.9816 7.61994 16.1737C7.77954 15.9657 7.96572 15.7795 8.17372 15.6199C8.98164 15 10.1544 15 12.5 15L13 15"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="15"
        :cy="15"
        :r="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
