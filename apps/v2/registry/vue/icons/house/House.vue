<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type HouseProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    door: {
      initial: { scaleX: 1, transformOrigin: '0% 50%' },
      animate: {
        scaleX: [1, 0.25, 1],
        transformOrigin: '0% 50%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'House', inheritAttrs: false })
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
          d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        />
        <motion.path
          d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
          :variants="variants.door"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
