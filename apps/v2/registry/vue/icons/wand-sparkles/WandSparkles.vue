<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WandSparklesProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    wand: {
      initial: { rotate: 0, scale: 1, transformOrigin: '0% 100%' },
      animate: {
        rotate: [0, -10, 4, 0],
        scale: [1, 0.9, 0.97, 1],
        transformOrigin: '0% 100%',
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.4, 0.75, 1],
        },
      },
    },
    sparkle1: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.2, 1.15, 1],
        opacity: [1, 0.4, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.15 },
      },
    },
    sparkle2: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.2, 1.15, 1],
        opacity: [1, 0.4, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.27 },
      },
    },
    sparkle3: {
      initial: { scale: 1, opacity: 1 },
      animate: {
        scale: [1, 0.2, 1.15, 1],
        opacity: [1, 0.4, 1, 1],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.39 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'WandSparkles', inheritAttrs: false })
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
      <motion.g
        :variants="variants.wand"
        initial="initial"
        :animate="controls"
      >
        <path
          d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"
        />
        <path
          d="m14 7 3 3"
        />
      </motion.g>
      <motion.g
        :variants="variants.sparkle1"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M10 2v2"
        />
        <path
          d="M11 3H9"
        />
      </motion.g>
      <motion.g
        :variants="variants.sparkle2"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M5 6v4"
        />
        <path
          d="M7 8H3"
        />
      </motion.g>
      <motion.g
        :variants="variants.sparkle3"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M19 14v4"
        />
        <path
          d="M21 16h-4"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
