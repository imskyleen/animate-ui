<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MessageCircleXProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom left',
        rotate: [0, 8, -8, 2, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path1: {},
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    path3: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 45, 0],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
          delay: 0.05,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MessageCircleX', inheritAttrs: false })
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
          d="M21.4961 12C21.4961 17.2467 17.2428 21.5 11.9961 21.5C10.368 21.5 8.83549 21.0904 7.49609 20.3687C5.62786 19.362 4.37071 20.2979 3.26202 20.4658C3.09383 20.4913 2.92634 20.4302 2.80606 20.31C2.6235 20.1274 2.58875 19.8451 2.6896 19.6074C3.12475 18.5818 3.5243 16.6382 2.9795 15C2.6659 14.057 2.49609 13.0483 2.49609 12C2.49609 6.75329 6.74939 2.5 11.9961 2.5C17.2428 2.5 21.4961 6.75329 21.4961 12Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M14.9879 9L8.99609 14.9997"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M9.00432 9.00033L14.9961 15"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
