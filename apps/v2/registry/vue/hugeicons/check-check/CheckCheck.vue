<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CheckCheckProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.1, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],

        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],

        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'CheckCheck', inheritAttrs: false })
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M2 13.2593L4.58579 15.9568C5.25245 16.6523 5.58579 17 6 17C6.41421 17 6.74755 16.6523 7.41421 15.9568L16 7"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M11 16.3889C11.2726 16.6733 11.409 16.8155 11.556 16.8915C11.8358 17.0362 12.1642 17.0362 12.444 16.8915C12.5911 16.8155 12.7274 16.6733 13 16.3889L22 7"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
