<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CircleUserRoundProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    outerCircle: {
      initial: { pathLength: 1, rotate: 0 },
      animate: {
        pathLength: [0, 1],
        rotate: [-90, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    headCircle: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [2, 0],
        opacity: [0, 1],
        transition: { duration: 0.4, delay: 0.2, ease: 'easeOut' },
      },
    },
    shoulders: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [2, 0],
        opacity: [0, 1],
        transition: { duration: 0.4, delay: 0.3, ease: 'easeOut' },
      },
    },
    arm: { initial: { scale: 0, transformOrigin: '50% 120%' } },
  } satisfies Record<string, Variants>,
  wave: {
    outerCircle: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
    },
    headCircle: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
    },
    shoulders: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
    },
    arm: {
      initial: {
        scale: 0,
        rotate: 0,
        transformOrigin: '50% 120%',
      },
      animate: {
        transformOrigin: '50% 120%',
        scale: [0, 1, 1, 1, 1, 1, 0],
        rotate: [0, 0, -10, 9, -6, 0, 0],
        transition: {
          duration: 1.1,
          ease: 'easeInOut',
          times: [0, 0.15, 0.35, 0.5, 0.65, 0.85, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CircleUserRound', inheritAttrs: false })
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
        d="M17.925 20.056a6 6 0 0 0-11.851.001"
        :variants="variants.shoulders"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="12"
        cy="11"
        r="4"
        :variants="variants.headCircle"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        :variants="variants.outerCircle"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.arm"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M17 16.5 C 19.3 15.2 20.3 12.5 20 9.8"
          stroke-linecap="round"
        />
        <circle
          cx="20"
          cy="9"
          r="1.2"
          fill="currentColor"
          stroke="none"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
