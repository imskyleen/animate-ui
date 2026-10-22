<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LeafProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, transformOrigin: '0% 100%' },
      animate: {
        rotate: [0, 3, -3, 1.5, 0],
        transformOrigin: '0% 100%',
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Leaf', inheritAttrs: false })
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
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20"
        />
        <path
          d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
