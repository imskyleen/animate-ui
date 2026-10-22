<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiOff01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    dot: {},
    arc1: {},
    arc2: {},
    arc3: {},
    arc4: {},
    arc5: {},
    slash: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0.6, -0.6, 0.6, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  off: {
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
    group: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WifiOff01', inheritAttrs: false })
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
        <motion.circle
          :cx="12"
          :cy="18"
          :r="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.dot"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8.5 14.5C9.62137 13.3944 10.9643 12.887 12.5 13.0212"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M18.5 11.5C17.0073 10.1794 15.2848 9.27433 13.5 9.00012"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M5.5 11.4999C6.59299 10.5891 7.778 9.91296 9 9.49989"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M22 8.49989C18.0717 5.18273 13.7362 3.92879 9.5 4.73808"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M2 8.5C3.22409 7.46632 4.5 6.5 5.5 6"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.arc5"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M2 2L22 22"
          stroke-linecap="round"
          :variants="variants.slash"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
