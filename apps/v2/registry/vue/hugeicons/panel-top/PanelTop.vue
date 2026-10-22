<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PanelTopProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line: {
      initial: { x: 0, y: 0 },
      animate: {
        x: 0,
        y: -2,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PanelTop', inheritAttrs: false })
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
        d="M2.49219 12C2.49219 7.52166 2.49219 5.28249 3.88343 3.89124C5.27467 2.5 7.51384 2.5 11.9922 2.5C16.4705 2.5 18.7097 2.5 20.1009 3.89124C21.4922 5.28249 21.4922 7.52166 21.4922 12C21.4922 16.4783 21.4922 18.7175 20.1009 20.1088C18.7097 21.5 16.4705 21.5 11.9922 21.5C7.51384 21.5 5.27467 21.5 3.88343 20.1088C2.49219 18.7175 2.49219 16.4783 2.49219 12Z"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2.99219 9H20.9922"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
