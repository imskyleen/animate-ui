<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GroupProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    corners: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.86, 1.03, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    frame: {},
    upper: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 0.8, -0.2, 0],
        y: [0, 0.8, -0.2, 0],
        transition: {
          duration: 0.5,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    lower: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -0.8, 0.2, 0],
        y: [0, -0.8, 0.2, 0],
        transition: {
          duration: 0.5,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  apart: {
    corners: {},
    frame: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 0.9, times: [0, 0.2, 1], ease: 'easeInOut' },
      },
    },
    upper: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1.6, 0],
        y: [0, -1.6, 0],
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
    lower: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1.6, 0],
        y: [0, 1.6, 0],
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Group', inheritAttrs: false })
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
        :variants="variants.corners"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M3 7V5c0-1.1.9-2 2-2h2"
          :variants="variants.frame"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M17 3h2c1.1 0 2 .9 2 2v2"
          :variants="variants.frame"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M21 17v2c0 1.1-.9 2-2 2h-2"
          :variants="variants.frame"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7 21H5c-1.1 0-2-.9-2-2v-2"
          :variants="variants.frame"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.rect
        :x="7"
        :y="7"
        :width="7"
        :height="5"
        :rx="1"
        :variants="variants.upper"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="10"
        :y="12"
        :width="7"
        :height="5"
        :rx="1"
        :variants="variants.lower"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
