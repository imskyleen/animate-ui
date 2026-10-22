<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Unlink2Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    left: {
      initial: { x: 0 },
      animate: {
        x: [0, -1, 0],
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] },
      },
    },
    right: {
      initial: { x: 0 },
      animate: {
        x: [0, 1, 0],
        transition: { duration: 0.8, ease: 'easeInOut', times: [0, 0.4, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Unlink2', inheritAttrs: false })
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
        d="M9 17H7A5 5 0 0 1 7 7h2"
        :variants="variants.left"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15 7h2a5 5 0 0 1 0 10h-2"
        :variants="variants.right"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
