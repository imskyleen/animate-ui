<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CloudSunRainProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: { y: 0, opacity: 1 },
  animate: (i: number = 0) => ({
    y: [0, 1, -1, 0],
    opacity: [1, 0, 0, 1],
    transition: {
      duration: 0.8,
      times: [0, 0.4, 0.4, 1],
      ease: ['easeIn', 'linear', 'easeOut'],
      repeat: Infinity,
      delay: i * 0.3,
    },
  }),
};

export const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {},
      path2: {},
      group: {},
      path3: rainAnimation,
      path4: rainAnimation,
    };

    for (let i = 1; i <= 4; i++) {
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

defineOptions({ name: 'CloudSunRain', inheritAttrs: false })
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
      <motion.path
        d="M15.947 12.65a4 4 0 0 0-5.925-4.128"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M7 19v2"
          :variants="variants.path3"
          :custom="0"
        />
        <motion.path
          d="M11 20v2"
          :variants="variants.path4"
          :custom="1"
        />
      </motion.g>
      <motion.line
        x1="6.3"
        y1="6.3"
        x2="4.9"
        y2="4.9"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="12"
        y1="4"
        x2="12"
        y2="2"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="17.7"
        y1="6.3"
        x2="19.1"
        y2="4.9"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        x1="20"
        y1="12"
        x2="22"
        y2="12"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
