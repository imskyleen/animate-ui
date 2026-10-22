<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type AlarmClockProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: [
          0,
          '2%',
          '-2%',
          '2%',
          '-2%',
          '2%',
          '-2%',
          '2%',
          '-2%',
          '2%',
          '-2%',
          0,
        ],
        y: [
          0,
          '-5%',
          '-5%',
          '-5%',
          '-5%',
          '-5%',
          '-5%',
          '-5%',
          '-5%',
          '-5%',
          0,
        ],
        transition: {
          ease: 'easeInOut',
          duration: 0.6,
        },
      },
    },
    circle: {},
    line1: {},
    line2: {},
    path1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 12, -12, 12, -12, 12, -12, 12, -12, 12, -12, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -12, 12, -12, 12, -12, 12, -12, 12, -12, 12, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group: {
      initial: {
        x: 0,
        y: 0,
      },
      animate: {
        x: ['2%', '-2%', '2%', '-2%', '2%', '-2%', '2%', '-2%', '2%', '-2%'],
        y: '-5%',
        transition: {
          duration: 0.5,
          x: {
            repeat: Infinity,
            repeatType: 'loop',
          },
          y: {
            duration: 0.2,
          },
        },
      },
    },
    circle: {},
    line1: {},
    line2: {},
    path1: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, 12, -12, 12, -12, 12, -12, 12, -12, 12, -12, 0],
        transition: { duration: 0.5, repeat: Infinity, repeatType: 'loop' },
      },
    },
    path2: {
      initial: {
        rotate: 0,
      },
      animate: {
        rotate: [0, -12, 12, -12, 12, -12, 12, -12, 12, -12, 12, 0],
        transition: { duration: 0.5, repeat: Infinity, repeatType: 'loop' },
      },
    },
    path3: {},
    path4: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'AlarmClock', inheritAttrs: false })
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
        :cx="12"
        :cy="13"
        :r="8"
        :variants="variants.circle"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="12"
        :y1="9"
        :x2="12"
        :y2="13"
        :variants="variants.line1"
        initial="initial"
        :animate="controls"
      />
      <motion.line
        :x1="14"
        :y1="15"
        :x2="12"
        :y2="13"
        :variants="variants.line2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M5 3 2 6"
        :variants="variants.path1"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="m22 6-3-3"
        :variants="variants.path2"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M6.38 18.7 4 21"
        :variants="variants.path3"
        initial="initial"
        :animate="controls"
      />
      <motion.path
        d="M17.64 18.67 20 21"
        :variants="variants.path4"
        initial="initial"
        :animate="controls"
      />
    </motion.svg>
  </IconWrapper>
</template>
