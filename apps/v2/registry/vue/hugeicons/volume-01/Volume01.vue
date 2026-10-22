<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Volume01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    still1: {},
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    still1: {},
    wave1: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
          },
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Volume01', inheritAttrs: false })
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
        d="M16 14.8135V9.18646C16 6.04126 16 4.46866 15.0747 4.0773C14.1494 3.68593 13.0603 4.79793 10.8823 7.02192C9.75439 8.17365 9.11085 8.42869 7.50604 8.42869C6.10257 8.42869 5.40084 8.42869 4.89675 8.77262C3.85035 9.48655 4.00852 10.882 4.00852 12C4.00852 13.118 3.85035 14.5134 4.89675 15.2274C5.40084 15.5713 6.10257 15.5713 7.50604 15.5713C9.11085 15.5713 9.75439 15.8264 10.8823 16.9781C13.0603 19.2021 14.1494 20.3141 15.0747 19.9227C16 19.5313 16 17.9587 16 14.8135Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.still1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M19 9C19.6254 9.81968 20 10.8634 20 12C20 13.1366 19.6254 14.1803 19 15"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
