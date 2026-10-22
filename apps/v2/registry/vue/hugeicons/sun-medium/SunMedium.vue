<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SunMediumProps = IconProps<keyof typeof animations>;

export const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      circle: {},
    };

    for (let i = 1; i <= 8; i++) {
      animation[`line${i}`] = {
        initial: { opacity: 1, scale: 1, pathLength: 1 },
        animate: {
          opacity: [0, 1],
          pathLength: [0, 1],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
            delay: (i - 1) * 0.15,
          },
        },
      };
    }

    return animation;
  })() satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SunMedium', inheritAttrs: false })
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11.9982 4L11.9982 2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17.499 6.5L18.9981 5.00098"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20 12L22 12"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17.5 17.501L19 19.001"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M11.9982 20V22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.5 17.5L5 19"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line6"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4 12H2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line7"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.49902 6.5L5 5.00098"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line8"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
