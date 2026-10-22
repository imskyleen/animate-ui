<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AlignVerticalDistributeCenterProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    t2r: {
      initial: { d: 'M22 17h-3' },
      animate: {
        d: ['M22 17h-3', 'M22 17h-0.5', 'M22 17h-3.6', 'M22 17h-3'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t1r: {
      initial: { d: 'M22 7h-5' },
      animate: {
        d: ['M22 7h-5', 'M22 7h-7.5', 'M22 7h-4.4', 'M22 7h-5'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t2l: {
      initial: { d: 'M5 17H2' },
      animate: {
        d: ['M5 17H2', 'M7.5 17H2', 'M4.4 17H2', 'M5 17H2'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t1l: {
      initial: { d: 'M7 7H2' },
      animate: {
        d: ['M7 7H2', 'M4.5 7H2', 'M7.6 7H2', 'M7 7H2'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    b2: {
      initial: { x: 0 },
      animate: {
        x: [0, 2.5, -0.6, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    b1: {
      initial: { x: 0 },
      animate: {
        x: [0, -2.5, 0.6, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'AlignVerticalDistributeCenter', inheritAttrs: false })
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
        d="M22 17h-3"
        :variants="variants.t2r"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M22 7h-5"
        :variants="variants.t1r"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 17H2"
        :variants="variants.t2l"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 7H2"
        :variants="variants.t1l"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="5"
        :y="14"
        :width="14"
        :height="6"
        :rx="2"
        :variants="variants.b2"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="7"
        :y="4"
        :width="10"
        :height="6"
        :rx="2"
        :variants="variants.b1"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
