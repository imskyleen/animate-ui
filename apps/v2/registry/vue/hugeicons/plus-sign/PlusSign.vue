<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PlusSignProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: {
        rotate: 0,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { duration: 0.4, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line2: {
      initial: { rotate: 0, transition: { duration: 0.4, ease: 'easeInOut' } },
      animate: { rotate: 90, transition: { duration: 0.4, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  x: {
    line1: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 45,
        scale: 1.2,
        transition: { duration: 0.3, ease: 'easeInOut', delay: 0.1 },
      },
    },
    line2: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 45,
        scale: 1.2,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PlusSign', inheritAttrs: false })
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
        d="M12 4V20"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20 12H4"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
