<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ZoomOutProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    lens: {
      initial: { scale: 1, transformOrigin: '44.44% 44.44%' },
      animate: {
        scale: [1, 1.1, 1],
        transformOrigin: '44.44% 44.44%',
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sign: {
      initial: { scaleX: 1 },
      animate: {
        scaleX: [1, 0.4, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  shrink: {
    lens: {
      initial: { scale: 1, transformOrigin: '44.44% 44.44%' },
      animate: {
        scale: [1, 0.86, 1],
        transformOrigin: '44.44% 44.44%',
        transition: { duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' },
      },
    },
    sign: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ZoomOut', inheritAttrs: false })
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
      <motion.g
        :variants="variants.lens"
        initial="initial"
        :animate="controls"
      >
        <line
          :x1="21"
          :x2="16.65"
          :y1="21"
          :y2="16.65"
        />
        <circle
          :cx="11"
          :cy="11"
          :r="8"
        />
        <motion.line
          :x1="8"
          :x2="14"
          :y1="11"
          :y2="11"
          :variants="variants.sign"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
