<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CloudHailProps = IconProps<keyof typeof animations>;

const hailAnimation: Variants = {
  initial: { y: 0, opacity: 1 },
  animate: (i: number = 0) => ({
    y: [0, 1, -1, 0, -0.4, 0],
    opacity: [1, 0, 0, 1, 1, 1],
    transition: {
      duration: 0.9,
      times: [0, 0.25, 0.25, 0.6, 0.8, 1],
      ease: ['easeIn', 'linear', 'easeIn', 'easeOut', 'easeIn'],
      repeat: Infinity,
      delay: i * 0.15,
    },
  }),
};

export const animations = {
  default: {
    group: {
      initial: {},
      animate: {},
    },
    path1: {},
    path2: hailAnimation,
    path3: hailAnimation,
    path4: hailAnimation,
    path5: hailAnimation,
    path6: hailAnimation,
    path7: hailAnimation,
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CloudHail', inheritAttrs: false })
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
        d="M4 17.0004C2.78555 16.0882 2 14.6358 2 13C2 10.4003 3.98398 8.26407 6.52042 8.0227M6.52042 8.0227C6.76233 5.20862 9.12324 3 12 3C15.0376 3 17.5 5.46243 17.5 8.5C17.5 8.66856 17.4924 8.83536 17.4776 9.00005M6.52042 8.0227C6.67826 8.00768 6.83823 8 7 8C7.7111 8 8.38754 8.14845 9 8.41604M17.4776 9.00005C17.485 9.00002 17.4925 9 17.5 9C19.9853 9 22 11.0147 22 13.5C22 15.0602 21.206 16.435 20 17.2422M17.4776 9.00005C17.4466 9.34345 17.3841 9.67773 17.293 10"
        stroke-linecap="round"
        stroke-linejoin="round"
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
          d="M8 14V16"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          :custom="0"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 22H12.01"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path3"
          :custom="1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M16 14V16"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path4"
          :custom="2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12 16V18"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path7"
          :custom="3"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M16 20H16.01"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path6"
          :custom="4"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M8 20H8.01"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path5"
          :custom="5"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
