<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SquareXProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    line1: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line2: {
      initial: {
        rotate: 0,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
      animate: {
        rotate: 90,
        transition: { ease: 'easeInOut', duration: 0.4, delay: 0.1 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SquareX', inheritAttrs: false })
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
        d="M11.9922 21.5H11.9922H11.9922C16.4705 21.5 18.7097 21.5 20.1009 20.1088C21.4922 18.7175 21.4922 16.4783 21.4922 12V12V12C21.4922 7.52165 21.4922 5.28248 20.1009 3.89124C18.7097 2.5 16.4705 2.5 11.9922 2.5C7.51384 2.5 5.27467 2.5 3.88343 3.89124C2.49219 5.28249 2.49219 7.52166 2.49219 12C2.49219 16.4783 2.49219 18.7175 3.88343 20.1088C5.27467 21.5 7.51384 21.5 11.9922 21.5Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.99219 14.9996L14.9922 9"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.99219 9.00039L14.9922 15"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
