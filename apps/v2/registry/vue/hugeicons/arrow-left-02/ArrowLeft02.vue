<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ArrowLeft02Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {},
    path2: {},
    group: {
      initial: { x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { x: -2, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {},
    path2: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, -2, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  pointing: {
    path1: {
      initial: {
        d: 'M5.5 12.002H19',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M9 12.002H19',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: 3.5,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    path1: {
      initial: { d: 'M5.5 12.002H19' },
      animate: {
        d: ['M5.5 12.002H19', 'M9 12.002H19', 'M5.5 12.002H19'],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: [0, 3.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  out: {
    path1: {},
    path2: {},
    group: {
      initial: { x: 0 },
      animate: {
        x: [0, '-150%', '150%', 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          times: [0, 0.5, 0.5, 1],
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ArrowLeft02', inheritAttrs: false })
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
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M5.5 12.002H19"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M10.9999 18.002C10.9999 18.002 4.99998 13.583 4.99997 12.0019C4.99996 10.4208 11 6.00195 11 6.00195"
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
