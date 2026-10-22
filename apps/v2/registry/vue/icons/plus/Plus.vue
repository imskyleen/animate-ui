<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PlusProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
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
  x: {
    line1: {
      initial: {
        rotate: 0,
        x1: 12,
        y1: 19,
        x2: 12,
        y2: 5,
        transition: { ease: 'easeInOut', duration: 0.3, delay: 0.1 },
      },
      animate: {
        rotate: 45,
        x1: 12,
        y1: 20.5,
        x2: 12,
        y2: 3.5,
        transition: { ease: 'easeInOut', duration: 0.3, delay: 0.1 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        x1: 5,
        y1: 12,
        x2: 19,
        y2: 12,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        rotate: 45,
        x1: 3.5,
        y1: 12,
        x2: 20.5,
        y2: 12,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Plus', inheritAttrs: false })
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
        :x1="12"
        :y1="19"
        :x2="12"
        :y2="5"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="5"
        :y1="12"
        :x2="19"
        :y2="12"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
