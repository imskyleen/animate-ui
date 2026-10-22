<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    dot: {},
    arc1: {},
    arc2: {},
    arc3: {},
    arc4: {},
    arc5: {},
    slash: {},
  } satisfies Record<string, Variants>,
  off: {
    group: {},
    dot: {},
    arc1: {},
    arc2: {},
    arc3: {},
    arc4: {},
    arc5: {},
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WifiOff', inheritAttrs: false })
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
        <motion.path
          d="M12 20h.01"
          :variants="variants.dot"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8.5 16.429a5 5 0 0 1 7 0"
          :variants="variants.arc1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M5 12.859a10 10 0 0 1 5.17-2.69"
          :variants="variants.arc2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M19 12.859a10 10 0 0 0-2.007-1.523"
          :variants="variants.arc3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M2 8.82a15 15 0 0 1 4.177-2.643"
          :variants="variants.arc4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M22 8.82a15 15 0 0 0-11.288-3.764"
          :variants="variants.arc5"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="m2 2 20 20"
          :variants="variants.slash"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
