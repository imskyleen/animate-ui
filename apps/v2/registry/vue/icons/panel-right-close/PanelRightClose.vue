<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PanelRightCloseProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line: {
      initial: { x1: 15, y1: 3, x2: 15, y2: 21 },
      animate: {
        x1: 17,
        y1: 3,
        x2: 17,
        y2: 21,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: 2,
        transition: { type: 'spring', damping: 20, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PanelRightClose', inheritAttrs: false })
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
        :x1="15"
        :y1="3"
        :x2="15"
        :y2="21"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m8 9 3 3-3 3"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
