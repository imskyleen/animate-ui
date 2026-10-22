<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiConnected03Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    check: {
      initial: { pathLength: 1, opacity: 1, scale: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1, 1.1, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.36 },
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
    wave4: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.36 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    check: {},
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
    wave4: {
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
            delay: 0.6,
          },
          scale: {
            duration: 0.2,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.2,
            delay: 0.6,
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

defineOptions({ name: 'WifiConnected03', inheritAttrs: false })
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
        d="M15 7.5C15.4706 7.66026 16.5935 8.12407 17 9.5C17 9.5 19.5294 5.33333 22 4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.check"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12.1256 19.25H12.0006M12.2506 19.25C12.2506 19.3881 12.1387 19.5 12.0006 19.5C11.8625 19.5 11.7506 19.3881 11.7506 19.25C11.7506 19.1119 11.8625 19 12.0006 19C12.1387 19 12.2506 19.1119 12.2506 19.25Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.5 15.9287C9.43464 15.0125 10.6912 14.4994 12 14.4994C13.3088 14.4994 14.5654 15.0125 15.5 15.9287"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 12.3587C6.86929 10.5264 9.38247 9.50009 12 9.50009"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 8.31966C4.75011 5.85989 8.31034 4.5 12 4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
