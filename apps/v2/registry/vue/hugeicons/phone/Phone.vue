<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PhoneProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    handset: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -10, 10, -10, 10, 0],
        scale: [1, 0.88, 0.88, 0.88, 0.88, 1],
        transition: { duration: 0.7, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Phone', inheritAttrs: false })
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
        d="M4.90404 10.5413L7.54448 7.90088C8.08309 7.36227 8.26947 6.56642 8.05163 5.83652C7.88129 5.26577 7.68937 4.57964 7.5618 3.99292C7.44381 3.45027 6.96763 3 6.41231 3H4.90404C3.79339 3 2.8813 3.90384 3.00313 5.0078C3.92928 13.3996 10.5926 20.0629 18.9844 20.9891C20.0883 21.1109 20.9922 20.1988 20.9922 19.0881V17.5799C20.9922 17.0246 20.5401 16.569 19.9937 16.4696C19.391 16.36 18.7533 16.1804 18.2198 16.0103C17.4533 15.7659 16.6013 15.9377 16.0325 16.5065L13.4509 19.0881"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.handset"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
