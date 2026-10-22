<script lang="ts">
import type { Variants } from 'motion-v'
import type { IconProps } from '@animate-ui/vue/icons'

export type MailProps = IconProps<keyof typeof animations>;

const CLOSED_BODY =
  'M20 4c1.105 0 2 0.895 2 2v12a2 2 0 0 1 -2 2H4a2 2 0 0 1 -2 -2V6a2 2 0 0 1 2 -2l8 0a0 0 0 0 1 0 0l8 0Z';
const OPEN_BODY =
  'M21.2 8.4c0.5 0.38 0.8 0.97 0.8 1.6v10a2 2 0 0 1 -2 2H4a2 2 0 0 1 -2 -2V10a2 2 0 0 1 0.8 -1.6l8 -6a2 2 0 0 1 2.4 0l8 6Z';
const CLOSED_FLAP = 'm22 7 -8.991 5.727a2 2 0 0 1 -2.009 0L2 7';
const OPEN_FLAP = 'm22 10 -8.97 5.7a1.94 1.94 0 0 1 -2.06 0L2 10';

export const animations = {
  default: {
    group: {
      initial: { y: 0 },
      animate: {
        y: [0, -1.5, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path1: {
      initial: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: [0, 1],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    },
    path2: {},
  } satisfies Record<string, Variants>,
  open: {
    group: {},
    path1: {
      initial: {
        d: CLOSED_FLAP,
        transition: { duration: 0.35, ease: 'easeInOut' },
      },
      animate: {
        d: OPEN_FLAP,
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
    path2: {
      initial: {
        d: CLOSED_BODY,
        transition: { duration: 0.35, ease: 'easeInOut' },
      },
      animate: {
        d: OPEN_BODY,
        transition: { duration: 0.45, ease: 'easeInOut' },
      },
    },
  } satisfies Record<string, Variants>,
  peek: {
    group: {},
    path1: {
      initial: { d: CLOSED_FLAP },
      animate: {
        d: [CLOSED_FLAP, OPEN_FLAP, OPEN_FLAP, CLOSED_FLAP],
        transition: {
          duration: 1.4,
          times: [0, 0.3, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
    path2: {
      initial: { d: CLOSED_BODY },
      animate: {
        d: [CLOSED_BODY, OPEN_BODY, OPEN_BODY, CLOSED_BODY],
        transition: {
          duration: 1.4,
          times: [0, 0.3, 0.7, 1],
          ease: 'easeInOut',
        },
      },
    },
  } satisfies Record<string, Variants>,
} as const;
</script>

<script setup lang="ts">
import { IconWrapper } from '@animate-ui/vue/icons'
import { motion } from 'motion-v'

defineOptions({ name: 'Mail', inheritAttrs: false })
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
      v-bind="attrs"
    >
      <motion.g
        :variants="variants.group"
        initial="initial"
        :animate="controls"
      >
        <motion.path
          :d="CLOSED_FLAP"
          :variants="variants.path1"
          initial="initial"
          :animate="controls"
        />
        <motion.path
          :d="CLOSED_BODY"
          :variants="variants.path2"
          initial="initial"
          :animate="controls"
        />
      </motion.g>
    </motion.svg>
  </IconWrapper>
</template>
