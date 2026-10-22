<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type UsersRoundProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 2, -1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.1,
        },
      },
    },
    path2: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 0.5, -1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    path3: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 2, -1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
        },
      },
    },
    circle: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 0.5, -1, 0],
        transition: {
          duration: 0.6,
          ease: 'easeInOut',
          delay: 0.1,
        },
      },
    },
  } satisfies Record<string, Variants>,
  appear: {
    path1: {},
    path2: {
      initial: {
        x: -5,
        opacity: 0,
      },
      animate: {
        x: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 10,
        },
      },
    },
    path3: {
      initial: {
        x: -5,
        opacity: 0,
      },
      animate: {
        x: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 10,
        },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'UsersRound', inheritAttrs: false })
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
        d="M15 21C15 17.6863 12.3137 15 9 15C5.68629 15 3 17.6863 3 21"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12.9614 10.4423C13.5584 10.7966 14.2554 11 15 11C17.2091 11 19 9.20914 19 7C19 4.79086 17.2091 3 15 3C12.7909 3 11 4.79086 11 7C11 7.18927 11.0131 7.37547 11.0386 7.55773"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M21 17C21 13.6863 18.3137 11 15 11"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M13 11C13 8.79086 11.2091 7 9 7C6.79086 7 5 8.79086 5 11C5 13.2091 6.79086 15 9 15C11.2091 15 13 13.2091 13 11Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
