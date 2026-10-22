<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TimerOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { y: 0 },
      animate: {
        y: [0, 1, 0],
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: { rotate: 0, transformOrigin: '12px 14px' },
      animate: {
        rotate: [0, 6, 6, 0],
        transformOrigin: '12px 14px',
        transition: {
          duration: 0.8,
          delay: 0.15,
          times: [0, 0.2, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path5: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'TimerOff', inheritAttrs: false })
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
        d="M10 2h4"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m2 2 20 20"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 12v-2"
        :style="{ transformBox: 'view-box' }"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
