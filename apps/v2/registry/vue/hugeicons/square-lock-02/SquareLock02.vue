<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type SquareLock02Props = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -5, 7, 0],
        scale: [1, 0.9, 1, 1],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
    keyhole: {},
    body: {},
    shackle: {
      initial: { y: 0 },
      animate: {
        y: [0, -1, 0, 0],
        transition: { duration: 1, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  unlock: {
    group: {},
    keyhole: {},
    body: {},
    shackle: {
      initial: {
        d: 'M7.5 9V6.5C7.5 4.01472 9.51471 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9',
        opacity: 1,
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      animate: {
        d: 'M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C13.9593 2 15.8664 3.25221 16.5 5V5',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  lock: {
    group: {
      initial: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, 7, 0],
        scale: [1, 0.9, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    keyhole: {},
    body: {},
    shackle: {
      initial: {
        d: 'M7.5 9V6.5C7.5 4.01472 9.51471 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9',
      },
      animate: {
        d: [
          'M7.5 9V6.5C7.5 4.01472 9.51472 2 12 2C13.9593 2 15.8664 3.25221 16.5 5V5',
          'M7.5 9V6.5C7.5 4.01472 9.51471 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9',
        ],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'SquareLock02', inheritAttrs: false })
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
          d="M12 14.5V17.5M13 14.5C13 15.0523 12.5523 15.5 12 15.5C11.4477 15.5 11 15.0523 11 14.5C11 13.9477 11.4477 13.5 12 13.5C12.5523 13.5 13 13.9477 13 14.5Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.keyhole"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M4.2678 18.8447C4.49268 20.515 5.87612 21.8235 7.55965 21.9009C8.97627 21.966 10.4153 22 12 22C13.5847 22 15.0237 21.966 16.4403 21.9009C18.1239 21.8235 19.5073 20.515 19.7322 18.8447C19.8789 17.7547 20 16.6376 20 15.5C20 14.3624 19.8789 13.2453 19.7322 12.1553C19.5073 10.485 18.1239 9.17649 16.4403 9.09909C15.0237 9.03397 13.5847 9 12 9C10.4153 9 8.97627 9.03397 7.55965 9.09909C5.87612 9.17649 4.49268 10.485 4.2678 12.1553C4.12104 13.2453 3.99999 14.3624 3.99999 15.5C3.99999 16.6376 4.12104 17.7547 4.2678 18.8447Z"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.body"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7.5 9V6.5C7.5 4.01472 9.51471 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5V9"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.shackle"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
