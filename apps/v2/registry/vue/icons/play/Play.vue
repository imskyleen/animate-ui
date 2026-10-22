<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PlayProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        x: 3,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    polygon: {
      initial: {
        x: 0,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Play', inheritAttrs: false })
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
      <motion.polygon
        points="6 3 20 12 6 21 6 3"
        :variants="variants.polygon"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
