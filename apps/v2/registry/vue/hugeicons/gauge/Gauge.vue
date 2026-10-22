<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GaugeProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        rotate: 70,
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
      animate: {
        rotate: [0, 70, 0],
        transformOrigin: '50% 75%',
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Gauge', inheritAttrs: false })
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
      <circle
        :cx="12.0"
        :cy="12.0"
        :r="10.0"
      />
      <path
        d="M18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12"
        stroke-linecap="round"
      />
      <motion.g
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      >
        <circle
          :cx="12.0"
          :cy="16.0"
          :r="2.0"
        />
        <path
          d="M12 14V10"
          stroke-linecap="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
