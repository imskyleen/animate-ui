<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CircleAlertProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    outline: {},
    mark: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.15, 1, 0.15, 1],
        transition: {
          duration: 1.1,
          times: [0, 0.2, 0.45, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CircleAlert', inheritAttrs: false })
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
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        :variants="variants.outline"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="12"
        x2="12"
        y1="8"
        y2="12"
        :variants="variants.mark"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="12"
        x2="12.01"
        y1="16"
        y2="16"
        :variants="variants.mark"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
