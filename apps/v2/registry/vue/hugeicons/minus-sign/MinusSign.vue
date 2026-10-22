<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MinusSignProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { rotate: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
      animate: {
        rotate: 180,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  shrink: {
    path1: {},
    left: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
      },
    },
    right: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 0.9, times: [0, 0.4, 1], ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MinusSign', inheritAttrs: false })
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
      <motion.g
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M12 12L4 12"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.left"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 12L20 12"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.right"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
