<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type LightbulbOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.3, 1, 0.2, 0.6, 0.15, 1],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
    path2: {},
    path3: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.3, 1, 0.2, 0.6, 0.15, 1],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
    path4: {},
    path5: {},
    path6: {
      initial: { opacity: 1 },
      animate: {
        opacity: [1, 0.3, 1, 0.2, 0.6, 0.15, 1],
        transition: { duration: 0.9, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  off: {
    path1: {},
    path2: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path3: {},
    path4: {},
    path5: {},
    path6: {
      initial: {
        opacity: 0,
        pathLength: 0,
      },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'LightbulbOff', inheritAttrs: false })
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
        d="M18.9107 13.9107C19.6032 12.7386 20 11.3746 20 9.91886C20 5.5454 16.4183 2 12 2C10.5585 2 9.20596 2.37741 8.03786 3.03786"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M2 2L22 22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M12 12L12 15.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path6"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5.41738 5.41738C4.52361 6.69556 4 8.24668 4 9.91886C4 11.4118 4.41735 12.8082 5.14286 14"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M16 16H7L7.54415 17.6325C7.81638 18.4491 8.58066 19 9.44152 19L14.5585 19C15.4193 19 16.1836 18.4491 16.4558 17.6325L16.75 16.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M9 19L9.54415 20.6325C9.81638 21.4491 10.5807 22 11.4415 22L12.5585 22C13.4193 22 14.1836 21.4491 14.4558 20.6325L15 19"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
