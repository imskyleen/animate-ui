<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ClockCheckProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    face1: {},
    check: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    minute: {
      initial: {
        rotate: 0,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: 360,
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    hour: {
      initial: {
        rotate: 0,
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
      animate: {
        rotate: [0, 20, 0],
        transformOrigin: '0% 0%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ClockCheck', inheritAttrs: false })
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
        d="M21.95 13a10 10 0 1 0-8.685 8.92"
        :variants="variants.face1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m16 19 2 2 4-4"
        :variants="variants.check"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 6V12"
        :variants="variants.minute"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 12L16 14"
        :variants="variants.hour"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
