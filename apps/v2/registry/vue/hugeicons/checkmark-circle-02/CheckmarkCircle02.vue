<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CheckmarkCircle02Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    path: {
      initial: { pathLength: 1, opacity: 1, scale: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CheckmarkCircle02', inheritAttrs: false })
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
        d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 12.5L10.5 15L16 9"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
