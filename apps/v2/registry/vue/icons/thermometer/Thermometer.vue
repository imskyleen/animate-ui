<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ThermometerProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    tube: {},
    bulb: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1, 1.04, 1],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Thermometer', inheritAttrs: false })
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
        d="M10 14.54V4a2 2 0 0 1 4 0v10.54"
        :variants="variants.tube"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 14.54a4 4 0 1 1-4 0"
        :style="{ transformBox: 'view-box', transformOrigin: '12px 18px' }"
        :variants="variants.bulb"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
