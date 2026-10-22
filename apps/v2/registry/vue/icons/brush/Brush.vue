<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BrushProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, -6, 6, 0],
        transformOrigin: 'top right',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Brush', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="m11 10 3 3"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
