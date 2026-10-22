<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TrashProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        y: 0,
      },
      animate: {
        y: -1,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path1: {},
    path2: {},
    path3: {
      initial: {
        y: 0,
        d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6',
      },
      animate: {
        y: 1,
        d: 'M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8',
        transition: {
          duration: 0.3,
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

defineOptions({ name: 'Trash', inheritAttrs: false })
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
          d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M3 6h18"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.path
        d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
