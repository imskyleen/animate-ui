<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type FolderOpenProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    front: {
      initial: { scaleY: 1, skewX: 0, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 0.8, 1.04, 1],
        skewX: [0, -6, 1.5, 0],
        transformOrigin: '50% 100%',
        transition: {
          duration: 0.6,
          times: [0, 0.45, 0.8, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  squash: {
    front: {
      initial: { scaleY: 1, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 0.78, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'FolderOpen', inheritAttrs: false })
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
      <path
        d="M18.45 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"
      />
      <motion.path
        d="M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5"
        :variants="variants.front"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
