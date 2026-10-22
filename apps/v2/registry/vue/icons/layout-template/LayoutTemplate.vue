<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LayoutTemplateProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    header: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.05, 1],
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    left: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.05, 1],
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
          delay: 0.1,
        },
      },
    },
    right: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.05, 1],
        transition: {
          duration: 0.45,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
  } satisfies Record<string, Variants>,
  slide: {
    header: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -2, -2, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.4, 1],
          ease: 'easeOut',
        },
      },
    },
    left: {
      initial: { x: 0, opacity: 1 },
      animate: {
        x: [0, -2, -2, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.4, 1],
          ease: 'easeOut',
          delay: 0.14,
        },
      },
    },
    right: {
      initial: { x: 0, opacity: 1 },
      animate: {
        x: [0, 2, 2, 0],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.3, 0.4, 1],
          ease: 'easeOut',
          delay: 0.28,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'LayoutTemplate', inheritAttrs: false })
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
        :x="3"
        :y="3"
        :width="18"
        :height="7"
        :rx="1"
        :variants="variants.header"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="3"
        :y="14"
        :width="9"
        :height="7"
        :rx="1"
        :variants="variants.left"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="16"
        :y="14"
        :width="5"
        :height="7"
        :rx="1"
        :variants="variants.right"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
