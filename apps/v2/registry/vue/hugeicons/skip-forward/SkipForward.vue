<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SkipForwardProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    triangle: {
      initial: { x: 0 },
      animate: {
        x: [0, 2, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SkipForward', inheritAttrs: false })
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
        d="M19.9922 5V19"
        stroke-linecap="round"
      />
      <motion.path
        d="M15.9273 12.6258C15.6729 13.8374 14.3192 14.7077 11.6119 16.4481C8.66747 18.3411 7.19522 19.2876 6.0027 18.9229C5.59881 18.7994 5.22681 18.5823 4.91445 18.2876C3.99219 17.4178 3.99219 15.6118 3.99219 12C3.99219 8.38816 3.99219 6.58224 4.91445 5.71235C5.22681 5.41773 5.59881 5.20057 6.0027 5.07707C7.19522 4.71243 8.66746 5.6589 11.6119 7.55186C14.3192 9.29233 15.6729 10.1626 15.9273 11.3742C16.0138 11.7865 16.0138 12.2135 15.9273 12.6258Z"
        stroke-linejoin="round"
        :variants="variants.triangle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
