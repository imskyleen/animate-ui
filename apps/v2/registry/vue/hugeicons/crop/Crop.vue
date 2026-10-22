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
      },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
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
      },
      animate: {
        x: [0, -1, 0],
        y: [0, 1, 0],
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M4 2V4M4 7.5L4 14C4 16.8284 4 18.2426 4.87868 19.1213C5.75736 20 7.17157 20 10 20L16.5 20M20 20L22 20"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20 22L20 12C20 8.22877 20 6.34315 18.8284 5.17158C17.6569 4 15.7712 4 12 4L2 4"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
