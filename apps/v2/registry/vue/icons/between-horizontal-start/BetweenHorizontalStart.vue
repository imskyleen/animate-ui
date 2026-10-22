<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BetweenHorizontalStartProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    topRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    bottomRect: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    topRect: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    bottomRect: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BetweenHorizontalStart', inheritAttrs: false })
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
      <motion.rect
        :width="13"
        :height="7"
        :x="8"
        :y="3"
        :rx="1"
        :variants="variants.topRect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m2 9 3 3-3 3"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :width="13"
        :height="7"
        :x="8"
        :y="14"
        :rx="1"
        :variants="variants.bottomRect"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
