<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ListFilterProps = IconProps<keyof typeof animations>;

function bar(delay: number): Variants {
  return {
    initial: { y: 0, opacity: 1, transition: { duration: 0.15 } },
    animate: {
      y: [-3, 0],
      opacity: [0, 1],
      transition: { duration: 0.3, delay, ease: 'easeOut' },
    },
  };
}

export const animations = {
  default: {
    top: bar(0),
    middle: bar(0.09),
    bottom: bar(0.18),
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ListFilter', inheritAttrs: false })
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
        d="M2 5h20"
        :variants="variants.top"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6 12h12"
        :variants="variants.middle"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9 19h6"
        :variants="variants.bottom"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
