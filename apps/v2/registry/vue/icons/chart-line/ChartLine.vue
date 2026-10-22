<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ChartLineProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {
      initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        pathOffset: [1, 0],
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
      initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
      animate: {
        opacity: [1, 0, 1],
        pathLength: [1, 0, 1],
        pathOffset: [0, 1, 0],
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

defineOptions({ name: 'ChartLine', inheritAttrs: false })
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
        d="M3 3v16a2 2 0 0 0 2 2h16"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m19 9-5 5-4-4-3 3"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
