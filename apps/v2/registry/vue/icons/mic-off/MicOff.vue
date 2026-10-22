<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MicOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    slash: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MicOff', inheritAttrs: false })
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
        d="M12 19v3"
      />
      <path
        d="M15 9.34V5a3 3 0 0 0-5.68-1.33"
      />
      <path
        d="M16.95 16.95A7 7 0 0 1 5 12v-2"
      />
      <path
        d="M18.89 13.23A7 7 0 0 0 19 12v-2"
      />
      <path
        d="M9 9v3a3 3 0 0 0 5.12 2.12"
      />
      <motion.path
        d="m2 2 20 20"
        :variants="variants.slash"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
