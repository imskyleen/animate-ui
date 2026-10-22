<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type EyeClosedProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [1, 0.45, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'EyeClosed', inheritAttrs: false })
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
          d="m15 18-.722-3.25"
        />
        <path
          d="M2 8a10.645 10.645 0 0 0 20 0"
        />
        <path
          d="m20 15-1.726-2.05"
        />
        <path
          d="m4 15 1.726-2.05"
        />
        <path
          d="m9 18 .722-3.25"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
