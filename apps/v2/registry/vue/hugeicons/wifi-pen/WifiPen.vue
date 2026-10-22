<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiPenProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    pen: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0.5, -1, 0.5, 0],
        y: [0, 1, -0.5, 1, -0.5, 0],
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
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
    pen: {},
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

defineOptions({ name: 'WifiPen', inheritAttrs: false })
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
        d="M13 20V18.6611C13 18.0548 13.2408 17.4735 13.6695 17.0448L18.3102 12.4041C18.5689 12.1453 18.9198 12 19.2857 12C19.6516 12 20.0025 12.1453 20.2612 12.4041L20.5959 12.7388C20.8547 12.9975 21 13.3484 21 13.7143C21 14.0802 20.8547 14.4311 20.5959 14.6898L15.9552 19.3305C15.5265 19.7592 14.9452 20 14.3389 20H13Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.pen"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.5 15.4287C9.43464 14.5125 10.6912 13.9994 12 13.9994"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 11.8587C6.86929 10.0264 9.38247 9.00009 12 9.00009C13.432 9.00009 14.8327 9.30725 16.1139 9.88549"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 7.81966C4.75011 5.35989 8.31034 4 12 4C15.6897 4 19.2499 5.35989 22 7.81966"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
