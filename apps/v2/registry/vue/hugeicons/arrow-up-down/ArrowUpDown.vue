<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type ArrowUpDownProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    upArrowGroup: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: -3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        y: 3,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    upArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 3, 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
  out: {
    upArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, -24, 24, 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          y: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    downArrowGroup: {
      initial: {
        y: 0,
      },
      animate: {
        y: [0, 24, -24, 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          y: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    upArrowLine: {},
    upArrowHead: {},
    downArrowLine: {},
    downArrowHead: {},
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'ArrowUpDown', inheritAttrs: false })
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
        :variants="variants.downArrowGroup"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M20 17C20 17 17.7905 20 17 20C16.2094 20 14 17 14 17"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.downArrowHead"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M17 19L17 4"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.downArrowLine"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
      <motion.g
        :variants="variants.upArrowGroup"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M4 7C4 7 6.20942 3.99999 6.99998 4C7.79053 4.00001 10 6.99998 10 6.99998"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.upArrowHead"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M7 4V20"
          stroke-linecap="round"
          stroke-linejoin="round"
          :variants="variants.upArrowLine"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
