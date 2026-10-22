<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type PanelBottomProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line: {
      initial: { x: 0, y: 0 },
      animate: {
        x: 0,
        y: 2,
        transition: { type: 'spring', damping: 18, stiffness: 200 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'PanelBottom', inheritAttrs: false })
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
        d="M2.99219 15.0001H20.9922"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2.49219 12.0001C2.49219 7.52178 2.49219 5.28261 3.88343 3.89136C5.27467 2.50012 7.51384 2.50012 11.9922 2.50012C16.4705 2.50012 18.7097 2.50012 20.1009 3.89136C21.4922 5.28261 21.4922 7.52178 21.4922 12.0001C21.4922 16.4785 21.4922 18.7176 20.1009 20.1089C18.7097 21.5001 16.4705 21.5001 11.9922 21.5001C7.51384 21.5001 5.27467 21.5001 3.88343 20.1089C2.49219 18.7176 2.49219 16.4785 2.49219 12.0001Z"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
