<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ShareProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    shaft: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { opacity: 1, scale: 1, transformOrigin: '50% 0%' },
      animate: {
        opacity: [0, 1],
        scale: [0.3, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.3, ease: 'easeOut', delay: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Share', inheritAttrs: false })
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
        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
      />
      <motion.path
        d="M12 15V2"
        :variants="variants.shaft"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m16 6-4-4-4 4"
        :variants="variants.head"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
