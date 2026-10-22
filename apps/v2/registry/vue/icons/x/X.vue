<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type XProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
  plus: {
    line1: {
      initial: {
        rotate: 0,
        x1: 6,
        y1: 18,
        x2: 18,
        y2: 6,
        transition: { ease: 'easeInOut', duration: 0.3, delay: 0.1 },
      },
      animate: {
        rotate: 45,
        x1: 7.1,
        y1: 16.9,
        x2: 16.9,
        y2: 7.1,
        transition: { ease: 'easeInOut', duration: 0.3, delay: 0.1 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        x1: 6,
        y1: 6,
        x2: 18,
        y2: 18,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        rotate: 45,
        x1: 7.1,
        y1: 7.1,
        x2: 16.9,
        y2: 16.9,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'X', inheritAttrs: false })
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
        :x1="6"
        :y1="18"
        :x2="18"
        :y2="6"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="6"
        :y1="6"
        :x2="18"
        :y2="18"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
