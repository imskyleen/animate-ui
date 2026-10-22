<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type WavesProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    wave1: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    wave2: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.1 },
      },
    },
    wave3: {
      initial: { scaleY: 1 },
      animate: {
        scaleY: [1, 1.5, 0.8, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.2 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Waves', inheritAttrs: false })
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
        d="M2 6.1932C2.68524 7.24434 3.57104 7.24434 4.27299 6.1932C6.52985 2.7408 8.67954 8.67642 10.273 6.23213C12.703 2.56944 14.4508 8.92184 16.273 6.1932C18.6492 2.5582 20.1295 8.57758 22 6.58418"
        stroke-linecap="round"
        :variants="variants.wave1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 12.1932C2.68524 13.2443 3.57104 13.2443 4.27299 12.1932C6.52985 8.7408 8.67954 14.6764 10.273 12.2321C12.703 8.56944 14.4508 14.9218 16.273 12.1932C18.6492 8.5582 20.1295 14.5776 22 12.5842"
        stroke-linecap="round"
        :variants="variants.wave2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 18.1932C2.68524 19.2443 3.57104 19.2443 4.27299 18.1932C6.52985 14.7408 8.67954 20.6764 10.273 18.2321C12.703 14.5694 14.4508 20.9218 16.273 18.1932C18.6492 14.5582 20.1295 20.5776 22 18.5842"
        stroke-linecap="round"
        :variants="variants.wave3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
