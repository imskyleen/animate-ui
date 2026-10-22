<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CloudMoonRainProps = IconProps<keyof typeof animations>;

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
  default: {
    group: {},
    path1: {},
    path2: {},
    path3: rainAnimation,
    path4: rainAnimation,
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CloudMoonRain', inheritAttrs: false })
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
        d="M18.376 14.512a6 6 0 0 0 3.461-4.127c.148-.625-.659-.97-1.248-.714a4 4 0 0 1-5.259-5.26c.255-.589-.09-1.395-.716-1.248a6 6 0 0 0-4.594 5.36"
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
    </motion.svg>
  </IconWrapper>
</template>
