<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LayoutDashboardProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect1: {
      initial: {
        height: 9,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        height: 5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    rect2: {
      initial: {
        height: 5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        height: 9,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    rect3: {
      initial: {
        height: 9,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        height: 5,
        y: 4,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    rect4: {
      initial: {
        height: 5,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        height: 9,
        y: -4,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    rect1: {
      initial: {
        height: 9,
      },
      animate: {
        height: [9, 5, 9],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    rect2: {
      initial: {
        height: 5,
      },
      animate: {
        height: [5, 9, 5],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    rect3: {
      initial: {
        height: 9,
        y: 0,
      },
      animate: {
        height: [9, 5, 9],
        y: [0, 4, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    rect4: {
      initial: {
        height: 5,
        y: 0,
      },
      animate: {
        height: [5, 9, 5],
        y: [0, -4, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'LayoutDashboard', inheritAttrs: false })
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
        :width="7"
        :height="9"
        :x="3"
        :y="3"
        :rx="1"
        :ry="1"
        :variants="variants.rect1"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :width="7"
        :height="5"
        :x="14"
        :y="3"
        :rx="1"
        :ry="1"
        :variants="variants.rect2"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :width="7"
        :height="9"
        :x="14"
        :y="12"
        :rx="1"
        :ry="1"
        :variants="variants.rect3"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :width="7"
        :height="5"
        :x="3"
        :y="16"
        :rx="1"
        :ry="1"
        :variants="variants.rect4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
