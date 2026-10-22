<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FileSlidersProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { d: 'M8 16L11 16' },
      animate: {
        d: 'M8 16L9 16',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: { x: -2, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line3: {
      initial: { d: 'M16 16L14 16' },
      animate: {
        d: 'M16 16L12 16',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { d: 'M8 16L11 16' },
      animate: {
        d: ['M8 16L11 16', 'M8 16L9 16', 'M8 16L11 16'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { d: 'M16 16L14 16' },
      animate: {
        d: ['M16 16L14 16', 'M16 16L12 16', 'M16 16L14 16'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FileSliders', inheritAttrs: false })
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
      <path
        d="M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M8 16L11 16"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 14V18"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 16L14 16"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
