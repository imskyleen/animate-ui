<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GhostProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    eyes: {},
    ghost: {
      initial: { y: 0, skewX: 0 },
      animate: {
        y: [0, -1, 0, -0.5, 0],
        skewX: [0, 3, -3, 1.5, 0],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  look: {
    ghost: {},
    eyes: {
      initial: { x: 0 },
      animate: {
        x: [0, -1.8, -1.8, 1.8, 1.8, 0],
        transition: {
          duration: 1.4,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Ghost', inheritAttrs: false })
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
      <motion.g
        :variants="variants.ghost"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M7.528 20.472a1.6 1.6 0 012.277 0l1.057 1.056a1.6 1.6 0 002.276 0l1.057-1.056a1.6 1.6 0 012.277 0l1.114 1.114a1.4 1.4 0 002.414-1V10a8 8 0 00-16 0v10.586a1.4 1.4 0 002.414 1z"
        />
        <motion.g
          :variants="variants.eyes"
          initial="initial"
          :animate="controls"
        >
          <path
            d="M15 10v1"
          />
          <path
            d="M9 10v1"
          />
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
