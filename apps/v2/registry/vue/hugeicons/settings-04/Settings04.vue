<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Settings04Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    line1: {
      initial: { y: 0 },
      animate: { y: -4, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line2: {
      initial: { d: 'M8.5 14L8.5 7' },
      animate: {
        d: 'M8.5 10L8.5 7',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
    line3: {
      initial: { y: 0 },
      animate: { y: 4, transition: { ease: 'easeInOut', duration: 0.4 } },
    },
    line4: {
      initial: { d: 'M15.5 10L15.5 17' },
      animate: {
        d: 'M15.5 14L15.5 17',
        transition: { ease: 'easeInOut', duration: 0.4 },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    line1: {
      initial: { y: 0 },
      animate: {
        y: [0, -4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line2: {
      initial: { d: 'M8.5 14L8.5 7' },
      animate: {
        d: ['M8.5 14L8.5 7', 'M8.5 10L8.5 7', 'M8.5 14L8.5 7'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line3: {
      initial: { y: 0 },
      animate: {
        y: [0, 4, 0],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
    line4: {
      initial: { d: 'M15.5 10L15.5 17' },
      animate: {
        d: ['M15.5 10L15.5 17', 'M15.5 14L15.5 17', 'M15.5 10L15.5 17'],
        transition: { ease: 'easeInOut', duration: 0.8 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Settings04', inheritAttrs: false })
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
      <path
        d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z"
        stroke-linejoin="round"
      />
      <motion.path
        d="M10 15.5C10 16.3284 9.32843 17 8.5 17C7.67157 17 7 16.3284 7 15.5C7 14.6716 7.67157 14 8.5 14C9.32843 14 10 14.6716 10 15.5Z"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M8.5 14L8.5 7"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17 8.5C17 7.67157 16.3284 7 15.5 7C14.6716 7 14 7.67157 14 8.5C14 9.32843 14.6716 10 15.5 10C16.3284 10 17 9.32843 17 8.5Z"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15.5 10L15.5 17"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
