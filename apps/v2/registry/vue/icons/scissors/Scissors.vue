<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ScissorsProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -26, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 26, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Scissors', inheritAttrs: false })
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
        :variants="variants.group1"
        initial="initial"
        :animate="controls"
      >
        <motion.circle
          cx="6"
          cy="6"
          r="3"
          :variants="variants.circle1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8.12 8.12 12 12"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M14.8 14.8 20 20"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.g
        :variants="variants.group2"
        initial="initial"
        :animate="controls"
      >
        <motion.circle
          cx="6"
          cy="18"
          r="3"
          :variants="variants.circle2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M20 4 8.12 15.88"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
