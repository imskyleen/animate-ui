<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type TimerOffProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    path1: {
      initial: { y: 0 },
      animate: {
        y: [0, 1, 0],
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
    },
    path2: {},
    path3: {},
    path4: {},
    path5: {
      initial: { rotate: 0, transformOrigin: '12px 13.5px' },
      animate: {
        rotate: [0, 6, 6, 0],
        transformOrigin: '12px 13.5px',
        transition: {
          duration: 0.8,
          delay: 0.15,
          times: [0, 0.2, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
  off: {
    group: {},
    path1: {},
    path2: {},
    path3: {},
    path4: {
      initial: { opacity: 0, pathLength: 0 },
      animate: {
        opacity: 1,
        pathLength: 1,
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path5: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'TimerOff', inheritAttrs: false })
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
      <path
        d="M18.0117 7.48959L19.5013 6"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M10 5.23663C10.6414 5.08195 11.3111 5 12 5C16.6944 5 20.5 8.80558 20.5 13.5C20.5 14.3701 20.3693 15.2096 20.1264 16"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18.481 19.0005C16.9218 20.8359 14.5969 22.0005 12 22.0005C7.30558 22.0005 3.5 18.1949 3.5 13.5005C3.5 10.9036 4.66459 8.57867 6.5 7.01953"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <motion.path
        d="M14.5 2H9.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.g
        :style="{ transformBox: 'view-box' }"
        :variants="variants.path5"
        initial="initial"
        :animate="controls"
      >
        <path
          d="M12 13.5L12.5 13"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15 10.5L15.5 10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </motion.g>
      <motion.path
        d="M2 2L22 22"
        stroke-linecap="round"
        stroke-linejoin="round"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
