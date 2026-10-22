<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FileProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    sheet: {
      initial: {
        d: 'M6 22a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2h8a2.4 2.4 0 0 1 1.704 .706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1 -2 2z',
      },
      animate: {
        d: [
          'M6 22a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2h8a2.4 2.4 0 0 1 1.704 .706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1 -2 2z',
          'M6 22a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2h8a240 240 0 0 1 2.4 0l1.6 0A2.4 2.4 0 0 1 20 4v16a2 2 0 0 1 -2 2z',
          'M6 22a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2h8a240 240 0 0 1 2.4 0l1.6 0A2.4 2.4 0 0 1 20 4v16a2 2 0 0 1 -2 2z',
          'M6 22a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2h8a2.4 2.4 0 0 1 1.704 .706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1 -2 2z',
        ],
        transition: {
          duration: 1.8,
          times: [0, 0.25, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    fold: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [1, 0, 0, 1],
        opacity: [1, 0, 0, 1],
        transition: {
          duration: 1.8,
          times: [0, 0.25, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    line1: {
      initial: { pathLength: 0, opacity: 0 },
      animate: {
        pathLength: [0, 0, 1, 1, 0],
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.8,
          times: [0, 0.3, 0.45, 0.7, 0.78],
          ease: 'easeOut',
        },
      },
    },
    line2: {
      initial: { pathLength: 0, opacity: 0 },
      animate: {
        pathLength: [0, 0, 1, 1, 0],
        opacity: [0, 0, 1, 1, 0],
        transition: {
          duration: 1.8,
          times: [0, 0.45, 0.6, 0.7, 0.78],
          ease: 'easeOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'File', inheritAttrs: false })
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
        d="M6 22a2 2 0 0 1 -2 -2V4a2 2 0 0 1 2 -2h8a2.4 2.4 0 0 1 1.704 .706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1 -2 2z"
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
        d="M8 11h8"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 15h8"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
