<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BatteryChargingProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {},
    path3: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: 'easeInOut',
        },
      },
    },
    line: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BatteryCharging', inheritAttrs: false })
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
        d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m11 7-3 5h4l-3 5"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="22"
        :x2="22"
        :y1="11"
        :y2="13"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
