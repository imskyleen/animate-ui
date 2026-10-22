<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MicProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    capsule: {
      initial: { x: 0 },
      animate: {
        x: [0, -0.4, 0.4, -0.4, 0.4, -0.2, 0.2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  wiggle: {
    group: {
      initial: { rotate: 0, transformOrigin: '50% 100%' },
      animate: {
        rotate: [0, -10, 10, -5, 0],
        transformOrigin: '50% 100%',
        transition: { duration: 0.8, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Mic', inheritAttrs: false })
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
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M7 6.5C7 4.01472 9.01472 2 11.5 2C13.9853 2 16 4.01472 16 6.5V11.5C16 13.9853 13.9853 16 11.5 16C9.01472 16 7 13.9853 7 11.5V6.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.capsule"
          initial="initial"
          :animate="controls"
        />
        <path
          d="M11.5 19H11.0828C7.57267 19 4.57706 16.4623 4 13"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.5 19H11.9172C15.4273 19 18.4229 16.4623 19 13"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11.5 19V22"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
