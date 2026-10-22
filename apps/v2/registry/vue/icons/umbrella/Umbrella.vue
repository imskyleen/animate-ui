<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type UmbrellaProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    canopy: {
      initial: { scaleX: 1, scaleY: 1, transformOrigin: '50% 0%' },
      animate: {
        scaleX: [0.4, 1.02, 1],
        scaleY: [0.8, 1],
        transformOrigin: '50% 0%',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Umbrella', inheritAttrs: false })
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
      <path
        d="M12 13v7a2 2 0 0 0 4 0"
      />
      <path
        d="M12 2v2"
      />
      <motion.path
        d="M20.992 13a1 1 0 0 0 .97-1.274 10.284 10.284 0 0 0-19.923 0A1 1 0 0 0 3 13z"
        :variants="variants.canopy"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
