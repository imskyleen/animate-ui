<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type InfoProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    mark: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 0, -0.8, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.3, 0.55, 0.75, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
  blink: {
    mark: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.15, 1, 0.15, 1],
        transition: {
          duration: 1.1,
          times: [0, 0.2, 0.45, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Info', inheritAttrs: false })
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
      <circle
        :cx="12"
        :cy="11.9999"
        :r="10"
      />
      <motion.g
        :variants="variants.mark"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M11.875 8.24994L12 8.24994"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.75 8.24994C11.75 8.11187 11.8619 7.99994 12 7.99994C12.1381 7.99994 12.25 8.11187 12.25 8.24994C12.25 8.38801 12.1381 8.49994 12 8.49994C11.8619 8.49994 11.75 8.38801 11.75 8.24994Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 15.9999L12 11.9999"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
