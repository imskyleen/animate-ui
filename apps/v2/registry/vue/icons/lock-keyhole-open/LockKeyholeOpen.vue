<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LockKeyholeOpenProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, -5, 0],
        scale: [1, 0.9, 1, 1],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 0.8,
      },
      animate: {
        pathLength: [0.8, 1, 0.8, 0.8],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  lock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, 7, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 0.8,
      },
      animate: {
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
  unlock: {
    group: {
      initial: {
        rotate: 0,
        scale: 1,
      },
      animate: {
        rotate: [0, -5, 0],
        scale: [1, 0.9, 1],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path: {
      initial: {
        pathLength: 1,
      },
      animate: {
        pathLength: 0.8,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    rect: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'LockKeyholeOpen', inheritAttrs: false })
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
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.circle
          cx="12"
          cy="16"
          r="1"
          :variants="variants.circle"
          initial="initial"
          :animate="controls"
        />
        <motion.rect
          x="3"
          y="10"
          width="18"
          height="12"
          rx="2"
          :variants="variants.rect"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7 10V7a5 5 0 0 1 10 0v3"
          :variants="variants.path"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
