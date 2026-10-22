<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LightbulbProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        rotate: 0,
        fill: 'transparent',
      },
      animate: {
        transformOrigin: 'bottom center',
        fill: 'currentColor',
        rotate: [0, -20, 15, -7, 0],
        fillOpacity: [0, 1, 0, 1, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          rotate: {
            duration: 0.8,
            ease: 'easeInOut',
            times: [0, 0.4, 0.6, 0.8, 1],
          },
          fillOpacity: {
            duration: 0.3,
            ease: 'easeInOut',
            times: [0, 0.4, 0.6, 0.8, 1],
            delay: 0.4,
          },
        },
      },
    },
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        transformOrigin: 'bottom center',
        rotate: [0, 0, 10, -5, 0],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
          times: [0, 0.4, 0.6, 0.8, 1],
        },
      },
    },
    path3: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Lightbulb', inheritAttrs: false })
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
      <motion.path
        d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9 18h6"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M10 22h4"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
