<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type EqualNotProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.1 },
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: [1, 0, 1],
        transition: { duration: 1.2, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'to-not': {
    line1: {},
    line2: {},
    line3: {
      initial: {
        pathLength: 0,
        opacity: 0,
      },
      animate: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          opacity: { duration: 0.1 },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'EqualNot', inheritAttrs: false })
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
      <motion.line
        x1="5"
        x2="19"
        y1="9"
        y2="9"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="5"
        x2="19"
        y1="15"
        y2="15"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="19"
        x2="5"
        y1="5"
        y2="19"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
