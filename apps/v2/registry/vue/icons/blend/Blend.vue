<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BlendProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle1: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: 6,
        y: 6,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
    circle2: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: -6,
        y: -6,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Blend', inheritAttrs: false })
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
      <motion.circle
        cx="9"
        cy="9"
        r="7"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="15"
        cy="15"
        r="7"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
