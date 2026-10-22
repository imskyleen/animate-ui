<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SnowflakeProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, scale: 1, transition: { duration: 0 } },
      animate: {
        rotate: 60,
        scale: [1, 0.9, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Snowflake', inheritAttrs: false })
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
          d="m10 20-1.25-2.5L6 18"
        />
        <path
          d="M10 4 8.75 6.5 6 6"
        />
        <path
          d="m14 20 1.25-2.5L18 18"
        />
        <path
          d="m14 4 1.25 2.5L18 6"
        />
        <path
          d="m17 21-3-6h-4"
        />
        <path
          d="m17 3-3 6 1.5 3"
        />
        <path
          d="M2 12h6.5L10 9"
        />
        <path
          d="m20 10-1.5 2 1.5 2"
        />
        <path
          d="M22 12h-6.5L14 15"
        />
        <path
          d="m4 10 1.5 2L4 14"
        />
        <path
          d="m7 21 3-6-1.5-3"
        />
        <path
          d="m7 3 3 6h4"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
