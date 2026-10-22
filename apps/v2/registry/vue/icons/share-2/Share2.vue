<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Share2Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    lines: {},
    path1: {},
    path2: {},
    node1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.25, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    node2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.25, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.15 },
      },
    },
    node3: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.25, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  spread: {
    lines: {},
    path1: {
      initial: { pathLength: 1, transition: { duration: 0.15 } },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.35, delay: 0.08, ease: 'easeOut' },
      },
    },
    path2: {
      initial: { pathLength: 1, transition: { duration: 0.15 } },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.35, delay: 0.08, ease: 'easeOut' },
      },
    },
    node1: {
      initial: { x: 0, y: 0, transition: { duration: 0.15 } },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
        transition: { duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' },
      },
    },
    node2: {},
    node3: {
      initial: { x: 0, y: 0, transition: { duration: 0.15 } },
      animate: {
        x: [0, 1, 0],
        y: [0, 1, 0],
        transition: { duration: 0.45, times: [0, 0.4, 1], ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Share2', inheritAttrs: false })
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
        :variants="variants.lines"
        initial="initial"
        :animate="controls"
      >
        <motion.line
          :x1="8.59"
          :x2="15.42"
          :y1="13.51"
          :y2="17.49"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.line
          :x1="15.41"
          :x2="8.59"
          :y1="6.51"
          :y2="10.49"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.circle
        :cx="18"
        :cy="5"
        :r="3"
        :variants="variants.node1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="6"
        :cy="12"
        :r="3"
        :variants="variants.node2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="18"
        :cy="19"
        :r="3"
        :variants="variants.node3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
