<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PanelTopProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 3, y1: 9, x2: 21, y2: 9 },
      animate: {
        x1: 3,
        y1: 7,
        x2: 21,
        y2: 7,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PanelTop', inheritAttrs: false })
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
        :width="18"
        :height="18"
        :x="3"
        :y="3"
        :rx="2"
        :ry="2"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="3"
        :y1="9"
        :x2="21"
        :y2="9"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
