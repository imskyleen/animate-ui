<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FileTextProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    sheet: {},
    fold: {},
    line1: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.35, delay: 0.05, ease: 'easeOut' },
      },
    },
    line2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.35, delay: 0.25, ease: 'easeOut' },
      },
    },
    line3: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.35, delay: 0.45, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FileText', inheritAttrs: false })
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
        d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
        :variants="variants.sheet"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 2v5a1 1 0 0 0 1 1h5"
        :variants="variants.fold"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 9h2"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 13h8"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 17h8"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
