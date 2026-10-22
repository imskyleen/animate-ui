<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Upload01Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    tray: {},
    arrow: {
      initial: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { y: -2, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    tray: {},
    arrow: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Upload01', inheritAttrs: false })
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
        d="M2.99994 17C2.99994 17.93 2.99994 18.395 3.10216 18.7765C3.37956 19.8117 4.18821 20.6204 5.22348 20.8978C5.60498 21 6.06997 21 6.99994 21L16.9999 21C17.9299 21 18.3949 21 18.7764 20.8978C19.8117 20.6204 20.6203 19.8117 20.8977 18.7765C20.9999 18.395 20.9999 17.93 20.9999 17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.tray"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16.5 7.49993C16.5 7.49993 13.1858 2.99997 12 2.99996C10.8141 2.99995 7.50002 7.49996 7.50002 7.49996M12 3.99996V16"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
