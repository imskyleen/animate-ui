<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TrendingUpProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    tip: {
      initial: { opacity: 1, scale: 1, transformOrigin: '100% 0%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '100% 0%',
        transition: { duration: 0.6, ease: 'easeOut', times: [0, 0.6, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'TrendingUp', inheritAttrs: false })
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
      v-bind="attrs"
    >
      <motion.path
        d="M3 17L7 13C7.88256 12.1174 8.32385 11.6762 8.86543 11.6274C8.95496 11.6193 9.04504 11.6193 9.13457 11.6274C9.67615 11.6762 10.1174 12.1174 11 13C11.8826 13.8826 12.3238 14.3238 12.8654 14.3726C12.955 14.3807 13.045 14.3807 13.1346 14.3726C13.6762 14.3238 14.1174 13.8826 15 13L20 8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 7.27657C16 7.27657 20.101 6.65426 20.7234 7.27661C21.3458 7.89896 20.7234 12 20.7234 12"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.tip"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
