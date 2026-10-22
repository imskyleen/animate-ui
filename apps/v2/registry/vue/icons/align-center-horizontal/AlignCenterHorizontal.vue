<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AlignCenterHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    bar: {
      initial: { y: 0 },
      animate: {
        y: [0, -3, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.45, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'AlignCenterHorizontal', inheritAttrs: false })
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
      <path
        d="M2 12h20"
      />
      <g>
        <path
          d="M10 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"
        />
        <path
          d="M10 8V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4"
        />
      </g>
      <motion.g
        :variants="variants.bar"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M20 16v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1"
        />
        <path
          d="M14 8V7c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v1"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
