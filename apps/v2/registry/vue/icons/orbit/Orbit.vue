<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type OrbitProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0 },
      animate: {
        rotate: 360,
        transition: {
          duration: 2,
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

defineOptions({ name: 'Orbit', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="M20.341 6.484A10 10 0 0 1 10.266 21.85"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3.659 17.516A10 10 0 0 1 13.74 2.152"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="12"
        cy="12"
        r="3"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="19"
        cy="5"
        r="2"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="5"
        cy="19"
        r="2"
        :variants="variants.circle3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
