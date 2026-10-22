<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FrameProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: {
        y: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        y: -4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
    line2: {
      initial: {
        y: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        y: 4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
    line3: {
      initial: {
        x: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        x: -4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
    line4: {
      initial: {
        x: 0,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
      animate: {
        x: 4,
        transition: { type: 'spring', stiffness: 150, damping: 15 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        y: [0, -4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        y: [0, 4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        x: [0, -4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
      animate: {
        x: [0, 4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Frame', inheritAttrs: false })
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
      <motion.line
        x1="22"
        x2="2"
        y1="6"
        y2="6"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="22"
        x2="2"
        y1="18"
        y2="18"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="6"
        x2="6"
        y1="2"
        y2="22"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="18"
        x2="18"
        y1="2"
        y2="22"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
