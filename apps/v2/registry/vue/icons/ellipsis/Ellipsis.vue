<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type EllipsisProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 60, damping: 10 },
      },
      animate: {
        rotate: 180,
        transition: { type: 'spring', stiffness: 60, damping: 10 },
      },
    },
    circle1: {},
    circle2: {},
    circle3: {},
  } satisfies Record<string, Variants>,
  vertical: {
    group: {
      initial: {
        rotate: 0,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
      animate: {
        rotate: 90,
        transition: { type: 'spring', stiffness: 100, damping: 12 },
      },
    },
    circle1: {},
    circle2: {},
    circle3: {},
  } satisfies Record<string, Variants>,
  jump: {
    group: {},
    circle1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -2, 2],
        transition: {
          duration: 1.2,
          delay: 0.4,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    circle2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -2, 2],
        transition: {
          duration: 1.2,
          delay: 0.2,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
    circle3: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -2, 2],
        transition: {
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  pulse: {
    group: {},
    circle1: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    circle2: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
          delay: 0.2,
          ease: 'easeInOut',
        },
      },
    },
    circle3: {
      initial: {
        scale: 1,
      },
      animate: {
        scale: [1, 1.5, 1],
        transition: {
          duration: 1,
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

defineOptions({ name: 'Ellipsis', inheritAttrs: false })
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
      <motion.circle
        :cx="19"
        :cy="12"
        :r="1"
        :variants="variants.circle1"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="12"
        :cy="12"
        :r="1"
        :variants="variants.circle2"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="5"
        :cy="12"
        :r="1"
        :variants="variants.circle3"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
