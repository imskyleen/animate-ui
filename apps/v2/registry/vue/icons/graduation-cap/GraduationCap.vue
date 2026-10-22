<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type GraduationCapProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    hat: {
      initial: { rotate: 0, transformOrigin: '50% 50%' },
      animate: {
        rotate: [0, -8, 4, 0],
        transformOrigin: '50% 50%',
        transition: {
          duration: 0.9,
          times: [0, 0.35, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    tassel: {
      initial: { rotate: 0, transformOrigin: '50% 0%' },
      animate: {
        rotate: [0, 12, -8, 4, 0],
        transformOrigin: '50% 0%',
        transition: {
          duration: 0.9,
          delay: 0.1,
          times: [0, 0.3, 0.6, 0.85, 1],
          ease: 'easeInOut',
        },
      },
    },
    part: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'GraduationCap', inheritAttrs: false })
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
        :variants="variants.hat"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"
          :variants="variants.part"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M22 10v6"
          :variants="variants.tassel"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"
          :variants="variants.part"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
