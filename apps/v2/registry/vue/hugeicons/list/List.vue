<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ListProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    rect: {},
    path1: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.2,
        },
      },
    },
    path3: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.4,
        },
      },
    },
    path4: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.6,
        },
      },
    },
    path5: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 0.8,
        },
      },
    },
    path6: {
      initial: {
        pathLength: 1,
        opacity: 1,
        scale: 1,
      },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        scale: [1.1, 1],
        transition: {
          duration: 0.4,
          ease: 'easeInOut',
          delay: 1,
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'List', inheritAttrs: false })
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
        d="M3.24609 5H3.12109M3.37109 5C3.37109 5.13807 3.25916 5.25 3.12109 5.25C2.98302 5.25 2.87109 5.13807 2.87109 5C2.87109 4.86193 2.98302 4.75 3.12109 4.75C3.25916 4.75 3.37109 4.86193 3.37109 5Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.12109 5H21.1211"
        stroke-linecap="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3.24609 12H3.12109M3.37109 12C3.37109 12.1381 3.25916 12.25 3.12109 12.25C2.98302 12.25 2.87109 12.1381 2.87109 12C2.87109 11.8619 2.98302 11.75 3.12109 11.75C3.25916 11.75 3.37109 11.8619 3.37109 12Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.12109 12H21.1211"
        stroke-linecap="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M3.24609 19H3.12109M3.37109 19C3.37109 19.1381 3.25916 19.25 3.12109 19.25C2.98302 19.25 2.87109 19.1381 2.87109 19C2.87109 18.8619 2.98302 18.75 3.12109 18.75C3.25916 18.75 3.37109 18.8619 3.37109 19Z"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9.12109 19H21.1211"
        stroke-linecap="round"
        :variants="variants.path6"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
