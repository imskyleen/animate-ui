<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type UnplugProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        d: 'm19 5 3-3',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'm16 8 6-6',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: -3,
        y: 3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        d: 'm2 22 3-3',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'm2 22 6-6',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 3,
        y: -3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path5: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 3,
        y: -3,
        pathLength: [1, 0],
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path6: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 3,
        y: -3,
        pathLength: [1, 0],
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        d: 'm19 5 3-3',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: ['m19 5 3-3', 'm16 8 6-6', 'm19 5 3-3'],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [0, -3, 0],
        y: [0, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        d: 'm2 22 3-3',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: ['m2 22 3-3', 'm2 22 6-6', 'm2 22 3-3'],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [0, 3, 0],
        y: [0, -3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path5: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [0, 3, 0],
        y: [0, -3, 0],
        pathLength: [1, 0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path6: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: [0, 3, 0],
        y: [0, -3, 0],
        pathLength: [1, 0, 1],
        transition: {
          duration: 0.6,
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

defineOptions({ name: 'Unplug', inheritAttrs: false })
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
        d="m19 5 3-3"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m2 22 3-3"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7.5 13.5 10 11"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M10.5 16.5 13 14"
        :variants="variants.path6"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
