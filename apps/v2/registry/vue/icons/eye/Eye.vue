<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type EyeProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 0.1, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  look: {
    group: {},
    path1: {},
    path2: {
      initial: { x: 0 },
      animate: {
        x: [0, -2.5, 2.5, 0],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Eye', inheritAttrs: false })
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
          d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.circle
          :cx="12"
          :cy="12"
          :r="3"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
