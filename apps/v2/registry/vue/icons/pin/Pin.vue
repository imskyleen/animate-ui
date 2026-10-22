<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PinProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: 'bottom center' },
      animate: {
        rotate: [0, -10, 6, -3, 0],
        transformOrigin: 'bottom center',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    line: {},
    path: {},
  } satisfies Record<string, Variants>,
  bounce: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        x: 0,
        y: 0,
        transformOrigin: 'bottom center',
      },
      animate: {
        scale: [1, 0.75, 1, 1],
        rotate: [0, 30, -15, 0],
        x: [0, 0, 0, 0],
        y: [0, -6, 0, 0],
        transformOrigin: 'bottom center',
        transition: { ease: 'easeInOut', duration: 1 },
      },
    },
    line: {},
    path: {},
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: {
        rotate: 0,
        transformOrigin: 'bottom center',
      },
      animate: {
        rotate: [0, 15, -10, 0],
        transformOrigin: 'bottom center',
        transition: { ease: 'easeInOut', duration: 1 },
      },
    },
    line: {},
    path: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        transform: 'rotate3d(0, 1, 0, 0deg)',
        perspective: 600,
      },
      animate: {
        transform: 'rotate3d(0, 1, 0, 360deg)',
        perspective: 600,
        transition: { ease: 'easeInOut', duration: 0.7 },
      },
    },
    line: {},
    path: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Pin', inheritAttrs: false })
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
        <motion.line
          :x1="12"
          :y1="17.1"
          :x2="12"
          :y2="22"
          :variants="variants.line"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M9,10.8c0,.8-.4,1.5-1.1,1.8l-1.8.9c-.7.3-1.1,1-1.1,1.8v.8c0,.6.4,1,1,1h12c.6,0,1-.4,1-1v-.8c0-.8-.4-1.5-1.1-1.8l-1.8-.9c-.7-.3-1.1-1-1.1-1.8v-3.8c0-.6.4-1,1-1,1.1,0,2-.9,2-2s-.9-2-2-2h-8c-1.1,0-2,.9-2,2s.9,2,2,2,1,.4,1,1v3.8Z"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
