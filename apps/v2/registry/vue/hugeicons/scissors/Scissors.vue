<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ScissorsProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {
      initial: { transformOrigin: '56.5% 55.1%', rotate: 0 },
      animate: {
        transformOrigin: '56.5% 55.1%',
        rotate: [0, -18, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    group2: {
      initial: { transformOrigin: '56.5% 46%', rotate: 0 },
      animate: {
        transformOrigin: '56.5% 46%',
        rotate: [0, 18, 0],
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
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group1"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M2.99219 6C2.99219 7.65685 4.33533 9 5.99219 9C7.64904 9 8.99219 7.65685 8.99219 6C8.99219 4.34315 7.64904 3 5.99219 3C4.33533 3 2.99219 4.34315 2.99219 6Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.circle1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8.99219 8L20.9922 19"
          stroke-linecap="round"
          stroke-linejoin="round"
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
        <motion.path
          d="M2.99219 18C2.99219 19.6569 4.33533 21 5.99219 21C7.64904 21 8.99219 19.6569 8.99219 18C8.99219 16.3431 7.64904 15 5.99219 15C4.33533 15 2.99219 16.3431 2.99219 18Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.circle2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M20.9922 4L15.4922 9.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8.99193 16L12.9922 12"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
