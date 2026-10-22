<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Search01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        transformOrigin: 'bottom right',
        rotate: [0, 17, -10, 5, -1, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  find: {
    group: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, '-15%', 0, 0],
        y: [0, 0, '-15%', 0],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Search01', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M17 17L21 21"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
