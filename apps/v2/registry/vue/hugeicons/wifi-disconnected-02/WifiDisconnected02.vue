<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiDisconnected02Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    arc1: {},
    arc2: {},
    x1: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 45, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    x2: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 45, 0],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.05 },
      },
    },
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WifiDisconnected02', inheritAttrs: false })
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
        <motion.path
          d="M18.5 13C14.7324 9 9.5 9 5.5 13"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M2 8C8.31579 2.66669 15.6842 2.66668 22 7.99989"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M14.5002 15L9.50016 20"
        stroke-linecap="round"
        :variants="variants.x1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14.5002 20L9.50016 15"
        stroke-linecap="round"
        :variants="variants.x2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
