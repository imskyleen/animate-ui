<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type UsersProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 2, -2, 0],
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
        y: [0, 4, -2, 0],
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
        y: [0, 2, -2, 0],
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
        y: [0, 4, -2, 0],
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
        x: -6,
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
        x: -6,
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

defineOptions({ name: 'Users', inheritAttrs: false })
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
        d="M16.5 20V16.9852C16.5 16.364 16.2184 15.7658 15.6838 15.4494C14.1574 14.546 12.1714 14 10 14C7.82863 14 5.84261 14.546 4.31618 15.4494C3.78162 15.7658 3.5 16.364 3.5 16.9852V20"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M15 4.14453C16.4457 4.57481 17.5 5.91408 17.5 7.49959C17.5 9.0851 16.4457 10.4244 15 10.8547"
        stroke-linecap="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M20.5 20.001V16.9862C20.5 16.365 20.2184 15.7667 19.6838 15.4504C19.171 15.1468 18.6062 14.8837 18 14.668"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.circle
        :cx="10"
        :cy="7.5"
        :r="3.5"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
