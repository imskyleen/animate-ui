<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type CopyProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: { x: 1, y: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    },
    path: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: -1,
        y: -1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    rect: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1, 0],
        y: [0, 1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0],
        y: [0, -1, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  merge: {
    rect: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: -3,
        x: -3,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: 3,
        x: 3,
        transition: {
          duration: 0.3,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'merge-loop': {
    rect: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, -3, 0],
        x: [0, -3, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        y: 0,
        x: 0,
      },
      animate: {
        y: [0, 3, 0],
        x: [0, 3, 0],
        transition: {
          duration: 0.6,
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

defineOptions({ name: 'Copy', inheritAttrs: false })
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
      <motion.rect
        :width="14"
        :height="14"
        :x="8"
        :y="8"
        :rx="2"
        :ry="2"
        :variants="variants.rect"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
        :variants="variants.path"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
