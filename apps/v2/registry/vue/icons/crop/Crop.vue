<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CropProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        pathLength: [1, 0.8, 1],
        pathOffset: [0, 0.1, 0],
        x: [0, 3, 0],
        y: [0, -3, 0],
        transition: {
          duration: 1,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        pathOffset: 0,
      },
      animate: {
        pathLength: [1, 0.8, 1],
        pathOffset: [0, 0.1, 0],
        x: [0, -3, 0],
        y: [0, 3, 0],
        transition: {
          duration: 1,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Crop', inheritAttrs: false })
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M6 2v14a2 2 0 0 0 2 2h14"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18 22V8a2 2 0 0 0-2-2H2"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
