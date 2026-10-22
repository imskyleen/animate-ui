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
      v-bind="attrs"
    >
      <path
        d="M8.1572 4.1572C8.94761 2.86349 10.373 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V11.5C16.5 11.8111 16.4684 12.1149 16.4083 12.4083"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.5 7.5V11.5C7.5 13.9853 9.51472 16 12 16C13.1154 16 14.136 15.5942 14.9222 14.9222"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 19H11.5828C8.07267 19 5.07706 16.4623 4.5 13"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 19H12.4172C14.2325 19 15.9102 18.3213 17.1869 17.1869"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 19V22"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19.5 13C19.3878 13.6733 19.1841 14.3116 18.903 14.903"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M2 2L22 22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.slash"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
