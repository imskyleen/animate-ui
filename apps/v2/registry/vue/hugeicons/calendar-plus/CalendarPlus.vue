<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CalendarPlusProps = IconProps<keyof typeof animations>;

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
    plus: {
      initial: { rotate: 0 },
      animate: { rotate: 90, transition: { duration: 0.5, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CalendarPlus', inheritAttrs: false })
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
        d="M21 13C21 9.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H14"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.g
        :variants="variants.plus"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M16 18.995H22"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M18.995 22L18.995 16"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
