<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Disc3Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      },
    },
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Disc3', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.circle
        :cx="12"
        :cy="12"
        :r="10"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.80269 15C7.32961 15.9109 8.08911 16.6704 9 17.1973"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="12"
        :cy="12"
        :r="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17.1973 9.00004C16.6704 8.08916 15.9109 7.32965 15 6.80273"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
