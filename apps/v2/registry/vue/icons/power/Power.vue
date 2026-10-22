<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PowerProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    stem: {
      initial: { y: 0 },
      animate: {
        y: [0, 2, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    ring: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.94, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Power', inheritAttrs: false })
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
        d="M12 2v10"
        :variants="variants.stem"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.4 6.6a9 9 0 1 1-12.77.04"
        :variants="variants.ring"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
