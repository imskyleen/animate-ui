<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CameraProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    body: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.94, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    lens: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.7, 1.1, 1],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  flash: {
    body: {},
    lens: {
      initial: { fill: 'currentColor', fillOpacity: 0 },
      animate: {
        fillOpacity: [0, 1, 0, 1, 0, 1, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.17, 0.33, 0.5, 0.67, 0.83, 1],
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

defineOptions({ name: 'Camera', inheritAttrs: false })
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
        :variants="variants.body"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"
        />
        <motion.circle
          :cx="12"
          :cy="13"
          :r="3"
          :variants="variants.lens"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
