<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ForkliftProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
    line: {
      initial: {
        y1: 19,
        y2: 19,
      },
      animate: {
        y1: [19, 5, 6],
        y2: [19, 5, 6],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
    line: {
      initial: {
        y1: 19,
        y2: 19,
      },
      animate: {
        y1: [19, 5, 6, 19],
        y2: [19, 5, 6, 19],
        transition: {
          duration: 1.2,
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

defineOptions({ name: 'Forklift', inheritAttrs: false })
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
      <motion.path
        d="M12,12h-7c-1.1,0-2,.9-2,2v5"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="13"
        :cy="19"
        :r="2"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="5"
        :cy="19"
        :r="2"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8,19h3M16,2v17M6,12v-5c0-1.1.9-2,2-2h3l5,5"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="22"
        :y1="19"
        :x2="16"
        :y2="19"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
