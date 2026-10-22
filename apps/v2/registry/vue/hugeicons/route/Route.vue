<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RouteProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle1: {},
    circle2: {},
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
      },
      animate: {
        opacity: [0, 1],
        pathLength: [0.05, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          opacity: {
            duration: 0.01,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    circle1: {},
    circle2: {},
    path: {
      initial: {
        opacity: 1,
        pathLength: 1,
      },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0.05, 1],
        transition: {
          duration: 1.6,
          ease: 'easeInOut',
          opacity: {
            duration: 0.01,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Route', inheritAttrs: false })
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
      <motion.circle
        :cx="6"
        :cy="19"
        :r="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 19L15.5 19C17.433 19 19 17.433 19 15.5C19 13.567 17.433 12 15.5 12L8.5 12C6.567 12 5 10.433 5 8.5C5 6.567 6.567 5 8.5 5L12 5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="18"
        :cy="5"
        :r="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
