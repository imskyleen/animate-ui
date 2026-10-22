<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type HourglassProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {},
    path4: {},
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
      animate: {
        rotate: 180,
        scale: [1, 0.75, 0.75, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          scale: { duration: 0.8, ease: 'easeInOut', times: [0, 0.2, 0.8, 1] },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Hourglass', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M4 3H20"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M5.5 3V5.03039C5.5 6.27227 6.07682 7.4437 7.06116 8.20089L12 12L16.9388 8.20089C17.9232 7.44371 18.5 6.27227 18.5 5.03039V3"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M5.5 21V18.9696C5.5 17.7277 6.07682 16.5563 7.06116 15.7991L12 12L16.9388 15.7991C17.9232 16.5563 18.5 17.7277 18.5 18.9696V21"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M4 21H20"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path4"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
