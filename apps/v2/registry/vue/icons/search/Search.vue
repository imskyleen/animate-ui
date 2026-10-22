<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SearchProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom right',
        rotate: [0, 17, -10, 5, -1, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path: {},
    circle: {},
  } satisfies Record<string, Variants>,
  find: {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, '-15%', 0, 0],
        y: [0, 0, '-15%', 0],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    path: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Search', inheritAttrs: false })
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
        d="m21 21-4.34-4.34"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="11"
        :cy="11"
        :r="8"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
