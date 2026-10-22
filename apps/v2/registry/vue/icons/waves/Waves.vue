<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WavesProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    wave1: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.1 },
      },
    },
    wave3: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.2 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Waves', inheritAttrs: false })
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
      <motion.path
        d="M2 5q2.5 2 5 0t5 0 5 0 5 0"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 12q2.5 2 5 0t5 0 5 0 5 0"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 19q2.5 2 5 0t5 0 5 0 5 0"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
