<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ArrowUp01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: -4, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: { y: 0 },
      animate: {
        y: [0, -4, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ArrowUp01', inheritAttrs: false })
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
      <motion.path
        d="M17.9998 15C17.9998 15 13.5809 9.00001 11.9998 9C10.4187 8.99999 5.99985 15 5.99985 15"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
