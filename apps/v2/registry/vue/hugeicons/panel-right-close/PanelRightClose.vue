<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PanelRightCloseProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line: {
      initial: { x: 0, y: 0 },
      animate: {
        x: 2,
        y: 0,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
    arrow: {
      initial: { x: 0 },
      animate: {
        x: 2,
        transition: { type: 'spring', damping: 20, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PanelRightClose', inheritAttrs: false })
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
      <motion.path
        d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15 3V21"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8 9L9.10819 9.87868C10.3694 10.8787 11 11.3787 11 12C11 12.6213 10.3694 13.1213 9.10819 14.1213L8 15"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.arrow"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
