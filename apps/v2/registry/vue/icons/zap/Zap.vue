<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ZapProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.9, 1.15, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
  fill: {
    group: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 0.9, 1.15, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path: {
      initial: { fill: 'currentColor', fillOpacity: 0 },
      animate: { fillOpacity: 1, transition: { delay: 0.2 } },
    },
  } satisfies Record<string, Variants>,
  shake: {
    group: {
      initial: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 0.9, 1.08, 0.98, 1],
        rotate: [0, -8, 8, -4, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
    },
    path: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Zap', inheritAttrs: false })
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
        <motion.path
          d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
