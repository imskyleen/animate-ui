<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CreditCardProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    card: {
      initial: { transform: 'rotate3d(0, 1, 0, 0deg)', perspective: 600 },
      animate: {
        transform: 'rotate3d(0, 1, 0, 360deg)',
        perspective: 600,
        transition: { ease: 'easeInOut', duration: 0.7 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CreditCard', inheritAttrs: false })
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
        :variants="variants.card"
        initial="initial"
        :animate="controls"
      >
        <rect
          :width="20"
          :height="14"
          :x="2"
          :y="5"
          :rx="2"
        />
        <line
          :x1="2"
          :x2="22"
          :y1="10"
          :y2="10"
        />
        <path
          d="M6 14h2"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
