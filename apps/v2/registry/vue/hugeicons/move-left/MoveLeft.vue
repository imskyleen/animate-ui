<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MoveLeftProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {},
    group2: {},
    path1: {},
    path2: {},
    circle: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: -3, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {},
    group2: {},
    path1: {},
    path2: {},
    circle: {
      initial: { x: 0 },
      animate: {
        x: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M2 11.9999H12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M7 11.9999H12',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } },
      animate: { x: 5, transition: { ease: 'easeInOut', duration: 0.3 } },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: { d: 'M2 11.9999H12' },
      animate: {
        d: ['M2 11.9999H12', 'M7 11.9999H12', 'M2 11.9999H12'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: { x: 0 },
      animate: {
        x: [0, 5, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    circle: {},
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: { x: 0 },
      animate: {
        x: [0, '-150%', '150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          x: { ease: 'easeInOut', duration: 0.6, times: [0, 0.5, 0.5, 1] },
        },
      },
    },
    path1: {},
    path2: {},
    circle: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'MoveLeft', inheritAttrs: false })
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
      :variants="variants.group1"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group1"
        initial="initial"
        :animate="controls"
      >
        <motion.g
          :variants="variants.group2"
          initial="initial"
          :animate="controls"
        >
          <motion.circle
            :cx="19"
            :cy="12"
            :r="3"
            :variants="variants.circle"
            initial="initial"
            :animate="controls"
          />
          <motion.path
            d="M2 11.9999H12"
            stroke-linecap="round"
            stroke-linejoin="round"
            :variants="variants.path1"
            initial="initial"
            :animate="controls"
          />
          <motion.g
            :variants="variants.path2"
            initial="initial"
            :animate="controls"
          >
            <path
              d="M2 11.9999C2 12.5619 2.4381 12.9891 3.3143 13.8436L4.97057 15.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 11.9999C2 11.4378 2.4381 11.0106 3.3143 10.1561L4.97044 8.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </motion.g>
        </motion.g>
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
