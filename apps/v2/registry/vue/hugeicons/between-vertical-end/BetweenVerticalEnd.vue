<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BetweenVerticalEndProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    leftRect: {
      initial: { y: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { y: -1.5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    arrow: {
      initial: {
        d: 'M7.5 16.5L12.5 11.5',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M7.5 16.5L13.5 10.5',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    rightRect: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: 1.5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    path1: {
      initial: {
        d: 'M20 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V4',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M21.5 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V2.5',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    leftRect: {
      initial: { y: 0 },
      animate: {
        y: [0, -1.5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { d: 'M7.5 16.5L12.5 11.5' },
      animate: {
        d: [
          'M7.5 16.5L12.5 11.5',
          'M7.5 16.5L13.5 10.5',
          'M7.5 16.5L12.5 11.5',
        ],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    rightRect: {
      initial: { x: 0 },
      animate: {
        x: [0, 1.5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path1: {
      initial: {
        d: 'M20 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V4',
      },
      animate: {
        d: [
          'M20 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V4',
          'M21.5 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V2.5',
          'M20 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V4',
        ],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BetweenVerticalEnd', inheritAttrs: false })
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
      <motion.path
        d="M20 18H14C10.2288 18 8.34315 18 7.17157 16.8284C6 15.6569 6 13.7712 6 10V4"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 5.99998C3 5.99998 5.20947 3.00001 6.00002 3C6.79058 2.99999 9 6 9 6"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.leftRect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18 15C18 15 21 17.2095 21 18C21 18.7906 18 21 18 21"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rightRect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7.5 16.5L12.5 11.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
