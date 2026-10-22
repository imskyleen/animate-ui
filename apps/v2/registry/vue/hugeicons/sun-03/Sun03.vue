<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type Sun03Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    circle: {},
    line1: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.0 },
      },
    },
    line2: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.15 },
      },
    },
    line3: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.3 },
      },
    },
    line4: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.45 },
      },
    },
    line5: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.6 },
      },
    },
    line6: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.75 },
      },
    },
    line7: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 0.9 },
      },
    },
    line8: {
      initial: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [0, 1],
        pathLength: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut', delay: 1.05 },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Sun03', inheritAttrs: false })
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
        d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 3.5V2"
        stroke-linecap="round"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.0106 5.98937L19.0713 4.92871"
        stroke-linecap="round"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20.5 12H22"
        stroke-linecap="round"
        :variants="variants.line3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M18.0101 18.0106L19.0708 19.0713"
        stroke-linecap="round"
        :variants="variants.line4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 20.5V22"
        stroke-linecap="round"
        :variants="variants.line5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5.98975 18.0107L4.92909 19.0714"
        stroke-linecap="round"
        :variants="variants.line6"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3.5 12H2"
        stroke-linecap="round"
        :variants="variants.line7"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5.98926 5.98926L4.9286 4.9286"
        stroke-linecap="round"
        :variants="variants.line8"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
