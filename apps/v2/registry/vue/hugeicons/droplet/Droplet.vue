<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type DropletProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    drop: {
      initial: { scaleY: 1, scaleX: 1, transformOrigin: '50% 100%' },
      animate: {
        scaleY: [1, 0.85, 1.04, 1],
        scaleX: [1, 1.08, 0.97, 1],
        transformOrigin: '50% 100%',
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Droplet', inheritAttrs: false })
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
        :variants="variants.drop"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M3.5 13.678C3.5 9.49387 7.08079 5.35907 9.59413 2.97222C10.9591 1.67593 13.0409 1.67593 14.4059 2.97222C16.9192 5.35907 20.5 9.49387 20.5 13.678C20.5 17.7804 17.2812 22 12 22C6.71878 22 3.5 17.7804 3.5 13.678Z"
        />
        <path
          d="M16 14C16 16.2091 14.2091 18 12 18"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
