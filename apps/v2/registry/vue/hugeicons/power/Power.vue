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
      v-bind="attrs"
    >
      <motion.path
        d="M12 3V12"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.stem"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.7083 6C20.1334 7.59227 21 9.69494 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 9.69494 3.86656 7.59227 5.29168 6"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.ring"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
