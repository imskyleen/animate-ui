<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RepeatProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, scale: 1, transition: { duration: 0 } },
      animate: {
        rotate: 180,
        scale: [1, 0.8, 0.8, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          scale: { duration: 0.8, ease: 'easeInOut', times: [0, 0.2, 0.8, 1] },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Repeat', inheritAttrs: false })
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
        <path
          d="m17 2 4 4-4 4"
        />
        <path
          d="M3 11v-1a4 4 0 0 1 4-4h14"
        />
        <path
          d="m7 22-4-4 4-4"
        />
        <path
          d="M21 13v1a4 4 0 0 1-4 4H3"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
