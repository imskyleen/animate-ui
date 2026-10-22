<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TrendingUpProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    tip: {
      initial: { opacity: 1, scale: 1, transformOrigin: '100% 0%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '100% 0%',
        transition: { duration: 0.6, ease: 'easeOut', times: [0, 0.6, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'TrendingUp', inheritAttrs: false })
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
        d="M2 17l6.5-6.5 5 5L22 7"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 7h6v6"
        :variants="variants.tip"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
