<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MoreHorizontalProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    dot1: {},
    dot2: {},
    dot3: {},
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
  } satisfies Record<string, Variants>,
  vertical: {
    dot1: {},
    dot2: {},
    dot3: {},
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
  } satisfies Record<string, Variants>,
  pulse: {
    dot1: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut', delay: 0 },
      },
    },
    dot2: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut', delay: 0.2 },
      },
    },
    dot3: {
      initial: { scale: 1 },
      animate: {
        scale: [1, 1.5, 1],
        transition: { duration: 1, ease: 'easeInOut', delay: 0.4 },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
  jump: {
    dot1: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 2],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          delay: 0,
          repeat: Infinity,
          repeatType: 'mirror',
        },
      },
    },
    dot2: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 2],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          delay: 0.2,
          repeat: Infinity,
          repeatType: 'mirror',
        },
      },
    },
    dot3: {
      initial: { y: 0 },
      animate: {
        y: [0, -2, 2],
        transition: {
          duration: 1.2,
          ease: 'easeInOut',
          delay: 0.4,
          repeat: Infinity,
          repeatType: 'mirror',
        },
      },
    },
    group: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MoreHorizontal', inheritAttrs: false })
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
          d="M6.00449 12.5V12M7.00449 12.5C7.00449 11.9477 6.55677 11.5 6.00449 11.5C5.4522 11.5 5.00449 11.9477 5.00449 12.5C5.00449 13.0523 5.4522 13.5 6.00449 13.5C6.55677 13.5 7.00449 13.0523 7.00449 12.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.dot1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M12.0045 12.5V12M13.0045 12.5C13.0045 11.9477 12.5568 11.5 12.0045 11.5C11.4522 11.5 11.0045 11.9477 11.0045 12.5C11.0045 13.0523 11.4522 13.5 12.0045 13.5C12.5568 13.5 13.0045 13.0523 13.0045 12.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.dot2"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M18.0045 12.5V12M19.0045 12.5C19.0045 11.9477 18.5568 11.5 18.0045 11.5C17.4522 11.5 17.0045 11.9477 17.0045 12.5C17.0045 13.0523 17.4522 13.5 18.0045 13.5C18.5568 13.5 19.0045 13.0523 19.0045 12.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.dot3"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
