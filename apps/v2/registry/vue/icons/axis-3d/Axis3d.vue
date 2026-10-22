<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Axis3DProps = IconProps<keyof typeof animations>;

const pathAnimation: Variants = {
  initial: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

export const animations = {
  default: {
    group: {
      initial: {},
      animate: {
        transition: {
          staggerChildren: 0.2,
        },
      },
    },
    path1: {},
    path2: pathAnimation,
    path3: pathAnimation,
    path4: pathAnimation,
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Axis3d', inheritAttrs: false })
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
        d="M4 4v15a1 1 0 0 0 1 1h15"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M4.293 19.707 6 18"
          :variants="variants.path2"
        />
        <motion.path
          d="m9 15 1.5-1.5"
          :variants="variants.path3"
        />
        <motion.path
          d="M13.5 10.5 15 9"
          :variants="variants.path4"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
