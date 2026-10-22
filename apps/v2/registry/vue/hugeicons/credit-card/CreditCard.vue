<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CreditCardProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    card: {
      initial: { transform: 'rotate3d(0, 1, 0, 0deg)', perspective: 600 },
      animate: {
        transform: 'rotate3d(0, 1, 0, 360deg)',
        perspective: 600,
        transition: { ease: 'easeInOut', duration: 0.7 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CreditCard', inheritAttrs: false })
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
      <motion.g
        :variants="variants.card"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M2 12C2 8.46252 2 6.69377 3.0528 5.5129C3.22119 5.32403 3.40678 5.14935 3.60746 4.99087C4.86213 4 6.74142 4 10.5 4H13.5C17.2586 4 19.1379 4 20.3925 4.99087C20.5932 5.14935 20.7788 5.32403 20.9472 5.5129C22 6.69377 22 8.46252 22 12C22 15.5375 22 17.3062 20.9472 18.4871C20.7788 18.676 20.5932 18.8506 20.3925 19.0091C19.1379 20 17.2586 20 13.5 20H10.5C6.74142 20 4.86213 20 3.60746 19.0091C3.40678 18.8506 3.22119 18.676 3.0528 18.4871C2 17.3062 2 15.5375 2 12Z"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2 9H22"
          stroke-linejoin="round"
        />
        <path
          d="M10 16H11.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14.5 16L18 16"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
