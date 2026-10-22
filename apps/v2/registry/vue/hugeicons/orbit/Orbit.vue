<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type OrbitProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: 360,
        scale: 0.92,
        transition: {
          rotate: {
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
          scale: { duration: 0.15, ease: 'easeInOut' },
        },
      },
    },
    circle1: {},
    circle2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Orbit', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
          stroke-linecap="round"
        />
        <path
          d="M18.6461 4.52795C18.2489 4.89346 18 5.41766 18 6C18 7.10457 18.8954 8 20 8C20.3793 8 20.7339 7.89441 21.0361 7.71103C21.6139 7.36038 22 6.72527 22 6C22 4.89543 21.1046 4 20 4C19.4778 4 19.0023 4.20016 18.6461 4.52795Z"
          stroke-linecap="round"
        />
        <path
          d="M18.6461 4.52795C16.8794 2.95541 14.5513 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 11.6625 21.9833 11.3289 21.9506 11"
          stroke-linecap="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
