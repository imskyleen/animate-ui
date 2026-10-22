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
        initial: { opacity: 1, scale: 1 },
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
      stroke-linecap="round"
      stroke-linejoin="round"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="4"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="12"
        y1="4"
        x2="12"
        y2="3"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="17.7"
        y1="6.3"
        x2="18.4"
        y2="5.6"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="20"
        y1="12"
        x2="21"
        y2="12"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="17.7"
        y1="17.7"
        x2="18.4"
        y2="18.4"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="12"
        y1="20"
        x2="12"
        y2="21"
        :variants="variants.line5"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="6.3"
        y1="17.7"
        x2="5.6"
        y2="18.4"
        :variants="variants.line6"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="4"
        y1="12"
        x2="3"
        y2="12"
        :variants="variants.line7"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="6.3"
        y1="6.3"
        x2="5.6"
        y2="5.6"
        :variants="variants.line8"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
