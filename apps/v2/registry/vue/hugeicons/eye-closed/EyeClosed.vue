<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type EyeClosedProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleY: [1, 0.45, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'EyeClosed', inheritAttrs: false })
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
        <path
          d="M12 13.5V16.5"
          stroke-linecap="round"
        />
        <path
          d="M16 13L17 15.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.5 11L21.5 13"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2.5 13L4.5 11"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 13L7 15.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2 7.5C2 7.5 5 13.5 12 13.5C19 13.5 22 7.5 22 7.5"
          stroke-linecap="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
