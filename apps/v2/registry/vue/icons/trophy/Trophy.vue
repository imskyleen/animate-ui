<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TrophyProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, y: 0 },
      animate: {
        rotate: [0, -5, 5, -2, 0],
        y: [0, -0.8, 0, -0.3, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Trophy', inheritAttrs: false })
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
          d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"
        />
        <path
          d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"
        />
        <path
          d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"
        />
        <path
          d="M4 22h16"
        />
        <path
          d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"
        />
        <path
          d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
