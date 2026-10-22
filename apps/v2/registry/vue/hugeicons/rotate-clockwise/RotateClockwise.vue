<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RotateClockwiseProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
      animate: {
        rotate: -360,
        scale: [1, 0.8, 0.8, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          scale: { duration: 0.8, ease: 'easeInOut', times: [0, 0.2, 0.8, 1] },
        },
      },
    },
  } satisfies Record<string, Variants>,
  tilt: {
    path1: {},
    path2: {},
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        scale: 0.85,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
  } satisfies Record<string, Variants>,
  rotate: {
    path1: {},
    path2: {},
    group: {
      initial: {
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 170, damping: 26 },
      },
      animate: {
        rotate: -360,
        scale: [1, 0.8, 0.8, 1],
        transition: {
          rotate: { type: 'spring', stiffness: 170, damping: 26, delay: 0.1 },
          scale: {
            duration: 1.4,
            ease: 'easeInOut',
            times: [0, 0.07, 0.85, 1],
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'RotateClockwise', inheritAttrs: false })
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
          d="M4 2V5.13219C4 5.42605 4.36724 5.55908 4.55527 5.33333C6.3854 3.2875 9.04499 2 12.0051 2C17.5251 2 22 6.47715 22 12C22 15.9582 19.7015 19.3793 16.367 21"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M11.7347 22.0001C12.2016 22.0001 12.6611 21.9688 13.1111 21.9084M2.26537 8.66675C2.15297 9.06394 2.06477 9.46536 2 9.86901M2.03457 13.5381C2.10487 13.9381 2.19644 14.3343 2.30852 14.7245M3.83292 17.9963C4.07124 18.3497 4.3296 18.69 4.6071 19.0147M7.42857 21.3607C7.78228 21.5632 8.15042 21.7464 8.53228 21.9084"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
