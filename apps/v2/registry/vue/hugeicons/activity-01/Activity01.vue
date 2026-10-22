<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Activity01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    frame: {},
    line: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-return': {
    frame: {},
    line: {
      initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
      animate: {
        opacity: [0, 1, 1, 1],
        pathLength: [0, 1, 0, 1],
        pathOffset: [1, 0, 0.01, 0],
        transition: {
          duration: 2.5,
          ease: 'easeInOut',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    frame: {},
    line: {
      initial: { opacity: 1, pathLength: 1, pathOffset: 0 },
      animate: {
        opacity: [0, 1, 1, 1, 1],
        pathLength: [0, 1, 0, 1, 0],
        pathOffset: [1, 0, 0.01, 0, 0.999],
        transition: {
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'loop',
          opacity: { duration: 0.01 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Activity01', inheritAttrs: false })
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
        d="M4.31802 19.682C3 18.364 3 16.2426 3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.frame"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 14L9.79289 11.2071C10.1834 10.8166 10.8166 10.8166 11.2071 11.2071L12.7929 12.7929C13.1834 13.1834 13.8166 13.1834 14.2071 12.7929L17 10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
