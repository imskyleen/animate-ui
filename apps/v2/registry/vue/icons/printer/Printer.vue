<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PrinterProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    body: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.3, 0.3, -0.3, 0.3, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    sheet: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [0.3, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Printer', inheritAttrs: false })
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
          d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
        />
        <path
          d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"
        />
      </motion.g>
      <motion.rect
        :x="6"
        :y="14"
        :width="12"
        :height="8"
        :rx="1"
        :variants="variants.sheet"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
