<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ShuffleProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transition: { duration: 0 } },
      animate: {
        scaleY: [1, -1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Shuffle', inheritAttrs: false })
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
          d="m18 14 4 4-4 4"
        />
        <path
          d="m18 2 4 4-4 4"
        />
        <path
          d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"
        />
        <path
          d="M2 6h1.972a4 4 0 0 1 3.6 2.2"
        />
        <path
          d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
