<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LinkProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
    path2: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0],
        y: [0, 1, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    path1: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, 1, 0],
        y: [0, -1, 0],
        transition: {
          duration: 0.8,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
    path2: {
      initial: { x: 0, y: 0 },
      animate: {
        x: [0, -1, 0],
        y: [0, 1, 0],
        transition: {
          duration: 0.8,
          times: [0, 0.4, 1],
          ease: ['easeOut', 'backOut'],
        },
      },
    },
  } satisfies Record<string, Variants>,
  unlink: {
    path1: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: 1,
        y: -1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: { x: 0, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
      animate: {
        x: -1,
        y: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  join: {
    path1: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: -1.5,
        y: 1.5,
        pathLength: 0.85,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: 1.5,
        y: -1.5,
        pathLength: 0.85,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  'join-loop': {
    path1: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: [0, -1.5, 0],
        y: [0, 1.5, 0],
        pathLength: [1, 0.85, 1],
        transition: {
          duration: 0.8,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        x: 0,
        y: 0,
        pathLength: 1,
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
      animate: {
        x: [0, 1.5, 0],
        y: [0, -1.5, 0],
        pathLength: [1, 0.85, 1],
        transition: {
          duration: 0.8,
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

defineOptions({ name: 'Link', inheritAttrs: false })
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
      <motion.path
        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
