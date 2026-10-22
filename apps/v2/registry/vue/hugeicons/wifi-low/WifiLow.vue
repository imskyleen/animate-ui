<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WifiLowProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
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
  } satisfies Record<string, Variants>,
  blink: {
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
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WifiLow', inheritAttrs: false })
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
        d="M12.1256 19.2506H12.0006M12.2506 19.2506C12.2506 19.3887 12.1387 19.5006 12.0006 19.5006C11.8625 19.5006 11.7506 19.3887 11.7506 19.2506C11.7506 19.1126 11.8625 19.0006 12.0006 19.0006C12.1387 19.0006 12.2506 19.1126 12.2506 19.2506Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.5 15.9293C9.43464 15.0132 10.6912 14.5 12 14.5C13.3088 14.5 14.5654 15.0132 15.5 15.9293"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
