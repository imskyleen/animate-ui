<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SunMoonProps = IconProps<keyof typeof animations>;

export const animations = {
  default: (() => {
    const animation: Record<string, Variants> = {
      path1: {
        initial: {
          rotate: 0,
        },
        animate: {
          rotate: [0, -10, 10, 0],
          transition: {
            duration: 0.6,
            ease: 'easeInOut',
          },
        },
      },
      path2: {},
    };

    for (let i = 1; i <= 3; i++) {
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

defineOptions({ name: 'SunMoon', inheritAttrs: false })
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
        d="M17 16.5314C16.116 17.0034 15.1064 17.271 14.0343 17.271C10.552 17.271 7.72899 14.448 7.72899 10.9657C7.72899 9.89358 7.99657 8.88398 8.46857 8C5.33406 8.73462 3 11.548 3 14.9065C3 18.8241 6.17586 22 10.0935 22C13.452 22 16.2654 19.6659 17 16.5314Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16.5 11.5C16.5 9.567 14.933 8 13 8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M13.5 4.5L13.5 2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.0028 5.99902L19.5018 4.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M19.502 10.5L21.5018 10.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
