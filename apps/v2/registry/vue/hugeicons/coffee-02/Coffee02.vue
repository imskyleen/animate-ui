<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Coffee02Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    steam1: {
      initial: { pathLength: 1, pathOffset: 0, x: 0, y: 0, opacity: 1 },
      animate: {
        pathLength: [1, 0.01, 0.01, 1],
        pathOffset: [0, 0, 0.99, 0],
        y: [0, -1, 0, 0],
        x: [0, 0.3, -0.3, 0],
        opacity: [1, 0.2, 0.2, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
          x: { duration: 1.2, ease: 'easeInOut' },
        },
      },
    },
    steam2: {
      initial: { pathLength: 1, pathOffset: 0, x: 0, y: 0, opacity: 1 },
      animate: {
        pathLength: [1, 0.01, 0.01, 1],
        pathOffset: [0, 0, 0.99, 0],
        y: [0, -1, 0, 0],
        x: [0, 0.3, -0.3, 0],
        opacity: [1, 0.2, 0.2, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
          delay: 0.2,
          x: { duration: 1.2, ease: 'easeInOut', delay: 0.2 },
        },
      },
    },
    steam3: {
      initial: { pathLength: 1, pathOffset: 0, x: 0, y: 0, opacity: 1 },
      animate: {
        pathLength: [1, 0.01, 0.01, 1],
        pathOffset: [0, 0, 0.99, 0],
        y: [0, -1, 0, 0],
        x: [0, 0.3, -0.3, 0],
        opacity: [1, 0.2, 0.2, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
          delay: 0.4,
          x: { duration: 1.2, ease: 'easeInOut', delay: 0.4 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  float: {
    steam1: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    steam2: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.15 },
      },
    },
    steam3: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -1, 0],
        opacity: [1, 0.3, 1],
        transition: { duration: 0.8, ease: 'easeInOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Coffee02', inheritAttrs: false })
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
      <path
        d="M18.2505 10.5H19.6403C21.4918 10.5 22.0421 10.7655 21.9975 12.0838C21.9237 14.2674 20.939 16.8047 17 17.5"
        stroke-linecap="round"
      />
      <path
        d="M5.94627 20.6145C2.57185 18.02 2.07468 14.3401 2.00143 10.5001C1.96979 8.8413 2.45126 8.5 4.65919 8.5H15.3408C17.5487 8.5 18.0302 8.8413 17.9986 10.5001C17.9253 14.3401 17.4281 18.02 14.0537 20.6145C13.0934 21.3528 12.2831 21.5 10.9194 21.5H9.08064C7.71686 21.5 6.90658 21.3528 5.94627 20.6145Z"
        stroke-linecap="round"
      />
      <motion.path
        d="M7.53971 4C7.53971 4 7 4.5 7 5.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.steam1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11.3089 2.5C10.7622 2.83861 10.0012 4 10.0012 5.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.steam2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14.0012 4C13.7279 4.1693 13.5 5 13.5 5.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.steam3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
