<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ChevronUpDownProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ChevronUpDown', inheritAttrs: false })
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
        d="m7 15 5 5 5-5"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m7 9 5-5 5 5"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
