<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AlarmClockProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0],
        y: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    hands: {},
    bell1: {
      initial: { y: 0, rotate: 0 },
      animate: {
        y: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        rotate: [0, 12, -12, 12, -12, 12, -12, 12, -12, 12, -12, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    bell2: {
      initial: { y: 0, rotate: 0 },
      animate: {
        y: [0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        rotate: [0, -12, 12, -12, 12, -12, 12, -12, 12, -12, 12, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0.5, -0.5, 0],
        y: -1,
        transition: {
          x: { duration: 0.5, repeat: Infinity, repeatType: 'loop' },
          y: { duration: 0.2 },
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
    hands: {},
    bell1: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, 12, -12, 12, -12, 12, -12, 12, -12, 12, -12, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    bell2: {
      initial: { rotate: 0 },
      animate: {
        rotate: [0, -12, 12, -12, 12, -12, 12, -12, 12, -12, 12, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'AlarmClock', inheritAttrs: false })
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
          d="M20.5 12.5C20.5 17.1944 16.6944 21 12 21C7.30558 21 3.5 17.1944 3.5 12.5C3.5 7.80558 7.30558 4 12 4C16.6944 4 20.5 7.80558 20.5 12.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M5.88 18.7031L3.5 21.0031"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M18.14 18.668L20.5 20.998"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 8V12.5L14 14.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.hands"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M5 3L2 6"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.bell1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M22 6L19 3"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.bell2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
