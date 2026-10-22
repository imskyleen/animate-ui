<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type BinaryProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: -8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: 8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: -10,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: 10,
        transition: {
          duration: 0.4,
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

defineOptions({ name: 'Binary', inheritAttrs: false })
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
        :x="14"
        :y="14"
        :width="4"
        :height="6"
        :rx="2"
        :variants="variants.rect1"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="6"
        :y="4"
        :width="4"
        :height="6"
        :rx="2"
        :variants="variants.rect2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6 20h4 M6 14h2v6"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 4h2v6 M14 10h4"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
