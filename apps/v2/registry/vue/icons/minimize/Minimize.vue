<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MinimizeProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 2,
        y: 2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: 2,
        x: -2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -2,
        x: 2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        y: 0,
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        y: -2,
        x: -2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [0, 2, 0],
        y: [0, 2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 2, 0],
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -2, 0],
        x: [0, 2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path4: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -2, 0],
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Minimize', inheritAttrs: false })
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
        d="M8 3v3a2 2 0 0 1-2 2H3"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21 8h-3a2 2 0 0 1-2-2V3"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 16h3a2 2 0 0 1 2 2v3"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 21v-3a2 2 0 0 1 2-2h3"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
