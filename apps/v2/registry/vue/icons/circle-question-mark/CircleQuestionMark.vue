<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CircleQuestionMarkProps = IconProps<keyof typeof animations>;

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
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CircleQuestionMark', inheritAttrs: false })
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
      <circle
        :cx="12"
        :cy="12"
        :r="10"
      />
      <motion.g
        :variants="variants.mark"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        />
        <path
          d="M12 17h.01"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
