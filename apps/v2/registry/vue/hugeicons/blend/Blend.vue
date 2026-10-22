<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BlendProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle1: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
    circle2: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.45, ease: 'easeInOut', delay: 0.3 },
      },
    },
    ring: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.45, ease: 'easeInOut', delay: 0.15 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Blend', inheritAttrs: false })
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
      <motion.path
        d="M7.5 13H6.4C4.32582 13 3.28873 13 2.64437 12.3556C2 11.7113 2 10.6742 2 8.6V6.4C2 4.32582 2 3.28873 2.64437 2.64437C3.28873 2 4.32582 2 6.4 2H8.6C10.6742 2 11.7113 2 12.3556 2.64437C13 3.28873 13 4.32582 13 6.4V7.5"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12.0348 19C9.17734 18.5206 7 16.0355 7 13.0418C7 9.70499 9.70499 7 13.0418 7C16.0355 7 18.5206 9.17734 19 12.0348"
        :variants="variants.ring"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.8706 12.3592A5 5 0 1 1 15.1294 21.6408A5 5 0 1 1 18.8706 12.3592Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
