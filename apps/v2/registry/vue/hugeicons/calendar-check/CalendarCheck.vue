<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CalendarCheckProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    ring1: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
    ring2: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, -0.3, 0],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
          delay: 0.08,
        },
      },
    },
    check: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.2 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CalendarCheck', inheritAttrs: false })
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
        d="M8 2V6"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.ring1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 2V6"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.ring2"
        initial="initial"
        :animate="controls"
      />
      <path
        d="M3 10H21"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M8.5 16.8333C8.5 16.8333 9.375 16.8333 10.25 18.5C10.25 18.5 13.0294 14.3333 15.5 13.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.check"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
