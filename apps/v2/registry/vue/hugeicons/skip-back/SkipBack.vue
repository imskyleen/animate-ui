<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SkipBackProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    triangle: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SkipBack', inheritAttrs: false })
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
        d="M3.99219 4L3.99219 20"
        stroke-linecap="round"
      />
      <motion.path
        d="M8.0571 12.6258C8.31149 13.8374 9.66514 14.7077 12.3724 16.4481C15.3169 18.3411 16.7892 19.2876 17.9817 18.9229C18.3856 18.7994 18.7576 18.5823 19.0699 18.2876C19.9922 17.4178 19.9922 15.6118 19.9922 12C19.9922 8.38816 19.9922 6.58224 19.0699 5.71235C18.7576 5.41773 18.3856 5.20057 17.9817 5.07707C16.7892 4.71243 15.3169 5.6589 12.3724 7.55186C9.66514 9.29233 8.31149 10.1626 8.0571 11.3742C7.97055 11.7865 7.97055 12.2135 8.0571 12.6258Z"
        stroke-linejoin="round"
        :variants="variants.triangle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
