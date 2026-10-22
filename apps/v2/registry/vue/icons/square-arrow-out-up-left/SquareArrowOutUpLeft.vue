<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SquareArrowOutUpLeftProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      animate: {
        x: -2,
        y: -2,
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, -2, 0],
        y: [0, -2, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SquareArrowOutUpLeft', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="m3 3 9 9"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M3 9V3h6"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
