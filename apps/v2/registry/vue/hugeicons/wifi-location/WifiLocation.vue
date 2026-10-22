<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiLocationProps = IconProps<keyof typeof animations>;

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
    wave2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
    wave3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.24 },
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
    wave2: {
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
            delay: 0.2,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.2,
          },
        },
      },
    },
    wave3: {
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
            delay: 0.4,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.4,
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

defineOptions({ name: 'WifiLocation', inheritAttrs: false })
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
        d="M21 11.0891C21 16.8654 14.9912 20.619 12.7931 21.7988C12.2934 22.0671 11.7066 22.0671 11.2069 21.7988C9.00877 20.619 3 16.8654 3 11.0891C3 6.06935 7.02944 2 12 2C16.9706 2 21 6.06935 21 11.0891Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.still1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 16H12.01"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.5 12.8647C10.2106 12.2981 11.0929 11.9904 12.0018 11.9922C12.9106 11.994 13.7917 12.3053 14.5 12.8747"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M7 9.755C8.4189 8.61897 10.1824 8 12 8C13.8176 8 15.5811 8.61897 17 9.755"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
