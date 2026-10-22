<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Globe02Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    meridian: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.1, 1, 0.1, 1],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Globe02', inheritAttrs: false })
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
      <circle
        :cx="12"
        :cy="12"
        :r="10"
      />
      <path
        d="M21 15H3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M21 9H3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z"
        stroke-linejoin="round"
        :variants="variants.meridian"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
