<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type RotateCcwKeyProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -45,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
  rotate: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
      animate: {
        rotate: -360,
        transition: { type: 'spring', stiffness: 150, damping: 25 },
      },
    },
    arrowArc: {},
    arrowHead: {},
    keyPart1: {},
    keyPart2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'RotateCcwKey', inheritAttrs: false })
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
      :variants="variants.group"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.path
        d="m14.5 9.5 1 1"
        :variants="variants.keyPart1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m15.5 8.5-4 4"
        :variants="variants.keyPart2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 12a9 9 0 1 0 9-9 9.74 9.74 0 0 0-6.74 2.74L3 8"
        :variants="variants.arrowArc"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3 3v5h5"
        :variants="variants.arrowHead"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        cx="10"
        cy="14"
        r="2"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
