<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ToggleLeftProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    circle: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 7, 6],
        transition: {
          duration: 0.5,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    rect: {},
    circle: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 7, 6, -1, 0],
        transition: {
          duration: 1,
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

defineOptions({ name: 'ToggleLeft', inheritAttrs: false })
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
        :width="20"
        :height="14"
        :x="2"
        :y="5"
        :rx="7"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="9"
        :cy="12"
        :r="3"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
