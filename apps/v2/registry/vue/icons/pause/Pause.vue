<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PauseProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: 1.5,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: -1.5,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    rect1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, 1.5, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    rect2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, -1.5, 0],
        transition: {
          duration: 0.6,
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

defineOptions({ name: 'Pause', inheritAttrs: false })
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
      <motion.rect
        :x="14"
        :y="4"
        :width="4"
        :height="16"
        :rx="1"
        :variants="variants.rect1"
        initial="initial"
        :animate="controls"
      />
      <motion.rect
        :x="6"
        :y="4"
        :width="4"
        :height="16"
        :rx="1"
        :variants="variants.rect2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
