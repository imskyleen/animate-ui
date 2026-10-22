<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SunsetProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    sun: {
      initial: { scale: 1, transformOrigin: '50% 100%' },
      animate: {
        scale: [1, 0.4, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
    shaft: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
    head: {
      initial: { opacity: 1, scale: 1, transformOrigin: '50% 100%' },
      animate: {
        opacity: [0, 0, 1],
        scale: [0.3, 0.3, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.5, ease: 'easeOut', times: [0, 0.5, 1] },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Sunset', inheritAttrs: false })
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
        d="m4.93 10.93 1.41 1.41"
      />
      <path
        d="M2 18h2"
      />
      <path
        d="M20 18h2"
      />
      <path
        d="m19.07 10.93-1.41 1.41"
      />
      <path
        d="M22 22H2"
      />
      <motion.path
        d="M16 18a4 4 0 0 0-8 0"
        :variants="variants.sun"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 2v8"
        :variants="variants.shaft"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m16 6-4 4-4-4"
        :variants="variants.head"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
