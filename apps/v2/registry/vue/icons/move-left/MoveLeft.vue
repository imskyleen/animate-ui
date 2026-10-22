<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MoveLeftProps = IconProps<keyof typeof animations>;

export const animations = {
  default: {
    group1: {
      initial: {
        x: 0,
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        x: '-15%',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  'default-loop': {
    group1: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-15%', 0],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    group2: {},
    path1: {},
    path2: {},
  } satisfies Record<string, Variants>,
  pointing: {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M2 12H22',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M12 12H22',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
    path2: {
      initial: {
        d: 'M6 8L2 12L6 16',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
      animate: {
        d: 'M15 8L11 12L15 16',
        transition: { ease: 'easeInOut', duration: 0.3 },
      },
    },
  } satisfies Record<string, Variants>,
  'pointing-loop': {
    group1: {},
    group2: {},
    path1: {
      initial: {
        d: 'M2 12H22',
      },
      animate: {
        d: ['M2 12H22', 'M12 12H22', 'M2 12H22'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
    path2: {
      initial: {
        d: 'M6 8L2 12L6 16',
      },
      animate: {
        d: ['M6 8L2 12L6 16', 'M15 8L11 12L15 16', 'M6 8L2 12L6 16'],
        transition: { ease: 'easeInOut', duration: 0.6 },
      },
    },
  } satisfies Record<string, Variants>,
  out: {
    group1: {},
    group2: {
      initial: {
        x: 0,
      },
      animate: {
        x: [0, '-150%', '150%', 0],
        transition: {
          default: { ease: 'easeInOut', duration: 0.6 },
          x: {
            ease: 'easeInOut',
            duration: 0.6,
            times: [0, 0.5, 0.5, 1],
          },
        },
      },
    },
    path1: {},
    path2: {},
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
      stroke-linecap="round"
      stroke-linejoin="round"
      :variants="variants.group1"
      initial="initial"
      :animate="controls"
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group2"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          d="M2 12H22"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          d="M6 8L2 12L6 16"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
