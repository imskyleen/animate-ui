<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CloudRainProps = IconProps<keyof typeof animations>;

const rainAnimation: Variants = {
  initial: { y: 0, opacity: 1 },
  animate: (i: number = 0) => ({
    y: [0, 1, -1, 0],
    opacity: [1, 0, 0, 1],
    transition: {
      duration: 1.2,
      times: [0, 0.4, 0.4, 1],
      ease: ['easeIn', 'linear', 'easeOut'],
      repeat: Infinity,
      delay: i * 0.3,
    },
  }),
};

export const animations = {
  default: {
    group: {},
    path1: {},
    path2: rainAnimation,
    path3: rainAnimation,
    path4: rainAnimation,
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CloudRain', inheritAttrs: false })
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
        d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M16 14v6"
          :variants="variants.path2"
          :custom="0"
        />
        <motion.path
          d="M8 14v6"
          :variants="variants.path3"
          :custom="1"
        />
        <motion.path
          d="M12 16v6"
          :variants="variants.path4"
          :custom="2"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
