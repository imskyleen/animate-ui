<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ChartSplineProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0.05, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0.05, 1],
        transition: {
          duration: 1.6,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ChartSpline', inheritAttrs: false })
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
        d="M3 3L3 14C3 17.2998 3 18.9497 4.02513 19.9749C5.05025 21 6.70017 21 10 21L21 21"
        stroke-linecap="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 17C7 10.2174 8.43478 8 10 8C12.5 8 13.5 14 16 14C18.087 14 19 8.13043 19 5"
        stroke-linecap="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
