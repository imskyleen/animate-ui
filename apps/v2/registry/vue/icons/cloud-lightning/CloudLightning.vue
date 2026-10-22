<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CloudLightningProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {
      initial: {
        opacity: 1,
        scale: 1,
      },
      animate: {
        opacity: [1, 0.5, 1, 0.5, 1],
        scale: [1, 0.9, 1, 0.9, 1],
        transition: {
          duration: 1.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CloudLightning', inheritAttrs: false })
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
        d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m13 12-3 5h4l-3 5"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
