<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FolderProps = IconProps<keyof typeof animations>;

const CLOSED_FRONT =
  'M20 20 a2 2 0 0 0 2 -2 V8 a2 2 0 0 0 -2 -2 h-7.9 a2 2 0 0 1 -1.69 -0.9 L9.6 3.9 A2 2 0 0 0 7.93 3 H4 a2 2 0 0 0 -2 2 v13 a2 2 0 0 0 2 2 Z';
const OPEN_FRONT =
  'M20 20 a2 2 0 0 0 2 -2 V11 a2 2 0 0 0 -2 -2 h-7.9 a20 20 0 0 1 -1.69 0 L9.6 9 A20 20 0 0 0 7.93 9 H4 a2 2 0 0 0 -2 2 v7 a2 2 0 0 0 2 2 Z';

export const animations = {
  default: {
    group: {},
    back: {},
    path: {
      initial: { d: CLOSED_FRONT },
      animate: {
        d: [CLOSED_FRONT, OPEN_FRONT, CLOSED_FRONT],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        y: 0,
      },
      animate: {
        scale: [1, 0.92, 1.05, 0.98, 1],
        rotate: [0, -3, 3, -1.5, 0],
        y: [0, -1, 0.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    back: {},
    path: {},
  } satisfies Record<string, Variants>,
  bounce: {
    group: {
      initial: {
        scale: 1,
        y: 0,
      },
      animate: {
        scale: [1, 0.9, 1.06, 0.97, 1],
        y: [0, -1.5, 0.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    back: {},
    path: {},
  } satisfies Record<string, Variants>,
  fill: {
    group: {
      initial: {
        scale: 1,
        rotate: 0,
        y: 0,
      },
      animate: {
        scale: [1, 0.92, 1.05, 0.98, 1],
        rotate: [0, -3, 3, -1.5, 0],
        y: [0, -1, 0.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    back: {},
    path: {
      initial: {
        fill: 'currentColor',
        fillOpacity: 0,
      },
      animate: {
        fillOpacity: 1,
        transition: { delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Folder', inheritAttrs: false })
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
        <motion.path
          :d="CLOSED_FRONT"
          :variants="variants.back"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          :d="CLOSED_FRONT"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
