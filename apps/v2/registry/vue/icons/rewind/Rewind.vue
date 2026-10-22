<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RewindProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    back: {
      initial: { x: 0 },
      animate: {
        x: [0, -1.5, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    front: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.6, 0],
        transition: { duration: 0.5, ease: 'easeInOut', delay: 0.05 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Rewind', inheritAttrs: false })
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
        d="M22 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 22 18z"
        :variants="variants.back"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 6a2 2 0 0 0-3.414-1.414l-6 6a2 2 0 0 0 0 2.828l6 6A2 2 0 0 0 12 18z"
        :variants="variants.front"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
