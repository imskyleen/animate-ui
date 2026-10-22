<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type UngroupProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    lower: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1.5, 0],
        y: [0, 1.5, 0],
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
    upper: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1.5, 0],
        y: [0, -1.5, 0],
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Ungroup', inheritAttrs: false })
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
      <motion.rect
        x="11"
        y="14"
        width="10"
        height="7"
        rx="2"
        :variants="variants.lower"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        x="3"
        y="3"
        width="10"
        height="7"
        rx="2"
        :variants="variants.upper"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
