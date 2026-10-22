<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BatteryMediumProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line1: {},
    line2: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    line3: {
      initial: { opacity: 1, scale: 1 },
      animate: {
        opacity: [1, 0.25, 1],
        scale: [1, 0.85, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.12 },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    rect: {},
    line1: {},
    line2: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0,
          },
          scale: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0,
          },
        },
      },
    },
    line3: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: 0,
        scale: 0,
        transition: {
          opacity: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.3,
          },
          scale: {
            duration: 0.3,
            ease: 'easeInOut',
            repeat: 1,
            repeatType: 'reverse',
            repeatDelay: 0.3,
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

defineOptions({ name: 'BatteryMedium', inheritAttrs: false })
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
        :width="16"
        :height="10"
        :x="2"
        :y="7"
        :rx="2"
        :ry="2"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="22"
        :x2="22"
        :y1="11"
        :y2="13"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="6"
        :x2="6"
        :y1="11"
        :y2="13"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="10"
        :x2="10"
        :y1="11"
        :y2="13"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
