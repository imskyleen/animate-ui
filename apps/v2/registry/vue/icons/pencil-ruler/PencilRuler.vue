<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PencilRulerProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    ruler: {},
    tick1: {},
    tick2: {},
    pencil: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0],
        y: [0, 1, 0],
        transition: { duration: 0.55, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PencilRuler', inheritAttrs: false })
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
        d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"
        :variants="variants.ruler"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m8 6 2-2"
        :variants="variants.tick1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m18 16 2-2"
        :variants="variants.tick2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17"
        :variants="variants.ruler"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :variants="variants.pencil"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"
        />
        <path
          d="m15 5 4 4"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
