<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CompassProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 95, 75],
        transition: {
          duration: 0.7,
          ease: 'easeInOut',
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    path: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 95, 75, -20, 0],
        transition: {
          duration: 1.4,
          ease: 'easeInOut',
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Compass', inheritAttrs: false })
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
        d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="12"
        :cy="12"
        :r="10"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
