<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type KanbanProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: {
        y2: 19,
      },
      animate: {
        y2: [19, 11, 16, 19],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line2: {
      initial: {
        y2: 11,
      },
      animate: {
        y2: [11, 16, 19, 11],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
    line3: {
      initial: {
        y2: 16,
      },
      animate: {
        y2: [16, 19, 11, 16],
        transition: { duration: 0.6, ease: 'linear' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Kanban', inheritAttrs: false })
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
        :x1="18"
        :y1="5"
        :x2="18"
        :y2="19"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="12"
        :y1="5"
        :x2="12"
        :y2="11"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="6"
        :y1="5"
        :x2="6"
        :y2="16"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
