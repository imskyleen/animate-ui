<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MoveRightProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {},
    group2: {},
    path1: {},
    path2: {},
    circle: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: 3, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {},
    group2: {},
    path1: {},
    path2: {},
    circle: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M22 12L12 12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M17 12L12 12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: -5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: { d: 'M22 12L12 12' },
      animate: {
        d: ['M22 12L12 12', 'M17 12L12 12', 'M22 12L12 12'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: [0, -5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: { x: 0 },
      animate: {
        x: [0, '150%', '-150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          x: { ease: 'easeInOut', duration: 0.6, times: [0, 0.5, 0.5, 1] },
        },
      },
    },
    path1: {},
    path2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MoveRight', inheritAttrs: false })
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
      :variants="variants.group1"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group1"
        initial="initial"
        :animate="controls"
      >
        <motion.g
          :variants="variants.group2"
          initial="initial"
          :animate="controls"
        >
          <motion.circle
            :cx="5"
            :cy="12"
            :r="3"
            :variants="variants.circle"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M22 12L12 12"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.path1"
            initial="initial"
            :animate="controls"
          />
          <motion.g
            :variants="variants.path2"
            initial="initial"
            :animate="controls"
          >
            <path
              d="M22 12C22 12.562 21.5619 12.9893 20.6857 13.8437L19.0294 15.5001"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 12C22 11.4379 21.5619 11.0107 20.6857 10.1563L19.0296 8.50012"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
