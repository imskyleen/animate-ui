<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BetweenVerticalEndProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    leftRect: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: -2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    rightRect: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: 2,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    arrow: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    leftRect: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    rightRect: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    arrow: {
      initial: { y: 0 },
      animate: {
        y: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'BetweenVerticalEnd', inheritAttrs: false })
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
        :width="7"
        :height="13"
        :x="3"
        :y="3"
        :rx="1"
        :variants="variants.leftRect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m9 22 3-3 3 3"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :width="7"
        :height="13"
        :x="14"
        :y="3"
        :rx="1"
        :variants="variants.rightRect"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
