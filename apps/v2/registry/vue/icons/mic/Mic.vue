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
      stroke-linecap="round"
      stroke-linejoin="round"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.rect
          :x="9"
          :y="2"
          :width="6"
          :height="13"
          :rx="3"
          :variants="variants.capsule"
          initial="initial"
          :animate="controls"
        />
        <path
          d="M19 10v2a7 7 0 0 1-14 0v-2"
        />
        <path
          d="M12 19v3"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
