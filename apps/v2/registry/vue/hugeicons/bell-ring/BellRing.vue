<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BellRingProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 20, -10, 10, -5, 3, 0],
        transformOrigin: 'top center',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
    path1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -6, 5, -5, 4, -3, 2, 0],
        transition: { duration: 1.1, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        y: 0,
        scale: 1,
      },
      animate: {
        y: [0, 1, -0.5, 0.5, -0.25, 0],
        scale: [1, 0.8, 0.9, 1, 1],

        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path3: {
      initial: {
        y: 0,
        scale: 1,
      },
      animate: {
        y: [0, -0.5, 1, -0.5, 0.25, 0],
        scale: [1, 0.8, 0.9, 1, 1],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    path4: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BellRing', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M8 18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M22 8C22 5.7 21.2 3.7 20 2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4 2C2.8 3.7 2 5.7 2 8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4.43654 18H19.5625C20.2903 18 20.6542 18 20.8648 17.8951C21.274 17.6913 21.4929 17.2359 21.3964 16.789C21.3468 16.559 21.1194 16.2749 20.6648 15.7066L20.4951 15.4944C20.0392 14.9246 19.8113 14.6397 19.6184 14.3409C19.0187 13.4119 18.6477 12.354 18.5356 11.254C18.4995 10.9002 18.4995 10.5353 18.4995 9.8056V8.5C18.4995 8.03572 18.4995 7.80358 18.4867 7.60758C18.2898 4.60304 15.8965 2.20977 12.892 2.01285C12.696 2 12.4638 2 11.9995 2C11.5353 2 11.3031 2 11.1071 2.01285C8.10258 2.20977 5.70931 4.60304 5.51239 7.60758C5.49954 7.80358 5.49954 8.03572 5.49954 8.5V9.8056C5.49954 10.5353 5.49954 10.9002 5.46349 11.254C5.35143 12.354 4.98035 13.4119 4.38067 14.3409C4.18779 14.6397 3.95985 14.9246 3.50401 15.4944L3.33427 15.7066C2.87964 16.2749 2.65233 16.559 2.60268 16.789C2.50621 17.2359 2.72509 17.6913 3.13431 17.8951C3.3449 18 3.70878 18 4.43654 18Z"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
