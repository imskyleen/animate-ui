<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TemperatureProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    mercury: {
      initial: { pathLength: 1 },
      animate: {
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Temperature', inheritAttrs: false })
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
        d="M12 22C14.7614 22 17 19.7614 17 17C17 15.3644 16.2147 13.9122 15.0005 13V5.00049C15.0005 4.06815 15.0005 3.60198 14.8481 3.23428C14.6451 2.74451 14.256 2.35537 13.7662 2.15239C13.3985 2 12.9323 2 12 2C11.0677 2 10.6015 2 10.2338 2.15239C9.74402 2.35537 9.35488 2.74451 9.1519 3.23428C8.99951 3.60198 8.99951 4.06815 8.99951 5.00049V13C7.78534 13.9122 7 15.3644 7 17C7 19.7614 9.23858 22 12 22Z"
        stroke-linejoin="round"
      />
      <path
        d="M12 15C10.8954 15 10 15.8954 10 17C10 18.1046 10.8954 19 12 19C13.1046 19 14 18.1046 14 17C14 15.8954 13.1046 15 12 15Z"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M12 15V8"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.mercury"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
