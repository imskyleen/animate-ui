<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CirclePlusProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CirclePlus', inheritAttrs: false })
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
      <motion.circle
        :cx="12"
        :cy="12"
        :r="10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 12L12 12M12 12H16"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 16L12 12M12 12L12 8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
