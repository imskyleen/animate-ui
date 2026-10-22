<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AlignHorizontalDistributeCenterProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    b1: {
      initial: { y: 0 },
      animate: {
        y: [0, -2.5, 0.6, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    b2: {
      initial: { y: 0 },
      animate: {
        y: [0, 2.5, -0.6, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t2b: {
      initial: { d: 'M17 22v-5' },
      animate: {
        d: ['M17 22v-5', 'M17 22v-2.5', 'M17 22v-5.6', 'M17 22v-5'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t2t: {
      initial: { d: 'M17 7V2' },
      animate: {
        d: ['M17 7V2', 'M17 9.5V2', 'M17 6.4V2', 'M17 7V2'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t1b: {
      initial: { d: 'M7 22v-3' },
      animate: {
        d: ['M7 22v-3', 'M7 22v-5.5', 'M7 22v-2.4', 'M7 22v-3'],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 0.75, 1],
          ease: 'easeInOut',
        },
      },
    },
    t1t: {
      initial: { d: 'M7 5V2' },
      animate: {
        d: ['M7 5V2', 'M7 2.5V2', 'M7 5.6V2', 'M7 5V2'],
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

defineOptions({ name: 'AlignHorizontalDistributeCenter', inheritAttrs: false })
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
      <motion.rect
        :x="4"
        :y="5"
        :width="6"
        :height="14"
        :rx="2"
        :variants="variants.b1"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="14"
        :y="7"
        :width="6"
        :height="10"
        :rx="2"
        :variants="variants.b2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17 22v-5"
        :variants="variants.t2b"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17 7V2"
        :variants="variants.t2t"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 22v-3"
        :variants="variants.t1b"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 5V2"
        :variants="variants.t1t"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
