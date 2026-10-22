<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiDisconnected01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    arc1: {},
    arc2: {},
    arc3: {},
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

defineOptions({ name: 'WifiDisconnected01', inheritAttrs: false })
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
          d="M8.5 15.9996C9.36651 15.1331 10.4207 14.642 11.5 14.5264"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M5.5 12.5C8.67327 9.32673 12.6221 8.67087 16 10.5324"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M2 8.5C8.31579 3.16669 15.6842 3.16668 22 8.49989"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc3"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M21.0002 13.5L15.0002 19.5"
        stroke-linecap="round"
        :variants="variants.x1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21.0002 19.5L15.0002 13.5"
        stroke-linecap="round"
        :variants="variants.x2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
