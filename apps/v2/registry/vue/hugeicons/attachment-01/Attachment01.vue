<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Attachment01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -12, 8, -4, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  draw: {
    path: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [0.02, 1],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'draw-loop': {
    path: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0.02, 1],
        transition: { duration: 2.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Attachment01', inheritAttrs: false })
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
        d="M5.82338 12L4.27922 10.4558C2.57359 8.75022 2.57359 5.98485 4.27922 4.27922C5.98485 2.57359 8.75022 2.57359 10.4558 4.27922L19.7208 13.5442C21.4264 15.2498 21.4264 18.0152 19.7208 19.7208C18.0152 21.4264 15.2498 21.4264 13.5442 19.7208L10.0698 16.2464C9.00379 15.1804 9.00379 13.4521 10.0698 12.386C11.1358 11.32 12.8642 11.32 13.9302 12.386L15.8604 14.3162"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
