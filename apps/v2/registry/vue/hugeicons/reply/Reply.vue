<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ReplyProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Reply', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M3.99219 10H11.9922C13.8521 10 14.7821 10 15.5451 10.2044C17.6157 10.7592 19.2329 12.3765 19.7877 14.4471C19.9922 15.2101 19.9922 16.1401 19.9922 18"
          stroke-linecap="round"
        />
        <path
          d="M7.99219 6L6.83839 6.87652C4.94092 8.31801 3.99219 9.03875 3.99219 10C3.99219 10.9612 4.94092 11.682 6.83839 13.1235L7.99219 14"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
