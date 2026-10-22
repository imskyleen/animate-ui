<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MenuProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: {
        rotate: 0,
        x: 0,
        y: 0,
      },
      animate: {
        rotate: -45,
        x: -2.35,
        y: 0.35,
        transformOrigin: 'top right',
        transition: {
          type: 'spring',
          stiffness: 200,
          damping: 20,
        },
      },
    },
    line2: {
      initial: {
        opacity: 1,
      },
      animate: {
        opacity: 0,
        transition: {
          ease: 'easeInOut',
          duration: 0.2,
        },
      },
    },
    line3: {
      initial: {
        rotate: 0,
        x: 0,
        y: 0,
      },
      animate: {
        rotate: 45,
        x: -2.35,
        y: -0.35,
        transformOrigin: 'bottom right',
        transition: {
          type: 'spring',
          stiffness: 200,
          damping: 20,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Menu', inheritAttrs: false })
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
      <motion.line
        :x1="4"
        :y1="6"
        :x2="20"
        :y2="6"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="4"
        :y1="12"
        :x2="20"
        :y2="12"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="4"
        :y1="18"
        :x2="20"
        :y2="18"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
