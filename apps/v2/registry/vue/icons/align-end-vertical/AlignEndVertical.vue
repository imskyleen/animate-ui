<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AlignEndVerticalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    bar: {
      initial: { x: 0 },
      animate: {
        x: [0, -5, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.45, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'AlignEndVertical', inheritAttrs: false })
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
      <rect
        :x="2"
        :y="4"
        :width="16"
        :height="6"
        :rx="2"
      />
      <motion.rect
        :x="9"
        :y="14"
        :width="9"
        :height="6"
        :rx="2"
        :variants="variants.bar"
        initial="initial"
        :animate="controls"
      />
      <path
        d="M22 22V2"
      />
    </motion.svg>
  </IconWrapper>
</template>
