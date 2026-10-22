<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MessageCircleOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-7%', '7%', '-7%', '7%', 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {},
    path2: {},
    path3: {},
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {
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
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MessageCircleOff', inheritAttrs: false })
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
        d="M20.4104 16.4143C21.1038 15.0954 21.4961 13.5935 21.4961 12C21.4961 6.75329 17.2428 2.5 11.9961 2.5C10.4026 2.5 8.9007 2.89234 7.58179 3.58569"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M1.99609 2L21.9961 22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5.27858 5.28249C3.55942 7.00165 2.49609 9.37665 2.49609 12C2.49609 13.0483 2.6659 14.057 2.9795 15C3.5243 16.6382 3.12475 18.5818 2.6896 19.6074C2.58875 19.8451 2.6235 20.1274 2.80606 20.31C2.92634 20.4302 3.09383 20.4913 3.26202 20.4658C4.37071 20.2979 5.62786 19.362 7.49609 20.3687C8.83549 21.0904 10.368 21.5 11.9961 21.5C14.6194 21.5 16.9944 20.4367 18.7136 18.7175"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
