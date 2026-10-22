<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PinOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-7%', '7%', '-7%', '7%', 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path4: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PinOff', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M12 17v5"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m2 2 20 20"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
