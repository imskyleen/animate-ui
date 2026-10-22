<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BlocksProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        d: 'M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2',
        strokeLinejoin: 'round',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: 2,
        y: -2,
        d: 'M10 22V6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6H2',
        strokeLinejoin: 'miter',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          d: { duration: 0, delay: 0.3 },
          strokeLinejoin: { duration: 0, delay: 0.3 },
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        d: 'M15 2 H21 A1 1 0 0 1 22 3 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: -2,
        y: 2,
        d: 'M15 2 H20 A2 2 0 0 1 22 4 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        x: 0,
        y: 0,
        d: 'M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2',
        strokeLinejoin: 'round',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: [0, 2, 0],
        y: [0, -2, 0],
        d: [
          'M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2',
          'M10 22V6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6H2',
          'M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2',
        ],
        strokeLinejoin: ['round', 'miter', 'round'],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          d: { duration: 0, delay: 0.3 },
          strokeLinejoin: { duration: 0, delay: 0.3 },
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        d: 'M15 2 H21 A1 1 0 0 1 22 3 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z',
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: [0, -2, 0],
        y: [0, 2, 0],
        d: [
          'M15 2 H21 A1 1 0 0 1 22 3 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z',
          'M15 2 H20 A2 2 0 0 1 22 4 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z',
          'M15 2 H21 A1 1 0 0 1 22 3 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z',
        ],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Blocks', inheritAttrs: false })
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
      <motion.path
        d="M10 22V7c0-.6-.4-1-1-1H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-5c0-.6-.4-1-1-1H2"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15 2 H21 A1 1 0 0 1 22 3 V9 A1 1 0 0 1 21 10 H15 A1 1 0 0 1 14 9 V3 A1 1 0 0 1 15 2 Z"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
