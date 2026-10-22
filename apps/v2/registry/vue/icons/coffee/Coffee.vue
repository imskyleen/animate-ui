<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CoffeeProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    steam1: {
      initial: { pathLength: 1, pathOffset: 0, x: 0, y: 0, opacity: 1 },
      animate: {
        pathLength: [1, 0.01, 0.01, 1],
        pathOffset: [0, 0, 0.99, 0],
        y: [0, -1, 0, 0],
        x: [0, 0.3, -0.3, 0],
        opacity: [1, 0.2, 0.2, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
          x: { duration: 1.2, ease: 'easeInOut' },
        },
      },
    },
    steam2: {
      initial: { pathLength: 1, pathOffset: 0, x: 0, y: 0, opacity: 1 },
      animate: {
        pathLength: [1, 0.01, 0.01, 1],
        pathOffset: [0, 0, 0.99, 0],
        y: [0, -1, 0, 0],
        x: [0, 0.3, -0.3, 0],
        opacity: [1, 0.2, 0.2, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
          delay: 0.2,
          x: { duration: 1.2, ease: 'easeInOut', delay: 0.2 },
        },
      },
    },
    steam3: {
      initial: { pathLength: 1, pathOffset: 0, x: 0, y: 0, opacity: 1 },
      animate: {
        pathLength: [1, 0.01, 0.01, 1],
        pathOffset: [0, 0, 0.99, 0],
        y: [0, -1, 0, 0],
        x: [0, 0.3, -0.3, 0],
        opacity: [1, 0.2, 0.2, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
          delay: 0.4,
          x: { duration: 1.2, ease: 'easeInOut', delay: 0.4 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  float: {
    steam1: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    steam2: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.15 },
      },
    },
    steam3: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Coffee', inheritAttrs: false })
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
      <path
        d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"
      />
      <motion.path
        d="M6 2v2"
        :variants="variants.steam1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M10 2v2"
        :variants="variants.steam2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 2v2"
        :variants="variants.steam3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
